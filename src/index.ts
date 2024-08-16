import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";

export const testFunction2 = onSchedule("every hour", async () => {
  logger.info("Hello functions 2!", { structuredData: true });
});
