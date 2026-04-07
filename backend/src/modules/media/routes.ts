


// @ts-nocheck
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { ObjectId } from "mongodb";
// @ts-nocheck
import { FastifyInstance } from "fastify";
import multipart from "@fastify/multipart";
import { z } from "zod";
import { env } from "../../config/env";
import { getDb } from "../../db/mongo";
import { mediaDeleteQueue } from "../../jobs/queues";

type MediaVariant = {
  key: string;
  format: string;
  width?: number;
  height?: number;
  size: number;
  fileName: string;
  publicPath: string;
  path: string;
};

type MediaDoc = {
  _id?: ObjectId;
  originalName: string;
  mime: string;
  size: number;
  variants: MediaVariant[];
  keepOriginal: boolean;
  status: "ready" | "pendingDelete" | "deleted";
  createdAt: Date;
  deletedAt?: Date;
};

const variantInputSchema = z.object({
  key: z.string().min(1),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  format: z.enum(["webp", "jpeg", "png", "avif"]).default("webp"),
  quality: z.number().int().min(1).max(100).optional(),
  fit: z.enum(["cover", "contain", "fill", "inside", "outside"]).default("cover"),
});

const uploadConfigSchema = z.object({
  variants: z.array(variantInputSchema).optional(),
  keepOriginal: z.boolean().optional(),
  maxSizeMb: z.number().int().positive().optional(),
  allowedTypes: z.array(z.string()).optional(),
  pathStyle: z.enum(["date", "flat"]).optional(),
  folder: z.string().optional(),
});

const listQuerySchema = z.object({
  q: z.string().optional(),
  mime: z.string().optional(),
  status: z.enum(["ready", "pendingDelete", "deleted"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const deletePathsSchema = z.object({
  paths: z.array(z.string().min(1)).min(1),
  reason: z.string().optional(),
});

const buildStoragePath = (pathStyle: "date" | "flat", folder?: string) => {
  const safeFolder = folder?.replace(/\.\./g, "").replace(/^\/+|\/+$/g, "");
  if (pathStyle === "flat") {
    return safeFolder && safeFolder.length ? safeFolder : "";
  }
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const datePath = `${now.getFullYear()}/${month}/${day}`;
  if (safeFolder && safeFolder.length) {
    return path.posix.join(safeFolder, datePath);
  }
  return datePath;
};

const ensureDir = async (dir: string) => {
  await fs.mkdir(dir, { recursive: true });
};

// ─── BunnyCDN Upload Helper ───────────────────────────────────────────────────
const uploadToBunny = async (filePath: string, publicPath: string) => {
  const fileBuffer = await fs.readFile(filePath);
  const zone = env.bunnyStorageZone;
  const password = env.bunnyStoragePassword;
  const region = env.bunnyStorageRegion;

  const hostname = region
    ? `${region}.storage.bunnycdn.com`
    : "storage.bunnycdn.com";

  const url = `https://${hostname}/${zone}/${publicPath}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      AccessKey: password,
      "Content-Type": "application/octet-stream",
    },
    body: fileBuffer,
  });

  if (!res.ok) {
    throw new Error(`Bunny upload failed: ${res.status} ${await res.text()}`);
  }
};
// ─────────────────────────────────────────────────────────────────────────────

const writeVariant = async (params: {
  buffer: Buffer;
  variant: z.infer<typeof variantInputSchema>;
  baseName: string;
  datePath: string;
}) => {
  const { buffer, variant, baseName, datePath } = params;
  const fileName = `${baseName}-${variant.key}.${variant.format}`;
  const targetDir = path.join(env.mediaStoragePath, datePath);
  const targetPath = path.join(targetDir, fileName);
  const publicPath = datePath ? path.posix.join(datePath, fileName) : fileName;

  await ensureDir(targetDir);

  let pipeline = sharp(buffer);
  if (variant.width || variant.height) {
    pipeline = pipeline.resize({
      width: variant.width,
      height: variant.height,
      fit: variant.fit ?? "cover",
    });
  }

  const quality = variant.quality ?? env.mediaWebpQuality;
  const info = await pipeline.toFormat(variant.format as keyof sharp.FormatEnum, { quality }).toFile(targetPath);

  // Upload to BunnyCDN if driver is set to bunny
  if (env.mediaDriver === "bunny") {
    await uploadToBunny(targetPath, publicPath);
  }

  return {
    key: variant.key,
    format: variant.format,
    width: info.width ?? variant.width,
    height: info.height ?? variant.height,
    size: info.size,
    fileName,
    publicPath,
    path: targetPath,
  } satisfies MediaVariant;
};

export default async function mediaRoutes(app: FastifyInstance) {
  await app.register(multipart, {
    limits: { fileSize: env.mediaMaxSizeMb * 1024 * 1024 },
  });

  const defaults: z.infer<typeof variantInputSchema>[] = [
    { key: "main", format: "webp", quality: env.mediaWebpQuality },
    { key: "thumb", format: "webp", width: env.mediaThumbWidth, height: env.mediaThumbHeight, quality: env.mediaWebpQuality, fit: "cover" },
  ];

  const loadConfig = async () => {
    const db = await getDb();
    const col = db.collection("media-config");
    const stored = await col.findOne<{
      variants?: z.infer<typeof variantInputSchema>[];
      keepOriginal?: boolean;
      maxSizeMb?: number;
      allowedTypes?: string[];
      pathStyle?: "date" | "flat";
      folder?: string;
    }>({
      key: "default",
    });
    return stored;
  };

  app.get("/media/config", { preHandler: [app.authenticate] }, async () => {
    const stored = await loadConfig();
    return {
      variants: stored?.variants ?? defaults,
      keepOriginal: stored?.keepOriginal ?? env.mediaKeepOriginal,
      maxSizeMb: stored?.maxSizeMb ?? env.mediaMaxSizeMb,
      allowedTypes: stored?.allowedTypes ?? env.mediaAllowedTypes,
      pathStyle: stored?.pathStyle ?? "date",
      folder: stored?.folder ?? "",
    };
  });

  app.put("/media/config", { preHandler: [app.authenticate] }, async (request, reply) => {
    const parsed = uploadConfigSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ message: "Invalid config" });
    }
    const db = await getDb();
    const col = db.collection("media-config");
    await col.updateOne({ key: "default" }, { $set: parsed.data }, { upsert: true });
    return {
      variants: parsed.data.variants ?? defaults,
      keepOriginal: parsed.data.keepOriginal ?? env.mediaKeepOriginal,
      maxSizeMb: parsed.data.maxSizeMb ?? env.mediaMaxSizeMb,
      allowedTypes: parsed.data.allowedTypes ?? env.mediaAllowedTypes,
      pathStyle: parsed.data.pathStyle ?? "date",
      folder: parsed.data.folder ?? "",
    };
  });

  app.post("/media/config/restore", { preHandler: [app.authenticate] }, async () => {
    const db = await getDb();
    const col = db.collection("media-config");
    await col.deleteOne({ key: "default" });
    return {
      variants: defaults,
      keepOriginal: env.mediaKeepOriginal,
      maxSizeMb: env.mediaMaxSizeMb,
      allowedTypes: env.mediaAllowedTypes,
      pathStyle: "date",
      folder: "",
    };
  });

  app.post("/media/upload", { preHandler: [app.authenticate] }, async (request, reply) => {
    const storedConfig = await loadConfig();
    const allowedTypes = storedConfig?.allowedTypes ?? env.mediaAllowedTypes;
    const maxSize = storedConfig?.maxSizeMb ?? env.mediaMaxSizeMb;
    const file = await request.file();
    if (!file) {
      return reply.code(400).send({ message: "File is required" });
    }

    if (!allowedTypes.includes(file.mimetype)) {
      return reply.code(400).send({ message: "Unsupported media type" });
    }

    const configRaw = file.fields?.config?.value ?? file.fields?.variants?.value;
    let parsedConfig = uploadConfigSchema.safeParse({});

    if (configRaw) {
      try {
        const parsedJson = typeof configRaw === "string" ? JSON.parse(configRaw) : JSON.parse(configRaw.toString());
        parsedConfig = uploadConfigSchema.safeParse(parsedJson);
      } catch (err) {
        request.log.warn({ err }, "media.upload config parse failed");
        return reply.code(400).send({ message: "Invalid config JSON" });
      }
    }

    if (!parsedConfig.success) {
      request.log.warn({ issues: parsedConfig.error.issues }, "media.upload config validation failed");
      return reply.code(400).send({ message: "Invalid config" });
    }

    const pathStyle = parsedConfig.data.pathStyle ?? storedConfig?.pathStyle ?? "date";
    const folder = parsedConfig.data.folder ?? storedConfig?.folder ?? "";

    const buffer = await file.toBuffer();

    if (buffer.length > maxSize * 1024 * 1024) {
      return reply.code(400).send({ message: "File exceeds size limit" });
    }

    const baseName = randomUUID();
    const datePath = buildStoragePath(pathStyle, folder);
    const variants = parsedConfig.data.variants?.length ? parsedConfig.data.variants : storedConfig?.variants ?? defaults;
    const keepOriginal = parsedConfig.data.keepOriginal ?? storedConfig?.keepOriginal ?? env.mediaKeepOriginal;

    const writtenVariants: MediaVariant[] = [];

    for (const variant of variants) {
      const saved = await writeVariant({ buffer, variant, baseName, datePath });
      writtenVariants.push(saved);
    }

    if (keepOriginal) {
      const targetDir = path.join(env.mediaStoragePath, datePath);
      const ext = path.extname(file.filename) || ".bin";
      const originalName = `${baseName}-original${ext}`;
      const targetPath = path.join(targetDir, originalName);
      const publicPath = datePath ? path.posix.join(datePath, originalName) : originalName;
      await ensureDir(targetDir);
      await fs.writeFile(targetPath, buffer);

      // Upload original to BunnyCDN if driver is bunny
      if (env.mediaDriver === "bunny") {
        await uploadToBunny(targetPath, publicPath);
      }

      writtenVariants.push({
        key: "original",
        format: ext.replace(".", "") || file.mimetype,
        size: buffer.length,
        fileName: originalName,
        publicPath,
        path: targetPath,
      });
    }

    const db = await getDb();
    const col = db.collection<MediaDoc>("media");
    const insert = await col.insertOne({
      originalName: file.filename,
      mime: file.mimetype,
      size: buffer.length,
      variants: writtenVariants,
      keepOriginal,
      status: "ready",
      createdAt: new Date(),
    });

    const toPublic = (variant: MediaVariant) => {
      const publicPath = (variant as any).publicPath ?? (variant as any).url ?? "";
      return {
        key: variant.key,
        format: variant.format,
        width: variant.width,
        height: variant.height,
        size: variant.size,
        fileName: variant.fileName ?? publicPath.split("/").pop() ?? "",
        path: publicPath,
      };
    };

    return reply.code(201).send({
      id: insert.insertedId.toString(),
      originalName: file.filename,
      mime: file.mimetype,
      size: buffer.length,
      variants: writtenVariants.map(toPublic),
      keepOriginal,
      status: "ready",
    });
  });

  app.get("/media", { preHandler: [app.authenticate] }, async (request) => {
    const parsed = listQuerySchema.parse(request.query);
    const db = await getDb();
    const col = db.collection<MediaDoc>("media");

    const filter: Record<string, unknown> = {};
    if (parsed.q) {
      filter.originalName = { $regex: parsed.q, $options: "i" };
    }
    if (parsed.mime) {
      filter.mime = parsed.mime;
    }
    if (parsed.status) {
      filter.status = parsed.status;
    }

    const total = await col.countDocuments(filter);
    const items = await col
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((parsed.page - 1) * parsed.limit)
      .limit(parsed.limit)
      .toArray();

    const toPublic = (variant: MediaVariant) => {
      const publicPath = (variant as any).publicPath ?? (variant as any).url ?? "";
      return {
        key: variant.key,
        format: variant.format,
        width: variant.width,
        height: variant.height,
        size: variant.size,
        fileName: variant.fileName ?? publicPath.split("/").pop() ?? "",
        path: publicPath,
      };
    };

    const sanitized = items.map(({ _id, variants, pathStyle, folder, ...rest }) => ({
      id: _id?.toString(),
      ...rest,
      variants: (variants as MediaVariant[] | undefined)?.map(toPublic) ?? [],
    }));

    return {
      items: sanitized,
      page: parsed.page,
      limit: parsed.limit,
      total,
    };
  });

  app.delete("/media/:id", { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    if (!ObjectId.isValid(id)) {
      return reply.code(400).send({ message: "Invalid id" });
    }

    const db = await getDb();
    const col = db.collection<MediaDoc>("media");
    const media = await col.findOne({ _id: new ObjectId(id) });
    if (!media) {
      return reply.code(404).send({ message: "Media not found" });
    }

    if (media.status === "pendingDelete") {
      return reply.code(202).send({ id, status: "pendingDelete" });
    }

    await col.updateOne({ _id: new ObjectId(id) }, { $set: { status: "pendingDelete", deletedAt: new Date() } });

    const paths = (media.variants ?? []).map((v) => v.path).filter(Boolean);
    await mediaDeleteQueue.add("delete", { id, paths });

    return reply.code(202).send({ id, status: "pendingDelete" });
  });

  app.post("/media/delete", { preHandler: [app.authenticate] }, async (request, reply) => {
    const parsed = deletePathsSchema.safeParse(request.body);
    if (!parsed.success) {
      request.log.warn({ issues: parsed.error.issues }, "media.deletePaths validation failed");
      return reply.code(400).send({ message: "Invalid payload" });
    }

    const sanitized = Array.from(new Set(parsed.data.paths.map((p) => p.replace(/\.\./g, "")).filter(Boolean)));
    if (!sanitized.length) {
      return reply.code(400).send({ message: "No paths to delete" });
    }

    await mediaDeleteQueue.add("delete-paths", { paths: sanitized, reason: parsed.data.reason ?? "manual" });
    return reply.code(202).send({ queued: true, count: sanitized.length });
  });
}
// @ts-nocheck