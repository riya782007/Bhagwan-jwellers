import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gold/20 bg-ink text-ivory mt-24">
      <div className="max-w-6xl mx-auto px-4 py-14 grid sm:grid-cols-4 gap-10 text-sm">
        <div className="sm:col-span-1">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-10 h-10 rounded-full border border-gold text-gold font-serif text-lg">BJ</span>
            <span className="font-serif text-xl">Bhagwan Jewellers</span>
          </div>
          <p className="mt-3 text-ivory/60 leading-relaxed">
            Wholesale manufacturers & exporters of handcrafted bridal, Polki & Kundan, Korean hair accessories and fashion jewellery. Serving buyers worldwide since 1982.
          </p>
        </div>

        <div>
          <div className="font-serif text-gold mb-3 text-base">Collection</div>
          <ul className="space-y-2 text-ivory/70">
            <li><Link href="/#collection" className="hover:text-gold">Bridal Jewellery</Link></li>
            <li><Link href="/#collection" className="hover:text-gold">Polki & Kundan</Link></li>
            <li><Link href="/#collection" className="hover:text-gold">Korean Hair Accessories</Link></li>
            <li><Link href="/#collection" className="hover:text-gold">Fashion Jewellery</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-serif text-gold mb-3 text-base">Visit & Contact</div>
          <ul className="space-y-2 text-ivory/70">
            <li>5133, Rui Mandi, Sadar Bazar,<br/>Delhi - 110006 (Near Hanuman Mandir)</li>
            <li><a href="https://wa.me/919654353586" className="hover:text-gold">WhatsApp: +91 96543 53586</a></li>
            <li><a href="tel:+919310612484" className="hover:text-gold">Phone: +91 93106 12484</a></li>
            <li><a href="mailto:bhagwanjewellers5133@gmail.com" className="hover:text-gold">bhagwanjewellers5133@gmail.com</a></li>
          </ul>
        </div>

        <div>
          <div className="font-serif text-gold mb-3 text-base">Follow</div>
          <ul className="space-y-2 text-ivory/70">
            <li><a href="https://www.instagram.com/bhagwan.jewellers/" target="_blank" rel="noreferrer" className="hover:text-gold">Instagram @bhagwan.jewellers</a></li>
            <li><a href="https://www.youtube.com/@Bhagwanjewellers" target="_blank" rel="noreferrer" className="hover:text-gold">YouTube @Bhagwanjewellers</a></li>
          </ul>
          <div className="mt-4 text-ivory/50 text-xs leading-relaxed">
            Wholesale & export enquiries welcome. Bulk orders and video-call shopping available.
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-ivory/50">
        © {new Date().getFullYear()} Bhagwan Jewellers · Rui Mandi, Sadar Bazar, Delhi · Established 1982
      </div>
    </footer>
  );
}
