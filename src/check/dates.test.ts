import { describe, expect, it } from "bun:test"
import { expected, problemsFor } from "../testing"

/** A pure date field with no cross-field rule, so only the format/calendar check applies. */
const lockedUntil = (value: unknown) =>
	problemsFor({ scenario: [["accounts", 2, "lockedUntil"], value] })
const invalid = expected("INVALID_DATE", ["scenario", "accounts", 2, "lockedUntil"])

describe("check() date validity", () => {
	it.each(["2024-02-29", "2000-02-29", "0001-01-01", "9999-12-31"])("accepts %s", (value) => {
		expect(lockedUntil(value)).toEqual([])
	})

	it.each([
		["a non-leap Feb 29", "2025-02-29"],
		["a century non-leap Feb 29", "1900-02-29"],
		["April 31", "2025-04-31"],
		["month 13", "2025-13-01"],
		["month 00", "2025-00-10"],
		["day 00", "2025-01-00"],
		["year 0000", "0000-01-01"],
		["an unpadded month", "2025-1-10"],
		["a datetime", "2025-01-10T00:00"],
		["a trailing newline", "2025-01-10\n"],
		["full-width digits", "２０２５-01-10"],
		["a number", 20250110],
		["null", null],
	])("rejects %s", (_name, value) => {
		expect(lockedUntil(value)).toEqual(invalid)
	})
})

describe("check() date rules", () => {
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

	it("rejects a horizon before the start", () => {
		expect(problemsFor({ timeline: [["horizon"], "2025-12-31"] })).toEqual(
			expected("HORIZON_BEFORE_START", ["timeline", "horizon"]),
		)
	})

	it("allows a horizon equal to the start", () => {
		expect(problemsFor({ timeline: [["horizon"], "2026-01-01"] })).toEqual([])
	})

	it("rejects a flow end before its start", () => {
		expect(problemsFor({ scenario: [["flows", 3, "end"], "2025-12-25"] })).toEqual(
			expected("END_BEFORE_START", ["scenario", "flows", 3, "end"]),
		)
	})

	it("allows a flow end equal to its start", () => {
		expect(problemsFor({ scenario: [["flows", 3, "end"], "2026-01-25"] })).toEqual([])
	})

	it("allows a once flow with end equal to start", () => {
		expect(problemsFor({ scenario: [["flows", 1, "end"], "2026-03-31"] })).toEqual([])
	})

	it("rejects a once flow whose end differs from its start", () => {
		expect(problemsFor({ scenario: [["flows", 1, "end"], "2026-04-30"] })).toEqual(
			expected("ONCE_FLOW_END_MISMATCH", ["scenario", "flows", 1, "end"]),
		)
	})
})
