/**
 * Psychology helpers: scarcity messages, social-proof toasts, and copy banks.
 * Pure functions — safe on client and server.
 */

const FIRST_NAMES = ["Riya","Aarav","Priya","Rohan","Anjali","Karthik","Neha","Vikram","Sneha","Arjun","Pooja","Siddharth","Kavya","Aditya","Meera","Rahul","Ishita","Aniket","Diya","Yash"];
const CITIES = ["Mumbai","Delhi","Bengaluru","Pune","Hyderabad","Chennai","Kolkata","Ahmedabad","Jaipur","Lucknow","Surat","Indore","Chandigarh","Kochi","Nagpur"];
const VERBS = ["just ordered","added to cart","reviewed 5★","just bought 2 of"];

export function socialProofMessage(productTitle: string) {
  const name = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const city = CITIES[Math.floor(Math.random() * CITIES.length)];
  const verb = VERBS[Math.floor(Math.random() * VERBS.length)];
  const minutes = 1 + Math.floor(Math.random() * 47);
  return `${name} from ${city} ${verb} "${productTitle}" · ${minutes}m ago`;
}

export function scarcityLine(stock: number) {
  if (stock <= 0) return { text: "Sold out — restock in 7 days", tone: "warn" as const };
  if (stock <= 5) return { text: `Only ${stock} left at this price`, tone: "danger" as const };
  if (stock <= 15) return { text: `Selling fast — ${stock} left`, tone: "danger" as const };
  if (stock <= 30) return { text: `In stock · ships in 24h`, tone: "ok" as const };
  return { text: "In stock · ships in 24h", tone: "ok" as const };
}

/** Returns an end-time (ms epoch) for a "deal ends in" timer that resets every X hours per browser. */
export function dealEndsAt(hoursWindow = 6): number {
  // Anchor to next multiple of `hoursWindow` from midnight, so it feels real & resets predictably.
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime();
  const slot = Math.floor((Date.now() - start) / (hoursWindow * 3600 * 1000)) + 1;
  return start + slot * hoursWindow * 3600 * 1000;
}

export const TRUST_BADGES = [
  { label: "Cash on Delivery", icon: "wallet" },
  { label: "7-Day Easy Returns", icon: "rotate-ccw" },
  { label: "Razorpay Secure", icon: "shield-check" },
  { label: "Ships in 24 hours", icon: "truck" }
];

export const FREE_GIFT_THRESHOLD_PAISE = 149900; // ₹1,499
