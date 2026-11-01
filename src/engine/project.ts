import { dailyRowDates, monthlyRowDates } from "../calendar/rows"
import { check } from "../check"
import { buildProjection } from "../output/build"
import type { Baseline, DateString, Scenario, Timeline } from "../types"
import type { ProjectionResult } from "../types/projection"
import { runEngine } from "./run"

function observationDates(timeline: Timeline): readonly DateString[] {
	return timeline.resolution === "day"
		? dailyRowDates(timeline.start, timeline.horizon)
		: monthlyRowDates(timeline.start, timeline.horizon)
}

/** Runs `check` first, then the deterministic engine; never throws on valid inputs. */
export function project(
	baseline: Baseline,
	scenario: Scenario,
	timeline: Timeline,
): ProjectionResult {
	const problems = check(baseline, scenario, timeline)
	if (problems.length > 0) return { ok: false, problems }
	const result = runEngine(baseline, scenario, timeline, observationDates(timeline))
	if (!result.ok) return { ok: false, problems: [result.problem] }
	const output = buildProjection(result.run, baseline, scenario, timeline)
	if ("problem" in output) return { ok: false, problems: [output.problem] }
	return { ok: true, projection: output.projection }
}
