import type { ErrorCode, Path } from "../check/codes"
import type { AccountId, DateString, MinorUnits } from "./common"

export interface AccountAmount {
	readonly account: AccountId
	readonly amount: MinorUnits
}

export interface ProjectionRow {
	readonly date: DateString
	readonly balances: readonly AccountAmount[]
	readonly netWorth: MinorUnits
	readonly accessibleNetWorth: MinorUnits
}

export interface RunsOut {
	readonly date: DateString
	readonly unmet: MinorUnits
}

export interface Projection {
	readonly rows: readonly ProjectionRow[]
	readonly runsOut?: RunsOut
}

export interface InputProblem {
	readonly code: ErrorCode
	readonly path: Path
}

export interface ValueOverflowProblem {
	readonly code: "VALUE_OVERFLOW"
	readonly date: DateString
	readonly account?: AccountId
}

export type ProjectionProblem = InputProblem | ValueOverflowProblem

export type ProjectionResult =
	| { readonly ok: true; readonly projection: Projection }
	| { readonly ok: false; readonly problems: readonly ProjectionProblem[] }
