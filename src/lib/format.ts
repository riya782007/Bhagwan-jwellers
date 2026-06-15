export const inr = (paise: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paise / 100);

export const percentOff = (price: number, compareAt?: number | null) => {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
};

export const orderNumber = (n: number) => `BJ-${String(n).padStart(5, "0")}`;
