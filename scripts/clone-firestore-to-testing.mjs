import fs from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { initializeApp, cert, getApps, deleteApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const TOP_LEVEL_COLLECTIONS = ['uploadPool', 'watchlist', 'buyerRequested', 'matched', 'stats_events'];
const IMAGE_STRING_KEYS = new Set(['listingImage', 'listingImageThumb', 'imageUrl']);
const IMAGE_ARRAY_KEYS = new Set(['extraImages', 'extraImageThumbs', 'imageUrls', 'imageThumbUrls']);
const EMAIL_KEYS = new Set(['email', 'buyerEmail', 'uploaderEmail']);
const ID_KEYS = new Set(['buyerID', 'uploaderID', 'senderID']);
const NAME_KEYS = new Set(['buyerName', 'uploaderName', 'sender']);

function requireEnv(key) {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

function readBooleanEnv(key, fallback = false) {
  const value = process.env[key];
  if (value == null) return fallback;
  return value === 'true';
}

function readIntegerEnv(key, fallback) {
  const value = process.env[key];
  const parsed = value ? Number.parseInt(value, 10) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

function shortHash(value) {
  return createHash('sha256').update(value).digest('hex').slice(0, 10);
}

function fakeUserId(value) {
  return `user_${shortHash(value)}`;
}

function fakeEmail(value) {
  return `user+${shortHash(value)}@example.test`;
}

function fakeDisplayName(value) {
  return `User ${shortHash(value).slice(0, 6)}`;
}

async function readServiceAccount(filePath) {
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(rootDir, filePath);
  const raw = await fs.readFile(absolutePath, 'utf8');
  return JSON.parse(raw);
}

async function readEnvFile(filePath) {
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(rootDir, filePath);
  const raw = await fs.readFile(absolutePath, 'utf8');
  return Object.fromEntries(
    raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const separatorIndex = line.indexOf('=');
        if (separatorIndex === -1) return [line, ''];
        return [line.slice(0, separatorIndex), line.slice(separatorIndex + 1)];
      })
  );
}

async function initializeNamedAdminApp(name, serviceAccountPath) {
  const existing = getApps().find((app) => app.name === name);
  if (existing) return existing;

  const serviceAccount = await readServiceAccount(serviceAccountPath);
  return initializeApp({ credential: cert(serviceAccount) }, name);
}

function sanitizeObjectLevelFields(record) {
  const nextRecord = { ...record };

  if (typeof nextRecord.buyerID === 'string') {
    const hashedId = fakeUserId(nextRecord.buyerID);
    nextRecord.buyerID = hashedId;
    if (typeof nextRecord.buyerEmail === 'string') nextRecord.buyerEmail = fakeEmail(nextRecord.buyerEmail);
    if (typeof nextRecord.buyerName === 'string') nextRecord.buyerName = fakeDisplayName(hashedId);
  }

  if (typeof nextRecord.uploaderID === 'string') {
    const hashedId = fakeUserId(nextRecord.uploaderID);
    nextRecord.uploaderID = hashedId;
    if (typeof nextRecord.uploaderEmail === 'string') nextRecord.uploaderEmail = fakeEmail(nextRecord.uploaderEmail);
    if (typeof nextRecord.uploaderName === 'string') nextRecord.uploaderName = fakeDisplayName(hashedId);
  }

  if (typeof nextRecord.senderID === 'string') {
    const hashedId = fakeUserId(nextRecord.senderID);
    nextRecord.senderID = hashedId;
    if (typeof nextRecord.sender === 'string') nextRecord.sender = fakeDisplayName(hashedId);
  }

  return nextRecord;
}

function sanitizeValue(value, key, targetDb) {
  if (value == null) return value;

  if (IMAGE_STRING_KEYS.has(key)) return '';
  if (IMAGE_ARRAY_KEYS.has(key)) return [];
  if (EMAIL_KEYS.has(key) && typeof value === 'string') return fakeEmail(value);
  if (ID_KEYS.has(key) && typeof value === 'string') return fakeUserId(value);
  if (NAME_KEYS.has(key) && typeof value === 'string') return fakeDisplayName(value);
  if (value instanceof Timestamp) return value;

  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeValue(entry, '', targetDb));
  }

  if (typeof value === 'object') {
    if ('path' in value && typeof value.path === 'string') {
      return targetDb.doc(value.path);
    }

    const nextRecord = sanitizeObjectLevelFields(value);
    return Object.fromEntries(
      Object.entries(nextRecord).map(([entryKey, entryValue]) => [
        entryKey,
        sanitizeValue(entryValue, entryKey, targetDb)
      ])
    );
  }

  return value;
}

function sanitizeDocumentData(rawData, targetDb) {
  const sanitized = sanitizeValue(rawData, '', targetDb);
  if (typeof sanitized !== 'object' || sanitized == null || Array.isArray(sanitized)) {
    throw new Error('Expected Firestore document data to sanitize into an object.');
  }
  return sanitized;
}

async function clearTargetData(targetDb, dryRun) {
  const matchedSnapshot = await targetDb.collection('matched').get();
  let deletedMatched = 0;

  for (const matchedDoc of matchedSnapshot.docs) {
    if (!dryRun) await targetDb.recursiveDelete(matchedDoc.ref);
    deletedMatched += 1;
  }

  const collectionsToClear = TOP_LEVEL_COLLECTIONS.filter((name) => name !== 'matched');
  let deletedTopLevel = 0;

  for (const collectionName of collectionsToClear) {
    const snapshot = await targetDb.collection(collectionName).get();
    if (!dryRun) {
      const writer = targetDb.bulkWriter();
      snapshot.docs.forEach((entry) => writer.delete(entry.ref));
      await writer.close();
    }
    deletedTopLevel += snapshot.size;
  }

  return { deletedMatched, deletedTopLevel };
}

async function cloneTopLevelCollection(sourceDb, targetDb, collectionName, dryRun) {
  const snapshot = await sourceDb.collection(collectionName).get();
  let copied = 0;
  const writer = dryRun ? null : targetDb.bulkWriter();

  snapshot.docs.forEach((entry) => {
    const sanitized = sanitizeDocumentData(entry.data(), targetDb);
    if (!dryRun) writer.set(targetDb.collection(collectionName).doc(entry.id), sanitized);
    copied += 1;
  });

  if (writer) await writer.close();
  return copied;
}

async function cloneMatchedMessages(sourceDb, targetDb, dryRun) {
  const matchedSnapshot = await sourceDb.collection('matched').get();
  let copiedThreads = 0;
  let copiedMessages = 0;

  for (const matchedEntry of matchedSnapshot.docs) {
    const sanitizedThread = sanitizeDocumentData(matchedEntry.data(), targetDb);
    if (!dryRun) await targetDb.collection('matched').doc(matchedEntry.id).set(sanitizedThread);
    copiedThreads += 1;

    const messagesSnapshot = await matchedEntry.ref.collection('messages').get();
    const writer = dryRun ? null : targetDb.bulkWriter();

    messagesSnapshot.docs.forEach((messageEntry) => {
      const sanitizedMessage = sanitizeDocumentData(messageEntry.data(), targetDb);
      if (!dryRun) {
        writer.set(
          targetDb.collection('matched').doc(matchedEntry.id).collection('messages').doc(messageEntry.id),
          sanitizedMessage
        );
      }
      copiedMessages += 1;
    });

    if (writer) await writer.close();
  }

  return { copiedThreads, copiedMessages };
}

async function cloneIntoTarget({ label, targetDb, dryRun, wipeTarget, sourceDb }) {
  console.log(`Cloning Firestore into ${label}${dryRun ? ' (dry run)' : ''}.`);

  if (wipeTarget) {
    const cleared = await clearTargetData(targetDb, dryRun);
    console.log(`[${label}] Cleared target data: ${cleared.deletedMatched} matched threads and ${cleared.deletedTopLevel} top-level docs.`);
  }

  let copiedDocs = 0;
  for (const collectionName of TOP_LEVEL_COLLECTIONS.filter((name) => name !== 'matched')) {
    const count = await cloneTopLevelCollection(sourceDb, targetDb, collectionName, dryRun);
    copiedDocs += count;
    console.log(`[${label}] Copied ${count} docs from ${collectionName}.`);
  }

  const matchedCounts = await cloneMatchedMessages(sourceDb, targetDb, dryRun);
  console.log(`[${label}] Copied ${matchedCounts.copiedThreads} matched threads and ${matchedCounts.copiedMessages} messages.`);
  console.log(`[${label}] Completed clone${dryRun ? ' dry run' : ''}: ${copiedDocs + matchedCounts.copiedThreads} top-level docs processed.`);
}

function checkPortOpen(host, port, timeoutMs = 500) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });

    const finish = (isOpen) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(isOpen);
    };

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
  });
}

async function createEmulatorFirestore(projectId, host, port) {
  const previousHost = process.env.FIRESTORE_EMULATOR_HOST;
  const emulatorHost = `${host}:${port}`;
  process.env.FIRESTORE_EMULATOR_HOST = emulatorHost;

  const emulatorApp = initializeApp({ projectId }, `clone-target-emulator-${Date.now()}`);
  const emulatorDb = getFirestore(emulatorApp);

  return {
    db: emulatorDb,
    async cleanup() {
      await deleteApp(emulatorApp);
      if (previousHost == null) {
        delete process.env.FIRESTORE_EMULATOR_HOST;
      } else {
        process.env.FIRESTORE_EMULATOR_HOST = previousHost;
      }
    }
  };
}

async function main() {
  const productionEnv = await readEnvFile('.env.production');
  const localEnv = await readEnvFile('.env.local');

  const sourceProjectId = process.env.SOURCE_PROJECT_ID ?? productionEnv.VITE_FIREBASE_PROJECT_ID ?? requireEnv('SOURCE_PROJECT_ID');
  const sourceServiceAccountPath = requireEnv('SOURCE_SERVICE_ACCOUNT_PATH');
  const testingProjectId = process.env.TESTING_PROJECT_ID ?? localEnv.VITE_FIREBASE_PROJECT_ID ?? requireEnv('TESTING_PROJECT_ID');
  const testingServiceAccountPath = process.env.TESTING_SERVICE_ACCOUNT_PATH ?? process.env.TARGET_SERVICE_ACCOUNT_PATH ?? requireEnv('SOURCE_SERVICE_ACCOUNT_PATH');
  const dryRun = readBooleanEnv('DRY_RUN', false);
  const wipeTarget = readBooleanEnv('WIPE_TARGET', true);
  const cloneToEmulator = readBooleanEnv('CLONE_TO_EMULATOR', true);
  const emulatorProjectId = process.env.EMULATOR_PROJECT_ID ?? testingProjectId;
  const emulatorHost = process.env.VITE_FIREBASE_EMULATOR_HOST ?? localEnv.VITE_FIREBASE_EMULATOR_HOST ?? '127.0.0.1';
  const emulatorPort = Number.parseInt(
    process.env.VITE_FIREBASE_FIRESTORE_EMULATOR_PORT ?? localEnv.VITE_FIREBASE_FIRESTORE_EMULATOR_PORT ?? '8080',
    10
  );

  const sourceApp = await initializeNamedAdminApp('clone-source', sourceServiceAccountPath);
  const testingApp = await initializeNamedAdminApp('clone-target-testing', testingServiceAccountPath);
  const sourceDb = getFirestore(sourceApp, sourceProjectId);
  const testingDb = getFirestore(testingApp, testingProjectId);

  const cleanupTasks = [];

  try {
    console.log(`Cloning Firestore from ${sourceProjectId} into testing project ${testingProjectId}${dryRun ? ' (dry run)' : ''}.`);
    await cloneIntoTarget({
      label: `testing:${testingProjectId}`,
      targetDb: testingDb,
      dryRun,
      wipeTarget,
      sourceDb
    });

    if (cloneToEmulator && await checkPortOpen(emulatorHost, emulatorPort)) {
      const emulatorTarget = await createEmulatorFirestore(emulatorProjectId, emulatorHost, emulatorPort);
      cleanupTasks.push(emulatorTarget.cleanup);

      await cloneIntoTarget({
        label: `emulator:${emulatorHost}:${emulatorPort}`,
        targetDb: emulatorTarget.db,
        dryRun,
        wipeTarget,
        sourceDb
      });
    } else if (cloneToEmulator) {
      console.log(`Skipping emulator clone because ${emulatorHost}:${emulatorPort} is not reachable.`);
    }
  } finally {
    while (cleanupTasks.length) {
      const cleanup = cleanupTasks.pop();
      await cleanup();
    }
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
