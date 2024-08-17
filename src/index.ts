import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";

import { QuerySnapshot, getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

initializeApp();

const DELETION_THRESHOLD_MS = 2 * 24 * 60 * 60 * 1000; // 2 days
const QUERY_PAGE_SIZE = 100;

export const unconsentedUserCleanup = onSchedule("every 5 mins", async (event) => {
  logger.info('Starting cleanup of unconsented users');

  const firestore = getFirestore();
  const auth = getAuth();

  let snapshot: QuerySnapshot | null = null;

  do {
    // Get all users who are awaiting parental consent
    // TODO: also get users in "started" state?
    let querySnapshot = firestore
      .collection('user')
      .where('legalAcceptance.state', '==', 'awaiting-parental-consent')
      .where('legalAcceptance.autoDelete', '==', true)
      .limit(QUERY_PAGE_SIZE);
    
    const lastDocInSnapshot = snapshot?.docs[snapshot?.docs.length - 1];
    if (lastDocInSnapshot) {
      querySnapshot = querySnapshot.startAfter(lastDocInSnapshot);
    }

    logger.debug('Querying page of users');
    snapshot = await querySnapshot.get();
    logger.info(`Found ${snapshot.size} users to process`);

    for (const doc of snapshot.docs) {
      const userId = doc.id;
      logger.info('Processing user', { userId: userId });

      // Parse the "sent at" field
      const sentAtString: unknown = doc.get('legalAcceptance.sentAt');
      if (!sentAtString || typeof sentAtString !== 'string') {
        logger.error(`'sentAt' string field does not exist in user doc. Skipping user`, { userId: userId });
        continue;
      }

      const sentAtDateMs = Date.parse(sentAtString);
      if (isNaN(sentAtDateMs)) {
        logger.error(`'sentAt' field is not a valid datetime`, { userId: userId });
        continue;
      }

      // Check if time threshold for deletion has been reached
      if (Date.now() - sentAtDateMs < DELETION_THRESHOLD_MS) {
        logger.info('Time threshold for deletion not reached. Skipping user', { userId: userId });
        continue;
      }

      logger.info('Should delete user', { userId: userId });

      // // Delete the user
      // try {
      //   await auth.deleteUser(userId);
      //   logger.info('Successfully deleted user', { userId: userId });
      // } catch (e) {
      //   if (e && typeof e === 'object' && 'code' in e && e.code === 'auth/user-not-found') {
      //     logger.warn('Failed to delete user because user was not found. Proceeding anyway', { userId: userId });
      //   } else {
      //     logger.error(`Failed to delete user: ${JSON.stringify(e)}`, { userId: userId });
      //     continue;
      //   }
      // }

      // // Delete the user doc
      // try {
      //   await doc.ref.delete();
      //   logger.info('Successfully deleted doc for user', { userId: userId });
      // } catch (e) {
      //   logger.error(`Failed to delete doc: ${JSON.stringify(e)}`, { userId: userId });
      //   continue;
      // }

      logger.info('Finished processing user', { userId: userId });
    }
    
    logger.info('Finished processing page of users');
  } while (snapshot.size > 0);
});
