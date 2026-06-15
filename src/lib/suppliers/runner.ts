import { db } from "../db";
import { findSupplierForTitle } from "./index";

/** For every published product without a supplier, try to find one. */
async function main() {
  const products = await db.product.findMany({ where: { supplierId: null, isPublished: true } });
  console.log(`Finding suppliers for ${products.length} products…`);
  for (const p of products) {
    const s = await findSupplierForTitle(p.title).catch(() => null);
    if (s) {
      await db.product.update({ where: { id: p.id }, data: { supplierId: s.id } });
      console.log(`  ✓ ${p.title} → ${s.name}`);
    } else {
      console.log(`  · ${p.title} — no match`);
    }
  }
}
main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
