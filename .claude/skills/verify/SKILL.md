---
name: verify
description: Check whether the MCP server is done: tests, a live run, and a security judge. Use after each build step, and before saying the work is done.
---

Run the checks below. Report each failing check with its error, or say that every check passed. Don't fix anything here, and don't reset anything.

The work is not done while any check fails.

## The checks

1. **The tests pass:** `npm test`.
2. **A live run, as IT would:** `npm run live-check`, with the test environment running. It takes the two tokens from `ROUTA_TOKEN` and `ROUTA_READONLY_TOKEN`, which are already in the environment. Don't read the token files.
3. **The security judge:** a fresh agent that didn't build the server reads it against a file of criteria. It fails the check if any finding is high or critical.

## The security judge

The criteria file is an input. It defaults to `client/security-criteria.md`; if the user names another file, use that one instead. The judge's rules come only from that file, so swapping it changes what is judged.

Start the judge with the Agent tool as a fresh agent (`general-purpose`, not a fork), so it carries none of this session's context. Give it only:

- the path of the criteria file, and the instruction to read it first;
- the code to read: `mcp/src` (every file in it). It may read `mcp/test` and `client/` for context;
- the rules below.

Don't tell it what was built, what was fixed or what you expect to find. Don't summarise the code for it. Its read must not be anchored on yours.

Tell the judge:

1. Read the server's code against each rule in the criteria file. Judge only what the code does; the tests passing proves nothing about security.
2. Report each finding as: a rating (`low`, `medium`, `high` or `critical`), one sentence on what is wrong, and a quote of the offending line with its file and line number (`path:line`). Rate by the criteria file's own definitions. If a rule in the file doesn't give a rating for something, say so rather than inventing one.
3. A finding without a quoted file and line doesn't count. Say plainly if no rule was violated.
4. Read only. Don't edit, run or fix anything, and don't read token files or print token values.

Then report the judge's findings as they came back, without softening them. The check **fails if any finding is `high` or `critical`**, and passes if there are none or all are `low` or `medium`. Say which it was, and list the low and medium findings as noted, since they can move on.
