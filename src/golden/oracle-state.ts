import type { Account, AccountId, DateString } from "../types"
import { oracleCountedDays } from "./oracle-date"
import { oracleGrow } from "./oracle-money"

export interface OracleState {
	readonly rule: Account
	balance: bigint
	asOf: DateString
}

export type OracleStates = ReadonlyMap<AccountId, OracleState>

export function oracleValuation(state: OracleState, date: DateString): bigint {
	return oracleGrow(state.balance, state.rule.rate, oracleCountedDays(state.asOf, date))
}

export function oracleMutate(state: OracleState, date: DateString, delta: bigint): void {
	state.balance = oracleValuation(state, date) + delta
	state.asOf = date
}
