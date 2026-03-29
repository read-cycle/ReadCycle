export async function sendEmail(email: string, subject: string, body: string) {
  const res = await fetch(
    "https://sendemail-i6sbso7noa-uc.a.run.app",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, subject, body }),
    }
  );

  const data = await res.json();
  console.log("Email response:", data);
  return data;
}
