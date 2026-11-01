import { describe, expect, it } from "bun:test"
import { expected, problemsFor } from "../testing"

const growthAt = ["flows", 0, "growth"] as const
const growthPath = ["scenario", ...growthAt] as const

describe("check() closed vocabulary", () => {
	it("rejects an unknown account kind", () => {
		expect(problemsFor({ scenario: [["accounts", 0, "kind"], "equity"] })).toEqual(
			expected("INVALID_KIND", ["scenario", "accounts", 0, "kind"]),
		)
	})

	it("rejects an unknown flow kind", () => {
		expect(problemsFor({ scenario: [["flows", 2, "kind"], "gift"] })).toEqual(
			expected("INVALID_KIND", ["scenario", "flows", 2, "kind"]),
		)
	})

	it("rejects a frequency outside the enum", () => {
		expect(problemsFor({ scenario: [["flows", 0, "frequency"], "fortnightly"] })).toEqual(
			expected("INVALID_FREQUENCY", ["scenario", "flows", 0, "frequency"]),
		)
	})

	it("accepts every frequency in the enum", () => {
		const all = ["once", "daily", "weekly", "biweekly", "monthly", "quarterly", "annual"]
		for (const frequency of all) {
			const edit = { scenario: [["flows", 2, "frequency"], frequency] } as const
			expect(problemsFor(edit)).toEqual([])
		}
	})

	it("rejects a resolution other than day or month", () => {
		expect(problemsFor({ timeline: [["resolution"], "week"] })).toEqual(
			expected("INVALID_RESOLUTION", ["timeline", "resolution"]),
		)
	})

	it('accepts growth "inflation"', () => {
		expect(problemsFor({ scenario: [growthAt, "inflation"] })).toEqual([])
	})

	it("accepts growth { bps } with a positive, zero or negative integer", () => {
		for (const bps of [300, 0, -150]) {
			expect(problemsFor({ scenario: [growthAt, { bps }] })).toEqual([])
		}
	})

	it.each([
		["a string other than inflation", "wage"],
		["a differently cased inflation", "Inflation"],
		["a bare number", 300],
		["null", null],
		["an array", [300]],
	])("rejects growth given as %s", (_name, value) => {
		expect(problemsFor({ scenario: [growthAt, value] })).toEqual(
			expected("INVALID_GROWTH", ["scenario", "flows", 0, "growth"]),
		)
	})

	it("rejects growth { bps } with a fractional bps", () => {
		expect(problemsFor({ scenario: [growthAt, { bps: 1.5 }] })).toEqual(
			expected("NOT_SAFE_INTEGER", [...growthPath, "bps"]),
		)
	})

	it("rejects growth { bps } with a string bps", () => {
		expect(problemsFor({ scenario: [growthAt, { bps: "300" }] })).toEqual(
			expected("NOT_SAFE_INTEGER", [...growthPath, "bps"]),
		)
	})

	it("rejects growth {} for missing bps", () => {
		expect(problemsFor({ scenario: [growthAt, {}] })).toEqual(
			expected("MISSING_KEY", [...growthPath, "bps"]),
		)
	})

	it("rejects an unknown key next to bps in growth", () => {
		expect(problemsFor({ scenario: [growthAt, { bps: 1, rate: 2 }] })).toEqual(
			expected("UNKNOWN_KEY", [...growthPath, "rate"]),
		)
	})

	it("rejects a non-boolean earned flag", () => {
		expect(problemsFor({ scenario: [["flows", 0, "earned"], "yes"] })).toEqual(
			expected("WRONG_TYPE", ["scenario", "flows", 0, "earned"]),
		)
	})
})
