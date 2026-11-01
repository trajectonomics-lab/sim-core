import { describe, expect, it } from "bun:test"
import { addDays, addMonthsClamped, dayNumber, fromDayNumber } from "./arith"
import { countedDays } from "./counted"
import { monthlyRowDates } from "./rows"

const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

function leap(year: number): boolean {
	return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

function daysIn(year: number, month: number): number {
	return month === 2 && leap(year) ? 29 : (DAYS[month - 1] ?? 0)
}

function parse(value: string): [number, number, number] {
	return value.split("-").map(Number) as [number, number, number]
}

function nextDay(value: string): string {
	let [year, month, day] = parse(value)
	day++
	if (day > daysIn(year, month)) {
		day = 1
		month++
	}
	if (month > 12) {
		month = 1
		year++
	}
	return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

/** Brute force: walk every day after `from`, counting all days except Feb 29. */
function naiveCounted(from: string, to: string): number {
	let count = 0
	for (let date = from; date < to; date = nextDay(date)) {
		const [, month, day] = parse(nextDay(date))
		if (!(month === 2 && day === 29)) count++
	}
	return count
}

describe("countedDays (Actual/365 No Leap)", () => {
	const dates = [
		"1900-02-27",
		"1900-03-01",
		"1999-12-31",
		"2000-02-28",
		"2000-02-29",
		"2000-03-01",
		"2023-12-31",
		"2024-01-01",
		"2024-02-28",
		"2024-02-29",
		"2024-03-01",
		"2025-02-28",
		"2025-03-01",
	]

	it("matches a brute-force walk over every date", () => {
		for (const from of dates) {
			for (const to of dates) {
				if (from <= to) expect(countedDays(from, to)).toBe(naiveCounted(from, to))
			}
		}
	})

	it.each(["2023-03-01", "2024-01-01", "2024-02-29", "2024-03-01", "2025-07-15"])(
		"counts exactly 365 days from %s to the same date next year",
		(start) => {
			const end = addMonthsClamped(start, 12)
			expect(countedDays(start, end)).toBe(365)
		},
	)

	it("is zero for the same date and negative only when reversed", () => {
		expect(countedDays("2024-02-29", "2024-02-29")).toBe(0)
		expect(countedDays("2024-03-01", "2024-02-28")).toBe(-1)
	})
})

describe("pure calendar arithmetic", () => {
	it("round-trips serial day numbers", () => {
		for (const date of ["0001-01-01", "1900-03-01", "2000-02-29", "9999-12-31"]) {
			expect(fromDayNumber(dayNumber(date))).toBe(date)
		}
	})

	it.each([
		["2024-02-28", 1, "2024-02-29"],
		["2024-02-29", 1, "2024-03-01"],
		["2023-02-28", 1, "2023-03-01"],
		["2024-12-31", 1, "2025-01-01"],
	])("adds %d day(s) to %s", (start, days, expected) => {
		expect(addDays(start, days)).toBe(expected)
	})

	it.each([
		["2024-01-31", 1, "2024-02-29"],
		["2023-01-31", 1, "2023-02-28"],
		["2024-02-29", 12, "2025-02-28"],
		["2023-12-31", 2, "2024-02-29"],
		["2024-03-31", -1, "2024-02-29"],
	])("adds %d month(s) to %s with clamping", (start, months, expected) => {
		expect(addMonthsClamped(start, months)).toBe(expected)
	})
})

describe("monthly row dates", () => {
	it("clamps each anniversary and always ends at the horizon", () => {
		expect(monthlyRowDates("2024-01-31", "2024-05-15")).toEqual([
			"2024-01-31",
			"2024-02-29",
			"2024-03-31",
			"2024-04-30",
			"2024-05-15",
		])
	})

	it("uses Feb 28 in a non-leap year", () => {
		expect(monthlyRowDates("2023-01-31", "2023-04-01")).toEqual([
			"2023-01-31",
			"2023-02-28",
			"2023-03-31",
			"2023-04-01",
		])
	})

	it("does not duplicate the horizon", () => {
		expect(monthlyRowDates("2026-01-01", "2026-03-01")).toEqual([
			"2026-01-01",
			"2026-02-01",
			"2026-03-01",
		])
	})

	it("returns one row when start equals horizon", () => {
		expect(monthlyRowDates("2026-01-01", "2026-01-01")).toEqual(["2026-01-01"])
	})
})
