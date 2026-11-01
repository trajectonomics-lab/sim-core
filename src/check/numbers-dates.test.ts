import { describe, expect, it } from "bun:test"
import { expected, problemsFor } from "../testing"
import { isValidDate } from "./date"

describe("check() numbers", () => {
	it("rejects a fractional balance", () => {
		expect(problemsFor({ baseline: [["balances", 0, "amount"], 1.5] })).toEqual(
			expected("NOT_SAFE_INTEGER", ["baseline", "balances", 0, "amount"]),
		)
	})

	it("rejects a balance beyond the safe-integer range", () => {
		const edits = { baseline: [["balances", 0, "amount"], 2 ** 53] } as const
		expect(problemsFor(edits)).toEqual(
			expected("NOT_SAFE_INTEGER", ["baseline", "balances", 0, "amount"]),
		)
	})

	it("rejects a numeric string amount", () => {
		expect(problemsFor({ scenario: [["flows", 0, "amount"], "100"] })).toEqual(
			expected("NOT_SAFE_INTEGER", ["scenario", "flows", 0, "amount"]),
		)
	})

	it("rejects a negative balance", () => {
		expect(problemsFor({ baseline: [["balances", 0, "amount"], -1] })).toEqual(
			expected("NEGATIVE_AMOUNT", ["baseline", "balances", 0, "amount"]),
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

	it("rejects NaN and non-integer basis-point rates", () => {
		expect(problemsFor({ scenario: [["accounts", 0, "rate"], Number.NaN] })).toEqual(
			expected("NOT_SAFE_INTEGER", ["scenario", "accounts", 0, "rate"]),
		)
		expect(problemsFor({ scenario: [["economy", "inflation"], 2.5] })).toEqual(
			expected("NOT_SAFE_INTEGER", ["scenario", "economy", "inflation"]),
		)
		expect(problemsFor({ scenario: [["flows", 0, "growth"], { bps: 1.5 }] })).toEqual(
			expected("NOT_SAFE_INTEGER", ["scenario", "flows", 0, "growth", "bps"]),
		)
	})

	it("allows negative basis-point rates (deflation, negative returns)", () => {
		expect(problemsFor({ scenario: [["economy", "inflation"], -100] })).toEqual([])
	})
})

describe("check() dates", () => {
	it("isValidDate handles leap years and month lengths", () => {
		expect(isValidDate("2024-02-29")).toBe(true)
		expect(isValidDate("2000-02-29")).toBe(true)
		expect(isValidDate("2025-02-29")).toBe(false)
		expect(isValidDate("1900-02-29")).toBe(false)
		expect(isValidDate("2025-04-31")).toBe(false)
		expect(isValidDate("2025-13-01")).toBe(false)
		expect(isValidDate("2025-00-10")).toBe(false)
		expect(isValidDate("2025-1-10")).toBe(false)
		expect(isValidDate("2025-01-10T00:00")).toBe(false)
		expect(isValidDate(20250110)).toBe(false)
	})

	it("rejects 2025-02-29 as a flow start", () => {
		expect(problemsFor({ scenario: [["flows", 0, "start"], "2025-02-29"] })).toEqual(
			expected("INVALID_DATE", ["scenario", "flows", 0, "start"]),
		)
	})

	it("rejects an invalid timeline date", () => {
		expect(problemsFor({ timeline: [["start"], "2026-06-31"] })).toEqual(
			expected("INVALID_DATE", ["timeline", "start"]),
		)
	})

	it("rejects an invalid lockedUntil", () => {
		expect(problemsFor({ scenario: [["accounts", 2, "lockedUntil"], "2046-02-30"] })).toEqual(
			expected("INVALID_DATE", ["scenario", "accounts", 2, "lockedUntil"]),
		)
	})

	it("rejects a horizon before the start but allows equality", () => {
		expect(problemsFor({ timeline: [["horizon"], "2025-12-31"] })).toEqual(
			expected("HORIZON_BEFORE_START", ["timeline", "horizon"]),
		)
		expect(problemsFor({ timeline: [["horizon"], "2026-01-01"] })).toEqual([])
	})

	it("rejects a flow end before its start but allows equality", () => {
		expect(problemsFor({ scenario: [["flows", 3, "end"], "2025-12-25"] })).toEqual(
			expected("END_BEFORE_START", ["scenario", "flows", 3, "end"]),
		)
		expect(problemsFor({ scenario: [["flows", 3, "end"], "2026-01-25"] })).toEqual([])
	})

	it("requires a once flow to have no end or end equal to start", () => {
		const bonus = ["flows", 1, "end"]
		expect(problemsFor({ scenario: [bonus, "2026-03-31"] })).toEqual([])
		expect(problemsFor({ scenario: [bonus, "2026-04-30"] })).toEqual(
			expected("ONCE_FLOW_END_MISMATCH", ["scenario", ...bonus]),
		)
	})
})
