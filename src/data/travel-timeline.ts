import { z } from "astro/zod";

const timelineRecord = z.object({
  year: z.number().int().min(2000),
  month: z.number().int().min(1).max(12),
  destination: z.string().min(1),
  region: z.enum(["国内", "国外"]),
  days: z.number().int().positive(),
  storySlug: z.string().min(1).optional(),
}).strict();

export type TravelTimelineRecord = z.infer<typeof timelineRecord>;

export const travelTimeline = z.array(timelineRecord).parse([
  { year: 2026, month: 8, destination: "土耳其", region: "国外", days: 13 },
  { year: 2026, month: 2, destination: "舟山", region: "国内", days: 4 },
  { year: 2025, month: 8, destination: "延边", region: "国内", days: 5 },
  { year: 2025, month: 2, destination: "西葡", region: "国外", days: 13 },
  { year: 2024, month: 8, destination: "澳大利亚", region: "国外", days: 12 },
  { year: 2024, month: 2, destination: "大连", region: "国内", days: 5 },
  { year: 2023, month: 7, destination: "日本", region: "国外", days: 11 },
  { year: 2023, month: 1, destination: "广州", region: "国内", days: 8 },
  { year: 2022, month: 7, destination: "新疆", region: "国内", days: 17 },
  { year: 2021, month: 8, destination: "四川", region: "国内", days: 11 },
  { year: 2020, month: 10, destination: "庐山", region: "国内", days: 5 },
  { year: 2019, month: 10, destination: "黄山", region: "国内", days: 4 },
  { year: 2019, month: 7, destination: "广西", region: "国内", days: 8 },
  { year: 2019, month: 5, destination: "天津", region: "国内", days: 5 },
]).sort((a, b) => b.year - a.year || b.month - a.month);
