import { occurrences } from "../calendar/occurrence"
import type { DateString, Flow, Scenario, Timeline } from "../types"
import { compareIds } from "./order"

export interface DatedEvent {
	readonly date: DateString
	readonly flow: Flow
	readonly years: number
}

/** All flow occurrences in the timeline, sorted by date then flow id. */
export function buildEvents(scenario: Scenario, timeline: Timeline): readonly DatedEvent[] {
	const events: DatedEvent[] = []
	for (const flow of scenario.flows) {
		const found = occurrences(
			flow.start,
			flow.frequency,
			flow.end,
			timeline.start,
			timeline.horizon,
		)
		for (const occurrence of found) {
			events.push({ date: occurrence.date, flow, years: occurrence.years })
		}
	}
	return events.sort((left, right) =>
		left.date === right.date
			? compareIds(left.flow.id, right.flow.id)
			: left.date < right.date
				? -1
				: 1,
	)
}
