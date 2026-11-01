import type { Baseline } from "../types"
import type { RuleMap } from "./rules"

/** Net worth at the timeline start, before any start-date flows land. */
export function openingNetWorth(baseline: Baseline, rules: RuleMap): bigint {
	let total = 0n
	for (const balance of baseline.balances) {
		const amount = BigInt(balance.amount)
		total += rules.get(balance.account)?.kind === "liability" ? -amount : amount
	}
	return total
}
