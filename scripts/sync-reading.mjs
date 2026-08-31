import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { execFileSync } from "node:child_process";
const NOTION_BASE = "https://api.notion.com/v1";

const output = resolve("src/data/reading.snapshot.json");
const expectedProperties = {
  Name: "title", 作者: "rich_text", 出版社: "rich_text", 国家: "select", 媒介: "select",
  开始阅读: "date", 类型: "multi_select", 结束阅读: "date", 评分: "select", 语言: "select",
  豆瓣得分: "number", 阅读状态: "select", 阅读者: "select",
};

const text = (property) => property?.title?.map((part) => part.plain_text).join("") || property?.rich_text?.map((part) => part.plain_text).join("") || undefined;
const select = (property) => property?.select?.name || undefined;
const multi = (property) => property?.multi_select?.map((part) => part.name).filter(Boolean) || undefined;
const number = (property) => typeof property?.number === "number" ? property.number : undefined;

function assertSchema(schema) {
  const properties = schema.properties;
  if (!properties) throw new Error("Reading schema response has no properties.");
  for (const [name, type] of Object.entries(expectedProperties)) {
    if (!properties[name] || properties[name].type !== type) throw new Error(`Reading schema drift: expected ${name} (${type}).`);
  }
}

function publicItem(properties) {
  const value = {
    title: text(properties.Name), author: text(properties.作者), publisher: text(properties.出版社),
    country: select(properties.国家), medium: select(properties.媒介), types: multi(properties.类型),
    language: select(properties.语言), rating: select(properties.评分), doubanScore: number(properties.豆瓣得分),
  };
  return Object.fromEntries(Object.entries(value).filter(([, field]) => field !== undefined && (!(Array.isArray(field)) || field.length)));
}

function readDataSourceId() {
  const value = process.env.NOTION_READING_DATA_SOURCE_ID;
  if (!value) throw new Error("NOTION_READING_DATA_SOURCE_ID is required for sync.");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new Error("NOTION_READING_DATA_SOURCE_ID must be a valid UUID.");
  }
  return value;
}

async function main() {
  const dataSourceId = readDataSourceId();
  const token = process.env.NOTION_READING_TOKEN;
  const headers = { Authorization: `Bearer ${token}`, "Notion-Version": "2025-09-03", "Content-Type": "application/json" };
  // In local development, the approved Notion CLI may supply its keychain-backed
  // read credential. CI and other automation use NOTION_READING_TOKEN instead.
  const request = async (path, body) => {
    if (token) {
      const response = await fetch(`${NOTION_BASE}${path}`, body ? { method: "POST", headers, body: JSON.stringify(body) } : { headers });
      if (!response.ok) throw new Error(`Reading request failed (${response.status}).`);
      return response.json();
    }
    try {
      const args = ["api", `/v1${path}`];
      if (body) args.push("-X", "POST", "-d", JSON.stringify(body));
      return JSON.parse(execFileSync("ntn", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }));
    } catch (error) {
      const detail = error?.stderr?.toString().trim() || error?.message || "unavailable";
      throw new Error(`NOTION_READING_TOKEN is required for sync, or authenticate the local read-only \`ntn\` CLI (${detail}).`);
    }
  };
  const schema = await request(`/data_sources/${dataSourceId}`);
  assertSchema(schema);
  const year = new Date().getFullYear();
  const current = [], completedThisYear = [], history = new Map();
  let cursor;
  do {
    const page = await request(`/data_sources/${dataSourceId}/query`, { page_size: 100, ...(cursor ? { start_cursor: cursor } : {}), filter: { property: "阅读者", select: { equals: "Calvin" } } });
    if (!Array.isArray(page.results)) throw new Error("Invalid Reading pagination response.");
    for (const row of page.results) {
      const p = row.properties;
      // Defence in depth: the server filter is mandatory, and mismatches never transform.
      if (select(p.阅读者) !== "Calvin") continue;
      const status = select(p.阅读状态);
      const item = publicItem(p);
      if (!item.title) throw new Error("Reading row has no title.");
      if (status === "阅读中") current.push(item);
      if (status === "已读") {
        const end = p.结束阅读?.date?.start;
        const completedYear = end ? new Date(`${end}T00:00:00Z`).getUTCFullYear() : undefined;
        if (!completedYear || completedYear > year) continue;
        if (completedYear === year) completedThisYear.push({ item, end });
        else history.set(completedYear, (history.get(completedYear) || 0) + 1);
      }
    }
    if (page.has_more && !page.next_cursor) throw new Error("Reading pagination ended without its required cursor.");
    cursor = page.has_more ? page.next_cursor : undefined;
  } while (cursor);

  completedThisYear.sort((a, b) => b.end.localeCompare(a.end));
  const snapshot = {
    schemaVersion: 1, generatedAt: new Date().toISOString(), year,
    current, completedThisYear: completedThisYear.map(({ item }) => item),
    history: [...history].map(([year, count]) => ({ year, count })).sort((a, b) => b.year - a.year),
  };
  // A parse/re-serialize round trip ensures the output is plain minimized JSON before replacement.
  JSON.parse(JSON.stringify(snapshot));
  mkdirSync(dirname(output), { recursive: true });
  const temporary = `${output}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(snapshot, null, 2)}\n`, { encoding: "utf8" });
  renameSync(temporary, output);
  console.log(`Reading snapshot updated: ${current.length} current, ${completedThisYear.length} completed.`);
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
