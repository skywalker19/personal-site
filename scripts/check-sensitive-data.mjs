import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { basename, extname, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = resolve(".");
const UUID_PATTERN = /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const CREDENTIAL_PATTERN = /(?:api[-_]?key|access[-_]?token|auth(?:orization)?|password|secret|private[-_]?key|token)\s*[:=]\s*["'`]?([A-Za-z0-9_./+=:-]{8,})/gi;
const TOKEN_PATTERN = /\b(?:sk-[A-Za-z0-9]{20,}|secret_[A-Za-z0-9]{16,}|gh[pousr]_[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{20,}|AIza[A-Za-z0-9_-]{20,})\b/g;
const TEXT_EXTENSIONS = new Set([
  ".astro", ".cjs", ".css", ".env", ".example", ".html", ".js", ".json", ".mjs", ".md", ".sh", ".svg", ".ts", ".txt", ".yaml", ".yml",
]);

function isPlaceholder(value) {
  return /^(?:<[^>]+>|\$\{[^}]+\}|\{\{[^}]+\}\}|\[[^\]]*(?:redacted|placeholder|uuid|example|dummy)[^\]]*\])$/i.test(value)
    || /^(?:process\.env\.|\$[A-Z_])/i.test(value)
    || /(?:example\.com|change[_-]?me|your[_-]|dummy|placeholder|redacted|notion_(?:read_)?token|data_source_uuid)/i.test(value);
}

function isTextFile(filePath, contents) {
  if (contents.includes(0)) return false;
  const extension = extname(filePath).toLowerCase();
  return TEXT_EXTENSIONS.has(extension) || !extension;
}

function addFinding(findings, category, location) {
  findings.add(`${category}\t${location}`);
}

function scanText(contents, location, protectedUsernames = []) {
  const findings = new Set();
  for (const match of contents.matchAll(UUID_PATTERN)) {
    if (!isPlaceholder(match[0])) addFinding(findings, "UUID", location);
  }
  for (const match of contents.matchAll(EMAIL_PATTERN)) {
    if (!isPlaceholder(match[0])) addFinding(findings, "email", location);
  }
  for (const match of contents.matchAll(CREDENTIAL_PATTERN)) {
    if (!isPlaceholder(match[1])) addFinding(findings, "credential", location);
  }
  for (const match of contents.matchAll(TOKEN_PATTERN)) {
    if (!isPlaceholder(match[0])) addFinding(findings, "credential", location);
  }
  for (const username of protectedUsernames) {
    if (username && !isPlaceholder(username) && contents.includes(username)) addFinding(findings, "username", location);
  }
  return findings;
}

function scanFilename(filePath, protectedUsernames = []) {
  return scanText(filePath, filePath, protectedUsernames);
}

function protectedUsernames() {
  return (process.env.PROTECTED_USERNAMES || "")
    .split(/[\n,]/)
    .map((value) => value.trim())
    .filter(Boolean);
}

function git(args, options = {}) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, ...options });
}

function nullSeparated(value) {
  return value.split("\0").filter(Boolean);
}

function trackedPaths() {
  return nullSeparated(git(["ls-files", "-co", "--exclude-standard", "-z"]));
}

function stagedPaths() {
  return nullSeparated(git(["diff", "--cached", "--name-only", "-z"]));
}

function displayPath(filePath) {
  return relative(ROOT, resolve(ROOT, filePath)) || ".";
}

function scanWorkingTree(paths, usernames) {
  const findings = new Set();
  for (const filePath of paths) {
    const location = displayPath(filePath);
    findingsForFilename(findings, location, usernames);
    try {
      const contents = readFileSync(resolve(ROOT, filePath));
      if (isTextFile(filePath, contents)) {
        for (const finding of scanText(contents.toString("utf8"), location, usernames)) findings.add(finding);
      }
    } catch (error) {
      addFinding(findings, "unreadable-file", location);
    }
  }
  return findings;
}

function findingsForFilename(findings, location, usernames) {
  for (const finding of scanFilename(basename(location), usernames)) findings.add(finding);
}

function scanStagedChanges(paths, usernames) {
  const findings = new Set();
  for (const filePath of paths) {
    const location = `staged:${filePath}`;
    findingsForFilename(findings, filePath, usernames);
    try {
      const contents = git(["show", `:${filePath}`], { encoding: "buffer" });
      if (isTextFile(filePath, contents)) {
        for (const finding of scanText(contents.toString("utf8"), location, usernames)) findings.add(finding);
      }
    } catch {
      addFinding(findings, "unreadable-staged-file", filePath);
    }
  }
  return findings;
}

function walkDirectory(directory, usernames, findings = new Set()) {
  if (!existsSync(directory)) return findings;
  for (const entry of readdirSync(directory)) {
    const filePath = resolve(directory, entry);
    const relativePath = displayPath(filePath);
    const stats = lstatSync(filePath);
    if (stats.isDirectory()) walkDirectory(filePath, usernames, findings);
    else {
      findingsForFilename(findings, relativePath, usernames);
      const contents = readFileSync(filePath);
      if (isTextFile(filePath, contents)) {
        for (const finding of scanText(contents.toString("utf8"), relativePath, usernames)) findings.add(finding);
      }
    }
  }
  return findings;
}

function scanHistory(usernames) {
  const findings = new Set();
  const commits = git(["rev-list", "--all"]).split("\n").filter(Boolean);
  for (const commit of commits) {
    const paths = nullSeparated(git(["ls-tree", "-r", "--name-only", "-z", commit]));
    for (const filePath of paths) {
      const location = `${commit}:${filePath}`;
      for (const finding of scanFilename(filePath, usernames)) addFinding(findings, `history-${finding.split("\t")[0]}`, location);
      try {
        const contents = git(["show", `${commit}:${filePath}`], { encoding: "buffer" });
        if (isTextFile(filePath, contents)) {
          for (const finding of scanText(contents.toString("utf8"), location, usernames)) {
            addFinding(findings, `history-${finding.split("\t")[0]}`, location);
          }
        }
      } catch {
        addFinding(findings, "history-unreadable-file", location);
      }
    }
  }
  return findings;
}

function safeLocation(location, usernames = []) {
  let result = location.replace(UUID_PATTERN, "[UUID]").replace(EMAIL_PATTERN, "[EMAIL]");
  for (const username of usernames) {
    if (username) result = result.split(username).join("[USERNAME]");
  }
  return result;
}

function printFindings(findings, usernames = []) {
  for (const finding of [...findings].sort()) {
    const [category, location] = finding.split("\t");
    console.error(`[sensitive-data] ${category} at ${safeLocation(location, usernames)}`);
  }
}

export function findSensitiveData(contents, location = "<memory>", usernames = []) {
  return scanText(contents, location, usernames);
}

export function runScan({ history = false, staged = false, path = null } = {}) {
  const usernames = protectedUsernames();
  const findings = new Set();
  if (history) {
    for (const finding of scanHistory(usernames)) findings.add(finding);
  } else if (path) {
    walkDirectory(resolve(ROOT, path), usernames, findings);
  } else {
    for (const finding of scanWorkingTree(trackedPaths(), usernames)) findings.add(finding);
    if (staged) for (const finding of scanStagedChanges(stagedPaths(), usernames)) findings.add(finding);
  }
  printFindings(findings, usernames);
  return findings.size === 0;
}

function parseArgs(args) {
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--history") options.history = true;
    else if (args[index] === "--staged") options.staged = true;
    else if (args[index] === "--path") options.path = args[++index];
    else if (args[index] === "--help") options.help = true;
    else throw new Error(`Unknown option: ${args[index]}`);
  }
  return options;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log("Usage: node scripts/check-sensitive-data.mjs [--staged] [--history] [--path <directory>]");
    return;
  }
  if (options.history && options.path) throw new Error("--history and --path cannot be combined.");
  if (!runScan(options)) process.exitCode = 1;
}

if (pathToFileURL(process.argv[1]).href === import.meta.url) {
  try {
    main();
  } catch (error) {
    console.error(`[sensitive-data] ${error.message}`);
    process.exitCode = 1;
  }
}
