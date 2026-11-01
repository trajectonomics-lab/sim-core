import { describe, expect, it } from "bun:test"
import { expected, problemsFor } from "../testing"

const balanceAmount = ["balances", 0, "amount"] as const

describe("check() numbers", () => {
	it("rejects a fractional balance", () => {
		expect(problemsFor({ baseline: [balanceAmount, 1.5] })).toEqual(
			expected("NOT_SAFE_INTEGER", ["baseline", ...balanceAmount]),
		)
	})

	it("rejects a balance beyond the safe-integer range", () => {
		expect(problemsFor({ baseline: [balanceAmount, 2 ** 53] })).toEqual(
			expected("NOT_SAFE_INTEGER", ["baseline", ...balanceAmount]),
		)
	})

	it("rejects a numeric string amount", () => {
		expect(problemsFor({ scenario: [["flows", 0, "amount"], "100"] })).toEqual(
			expected("NOT_SAFE_INTEGER", ["scenario", "flows", 0, "amount"]),
		)
	})

	it("rejects a negative balance", () => {
		expect(problemsFor({ baseline: [balanceAmount, -1] })).toEqual(
			expected("NEGATIVE_AMOUNT", ["baseline", ...balanceAmount]),
		)
	})

	it("rejects a negative flow amount", () => {
		expect(problemsFor({ scenario: [["flows", 0, "amount"], -5] })).toEqual(
			expected("NEGATIVE_AMOUNT", ["scenario", "flows", 0, "amount"]),
		)
	})

	it("rejects a negative upTo", () => {
		expect(problemsFor({ scenario: [["cashflow", "surplus", 0, "upTo"], -1] })).toEqual(
			expected("NEGATIVE_AMOUNT", ["scenario", "cashflow", "surplus", 0, "upTo"]),
		)
	})

	it("rejects a NaN account rate", () => {
		expect(problemsFor({ scenario: [["accounts", 0, "rate"], Number.NaN] })).toEqual(
			expected("NOT_SAFE_INTEGER", ["scenario", "accounts", 0, "rate"]),
		)
	})

	it("rejects a non-integer inflation rate", () => {
		expect(problemsFor({ scenario: [["economy", "inflation"], 2.5] })).toEqual(
			expected("NOT_SAFE_INTEGER", ["scenario", "economy", "inflation"]),
		)
	})

	it("allows negative basis-point rates (deflation, negative returns)", () => {
		expect(problemsFor({ scenario: [["economy", "inflation"], -100] })).toEqual([])
	})
})
