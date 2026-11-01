import { describe, expect, it } from "bun:test"
import { expected, problemsFor } from "../testing"

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

	it("accepts growth inflation and { bps }", () => {
		expect(problemsFor({ scenario: [["flows", 0, "growth"], "inflation"] })).toEqual([])
		expect(problemsFor({ scenario: [["flows", 0, "growth"], { bps: 0 }] })).toEqual([])
	})

	it("rejects any other growth", () => {
		expect(problemsFor({ scenario: [["flows", 0, "growth"], "wage"] })).toEqual(
			expected("INVALID_GROWTH", ["scenario", "flows", 0, "growth"]),
		)
		expect(problemsFor({ scenario: [["flows", 0, "growth"], 300] })).toEqual(
			expected("INVALID_GROWTH", ["scenario", "flows", 0, "growth"]),
		)
	})

	it("rejects a non-boolean earned flag", () => {
		expect(problemsFor({ scenario: [["flows", 0, "earned"], "yes"] })).toEqual(
			expected("WRONG_TYPE", ["scenario", "flows", 0, "earned"]),
		)
	})
})
