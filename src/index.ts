import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";

export const unconsentedUserCleanup = onSchedule("every hour", async (event) => {
  logger.info("Hello functions!", { structuredData: true });
});
