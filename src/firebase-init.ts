import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, initializeFirestore } from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import { runtimeConfig } from './config/runtime';

const app = initializeApp(runtimeConfig.firebase);

const auth = getAuth(app);
const db = initializeFirestore(app, {
  // Forwarded emulator traffic behaves like a proxy hop; force long polling
  // to avoid WebChannel streaming failures on mobile/LAN test setups.
  experimentalForceLongPolling: runtimeConfig.useFirebaseEmulators,
  experimentalAutoDetectLongPolling: false
});
const storage = getStorage(app);

function getEmulatorHost() {
  const explicitHost = import.meta.env.VITE_FIREBASE_EMULATOR_HOST?.trim();
  if (explicitHost) return explicitHost;

  if (typeof window !== 'undefined' && window.location.hostname) {
    return window.location.hostname;
  }

  return '127.0.0.1';
}

function getEmulatorPort(key: 'VITE_FIREBASE_AUTH_EMULATOR_PORT' | 'VITE_FIREBASE_FIRESTORE_EMULATOR_PORT' | 'VITE_FIREBASE_STORAGE_EMULATOR_PORT', fallback: number) {
  const raw = import.meta.env[key];
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

if (runtimeConfig.useFirebaseEmulators) {
  const emulatorHost = getEmulatorHost();
  const authPort = getEmulatorPort('VITE_FIREBASE_AUTH_EMULATOR_PORT', 9099);
  const firestorePort = getEmulatorPort('VITE_FIREBASE_FIRESTORE_EMULATOR_PORT', 8080);
  const storagePort = getEmulatorPort('VITE_FIREBASE_STORAGE_EMULATOR_PORT', 9199);

  connectAuthEmulator(auth, `http://${emulatorHost}:${authPort}`, { disableWarnings: true });
  connectFirestoreEmulator(db, emulatorHost, firestorePort);
  connectStorageEmulator(storage, emulatorHost, storagePort);
}

export { app, auth, db, storage };
