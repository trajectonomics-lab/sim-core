import type { AccountId, DateString, Frequency, Growth, MinorUnits } from "./common"

interface FlowBase {
	readonly id: string
	readonly amount: MinorUnits
	readonly frequency: Frequency
	readonly start: DateString
	/** Omitted means the flow runs to `Timeline.horizon`. A `once` flow omits it or equals `start`. */
	readonly end?: DateString
	readonly growth: Growth
}

export interface IncomeFlow extends FlowBase {
	readonly kind: "income"
	/** Earned (true) versus passive (false) income. */
	readonly earned: boolean
}

export interface ExpenseFlow extends FlowBase {
	readonly kind: "expense"
}

/** Cash moves into `target`; a liability target is a debt payment, capped at the amount owed. */
export interface ContributionFlow extends FlowBase {
	readonly kind: "contribution"
	readonly target: AccountId
}

export type Flow = IncomeFlow | ExpenseFlow | ContributionFlow
