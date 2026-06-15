import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-black/5 bg-muted-soft mt-20">
      <div className="max-w-6xl mx-auto px-4 py-10 grid sm:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="font-black text-xl">new<span className="text-brand">vora</span>.</div>
          <p className="mt-2 text-muted">Curated viral gadgets, shipped from India.</p>
        </div>
        <div>
          <div className="font-semibold mb-2">Shop</div>
          <ul className="space-y-1 text-muted">
            <li><Link href="/?cat=Kitchen">Kitchen</Link></li>
            <li><Link href="/?cat=Home">Home</Link></li>
            <li><Link href="/?cat=Health">Health & Wellness</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Help</div>
          <ul className="space-y-1 text-muted">
            <li><Link href="/track">Track order</Link></li>
            <li><Link href="/returns">Returns</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Trust</div>
          <ul className="space-y-1 text-muted">
            <li>Razorpay secure UPI</li>
            <li>Cash on Delivery</li>
            <li>7-day returns</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-black/5 py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} NewVora · Made in India · GSTIN coming soon
      </div>
    </footer>
  );
}
