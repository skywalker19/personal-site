import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

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
    related: z.array(z.string()).default([]),
  }),
});

export const collections = { things };
