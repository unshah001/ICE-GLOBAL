import { emailWorker } from "./workers/email";
import { imageWorker } from "./workers/image";
import { cacheWorker } from "./workers/cache";
import { digestWorker } from "./workers/digest";
import { logPruneWorker } from "./workers/log-prune";
import { activityPruneWorker } from "./workers/activity-prune";

export const workers = [emailWorker, imageWorker, cacheWorker, digestWorker, logPruneWorker, activityPruneWorker];
