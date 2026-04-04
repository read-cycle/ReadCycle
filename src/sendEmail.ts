import { runtimeConfig } from './config/runtime';

export async function sendEmail(email: string, subject: string, body: string) {
  if (!runtimeConfig.email.enabled || !runtimeConfig.email.endpoint) {
    return { skipped: true };
  }

  const res = await fetch(
    runtimeConfig.email.endpoint,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, subject, body }),
    }
  );

  const data = await res.json();
  return data;
}
