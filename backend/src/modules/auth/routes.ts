// @ts-nocheck
import { FastifyInstance } from "fastify";
import { env } from "../../config/env";
import { z } from "zod";

export default async function authRoutes(app: FastifyInstance) {
  const loginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
  });

  const refreshSchema = z.object({
    refreshToken: z.string().min(10),
  });

  app.post(
    "/auth/login",
    {
      schema: {
        body: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: { type: "string" },
            password: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const parse = loginSchema.safeParse(request.body);
      if (!parse.success) {
        request.log.warn(
          { reason: "validation_failed", issues: parse.error.issues },
          "auth.login validation failed"
        );
        return reply.code(400).send({ message: "username and password are required" });
      }

      const { username, password } = parse.data;
      const isValid = username === env.adminUser && password === env.adminPassword;

      if (!isValid) {
        request.log.warn({ username, reason: "invalid_credentials" }, "auth.login failed");
        return reply.code(401).send({ message: "Invalid credentials" });
      }

      request.log.info({ username }, "auth.login success");

      const accessToken = app.jwt.sign({ sub: username, role: "admin" }, { expiresIn: "24h" } as any);

      const refreshToken = (app.jwt as any).sign(
        { sub: username, role: "admin", type: "refresh" },
        { expiresIn: "30d", secret: env.jwtRefreshSecret }
      );

      return { accessToken, refreshToken };
    }
  );

  app.post(
    "/auth/refresh",
    {
      schema: {
        body: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const parse = refreshSchema.safeParse(request.body);
      if (!parse.success) {
        request.log.warn(
          { reason: "validation_failed", issues: parse.error.issues },
          "auth.refresh validation failed"
        );
        return reply.code(400).send({ message: "refreshToken is required" });
      }
      try {
        const payload = (app.jwt as any).verify(parse.data.refreshToken, { secret: env.jwtRefreshSecret }) as { sub: string };
        request.log.info({ sub: payload.sub }, "auth.refresh success");
        const accessToken = app.jwt.sign({ sub: payload.sub, role: "admin" }, { expiresIn: "24h" } as any);
        return { accessToken };
      } catch {
        request.log.warn({ reason: "invalid_refresh_token" }, "auth.refresh failed");
        return reply.code(401).send({ message: "Invalid refresh token" });
      }
    }
  );
}
// @ts-nocheck
