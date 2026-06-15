import { runTrendingScan } from "./index";

runTrendingScan()
  .then(r => { console.log("DONE", r); process.exit(0); })
  .catch(e => { console.error(e); process.exit(1); });
