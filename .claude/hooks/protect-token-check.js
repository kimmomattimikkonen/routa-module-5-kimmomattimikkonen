// PreToolUse hook: refuse any change to mcp/src/token-check.ts.
// Blocks file-edit tools aimed at it, and shell commands that write to it.
// A command that only mentions the file (git add, cat, grep, ...) is allowed.
import path from "node:path";

const PROTECTED = "mcp/src/token-check.ts";
const NAME = "token-check.ts";

const deny = (why) => {
  console.error(`Blocked: ${PROTECTED} is protected, so ${why}. Ask the user to change it themselves.`);
  process.exit(2);
};

const input = JSON.parse(await new Promise((resolve) => {
  let data = "";
  process.stdin.on("data", (chunk) => (data += chunk));
  process.stdin.on("end", () => resolve(data || "{}"));
}));

const { tool_name: tool, tool_input: args = {}, cwd = process.cwd() } = input;

const isProtected = (p) =>
  typeof p === "string" && path.resolve(cwd, p).endsWith(path.join("mcp", "src", NAME));

if (["Edit", "Write", "MultiEdit", "NotebookEdit"].includes(tool)) {
  if (isProtected(args.file_path ?? args.notebook_path)) deny("file edits to it are refused");
}

if (tool === "Bash" && typeof args.command === "string") {
  // Look at each simple command on its own.
  for (const part of args.command.split(/&&|\|\||[;|\n]/)) {
    if (!part.includes(NAME)) continue;
    const writes =
      /(^|[^<\d])>{1,2}\s*["']?\S*token-check\.ts/.test(part) ||             // > file, >> file
      /\b(tee|truncate|install|dd|rm|unlink|mv|cp|ln|chmod|touch|patch|ed|ex)\b/.test(part) ||
      /\b(sed|perl|ruby)\b.*\s-\w*i/.test(part) ||                           // in-place edits
      /--in-place/.test(part) ||
      /\bgit\s+(-\S+\s+)*(checkout|restore|apply|rm|mv|reset|stash|revert|merge|rebase|cherry-pick|pull|switch|clean)\b/.test(part) ||
      /\b(node|python3?|ruby|perl|deno|bun)\b.*(write|append|open\(|unlink|rename|copyFile|truncate|rm)/i.test(part);
    if (writes) deny("shell commands that write to it are refused");
  }
}
