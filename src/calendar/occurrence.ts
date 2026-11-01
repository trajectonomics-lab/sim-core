import type { DateString, Frequency } from "../types"
import { addDays, addMonthsClamped, dayNumber, growthYears } from "./arith"

export interface Occurrence {
	readonly date: DateString
	readonly years: number
}

function stepDays(frequency: Frequency): number | undefined {
	if (frequency === "daily") return 1
	if (frequency === "weekly") return 7
	if (frequency === "biweekly") return 14
	return undefined
}

function stepMonths(frequency: Frequency): number | undefined {
	if (frequency === "monthly") return 1
	if (frequency === "quarterly") return 3
	if (frequency === "annual") return 12
	return undefined
}

function occurrenceDate(start: DateString, frequency: Frequency, index: number): DateString {
	const months = stepMonths(frequency)
	if (months !== undefined) return addMonthsClamped(start, index * months)
	const days = stepDays(frequency) ?? 1
	return addDays(start, index * days)
}

function firstIndex(start: DateString, frequency: Frequency, from: DateString): number {
	if (from <= start) return 0
	const months = stepMonths(frequency)
	if (months !== undefined) {
		const s = start.split("-")
		const f = from.split("-")
		const diff = (Number(f[0]) - Number(s[0])) * 12 + (Number(f[1]) - Number(s[1]))
		return Math.max(0, Math.floor(diff / months))
	}
	const days = stepDays(frequency) ?? 1
	return Math.max(0, Math.floor((dayNumber(from) - dayNumber(start)) / days))
}

function rangeOccurrences(
	start: DateString,
	frequency: Frequency,
	last: DateString,
	from: DateString,
): readonly Occurrence[] {
	const result: Occurrence[] = []
	for (let index = firstIndex(start, frequency, from); ; index++) {
		const date = occurrenceDate(start, frequency, index)
		if (date > last) return result
		if (date >= from) result.push({ date, years: growthYears(start, date) })
	}
}

/** Occurrences in `[from, to]`, with `end` (inclusive) capping them. */
export function occurrences(
	start: DateString,
	frequency: Frequency,
	end: DateString | undefined,
	from: DateString,
	to: DateString,
): readonly Occurrence[] {
	if (to < from) return []
	const last = end !== undefined && end < to ? end : to
	if (frequency === "once") {
		return start >= from && start <= last ? [{ date: start, years: 0 }] : []
	}
	return rangeOccurrences(start, frequency, last, from)
}
