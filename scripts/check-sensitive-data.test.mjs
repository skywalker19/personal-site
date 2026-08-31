import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { findSensitiveData } from "./check-sensitive-data.mjs";

const validator = join(process.cwd(), "scripts/check-sensitive-data.mjs");

test("safe placeholders pass and protected values are classified", () => {
  const safe = findSensitiveData("NOTION_READING_DATA_SOURCE_ID=<NOTION_DATA_SOURCE_UUID>");
  assert.equal(safe.size, 0);

  const uuid = ["12345678", "1234", "4123", "8123", "123456789abc"].join("-");
  const email = `owner${"@"}private.invalid`;
  const token = ["tok", "en-", "abc12345"].join("");
  const findings = findSensitiveData(`id=${uuid}\ncontact=${email}\nNOTION_READING_TOKEN=${token}`, "fixture.txt");
  assert.deepEqual([...findings].sort(), ["UUID\tfixture.txt", "credential\tfixture.txt", "email\tfixture.txt"]);
});

test("CLI reports category and location without printing the value", () => {
  const directory = mkdtempSync(join(tmpdir(), "sensitive-data-"));
  const uuid = ["87654321", "4321", "4123", "8123", "abcdefabcdef"].join("-");
  const file = join(directory, "generated.html");
  writeFileSync(file, `<p>${uuid}</p>`, "utf8");
  try {
    const result = spawnSync(process.execPath, [validator, "--path", directory], { encoding: "utf8" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /UUID/);
    assert.match(result.stderr, /generated\.html/);
    assert.doesNotMatch(result.stderr, new RegExp(uuid));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("asset filenames and protected usernames are scanned", () => {
  const directory = mkdtempSync(join(tmpdir(), "sensitive-data-"));
  const uuid = ["abcdef12", "3456", "4123", "8123", "abcdefabcdef"].join("-");
  const file = join(directory, `private_handle-${uuid}.png`);
  writeFileSync(file, Buffer.from([0, 1, 2, 3]));
  try {
    const result = spawnSync(process.execPath, [validator, "--path", directory], {
      encoding: "utf8",
      env: { ...process.env, PROTECTED_USERNAMES: "private_handle" },
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /UUID/);
    assert.match(result.stderr, /username/);
    assert.doesNotMatch(result.stderr, new RegExp(uuid));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
