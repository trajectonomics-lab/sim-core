import type { Baseline, DateString, Scenario, Timeline } from "../types"
import { collectDates } from "./dates"
import { buildEvents } from "./events"
import type { EngineResult } from "./result"
import { type RunAccumulator, stepDate } from "./run-step"
import { createStates } from "./state"

export function runEngine(
	baseline: Baseline,
	scenario: Scenario,
	timeline: Timeline,
	observations: readonly DateString[],
): EngineResult {
	const states = createStates(baseline, scenario, timeline.start)
	const events = buildEvents(scenario, timeline)
	const acc: RunAccumulator = {
		snapshots: [],
		totals: [],
		wanted: new Set<DateString>(observations),
	}
	let index = 0
	for (const date of collectDates(events, observations)) {
		const start = index
		while (index < events.length && events[index]?.date === date) index++
		const result = stepDate(acc, states, scenario, date, events.slice(start, index))
		if (result !== undefined) return result
	}
	return { ok: true, run: { snapshots: acc.snapshots, totals: acc.totals } }
}
