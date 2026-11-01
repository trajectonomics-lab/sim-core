import type { AccountId, BasisPoints } from "../types"
import { amountAt } from "./amount"
import type { DatedEvent } from "./events"

export interface DayFlows {
	readonly income: bigint
	readonly expense: bigint
	readonly contributions: ReadonlyMap<AccountId, bigint>
}

export function aggregate(events: readonly DatedEvent[], inflation: BasisPoints): DayFlows {
	let income = 0n
	let expense = 0n
	const contributions = new Map<AccountId, bigint>()
	for (const event of events) {
		const amount = amountAt(event, inflation)
		const flow = event.flow
		if (flow.kind === "income") income += amount
		else if (flow.kind === "expense") expense += amount
		else {
			const previous = contributions.get(flow.target) ?? 0n
			contributions.set(flow.target, previous + amount)
		}
	}
	return { income, expense, contributions }
}
