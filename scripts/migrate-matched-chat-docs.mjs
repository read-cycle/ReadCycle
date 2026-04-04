import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { deleteApp, initializeApp } from 'firebase/app';
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  updateDoc
} from 'firebase/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envFile = process.env.ENV_FILE ?? '.env.production';
dotenv.config({ path: path.resolve(__dirname, '..', envFile) });

function readRequiredEnv(key) {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

const runtimeConfig = {
  appEnv: process.env.VITE_APP_ENV ?? 'production',
  firebase: {
    apiKey: readRequiredEnv('VITE_FIREBASE_API_KEY'),
    authDomain: readRequiredEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: readRequiredEnv('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: readRequiredEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: readRequiredEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: readRequiredEnv('VITE_FIREBASE_APP_ID'),
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
  }
};

const dryRun = process.argv.includes('--dry-run');

function buildPreview(messageData) {
  const text = typeof messageData.text === 'string' ? messageData.text.trim() : '';
  const hasImages =
    Array.isArray(messageData.imageUrls) ? messageData.imageUrls.length > 0 :
    typeof messageData.imageUrl === 'string' && messageData.imageUrl.length > 0;

  const raw = text || (hasImages ? 'Sent an image' : '');
  if (raw.length <= 80) return raw;
  return `${raw.slice(0, 77)}...`;
}

async function main() {
  const app = initializeApp(runtimeConfig.firebase);
  try {
    const db = getFirestore(app);
    const matchedSnapshot = await getDocs(collection(db, 'matched'));

    let updated = 0;

    for (const matchedEntry of matchedSnapshot.docs) {
      const messagesSnapshot = await getDocs(
        query(collection(matchedEntry.ref, 'messages'), orderBy('timestamp', 'desc'), limit(1))
      );

      const lastMessage = messagesSnapshot.docs[0];
      const lastMessageData = lastMessage?.data() ?? null;

      const updatePayload = {
        lastMessagePreview: lastMessageData ? buildPreview(lastMessageData) : '',
        lastMessageTimestamp: lastMessageData?.timestamp ?? matchedEntry.data().timestamp ?? null,
        unreadCountForUploader: 0,
        unreadCountForBuyer: 0
      };

      if (dryRun) {
        console.log(
          JSON.stringify(
            {
              docId: matchedEntry.id,
              current: {
                lastMessagePreview: matchedEntry.data().lastMessagePreview ?? '',
                lastMessageTimestamp: matchedEntry.data().lastMessageTimestamp ?? null,
                unreadCountForUploader: matchedEntry.data().unreadCountForUploader ?? null,
                unreadCountForBuyer: matchedEntry.data().unreadCountForBuyer ?? null
              },
              next: updatePayload
            },
            null,
            2
          )
        );
      } else {
        await updateDoc(doc(db, 'matched', matchedEntry.id), updatePayload);
      }

      updated += 1;
    }

    console.log(`${dryRun ? 'Previewed' : 'Updated'} ${updated} matched chat docs using ${envFile}.`);
  } finally {
    await deleteApp(app);
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
