import { z } from "astro/zod";

const timelineRecord = z.object({
  year: z.number().int().min(2000),
  month: z.number().int().min(1).max(12),
  destination: z.string().min(1),
  days: z.number().int().positive(),
  storySlug: z.string().min(1).optional(),
}).strict();

export type TravelTimelineRecord = z.infer<typeof timelineRecord>;

export const travelTimeline = z.array(timelineRecord).parse([
  { year: 2026, month: 8, destination: "土耳其", days: 13 },
  { year: 2026, month: 2, destination: "舟山", days: 4 },
  { year: 2025, month: 8, destination: "延边", days: 5 },
  { year: 2025, month: 2, destination: "西葡", days: 15 },
  { year: 2024, month: 8, destination: "澳大利亚", days: 12 },
]).sort((a, b) => b.year - a.year || b.month - a.month);
