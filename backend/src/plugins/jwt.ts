import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import { env } from "../config/env";

export default fp(async (app) => {
  await app.register(fastifyJwt, {
    secret: env.jwtSecret,
    sign: { expiresIn: "1d" },
  });

  const authenticateAdmin = async (request: any, reply: any) => {
    try {
      const payload = await request.jwtVerify();
      if (payload.role !== "admin") {
        return reply.code(403).send({ message: "Admin access required" });
      }
    } catch (err) {
      reply.send(err);
    }
  };

  const authenticateUser = async (request: any, reply: any) => {
    try {
      const payload = await request.jwtVerify();
      if (payload.role !== "user") {
        return reply.code(403).send({ message: "User session required" });
      }
    } catch (err) {
      reply.send(err);
    }
  };

  app.decorate("authenticate", authenticateAdmin);
  app.decorate("authenticateAdmin", authenticateAdmin);
  app.decorate("authenticateUser", authenticateUser);
});
