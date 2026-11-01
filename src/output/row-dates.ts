import { dailyRowDates, monthlyRowDates } from "../calendar/rows"
import type { DateString, Timeline } from "../types"

/** The dates `Timeline.resolution` asks to report. */
export function rowDates(timeline: Timeline): readonly DateString[] {
	return timeline.resolution === "day"
		? dailyRowDates(timeline.start, timeline.horizon)
		: monthlyRowDates(timeline.start, timeline.horizon)
}
