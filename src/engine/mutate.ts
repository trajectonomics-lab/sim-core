import type { DateString } from "../types"
import type { ProjectionProblem } from "../types/projection"
import { isSafeInteger, overflow } from "./overflow"
import type { AccountState } from "./state"
import { valuation } from "./value"

/** Commits accrued growth, then applies `delta`; returns a problem on overflow. */
export function mutate(
	state: AccountState,
	date: DateString,
	delta: bigint,
): ProjectionProblem | undefined {
	const committed = valuation(state, date)
	if (!isSafeInteger(committed)) return overflow(date, state.rule.id)
	const next = committed + delta
	if (next < 0n) throw new RangeError(`Negative balance on ${state.rule.id} at ${date}`)
	if (!isSafeInteger(next)) return overflow(date, state.rule.id)
	state.balance = next
	state.asOf = date
	return undefined
}
