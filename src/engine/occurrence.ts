import type { DateString, Scenario } from "../types"
import type { ProjectionProblem } from "../types/projection"
import { aggregate } from "./aggregate"
import { applyContributions } from "./contributions"
import type { DatedEvent } from "./events"
import type { StateMap } from "./state"
import { applySurplus } from "./surplus"
import { applyWithdraw } from "./withdraw"

export interface DayTotals {
	readonly date: DateString
	readonly income: bigint
	readonly expense: bigint
	readonly contributions: bigint
}

export interface EngineRunsOut {
	readonly date: DateString
	readonly unmet: bigint
}

export interface DateOutcome {
	readonly totals: DayTotals
	readonly problem: ProjectionProblem | undefined
	readonly runsOut: EngineRunsOut | undefined
}

/** Applies one occurrence date in the canonical order of operations. */
export function processDate(
	states: StateMap,
	scenario: Scenario,
	date: DateString,
	events: readonly DatedEvent[],
): DateOutcome {
	const day = aggregate(events, scenario.economy.inflation)
	const applied = applyContributions(states, day.contributions, date)
	const totals = {
		date,
		income: day.income,
		expense: day.expense,
		contributions: applied.outflow,
	}
	if (applied.problem !== undefined) return { totals, problem: applied.problem, runsOut: undefined }
	const net = day.income - day.expense - applied.outflow
	if (net > 0n) {
		const problem = applySurplus(states, scenario, date, net)
		return { totals, problem, runsOut: undefined }
	}
	if (net < 0n) {
		const drawn = applyWithdraw(states, scenario, date, -net)
		if (drawn.problem !== undefined) {
			return { totals, problem: drawn.problem, runsOut: undefined }
		}
		if (drawn.remaining > 0n) {
			return { totals, problem: undefined, runsOut: { date, unmet: drawn.remaining } }
		}
	}
	return { totals, problem: undefined, runsOut: undefined }
}
