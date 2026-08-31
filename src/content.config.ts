import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const siteRelativeUrl = z
  .string()
  .startsWith("/")
  .refine((url) => !url.startsWith("//"), {
    message: "URL must be site-relative, not protocol-relative",
  });

const episode = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  htmlUrl: siteRelativeUrl,
  pdfUrl: siteRelativeUrl,
});

const report = z.object({
  label: z.string().min(1),
  url: siteRelativeUrl,
});

const things = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/things" }),
  schema: z.object({
    title: z.string(),
    titleZh: z.string().optional(),
    summary: z.string(),
    summaryZh: z.string().optional(),
    type: z.enum(["project", "podcast", "writing", "system", "idea"]),
    status: z.enum([
      "exploring",
      "building",
      "ongoing",
      "maintained",
      "complete",
      "paused",
      "archived",
    ]),
    started: z.coerce.date(),
    finished: z.coerce.date().optional(),
    updated: z.coerce.date(),
    cadence: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    language: z.enum(["zh", "en", "bilingual"]),
    themes: z.array(z.string()).default([]),
    mark: z.string().max(2),
    tone: z.enum(["blue", "green", "rust", "gold", "violet", "slate"]),
    links: z
      .array(
        z.object({
          label: z.string(),
          url: z.url(),
        }),
      )
      .default([]),
    report: report.optional(),
    episodes: z.array(episode).default([]),
    related: z.array(z.string()).default([]),
  }),
});

const travelImage = z.object({
  src: z.string().startsWith("/"),
  alt: z.string().min(1).optional(),
  decorative: z.boolean().default(false),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
}).refine((image) => image.decorative || Boolean(image.alt), {
  message: "Travel images need alt text unless decorative",
});

const travel = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/travel" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    destinations: z.array(z.string().min(1)).min(1),
    locationContext: z.string().max(180).optional(),
    themes: z.array(z.string()).default([]),
    language: z.enum(["zh", "en", "bilingual"]).default("zh"),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    hero: travelImage.optional(),
    gallery: z.array(travelImage).default([]),
    highlights: z.array(z.string()).default([]),
    practicalNotes: z.array(z.string()).default([]),
    transport: z.array(z.string()).default([]),
    companions: z.array(z.string()).default([]),
  }).refine((entry) => entry.endDate >= entry.startDate, {
    message: "endDate must be on or after startDate",
    path: ["endDate"],
  }),
});

export const collections = { things, travel };
