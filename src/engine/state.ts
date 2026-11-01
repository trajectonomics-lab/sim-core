import type { Account, AccountId, Baseline, DateString, Scenario } from "../types"
import { compareIds } from "./order"

export interface AccountState {
	readonly rule: Account
	balance: bigint
	asOf: DateString
}

export type StateMap = ReadonlyMap<AccountId, AccountState>

/** Every declared account gets a state; missing baseline balances open at zero. */
export function createStates(baseline: Baseline, scenario: Scenario, start: DateString): StateMap {
	const opening = new Map<AccountId, number>()
	for (const balance of baseline.balances) opening.set(balance.account, balance.amount)
	const states = new Map<AccountId, AccountState>()
	const rules = [...scenario.accounts].sort((a, b) => compareIds(a.id, b.id))
	for (const rule of rules) {
		states.set(rule.id, { rule, balance: BigInt(opening.get(rule.id) ?? 0), asOf: start })
	}
	return states
}
