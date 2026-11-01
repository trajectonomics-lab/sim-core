import type { AccountId, DateString } from "../types"
import type { ProjectionProblem } from "../types/projection"

export const MAX_SAFE: bigint = BigInt(Number.MAX_SAFE_INTEGER)

export function isSafeInteger(value: bigint): boolean {
	return value >= -MAX_SAFE && value <= MAX_SAFE
}

export function overflow(date: DateString, account?: AccountId): ProjectionProblem {
	return account === undefined
		? { code: "VALUE_OVERFLOW", date }
		: { code: "VALUE_OVERFLOW", date, account }
}
