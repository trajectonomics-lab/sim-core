import type { AccountId, DateString } from "../types"
import type { ProjectionProblem } from "../types/projection"
import { minBigInt } from "./min"
import { mutate } from "./mutate"
import { compareIds } from "./order"
import type { StateMap } from "./state"
import { valuation } from "./value"

export interface ContributionResult {
	readonly outflow: bigint
	readonly problem: ProjectionProblem | undefined
}

function applyTarget(
	states: StateMap,
	target: AccountId,
	total: bigint,
	date: DateString,
): ContributionResult {
	const state = states.get(target)
	if (total === 0n || state === undefined) return { outflow: 0n, problem: undefined }
	const liability = state.rule.kind === "liability"
	const owed = liability ? valuation(state, date) : total
	const payment = minBigInt(total, owed)
	const problem = mutate(state, date, liability ? -payment : payment)
	return problem === undefined ? { outflow: payment, problem: undefined } : { outflow: 0n, problem }
}

/** Applies same-date contributions per target, capping liability payments at the amount owed. */
export function applyContributions(
	states: StateMap,
	contributions: ReadonlyMap<AccountId, bigint>,
	date: DateString,
): ContributionResult {
	let outflow = 0n
	for (const target of [...contributions.keys()].sort(compareIds)) {
		const result = applyTarget(states, target, contributions.get(target) ?? 0n, date)
		if (result.problem !== undefined) return { outflow, problem: result.problem }
		outflow += result.outflow
	}
	return { outflow, problem: undefined }
}
