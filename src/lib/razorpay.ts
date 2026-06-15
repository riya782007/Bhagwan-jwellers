import Razorpay from "razorpay";
import crypto from "crypto";

let _client: Razorpay | null = null;

export function razorpay(): Razorpay {
  if (_client) return _client;
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error("Razorpay keys not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }
  _client = new Razorpay({ key_id, key_secret });
  return _client;
}

/** Server-side: create an order (amount in paise). */
export async function createOrder(args: { amountPaise: number; receipt: string; notes?: Record<string, string> }) {
  return razorpay().orders.create({
    amount: args.amountPaise,
    currency: "INR",
    receipt: args.receipt,
    notes: args.notes
  });
}

/** Verify the checkout signature from the browser. */
export function verifySignature(args: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): boolean {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = args;
  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return expected === razorpay_signature;
}

/** Verify a webhook payload signature. */
export function verifyWebhook(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return expected === signature;
}
