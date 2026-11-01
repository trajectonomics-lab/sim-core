import type { Account, AccountId, Scenario } from "../types"

export type RuleMap = ReadonlyMap<AccountId, Account>

export function accountRules(scenario: Scenario): RuleMap {
	const rules = new Map<AccountId, Account>()
	for (const rule of scenario.accounts) rules.set(rule.id, rule)
	return rules
}
