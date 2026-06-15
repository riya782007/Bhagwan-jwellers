export function AnnouncementBar() {
  const items = [
    "Wholesale & Export enquiries welcome",
    "Worldwide shipping",
    "Trusted since 1982 · Rui Mandi, Sadar Bazar, Delhi",
    "Bulk orders & video-call shopping",
    "Bridal · Polki & Kundan · Korean Accessories · Fashion"
  ];
  return (
    <div className="bg-ink text-gold-light text-[11px] sm:text-xs overflow-hidden tracking-wide">
      <div className="flex animate-marquee whitespace-nowrap py-2">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="px-8 opacity-90">{t} <span className="text-gold">✦</span></span>
        ))}
      </div>
    </div>
  );
}
