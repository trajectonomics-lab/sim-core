import type { AccountId, BasisPoints, DateString } from "./common"

/** Asset: `rate` is the expected return. Locked money does not count until `lockedUntil`. */
export interface AssetRule {
	readonly id: AccountId
	readonly kind: "asset"
	readonly rate: BasisPoints
	readonly lockedUntil?: DateString
}

/** Liability: `rate` is the interest on the outstanding balance. Cannot be locked. */
export interface LiabilityRule {
	readonly id: AccountId
	readonly kind: "liability"
	readonly rate: BasisPoints
}

export type Account = AssetRule | LiabilityRule
