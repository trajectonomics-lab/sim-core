import type { Fixture } from "../fixtures/fixture"
import type { AccountId, DateString } from "../types"
import { oracleAddDays } from "./oracle-date"
import { type OracleEvent, oracleEvents } from "./oracle-flow"
import {
	oracleContributions,
	oracleIncomeExpense,
	oracleSurplus,
	oracleWithdraw,
} from "./oracle-ops"
import { type OracleSnapshot, oracleSnapshot } from "./oracle-snapshot"
import type { OracleState, OracleStates } from "./oracle-state"

export interface OracleRunsOut {
	readonly date: DateString
	readonly unmet: bigint
}

export interface OracleRun {
	readonly snapshots: readonly OracleSnapshot[]
	readonly runsOut?: OracleRunsOut
}

function createStates(fixture: Fixture): OracleStates {
	const opening = new Map<AccountId, number>()
	for (const balance of fixture.baseline.balances) opening.set(balance.account, balance.amount)
	const states = new Map<AccountId, OracleState>()
	const rules = [...fixture.scenario.accounts].sort((a, b) => (a.id < b.id ? -1 : 1))
	for (const rule of rules) {
		states.set(rule.id, {
			rule,
			balance: BigInt(opening.get(rule.id) ?? 0),
			asOf: fixture.timeline.start,
		})
	}
	return states
}

function processDay(
	states: OracleStates,
	fixture: Fixture,
	date: DateString,
	events: readonly OracleEvent[],
): OracleRunsOut | undefined {
	const { scenario } = fixture
	const inflation = scenario.economy.inflation
	const [income, expense] = oracleIncomeExpense(events, inflation)
	const outflow = oracleContributions(states, events, inflation, date)
	const net = income - expense - outflow
	if (net > 0n) {
		oracleSurplus(states, scenario.cashflow.surplus, date, net)
		return undefined
	}
	if (net < 0n) {
		const remaining = oracleWithdraw(states, scenario, date, -net)
		if (remaining > 0n) return { date, unmet: remaining }
	}
	return undefined
}

export function oracleRun(fixture: Fixture, observations: readonly DateString[]): OracleRun {
	const { scenario, timeline } = fixture
	const inflation = scenario.economy.inflation
	const states = createStates(fixture)
	const byDate = new Map<DateString, OracleEvent[]>()
	for (const event of oracleEvents(scenario.flows, timeline.start, timeline.horizon)) {
		const list = byDate.get(event.date) ?? []
		list.push(event)
		byDate.set(event.date, list)
	}
	const wanted = new Set<DateString>(observations)
	const snapshots: OracleSnapshot[] = []
	for (let date = timeline.start; date <= timeline.horizon; date = oracleAddDays(date, 1)) {
		const day = byDate.get(date)
		const runsOut = day === undefined ? undefined : processDay(states, fixture, date, day)
		if (runsOut !== undefined) {
			snapshots.push(oracleSnapshot(states, date, timeline.start, inflation))
			return { snapshots, runsOut }
		}
		if (wanted.has(date)) {
			snapshots.push(oracleSnapshot(states, date, timeline.start, inflation))
		}
	}
	return { snapshots }
}
