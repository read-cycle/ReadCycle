import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { doc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.join(__dirname, 'seeds', 'demo-data.json');
const envFile = process.env.ENV_FILE ?? '.env.local';

dotenv.config({ path: path.resolve(__dirname, '..', envFile) });

function readRequiredEnv(key) {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

const runtimeConfig = {
  appEnv: process.env.VITE_APP_ENV ?? 'production',
  useFirebaseEmulators: process.env.VITE_USE_FIREBASE_EMULATORS === 'true',
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

async function main() {
  if (runtimeConfig.appEnv === 'production') {
    throw new Error('This action is blocked in production.');
  }

  if (runtimeConfig.useFirebaseEmulators) {
    console.warn('Seed script is targeting emulator-configured credentials. Make sure your emulators are running.');
  }

  const raw = await fs.readFile(seedPath, 'utf8');
  const data = JSON.parse(raw);

  const app = initializeApp(runtimeConfig.firebase);
  const db = getFirestore(app);

  await Promise.all(
    (data.uploadPool ?? []).map((entry) =>
      setDoc(doc(db, 'uploadPool', entry.id), {
        ...entry,
        timestamp: serverTimestamp()
      })
    )
  );

  await Promise.all(
    (data.watchlist ?? []).map((entry) =>
      setDoc(doc(db, 'watchlist', entry.id), {
        ...entry,
        timestamp: serverTimestamp()
      })
    )
  );

  console.log(`Seeded ${data.uploadPool?.length ?? 0} uploadPool docs and ${data.watchlist?.length ?? 0} watchlist docs using ${envFile}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
