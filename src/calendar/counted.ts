import type { DateString } from "../types"
import { dayNumber } from "./arith"
import { isLeapYear, parseDate } from "./civil"

/** Number of Feb 29 dates in years 1..year that are not after `date`. */
function leapDaysThrough(date: DateString): number {
	const { year, month, day } = parseDate(date)
	let count = Math.floor(year / 4) - Math.floor(year / 100) + Math.floor(year / 400)
	if (isLeapYear(year) && (month < 2 || (month === 2 && day < 29))) count--
	return count
}

/** Actual/365 No Leap: actual days minus the Feb 29s in `(from, to]`. */
export function countedDays(from: DateString, to: DateString): number {
	return dayNumber(to) - dayNumber(from) - (leapDaysThrough(to) - leapDaysThrough(from))
}
