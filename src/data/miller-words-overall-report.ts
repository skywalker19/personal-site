export interface MillerWordsSession {
  id: string;
  label: string;
  entryCount: number;
}

export interface MillerWordsOverallReport {
  title: string;
  titleZh: string;
  description: string;
  updated: string;
  totalEntries: number;
  uniqueWords: number;
  sessions: MillerWordsSession[];
  sourceNote: string;
}

/**
 * Public-safe aggregate data for the Miller Words report.
 *
 * Add future recorded sessions to `sessions` and update the verified totals
 * above. Keep this data aligned with the canonical Miller Words word list;
 * do not infer or silently correct counts from the story HTML.
 */
export const millerWordsOverallReport: MillerWordsOverallReport = {
  title: "Miller Words, overall",
  titleZh: "米勒单词：总体记录",
  description: "A small record of the words gathered, revisited, and carried into stories.",
  updated: "2026-08-30",
  totalEntries: 45,
  uniqueWords: 44,
  sessions: [
    { id: "day-1", label: "Day 1", entryCount: 6 },
    { id: "day-2", label: "Day 2", entryCount: 6 },
    { id: "day-3", label: "Day 3", entryCount: 8 },
    { id: "day-4", label: "Day 4", entryCount: 5 },
    { id: "day-5", label: "Day 5", entryCount: 4 },
    { id: "day-6", label: "Day 6", entryCount: 5 },
    { id: "day-7", label: "Day 7", entryCount: 9 },
    { id: "day-8", label: "Day 8", entryCount: 2 },
  ],
  sourceNote: "Verified against the current Miller Words word list and eight recorded vocabulary days.",
};
