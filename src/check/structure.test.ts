import { describe, expect, it } from "bun:test"
import { check } from "../check"
import { thaiEmployee } from "../fixtures/thai-employee"
import { expected, problemsFor, REMOVE } from "../testing"

const { baseline, scenario, timeline } = thaiEmployee

describe("check() structure", () => {
	it("never throws on garbage and flags non-objects", () => {
		const garbage = [undefined, null, 0, "x", true, [], [[]], () => 1, Symbol("s"), 1n]
		for (const g of garbage) {
			expect(() => check(g, g, g)).not.toThrow()
			expect(check(g, g, g).map((p) => p.code)).toContain("NOT_AN_OBJECT")
		}
	})

	it("never throws on wrongly typed nested values", () => {
		const cashflow = { surplus: [7], withdraw: 3 }
		const bad = { ...scenario, accounts: [null, 1, "a"], flows: {}, cashflow }
		expect(() => check(baseline, bad, timeline)).not.toThrow()
		expect(() => check({ schemaVersion: 1, balances: [null, {}] }, bad, timeline)).not.toThrow()
	})

	it("reports a single UNSUPPORTED_SCHEMA_VERSION instead of unknown-key noise", () => {
		const v2 = { schemaVersion: 2, whatever: 1, balances: [] }
		expect(check(v2, scenario, timeline)).toEqual(
			expected("UNSUPPORTED_SCHEMA_VERSION", ["baseline", "schemaVersion"]),
		)
	})

	it("rejects a scenario with schemaVersion other than 1", () => {
		expect(problemsFor({ scenario: [["schemaVersion"], "1"] })).toEqual(
			expected("UNSUPPORTED_SCHEMA_VERSION", ["scenario", "schemaVersion"]),
		)
	})

	it("rejects a missing schemaVersion", () => {
		expect(problemsFor({ baseline: [["schemaVersion"], REMOVE] })).toEqual(
			expected("UNSUPPORTED_SCHEMA_VERSION", ["baseline", "schemaVersion"]),
		)
	})

	it("reports problems from all three inputs in one pass", () => {
		const codes = problemsFor({
			baseline: [["balances", 0, "amount"], -1],
			scenario: [["currency"], 5],
			timeline: [["resolution"], "week"],
		}).map((p) => p.code)
		expect(codes).toEqual(["NEGATIVE_AMOUNT", "WRONG_TYPE", "INVALID_RESOLUTION"])
	})

	it("rejects unknown keys on every scenario object", () => {
		const parents: (readonly (string | number)[])[] = [
			[],
			["economy"],
			["accounts", 0],
			["flows", 0],
			["flows", 0, "growth"],
			["cashflow"],
			["cashflow", "surplus", 0],
		]
		for (const parent of parents) {
			const path = [...parent, "extra"]
			const edits = { scenario: [path, 1] } as const
			expect(problemsFor(edits)).toEqual(expected("UNKNOWN_KEY", ["scenario", ...path]))
		}
	})

	it("rejects unknown keys on baseline and timeline objects", () => {
		expect(problemsFor({ baseline: [["extra"], 1] })).toEqual(
			expected("UNKNOWN_KEY", ["baseline", "extra"]),
		)
		expect(problemsFor({ baseline: [["balances", 0, "extra"], 1] })).toEqual(
			expected("UNKNOWN_KEY", ["baseline", "balances", 0, "extra"]),
		)
		expect(problemsFor({ timeline: [["extra"], 1] })).toEqual(
			expected("UNKNOWN_KEY", ["timeline", "extra"]),
		)
	})

	it("rejects a typo'd key and reports the missing one", () => {
		const codes = problemsFor({ scenario: [["economy"], { inflaton: 1 }] }).map((p) => p.code)
		expect(codes).toEqual(["UNKNOWN_KEY", "MISSING_KEY"])
	})

	it("rejects a non-array where an array belongs", () => {
		expect(problemsFor({ scenario: [["flows"], {}] })).toEqual(
			expected("NOT_AN_ARRAY", ["scenario", "flows"]),
		)
	})

	it("rejects an empty currency", () => {
		expect(problemsFor({ scenario: [["currency"], ""] })).toEqual(
			expected("EMPTY_STRING", ["scenario", "currency"]),
		)
	})
})
