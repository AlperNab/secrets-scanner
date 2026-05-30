#!/usr/bin/env node
import { scanDirectory, scanFile } from "./scanners/file-scanner.js";
import { join, resolve } from "path";
import { existsSync, statSync } from "fs";

const args = process.argv.slice(2);
const target = args[0] ?? ".";
const format = args.includes("--json") ? "json" : "text";
const failOnFound = args.includes("--fail");

const targetPath = resolve(target);
if (!existsSync(targetPath)) { console.error(`Path not found: ${targetPath}`); process.exit(1); }

const stat = statSync(targetPath);
const findings = stat.isDirectory() ? scanDirectory(targetPath) : scanFile(targetPath, process.cwd());

if (format === "json") {
  console.log(JSON.stringify({ total: findings.length, findings }, null, 2));
} else {
  if (findings.length === 0) {
    console.log("✓ No secrets found");
    process.exit(0);
  }
  const bySeverity = { critical:[] as any[], high:[] as any[], medium:[] as any[], low:[] as any[] };
  findings.forEach(f => (bySeverity as any)[f.severity]?.push(f));

  const badge: Record<string,string> = { critical:"[CRITICAL]", high:"[HIGH]", medium:"[MEDIUM]", low:"[LOW]" };
  let total = 0;
  for (const sev of ["critical","high","medium","low"] as const) {
    for (const f of bySeverity[sev]) {
      total++;
      console.log(`${badge[sev]} ${f.file}:${f.line}:${f.column}`);
      console.log(`  ${f.pattern_name}: ${f.match_preview}`);
      console.log(`  ${f.description}`);
      if (f.entropy) console.log(`  entropy: ${f.entropy}`);
      console.log();
    }
  }
  console.log(`Found ${total} potential secret${total > 1 ? "s" : ""} — review before pushing`);
}

if (findings.length > 0 && failOnFound) process.exit(1);
