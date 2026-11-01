import type { DateString } from "../types"
import type { DatedEvent } from "./events"

/** Sorted unique union of event dates and requested observation dates. */
export function collectDates(
	events: readonly DatedEvent[],
	observations: readonly DateString[],
): readonly DateString[] {
	const dates = new Set<DateString>()
	for (const event of events) dates.add(event.date)
	for (const date of observations) dates.add(date)
	return [...dates].sort((left, right) => (left < right ? -1 : left > right ? 1 : 0))
}
