function readRequiredEnv(key: keyof ImportMetaEnv) {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

function readBooleanEnv(value: string | undefined, fallback = false) {
  if (value == null) return fallback;
  return value === 'true';
}

export const runtimeConfig = {
  appEnv: import.meta.env.VITE_APP_ENV ?? 'production',
  useFirebaseEmulators: readBooleanEnv(import.meta.env.VITE_USE_FIREBASE_EMULATORS, false),
  firebase: {
    apiKey: readRequiredEnv('VITE_FIREBASE_API_KEY'),
    authDomain: readRequiredEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: readRequiredEnv('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: readRequiredEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: readRequiredEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: readRequiredEnv('VITE_FIREBASE_APP_ID'),
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  },
  email: {
    endpoint: import.meta.env.VITE_SEND_EMAIL_URL ?? '',
    enabled: readBooleanEnv(import.meta.env.VITE_ENABLE_TRANSACTIONAL_EMAILS, false)
  }
} as const;

export function assertNonProductionEnvironment() {
  if (runtimeConfig.appEnv === 'production') {
    throw new Error('This action is blocked in production.');
  }
}
