import { addDays, addMonthsClamped } from "../calendar/arith"
import type { DateString } from "../types"

export interface Period {
	readonly index: number
	readonly from: DateString
	readonly to: DateString
	readonly partial: boolean
}

/** Last day of every full twelve-month period that ends on or before `end`. */
export function periodEndDates(start: DateString, end: DateString): readonly DateString[] {
	const dates: DateString[] = []
	for (let index = 1; ; index++) {
		const last = addDays(addMonthsClamped(start, index * 12), -1)
		if (last > end) return dates
		dates.push(last)
	}
}

/**
 * Twelve-month periods from each anniversary of `start` to the day before the next one; the
 * final one is clipped by the projection's end and marked partial.
 */
export function buildPeriods(
	start: DateString,
	end: DateString,
	runsOutDate: DateString | undefined,
): readonly Period[] {
	const periods: Period[] = []
	let from = start
	let index = 0
	while (true) {
		const next = addMonthsClamped(start, (index + 1) * 12)
		const yearEnd = addDays(next, -1)
		const to = end < yearEnd ? end : yearEnd
		const partial = to < yearEnd || to === runsOutDate
		periods.push({ index, from, to, partial })
		if (to === end) return periods
		from = next
		index++
	}
}
