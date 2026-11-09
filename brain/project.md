# Project brain

## What this is

Routa's IT configures its identity platform by asking Claude, through this MCP server. The brief is in `client/brief.md`.

## What we found out

- The admin API applies a PATCH at once and has no preview, so the server keeps its own.
- The API doesn't enforce scope: any valid token can PATCH. `whoami` says what a token is, and the server must refuse.
- `session-length-hours` takes a number, `guest-access` a string, and the `mfa.*` policies true or false.

## Rules that cost us if we break them

- A read-only token never changes a setting.
- Every change is shown before it is applied, and what is applied is what was shown.

## The baseline check (`check_baseline`)

- The baseline is `client/security-baseline.json`: allowed apps per group, and a value per policy. The platform has more differences from it than a fresh seed should: for example ext-contractors reaches crm and finance, and two mfa policies are off.
- The tool only reads: `GET /admin/v1/settings`. A read-only token is enough, and it never calls PATCH.
- The server finds the baseline next to the repository (`client/`), not through the environment, so a token holder can't point it at another file.
- Groups or policies on only one side are differences too, said in words.
