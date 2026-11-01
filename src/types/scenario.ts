import type { Account } from "./account"
import type { Cashflow } from "./cashflow"
import type { BasisPoints } from "./common"
import type { Flow } from "./flow"

export interface Economy {
	readonly inflation: BasisPoints
}

export interface Scenario {
	readonly schemaVersion: 1
	readonly currency: string
	readonly economy: Economy
	readonly accounts: readonly Account[]
	readonly flows: readonly Flow[]
	readonly cashflow: Cashflow
}
