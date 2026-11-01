// Runs the built package under Node (V8) against the hashes recorded under Bun (JavaScriptCore).
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { project } from "../dist/index.mjs"

const cases = JSON.parse(readFileSync(new URL("../parity/cases.json", import.meta.url), "utf8"))
const failed = cases.filter(({ baseline, scenario, timeline, sha256 }) => {
	const json = JSON.stringify(project(baseline, scenario, timeline))
	return createHash("sha256").update(json).digest("hex") !== sha256
})
for (const { name } of failed) console.error(`parity mismatch: ${name}`)
if (failed.length > 0) process.exit(1)
console.log(`parity ok: ${cases.length} cases under node ${process.version}`)
