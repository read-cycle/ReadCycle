import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import cors from "cors";
import * as nodemailer from "nodemailer";

const corsHandler = cors({ origin: true });

const GMAIL_APP_PASSWORD = defineSecret("GMAIL_APP_PASSWORD");

export const sendEmail = onRequest(
  {
    secrets: [GMAIL_APP_PASSWORD],
    region: "asia-south1"
  },
  async (req, res) => {
    corsHandler(req, res, async () => {
      try {
        const { email, subject, body } = req.body;

        if (!email || !subject || !body) {
          return res.status(400).json({ error: "Missing required fields" });
        }

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "readcycle@inventureacademy.com",
            pass: GMAIL_APP_PASSWORD.value(),
          },
        });

        await transporter.sendMail({
          from: "ReadCycle <readcycle@inventureacademy.com>",
          to: email,
          subject,
          html: body,
        });

        return res.status(200).json({ success: true });

      } catch (error: any) {
        console.error(error);
        return res.status(500).json({ error: error.message || error.toString() });
      }
    });
  }
);