import { FastifyPluginAsync } from "fastify";
import { getRedis } from "../db/redis";

type TtlMap = Record<string, number>;

const CACHEABLE_ROUTES = new Set<string>([
  "/hero",
  "/brands",
  "/brands/highlights",
  "/brands/hero",
  "/brands/:slug",
  "/sellers",
  "/sellers/hero",
  "/sellers/list",
  "/sellers/detail-copy",
  "/sellers/:id",
  "/buyers",
  "/buyers/hero",
  "/buyers/list",
  "/buyers/:id",
  "/teams",
  "/teams/hero",
  "/teams/detail-copy",
  "/teams/list",
  "/teams/:id",
  "/founders",
  "/founders/hero",
  "/founders/list",
  "/founders/detail-copy",
  "/founders/:id",
  "/cofounders",
  "/cofounders/hero",
  "/cofounders/list",
  "/cofounders/detail-copy",
  "/cofounders/:id",
  "/celebrities",
  "/vvips",
  "/arches",
  "/stalls",
  "/buyer-mosaic",
  "/timeline",
  "/review",
  "/gallery",
  "/gallery/hero",
  "/gallery/:id",
  "/gallery-detail/copy",
  "/metrics/overview",
  "/metrics/timeline",
  "/about",
  "/counts",
  "/dual-cta",
  "/footer",
  "/contact",
  "/cookies",
  "/feedback",
  "/partner",
  "/sponsor",
  "/privacy",
  "/terms",
  "/not-found",
  "/submit-success",
  "/testimonials",
  "/testimonials/list",
  "/branding",
  "/templates",
  "/templates/:slug",
  "/theme",
  "/notifications/settings",
  "/forms",
  "/forms/:slug",
  "/profile/config",
  "/health",
  "/ready",
]);

const TTL_SECONDS: TtlMap = {
  "/gallery": 180,
  "/gallery/:id": 90,
  "/gallery/hero": 600,
  "/brands": 600,
  "/brands/:slug": 600,
  "/forms": 300,
  "/forms/:slug": 300,
};

const defaultTtl = 300;

const shouldBypass = (request: any) => {
  const control = (request.headers["cache-control"] as string | undefined) || "";
  return control.toLowerCase().includes("no-cache");
};

const buildKey = (request: any) => {
  const path = request.routerPath || request.url;
  const payload = {
    path,
    params: request.params || {},
    query: request.query || {},
  };
  return `cache:${path}:${JSON.stringify(payload)}`;
};

export const cachePlugin: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", async (request, reply) => {
    if (request.method !== "GET") return;
    const path = request.routerPath || request.url;
    if (!path || !CACHEABLE_ROUTES.has(path)) return;
    if (shouldBypass(request)) return;

    const key = buildKey(request);
    try {
      const redis = getRedis();
     const cached = await redis.get(key);
if (cached) {
  const parsed = JSON.parse(cached);
  if (parsed?.statusCode >= 400 || parsed?.error || parsed?.message) {
    await redis.del(key);
    return;
  }
  const ttl = TTL_SECONDS[path] || defaultTtl;
  reply.header("Cache-Control", `public, max-age=${ttl}`);
  reply.header("X-Cache", "HIT");
  return reply.send(parsed);
}
      (request as any)._cacheKey = key;
      reply.header("X-Cache", "MISS");
    } catch {
      // ignore cache errors
    }
  });

  app.addHook("onSend", async (request, reply, payload) => {
    if (request.method !== "GET") return payload;
    const path = request.routerPath;
    if (!path || !CACHEABLE_ROUTES.has(path)) return payload;
    if (shouldBypass(request)) return payload;
    if (reply.statusCode < 200 || reply.statusCode >= 300) return payload;

    const key = (request as any)._cacheKey as string | undefined;
    if (!key) return payload;

    try {
      const redis = getRedis();
      const ttl = TTL_SECONDS[path] || defaultTtl;
      const serialized = typeof payload === "string" ? payload : JSON.stringify(payload ?? {});
      await redis.setex(key, ttl, serialized);
      reply.header("Cache-Control", `public, max-age=${ttl}`);
    } catch {
      // ignore cache set errors
    }
    return payload;
  });
};

export default cachePlugin;
