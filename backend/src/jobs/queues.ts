import { Queue } from "bullmq";
import { getRedis } from "../db/redis";

const connection = getRedis();

export const emailQueue = new Queue("email", { connection });
export const imageQueue = new Queue("image-processing", { connection });
export const cacheQueue = new Queue("cache-warm", { connection });
export const digestQueue = new Queue("digest-send", { connection });
