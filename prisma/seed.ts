import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  // ---- Admin user ----
  const email = process.env.ADMIN_EMAIL || "founder@newvora.in";
  const password = process.env.ADMIN_PASSWORD || "newvora-change-me";
  const passwordHash = await bcrypt.hash(password, 10);

  await db.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, name: "NewVora Founder", role: "OWNER" }
  });
  console.log(`✓ Admin: ${email}  (password: ${password})`);

  // ---- 4 starter products (real "WOW" archetypes) ----
  const products = [
    {
      slug: "self-stirring-mug",
      title: "Self-Stirring Magnetic Mug",
      tagline: "Stirs your coffee while you scroll. Battery-free.",
      bullets: JSON.stringify(["No spoon, no mess — magnetic stir in 5s", "BPA-free 350ml ceramic", "Works with hot & cold drinks"]),
      description: "The mug that does the boring part. A magnetic stirrer in the base activates with a button — your coffee, milk, protein shake, anything thick — perfectly mixed in seconds.",
      price: 79900, compareAt: 149900, costPrice: 28000,
      imagesJson: JSON.stringify([
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800",
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800"
      ]),
      category: "Kitchen", tags: "viral,gift,kitchen,gadget",
      faqJson: JSON.stringify([
        { q: "Is it dishwasher safe?", a: "Top rack only. Hand wash recommended for the magnetic base." },
        { q: "Does COD work in my pin code?", a: "Yes — we ship to 27,000+ pincodes via Shiprocket." },
        { q: "How long does shipping take?", a: "3–5 days metro, 5–7 days rest of India." }
      ]),
      founderNote: "I built NewVora because I was tired of Indian gadget stores selling junk. Every product here, I personally test for 30 days. If it doesn't make me say WOW, it doesn't make the cut. — Riya",
      isPublished: true, isHero: true, stock: 47, soldCount: 1247, rating: 4.7, reviewCount: 312
    },
    {
      slug: "posture-corrector-pro",
      title: "Posture Corrector Pro",
      tagline: "Stand straighter in 7 days. Doctors swear by it.",
      bullets: JSON.stringify(["Trains your back muscles passively", "Invisible under shirts", "Sized S/M/L/XL — ₹0 returns"]),
      description: "An adjustable smart brace that gently pulls your shoulders into the right position. Wear it 30 minutes a day and your default posture rewires itself in a week.",
      price: 99900, compareAt: 249900, costPrice: 32000,
      imagesJson: JSON.stringify([
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"
      ]),
      category: "Health", tags: "health,pain,viral,gift",
      faqJson: JSON.stringify([
        { q: "Will it fit me?", a: "Sizes XS-XXL. We send a free size-swap if it doesn't fit." },
        { q: "Is it visible under clothes?", a: "Designed to be invisible under most shirts and t-shirts." }
      ]),
      founderNote: "After 3 months of remote work my back was ruined. This brace genuinely fixed me. — Riya",
      isPublished: true, isHero: true, stock: 23, soldCount: 892, rating: 4.6, reviewCount: 218
    },
    {
      slug: "led-galaxy-projector",
      title: "LED Galaxy Star Projector",
      tagline: "Turn your bedroom into Coachella in 10 seconds.",
      bullets: JSON.stringify(["13 lighting modes + bluetooth speaker", "App + remote controlled", "Voice + party mode"]),
      description: "A bedroom projector that paints stars, nebulae, and moving auroras on your ceiling. Bluetooth speaker built in — sync the lights to your music.",
      price: 149900, compareAt: 299900, costPrice: 55000,
      imagesJson: JSON.stringify([
        "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800"
      ]),
      category: "Home", tags: "home,decor,gift,viral,bedroom",
      faqJson: JSON.stringify([
        { q: "Does it come with a warranty?", a: "1 year replacement warranty from NewVora." }
      ]),
      isPublished: true, isHero: false, stock: 38, soldCount: 2104, rating: 4.8, reviewCount: 504
    },
    {
      slug: "magnetic-spice-rack",
      title: "Magnetic Spice Rack (Set of 12)",
      tagline: "End the spice chaos. Stick anywhere, snap them out.",
      bullets: JSON.stringify(["12 jars, 100ml each", "Sticks to fridge / under cabinet", "Pre-printed labels included"]),
      description: "Twelve magnetic spice jars that snap onto any metal surface. The clearest, prettiest kitchen organisation upgrade you'll do this year.",
      price: 89900, compareAt: 159900, costPrice: 34000,
      imagesJson: JSON.stringify([
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800"
      ]),
      category: "Kitchen", tags: "kitchen,organize,gift,viral",
      isPublished: true, isHero: false, stock: 56, soldCount: 671, rating: 4.7, reviewCount: 189
    }
  ];

  for (const p of products) {
    await db.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p
    });
  }
  console.log(`✓ ${products.length} starter products seeded`);

  // ---- Seed reviews so PDPs don't look empty ----
  const reviewSeed = [
    { name: "Aarav S.", city: "Mumbai", rating: 5, title: "Worth every rupee", body: "Got it in 4 days. Build is way better than expected. My wife loves it." },
    { name: "Priya K.", city: "Bengaluru", rating: 5, title: "Made my morning easier", body: "I make protein shakes every day, this saves me a spoon and a wash. Smart buy." },
    { name: "Rohan M.", city: "Delhi", rating: 4, title: "Good but battery could be better", body: "Works great. Wish the battery lasted a bit longer between charges." },
    { name: "Anjali R.", city: "Pune", rating: 5, title: "Gifted to mom, she loves it", body: "She's been showing it off to everyone. Solid build." },
    { name: "Karthik V.", city: "Chennai", rating: 5, title: "10/10 would buy again", body: "Better than the Amazon equivalent at half the price. NewVora delivered fast too." },
  ];

  const allProducts = await db.product.findMany();
  for (const prod of allProducts) {
    const existing = await db.review.count({ where: { productId: prod.id } });
    if (existing > 0) continue;
    for (const r of reviewSeed) {
      await db.review.create({ data: { ...r, productId: prod.id, isApproved: true, isVerified: true } });
    }
  }
  console.log(`✓ Reviews seeded`);

  // ---- A few suppliers ----
  await db.supplier.upsert({
    where: { id: "seed-supplier-1" },
    update: {},
    create: {
      id: "seed-supplier-1",
      source: "indiamart",
      name: "Shree Krishna Trading Co.",
      contactName: "Mahesh Patel",
      phone: "+91-9876543210",
      whatsapp: "+91-9876543210",
      city: "Surat", state: "Gujarat",
      gstNumber: "24AAAAA0000A1Z5",
      productMatch: "kitchen gadgets, mugs, home accessories",
      unitPrice: 28000, moq: 50, rating: 4.4
    }
  });
  console.log("✓ Sample supplier seeded");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
