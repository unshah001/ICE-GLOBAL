import fp from "fastify-plugin";
import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifySensible from "@fastify/sensible";

export default fp(async (app) => {
  await app.register(fastifySensible);
  await app.register(fastifyCors, { origin: true, credentials: true });
  await app.register(fastifyHelmet);
  await app.register(fastifyRateLimit, {
    max: 200,
    timeWindow: "1 minute",
  });
});
