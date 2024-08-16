import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";

import { QuerySnapshot, getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

initializeApp();

const DELETION_THRESHOLD_MS = 2 * 24 * 60 * 60 * 1000; // 2 days
const QUERY_PAGE_SIZE = 100;

export const unconsentedUserCleanup = onSchedule("every 5 mins", async (event) => {
  logger.info("Hello logs!", { structuredData: true });

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

    console.log('Querying page of users');
    snapshot = await querySnapshot.get();
    console.log(`Found ${snapshot.size} users to process`);

    for (const doc of snapshot.docs) {
      const userId = doc.id;
      console.log(`Processing user ${userId}`);

      // Parse the "sent at" field
      const sentAtString = doc.get('legalAcceptance.sentAt');
      if (!sentAtString || typeof sentAtString !== 'string') {
        console.error(`'sentAt' string field does not exist in user doc. Skipping user`);
        continue;
      }

      const sentAtDateMs = Date.parse(sentAtString);
      if (isNaN(sentAtDateMs)) {
        console.error(`'sentAt' field is not a valid datetime`);
        continue;
      }

      // Check if time threshold for deletion has been reached
      if (Date.now() - sentAtDateMs < DELETION_THRESHOLD_MS) {
        console.log('Time threshold for deletion not reached. Skipping user');
        continue;
      }

      console.log(`Should delete user ${userId}`);

      // // Delete the user
      // try {
      //   await auth.deleteUser(userId);
      //   console.log(`Successfully deleted user ${userId}`);
      // } catch (e) {
      //   if (e && typeof e === 'object' && 'code' in e && e.code === 'auth/user-not-found') {
      //     console.warn(`Failed to delete user because user was not found. Proceeding anyway`);
      //   } else {
      //     console.error(`Failed to delete user: ${e}`);
      //     continue;
      //   }
      // }

      // // Delete the user doc
      // try {
      //   await doc.ref.delete();
      //   console.log(`Successfully deleted doc for user ${userId}`);
      // } catch (e) {
      //   console.error(`Failed to delete doc: ${e}`);
      //   continue;
      // }

      console.log(`Finished processing user ${userId}`);
    }
    
    console.log('Finished processing page of users');
  } while (snapshot.size > 0);
});
