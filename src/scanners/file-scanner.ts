import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, extname, relative } from "path";
import { PATTERNS, SecretPattern } from "../rules/patterns.js";

export interface SecretFinding {
  pattern_id: string; pattern_name: string; severity: string;
  file: string; line: number; column: number;
  match_preview: string; description: string;
  entropy?: number;
}

const SKIP_DIRS  = new Set([".git","node_modules","dist","build",".next","vendor","venv",".venv","__pycache__",".cache"]);
const SKIP_EXTS  = new Set([".jpg",".jpeg",".png",".gif",".svg",".ico",".woff",".woff2",".ttf",".eot",".zip",".tar",".gz",".lock",".sum"]);
const SKIP_FILES = new Set(["package-lock.json","yarn.lock","pnpm-lock.yaml",".env.example"]);
const MAX_FILE_SIZE = 1024 * 1024; // 1MB

function entropy(str: string): number {
  const freq: Record<string, number> = {};
  for (const c of str) freq[c] = (freq[c] ?? 0) + 1;
  const len = str.length;
  return -Object.values(freq).reduce((h, f) => {
    const p = f / len; return h + p * Math.log2(p);
  }, 0);
}

function redact(match: string): string {
  if (match.length <= 8) return "****";
  return match.slice(0, 4) + "****" + match.slice(-4);
}

export function scanFile(filePath: string, rootDir: string): SecretFinding[] {
  const findings: SecretFinding[] = [];
  let content: string;
  try { content = readFileSync(filePath, "utf-8"); }
  catch { return []; }

  const lines = content.split("\n");
  const rel = relative(rootDir, filePath).replace(/\\/g, "/");

  for (const pattern of PATTERNS) {
    let lineNum = 0;
    for (const line of lines) {
      lineNum++;
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags.includes("g") ? pattern.regex.flags : pattern.regex.flags + "g");
      let m: RegExpExecArray | null;
      while ((m = regex.exec(line)) !== null) {
        const matchStr = m[1] ?? m[0];
        if (pattern.entropy_threshold) {
          const e = entropy(matchStr);
          if (e < pattern.entropy_threshold) continue;
        }
        findings.push({
          pattern_id: pattern.id, pattern_name: pattern.name,
          severity: pattern.severity, file: rel,
          line: lineNum, column: m.index + 1,
          match_preview: redact(matchStr), description: pattern.description,
          entropy: pattern.entropy_threshold ? Math.round(entropy(matchStr) * 100) / 100 : undefined,
        });
      }
    }
  }
  return findings;
}

export function scanDirectory(dir: string, rootDir?: string): SecretFinding[] {
  const root = rootDir ?? dir;
  const findings: SecretFinding[] = [];

  function walk(current: string) {
    let entries;
    try { entries = readdirSync(current); } catch { return; }
    for (const entry of entries) {
      if (SKIP_DIRS.has(entry)) continue;
      const full = join(current, entry);
      let stat;
      try { stat = statSync(full); } catch { continue; }
      if (stat.isDirectory()) { walk(full); continue; }
      if (SKIP_FILES.has(entry)) continue;
      if (SKIP_EXTS.has(extname(entry).toLowerCase())) continue;
      if (stat.size > MAX_FILE_SIZE) continue;
      findings.push(...scanFile(full, root));
    }
  }
  walk(dir);
  return findings;
}
