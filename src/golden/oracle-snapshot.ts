import type { AccountId, DateString } from "../types"
import { oracleCountedDays } from "./oracle-date"
import { oracleDeflate } from "./oracle-money"
import { type OracleStates, oracleValuation } from "./oracle-state"

export interface OracleBalance {
	readonly account: AccountId
	readonly amount: bigint
}

export interface OracleSnapshot {
	readonly date: DateString
	readonly balances: readonly OracleBalance[]
	readonly netWorth: bigint
	readonly accessibleNetWorth: bigint
	readonly realBalances: readonly OracleBalance[]
	readonly realNetWorth: bigint
	readonly realAccessibleNetWorth: bigint
}

export function oracleSnapshot(
	states: OracleStates,
	date: DateString,
	start: DateString,
	inflation: number,
): OracleSnapshot {
	const days = oracleCountedDays(start, date)
	const balances: OracleBalance[] = []
	const realBalances: OracleBalance[] = []
	let net = 0n
	let accessible = 0n
	let realNet = 0n
	let realAccessible = 0n
	const ordered = [...states.values()].sort((a, b) => (a.rule.id < b.rule.id ? -1 : 1))
	for (const state of ordered) {
		const amount = oracleValuation(state, date)
		const real = oracleDeflate(amount, inflation, days)
		balances.push({ account: state.rule.id, amount })
		realBalances.push({ account: state.rule.id, amount: real })
		const signed = state.rule.kind === "liability" ? -amount : amount
		const realSigned = state.rule.kind === "liability" ? -real : real
		net += signed
		realNet += realSigned
		const unlocked =
			state.rule.kind !== "asset" ||
			state.rule.lockedUntil === undefined ||
			date >= state.rule.lockedUntil
		if (unlocked) {
			accessible += signed
			realAccessible += realSigned
		}
	}
	return {
		date,
		balances,
		netWorth: net,
		accessibleNetWorth: accessible,
		realBalances,
		realNetWorth: realNet,
		realAccessibleNetWorth: realAccessible,
	}
}
