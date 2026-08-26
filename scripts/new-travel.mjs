import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const [, , rawSlug, ...titleParts] = process.argv;
const slug = rawSlug?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const title = titleParts.join(" ").trim();
if (!slug || !title) {
  console.error('Usage: npm run new:travel -- "trip-slug" "Trip title"');
  process.exit(1);
}
const destination = resolve("src/content/travel", `${slug}.md`);
if (existsSync(destination)) throw new Error(`A Travel entry already exists at ${destination}`);
const today = new Date().toISOString().slice(0, 10);
writeFileSync(destination, `---\ntitle: ${title}\nsummary: Replace with a short, public-facing description.\nstartDate: ${today}\nendDate: ${today}\ndestinations: [\"City, Region\"]\nthemes: []\nfeatured: false\ndraft: true\nlanguage: zh\ngallery: []\nhighlights: []\npracticalNotes: []\n---\n\nWrite the story here. Avoid exact addresses, booking references, and private itinerary details.\n`, { flag: "wx" });
console.log(`Created ${destination}`);
