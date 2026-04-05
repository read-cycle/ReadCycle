import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import { OAuth2Client } from "google-auth-library";
import type { Request, Response } from "express";
import cors from "cors";
import * as nodemailer from "nodemailer";

const corsHandler = cors({ origin: true });

const GMAIL_APP_PASSWORD = defineSecret("GMAIL_APP_PASSWORD");
const FUNCTION_URL = "https://asia-south1-book-exchange-22dd2.cloudfunctions.net/chatbotListings/";

const TITLE_SCAN_LIMIT = 100;
const googleTokenVerifier = new OAuth2Client();

if (!admin.apps.length) {
  admin.initializeApp();
}

type ChatbotListing = {
  title: string;
  grade: string | null;
  subject: string | null;
  price: number;
  quantity: number;
  isbn: string | null;
};

type SessionParameters = {
  grade?: string;
  subject?: string;
  title?: string;
};

const asOptionalString = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const normalizeSearchText = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

const buildFulfillmentResponse = (
  message: string,
  listings: ChatbotListing[] = [],
) => ({
  fulfillment_response: {
    messages: [
      {
        text: {
          text: [message],
        },
      },
    ],
  },
  session_info: {
    parameters: {
      listings,
      listingsCount: listings.length,
    },
  },
});

async function verifyGoogleCaller(
  req: Request,
): Promise<void> {
  const authHeader = req.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("missing-bearer-token");
  }

  const token = authHeader.slice("Bearer ".length).trim();

  if (!token) {
    throw new Error("empty-bearer-token");
  }

  await googleTokenVerifier.verifyIdToken({
    idToken: token,
    audience: FUNCTION_URL,
  });
}

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

export const chatbotListings = onRequest(
  {
    region: "asia-south1",
  },
  async (req, res) => {
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json(
        buildFulfillmentResponse(
          "This endpoint only accepts POST requests.",
        ),
      );
      return;
    }

    try {
      await verifyGoogleCaller(req);
    } catch (error) {
      console.warn("chatbotListings unauthorized request", error);
      res.status(401).json(buildFulfillmentResponse("Unauthorized"));
      return;
    }

    await handleChatbotListingsQuery(req, res);
  },
);

async function handleChatbotListingsQuery(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const parameters = (req.body?.sessionInfo?.parameters ?? {}) as SessionParameters;
    const grade = asOptionalString(parameters.grade);
    const subject = asOptionalString(parameters.subject);
    const title = asOptionalString(parameters.title);
    const normalizedTitle = title ? normalizeSearchText(title) : undefined;

    let query: FirebaseFirestore.Query = admin
      .firestore()
      .collection("uploadPool")
      .where("quantity", ">", 0);

    if (grade) {
      query = query.where("grade", "==", grade);
    }

    if (subject) {
      query = query.where("subject", "==", subject);
    }

    const snapshot = await query.limit(normalizedTitle ? TITLE_SCAN_LIMIT : 10).get();

    const matchingDocs = normalizedTitle
      ? snapshot.docs.filter((doc) => {
          const rawTitle = doc.get("title");
          return (
            typeof rawTitle === "string" &&
            normalizeSearchText(rawTitle).includes(normalizedTitle)
          );
        })
      : snapshot.docs;

    if (matchingDocs.length === 0) {
      res.status(200).json(
        buildFulfillmentResponse(
          "I couldn't find any book listings that match those filters.",
        ),
      );
      return;
    }

    const listings: ChatbotListing[] = matchingDocs.slice(0, 10).map((doc) => {
      const data = doc.data();

      return {
        title: typeof data.title === "string" ? data.title : "",
        grade: typeof data.grade === "string" ? data.grade : null,
        subject: typeof data.subject === "string" ? data.subject : null,
        price: typeof data.price === "number" ? data.price : 0,
        quantity: typeof data.quantity === "number" ? data.quantity : 0,
        isbn: typeof data.isbn === "string" ? data.isbn : null,
      };
    });

    const summary = listings
      .map((listing) => {
        const details = [
          listing.grade ? `Grade ${listing.grade}` : null,
          listing.subject,
          `Rs ${listing.price}`,
          `${listing.quantity} available`,
        ].filter(Boolean);

        return `${listing.title} (${details.join(", ")})`;
      })
      .join("; ");

    res.status(200).json(
      buildFulfillmentResponse(
        `I found ${listings.length} matching listing${listings.length === 1 ? "" : "s"}: ${summary}`,
        listings,
      ),
    );
    return;
  } catch (error) {
    console.error("chatbotListings failed", error);
    res.status(200).json(
      buildFulfillmentResponse(
        "I hit a temporary problem while checking listings. Please try again in a moment.",
      ),
    );
    return;
  }
}
