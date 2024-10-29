import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";

import { QuerySnapshot, getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

initializeApp();

const QUERY_PAGE_SIZE = 100;

export const unconsentedUserCleanup = onSchedule("every 1 hour", async (event) => {
  logger.info('Starting cleanup of unconsented users');

  const firestore = getFirestore();
  const auth = getAuth();

  let snapshot: QuerySnapshot | null = null;

  const now = Date.now();

  do {
    // Get all users whose consent process has expired
    let querySnapshot = firestore
      .collection('user')
      .where('legalAcceptance.state', 'in', ['not-started', 'awaiting-parental-consent'])
      .where('legalAcceptance.expiresAt', '<=', now)
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
