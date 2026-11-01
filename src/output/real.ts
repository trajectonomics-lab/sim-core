import { countedDays } from "../calendar/counted"
import { isSafeInteger, overflow } from "../engine/overflow"
import type { EngineSnapshot } from "../engine/snapshot"
import { deflate } from "../money/growth"
import type { BasisPoints, DateString } from "../types"
import type { AccountAmount, ProjectionProblem } from "../types/projection"
import type { RuleMap } from "./rules"

export interface RealValues {
	readonly balances: readonly AccountAmount[]
	readonly netWorth: bigint
	readonly accessibleNetWorth: bigint
}

export interface RealOutcome {
	readonly values: RealValues | undefined
	readonly problem: ProjectionProblem | undefined
}

/** Deflates each account separately, then sums the signed real balances. */
export function realValues(
	snapshot: EngineSnapshot,
	rules: RuleMap,
	start: DateString,
	inflation: BasisPoints,
): RealOutcome {
	const days = countedDays(start, snapshot.date)
	const balances: AccountAmount[] = []
	let net = 0n
	let accessible = 0n
	for (const balance of snapshot.balances) {
		const amount = deflate(balance.amount, inflation, days)
		if (!isSafeInteger(amount))
			return { values: undefined, problem: overflow(snapshot.date, balance.account) }
		balances.push({ account: balance.account, amount: Number(amount) })
		const rule = rules.get(balance.account)
		const signed = rule?.kind === "liability" ? -amount : amount
		net += signed
		const unlocked =
			rule?.kind !== "asset" || rule.lockedUntil === undefined || snapshot.date >= rule.lockedUntil
		if (unlocked) accessible += signed
	}
	if (!isSafeInteger(net) || !isSafeInteger(accessible)) {
		return { values: undefined, problem: overflow(snapshot.date) }
	}
	return { values: { balances, netWorth: net, accessibleNetWorth: accessible }, problem: undefined }
}
