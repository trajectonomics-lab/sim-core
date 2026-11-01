import type { DateString } from "../types"

const DATE_SHAPE = /^(\d{4})-(\d{2})-(\d{2})$/
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

export interface CivilDate {
	readonly year: number
	readonly month: number
	readonly day: number
}

export function isLeapYear(year: number): boolean {
	return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

export function daysInMonth(year: number, month: number): number {
	return month === 2 && isLeapYear(year) ? 29 : (MONTH_DAYS[month - 1] ?? 0)
}

/** Parses an already validated `YYYY-MM-DD` date. */
export function parseDate(value: DateString): CivilDate {
	const match = DATE_SHAPE.exec(value)
	if (!match) throw new RangeError(`Invalid date: ${value}`)
	return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) }
}

function pad(value: number, width: number): string {
	return String(value).padStart(width, "0")
}

export function formatDate({ year, month, day }: CivilDate): DateString {
	return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`
}
