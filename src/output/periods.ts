import { addDays, addMonthsClamped } from "../calendar/arith"
import type { DateString } from "../types"

export interface Period {
	readonly index: number
	readonly from: DateString
	readonly to: DateString
	readonly partial: boolean
}

/** Twelve-month periods anchored on `start`; the final one is clipped by the projection's end. */
export function buildPeriods(
	start: DateString,
	end: DateString,
	runsOutDate: DateString | undefined,
): readonly Period[] {
	const periods: Period[] = []
	let from = start
	let index = 0
	while (true) {
		const boundary = addMonthsClamped(start, (index + 1) * 12)
		const to = end < boundary ? end : boundary
		const partial = to < boundary || to === runsOutDate
		periods.push({ index, from, to, partial })
		if (to === end) return periods
		from = addDays(to, 1)
		index++
	}
}
