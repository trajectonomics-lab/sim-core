import { dailyRowDates, monthlyRowDates } from "../calendar/rows"
import { check } from "../check"
import type { Baseline, DateString, Scenario, Timeline } from "../types"
import type {
	AccountAmount,
	Projection,
	ProjectionResult,
	ProjectionRow,
	RunsOut,
} from "../types/projection"
import { runEngine } from "./run"
import type { EngineSnapshot } from "./snapshot"

function observationDates(timeline: Timeline): readonly DateString[] {
	return timeline.resolution === "day"
		? dailyRowDates(timeline.start, timeline.horizon)
		: monthlyRowDates(timeline.start, timeline.horizon)
}

function toAmounts(snapshot: EngineSnapshot): readonly AccountAmount[] {
	return snapshot.balances.map((balance) => ({
		account: balance.account,
		amount: Number(balance.amount),
	}))
}

function toRow(snapshot: EngineSnapshot): ProjectionRow {
	return {
		date: snapshot.date,
		balances: toAmounts(snapshot),
		netWorth: Number(snapshot.netWorth),
		accessibleNetWorth: Number(snapshot.accessibleNetWorth),
	}
}

function toRunsOut(runsOut: { readonly date: DateString; readonly unmet: bigint }): RunsOut {
	return { date: runsOut.date, unmet: Number(runsOut.unmet) }
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
	const rows = result.run.snapshots.map(toRow)
	const projection: Projection =
		result.run.runsOut === undefined ? { rows } : { rows, runsOut: toRunsOut(result.run.runsOut) }
	return { ok: true, projection }
}
