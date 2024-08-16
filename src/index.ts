import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";

export const unconsentedUserCleanup = onSchedule("every 5 mins", async () => {
  logger.info("Hello from auto-deployed function unconsentedUserCleanup!", { structuredData: true });
});
