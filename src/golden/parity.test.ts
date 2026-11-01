import { describe, expect, it } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { project } from "../engine/project"
import { PARITY_CASES } from "./parity-cases"

const recorded: readonly { name: string; sha256: string }[] = JSON.parse(
	readFileSync(new URL("../../parity/cases.json", import.meta.url), "utf8"),
)

describe("parity/cases.json", () => {
	it("lists exactly the parity cases", () => {
		expect(recorded.map((item) => item.name)).toEqual(PARITY_CASES.map((item) => item.name))
	})

	it.each(PARITY_CASES.map((item) => [item.name, item] as const))(
		"%s hashes as recorded (run `bun run parity:update` after an intended change)",
		(name, { fixture }) => {
			const { baseline, scenario, timeline } = fixture
			const json = JSON.stringify(project(baseline, scenario, timeline))
			const hash = createHash("sha256").update(json).digest("hex")
			expect(hash).toBe(recorded.find((item) => item.name === name)?.sha256 ?? "missing")
		},
	)
})
