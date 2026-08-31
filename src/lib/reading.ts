import snapshot from "../data/reading.snapshot.json";
import { z } from "astro/zod";

const item = z.object({
  title: z.string().min(1),
  author: z.string().optional(),
  publisher: z.string().optional(),
  country: z.string().optional(),
  medium: z.string().optional(),
  types: z.array(z.string()).optional(),
  language: z.string().optional(),
  rating: z.string().max(16).optional(),
  doubanScore: z.number().min(0).max(10).optional(),
}).strict();

const readingSnapshot = z.object({
  schemaVersion: z.literal(1),
  generatedAt: z.iso.datetime(),
  year: z.number().int(),
  current: z.array(item),
  completedThisYear: z.array(item),
  history: z.array(z.object({ year: z.number().int(), count: z.number().int().positive() }).strict()),
}).strict();

export type ReadingItem = z.infer<typeof item>;
export type ReadingSnapshot = z.infer<typeof readingSnapshot>;

export function getReadingSnapshot(): ReadingSnapshot {
  const parsed = readingSnapshot.parse(snapshot);
  const currentYear = new Date().getFullYear();
  if (parsed.year !== currentYear) {
    throw new Error(`Reading snapshot is for ${parsed.year}; run \`npm run sync:reading\` before publishing.`);
  }
  return parsed;
}
