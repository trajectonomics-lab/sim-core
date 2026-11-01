import type { DateString } from "../types"

const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

export function oracleLeap(year: number): boolean {
	return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

function monthDays(year: number, month: number): number {
	return month === 2 && oracleLeap(year) ? 29 : (MONTH_DAYS[month - 1] ?? 0)
}

function parse(value: DateString): readonly [number, number, number] {
	return value.split("-").map(Number) as [number, number, number]
}

function format(year: number, month: number, day: number): DateString {
	return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function daysBeforeYear(year: number): number {
	const p = year - 1
	return 365 * p + Math.floor(p / 4) - Math.floor(p / 100) + Math.floor(p / 400)
}

export function oracleOrdinal(date: DateString): number {
	const [year, month, day] = parse(date)
	let days = daysBeforeYear(year) + day - 1
	for (let m = 1; m < month; m++) days += monthDays(year, m)
	return days
}

export function oracleAddDays(date: DateString, days: number): DateString {
	const target = oracleOrdinal(date) + days
	let year = Math.floor(target / 366) + 1
	while (daysBeforeYear(year + 1) <= target) year++
	while (daysBeforeYear(year) > target) year--
	let remaining = target - daysBeforeYear(year)
	let month = 1
	while (remaining >= monthDays(year, month)) {
		remaining -= monthDays(year, month)
		month++
	}
	return format(year, month, remaining + 1)
}

export function oracleAddMonthsClamped(date: DateString, months: number): DateString {
	const [year, month, day] = parse(date)
	const total = year * 12 + month - 1 + months
	const targetYear = Math.floor(total / 12)
	const targetMonth = (total % 12) + 1
	return format(targetYear, targetMonth, Math.min(day, monthDays(targetYear, targetMonth)))
}

export function oracleCountedDays(from: DateString, to: DateString): number {
	let leapDays = 0
	for (let year = parse(from)[0]; year <= parse(to)[0]; year++) {
		if (!oracleLeap(year)) continue
		const leap = format(year, 2, 29)
		if (leap > from && leap <= to) leapDays++
	}
	return oracleOrdinal(to) - oracleOrdinal(from) - leapDays
}

export function oracleGrowthYears(start: DateString, date: DateString): number {
	let years = 0
	while (oracleAddMonthsClamped(start, (years + 1) * 12) <= date) years++
	return years
}
