import { getDb } from "../db/mongo";

/**
 * Returns whether a notification event is enabled.
 * Defaults to true when not configured.
 */
export const isNotificationEnabled = async (event: string) => {
  try {
    const db = await getDb();
    const doc = await db
      .collection<{ map?: Record<string, { enabled: boolean }> }>("notification_settings")
      .findOne({ _id: "global" });
    const map = doc?.map || {};
    return map[event]?.enabled ?? true;
  } catch {
    return true;
  }
};
