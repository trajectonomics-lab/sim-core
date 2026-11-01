// Regenerates parity/cases.json from the engine under Bun. Run: bun run parity:update
import { createHash } from "node:crypto"
import { writeFileSync } from "node:fs"
import { project } from "../src/engine/project"
import { PARITY_CASES } from "../src/golden/parity-cases"

const cases = PARITY_CASES.map(({ name, fixture }) => {
	const { baseline, scenario, timeline } = fixture
	const json = JSON.stringify(project(baseline, scenario, timeline))
	return {
		name,
		baseline,
		scenario,
		timeline,
		sha256: createHash("sha256").update(json).digest("hex"),
	}
})
writeFileSync(
	new URL("../parity/cases.json", import.meta.url),
	`${JSON.stringify(cases, null, "\t")}\n`,
)
