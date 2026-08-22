import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const [, , rawSlug, ...titleParts] = process.argv;
const slug = rawSlug?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const title = titleParts.join(" ").trim();

if (!slug || !title) {
  console.error('Usage: npm run new -- "thing-slug" "Thing title"');
  process.exit(1);
}

const destination = resolve("src/content/things", `${slug}.md`);
if (existsSync(destination)) {
  console.error(`A Thing already exists at ${destination}`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const template = `---
title: ${title}
summary: Replace this with one specific sentence about what the Thing does and why it exists.
type: project
status: building
started: ${today}
updated: ${today}
featured: false
draft: true
language: bilingual
themes: []
mark: 新
tone: slate
links: []
related: []
---

## What it is

Write the smallest useful explanation.

## Why I made it

Record the situation or question that caused this Thing to exist.

## What happened

Add evidence, outcomes, or an honest note about its current state.
`;

writeFileSync(destination, template, { flag: "wx" });
console.log(`Created ${destination}`);
console.log("It is a hidden draft until you set draft: false.");
