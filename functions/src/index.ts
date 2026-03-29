import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import cors from "cors";

const corsHandler = cors({ origin: true });

const BREVO_KEY = defineSecret("BREVO_KEY");

export const sendEmail = onRequest(
  {
    secrets: [BREVO_KEY],
  },
  async (req, res) => {
    corsHandler(req, res, async () => {
      try {
        const { email, subject, body } = req.body;

        if (!email || !subject || !body) {
          return res.status(400).json({ error: "Missing required fields" });
        }

        const apiKey = BREVO_KEY.value();

        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": apiKey,
            "accept": "application/json",
          },
          body: JSON.stringify({
            sender: { email: "read.cycle.inv@gmail.com", name: "ReadCycle" },
            to: [{ email }],
            subject,
            htmlContent: body,
          }),
        });

        const data = await response.json();
        return res.status(200).json(data);

      } catch (error: any) {
        console.error(error);
        return res.status(500).json({ error: error.message || error.toString() });
      }
    });
  }
);