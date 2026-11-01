import { SCHEMA_VERSION } from "../vocab"
import { indexAccounts } from "./accounts"
import { checkBaseline } from "./baseline"
import type { AccountIndex, Emit, Path, Problem } from "./codes"
import { checkScenario } from "./scenario"
import { isRecord } from "./shape"
import { checkTimeline } from "./timeline"

/** True (and no problem) unless a record's `schemaVersion` is not 1: then one error is emitted. */
function versionOk(value: unknown, path: Path, emit: Emit): boolean {
	if (!isRecord(value) || value["schemaVersion"] === SCHEMA_VERSION) return true
	emit("UNSUPPORTED_SCHEMA_VERSION", [...path, "schemaVersion"])
	return false
}

/**
 * Validates all three inputs in one pass. `[]` means valid; the engine refuses to run otherwise.
 * Accepts arbitrary values and never throws.
 */
export function check(baseline: unknown, scenario: unknown, timeline: unknown): readonly Problem[] {
	const problems: Problem[] = []
	const emit: Emit = (code, path) => void problems.push({ code, path })
	const scenarioOk = versionOk(scenario, ["scenario"], emit)
	const baselineOk = versionOk(baseline, ["baseline"], emit)
	const accounts: AccountIndex | undefined =
		scenarioOk && isRecord(scenario) ? indexAccounts(scenario["accounts"]) : undefined
	if (baselineOk) checkBaseline(baseline, ["baseline"], accounts, emit)
	if (scenarioOk) checkScenario(scenario, ["scenario"], accounts, emit)
	checkTimeline(timeline, ["timeline"], emit)
	return problems
}
