export function AnnouncementBar() {
  const items = [
    "FREE shipping over ₹699",
    "Cash on Delivery available",
    "Ships in 24 hours · Tracking on WhatsApp",
    "7-day easy returns",
    "Razorpay secure UPI checkout"
  ];
  return (
    <div className="bg-ink text-white text-xs sm:text-sm overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap py-2">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="px-8 opacity-90">{t} ·</span>
        ))}
      </div>
    </div>
  );
}
