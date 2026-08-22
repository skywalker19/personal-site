import type { CollectionEntry } from "astro:content";

export const statusOrder = [
  "ongoing",
  "exploring",
  "building",
  "maintained",
  "complete",
  "paused",
  "archived",
] as const;

export const statusLabels = {
  ongoing: { zh: "持续更新", en: "Ongoing" },
  exploring: { zh: "探索中", en: "Exploring" },
  building: { zh: "制作中", en: "Building" },
  maintained: { zh: "维护中", en: "Maintained" },
  complete: { zh: "已完成", en: "Complete" },
  paused: { zh: "已暂停", en: "Paused" },
  archived: { zh: "已归档", en: "Archived" },
} as const;

export type ThingStatus = (typeof statusOrder)[number];

export function compareThings(a: CollectionEntry<"things">, b: CollectionEntry<"things">) {
  const statusDifference = statusOrder.indexOf(a.data.status) - statusOrder.indexOf(b.data.status);
  return statusDifference || b.data.updated.valueOf() - a.data.updated.valueOf();
}
