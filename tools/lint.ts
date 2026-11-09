// Every change is shown before it is applied: a tool that calls patchSettings
// must also call showChange. apply-change.ts is the exception, it applies a
// change that preview-change already showed.
import { readdirSync, readFileSync } from "node:fs";

const dir = new URL("../mcp/src/tools/", import.meta.url);
const calls = (source: string, name: string) => new RegExp(`\\b${name}\\s*\\(`).test(source);

const failures = readdirSync(dir)
  .filter((file) => file.endsWith(".ts") && file !== "index.ts" && file !== "apply-change.ts")
  .filter((file) => {
    const source = readFileSync(new URL(file, dir), "utf8");
    return calls(source, "patchSettings") && !calls(source, "showChange");
  });

for (const file of failures) {
  console.error(`mcp/src/tools/${file}: calls patchSettings without calling showChange`);
}
process.exit(failures.length ? 1 : 0);
