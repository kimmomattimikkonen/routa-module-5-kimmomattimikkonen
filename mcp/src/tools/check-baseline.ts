// Lists every setting that differs from Routa's security baseline. It only reads.
import { readFileSync } from "node:fs";
import { getSettings } from "../platform.ts";
import type { Settings } from "../platform.ts";
import { requireToken } from "../token-check.ts";

export type Baseline = { access: Record<string, string[]>; policies: Record<string, boolean | number | string> };

const baselineFile = new URL("../../../client/security-baseline.json", import.meta.url);

const say = (value: unknown) => (value === true ? "on" : value === false ? "off" : JSON.stringify(value));

export function differences(settings: Settings, baseline: Baseline): string[] {
  const found: string[] = [];
  for (const { group, apps } of settings.access) {
    const allowed = baseline.access[group];
    if (!allowed) found.push(`${group} is not in the baseline, and reaches ${apps.length ? apps.join(", ") : "nothing"}.`);
    for (const app of apps) if (allowed && !allowed.includes(app)) found.push(`${group} reaches ${app}, and the baseline says it should not.`);
    for (const app of allowed ?? []) if (!apps.includes(app)) found.push(`${group} does not reach ${app}, and the baseline says it should.`);
  }
  for (const group of Object.keys(baseline.access)) {
    if (!settings.access.some((a) => a.group === group)) found.push(`${group} is in the baseline but the platform has no such group.`);
  }
  for (const { id, label, value } of settings.policies) {
    if (!(id in baseline.policies)) found.push(`${label} (${id}) is ${say(value)}, and the baseline does not mention it.`);
    else if (baseline.policies[id] !== value) found.push(`${label} (${id}) is ${say(value)}, and the baseline says ${say(baseline.policies[id])}.`);
  }
  for (const id of Object.keys(baseline.policies)) {
    if (!settings.policies.some((p) => p.id === id)) found.push(`${id} is in the baseline but the platform has no such policy.`);
  }
  return found;
}

export const checkBaselineTool = {
  name: "check_baseline",
  description: "List, in plain words, every setting that differs from Routa's security baseline. Read-only: it changes nothing, and works with a read-only token.",
  inputSchema: { type: "object", properties: {} },
  async handler() {
    await requireToken();
    const baseline = JSON.parse(readFileSync(baselineFile, "utf8")) as Baseline;
    const found = differences(await getSettings(), baseline);
    if (found.length === 0) return "Every setting matches the baseline.";
    return [`${found.length} ${found.length === 1 ? "setting differs" : "settings differ"} from the baseline:`, ...found.map((f) => `- ${f}`), "Nothing has been changed."].join("\n");
  },
};
