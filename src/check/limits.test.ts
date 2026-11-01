import { describe, expect, it } from "bun:test"
import { expected, problemsFor } from "../testing"

const surplus = ["cashflow", "surplus"] as const

describe("check() surplus routing", () => {
	it("rejects an empty surplus list", () => {
		expect(problemsFor({ scenario: [surplus, []] })).toEqual(
			expected("SURPLUS_UNROUTED", ["scenario", ...surplus]),
		)
	})

	it("rejects a last surplus step with an upTo ceiling", () => {
		expect(problemsFor({ scenario: [[...surplus, 1, "upTo"], 5] })).toEqual(
			expected("SURPLUS_UNROUTED", ["scenario", ...surplus, 1, "upTo"]),
		)
	})

	it("accepts an uncapped last step", () => {
		expect(problemsFor({ scenario: [surplus, [{ account: "cash" }]] })).toEqual([])
	})
})

describe("check() rate floor", () => {
	it.each([
		["an account rate", ["accounts", 0, "rate"], -10000],
		["inflation", ["economy", "inflation"], -10000],
		["flow growth", ["flows", 0, "growth", "bps"], -10000],
	])("rejects %s at -10000 bps", (_name, path, value) => {
		expect(problemsFor({ scenario: [path, value] })).toEqual(
			expected("RATE_OUT_OF_RANGE", ["scenario", ...path]),
		)
	})

	it.each([-10001, -50000, Number.MIN_SAFE_INTEGER])("rejects %d bps", (value) => {
		expect(problemsFor({ scenario: [["accounts", 0, "rate"], value] })).toEqual(
			expected("RATE_OUT_OF_RANGE", ["scenario", "accounts", 0, "rate"]),
		)
	})

	it("accepts -9999 bps and keeps rejecting non-integers", () => {
		expect(problemsFor({ scenario: [["accounts", 0, "rate"], -9999] })).toEqual([])
		expect(problemsFor({ scenario: [["accounts", 0, "rate"], -9999.5] })).toEqual(
			expected("NOT_SAFE_INTEGER", ["scenario", "accounts", 0, "rate"]),
		)
	})
})
