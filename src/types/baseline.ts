import type { AccountId, MinorUnits } from "./common"

/** Opening balance at `Timeline.start`. A liability's amount is the positive amount owed. */
export interface Balance {
	readonly account: AccountId
	readonly amount: MinorUnits
}

export interface Baseline {
	readonly schemaVersion: 1
	readonly balances: readonly Balance[]
}
