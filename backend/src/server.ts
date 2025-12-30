import { buildApp } from "./app";
import { env } from "./config/env";
import { getDb } from "./db/mongo";
import { getRedis } from "./db/redis";
import "./jobs";

const start = async () => {
  const app = buildApp();
  try {
    await getDb();
    app.log.info("MongoDB connection OK");
    try {
      const redis = getRedis();
      await redis.ping();
      app.log.info("Redis connection OK");
    } catch (redisErr) {
      app.log.error({ err: redisErr }, "Redis connection failed");
      throw redisErr;
    }
    await app.listen({ port: env.port, host: "0.0.0.0" });
    app.log.info(`Server listening on ${env.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
