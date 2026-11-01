import type { BasisPoints } from "../types"
import { nthRootFloor } from "./root"

export const RATE_SCALE: bigint = 10000n
export const FACTOR_SCALE: number = 30
export const FACTOR_BASE: bigint = 10n ** BigInt(FACTOR_SCALE)
export const DAYS_PER_YEAR: number = 365

const cache: Map<BasisPoints, bigint> = new Map()

/**
 * Largest integer `f` with `10000 * f^365 <= (10000 + rate) * 10^(30*365)`.
 * The result is cached per rate; the cache is deterministic and purely additive.
 */
export function dailyFactor(rate: BasisPoints): bigint {
	if (!Number.isSafeInteger(rate) || rate <= -10000) {
		throw new RangeError(`Rate must be a safe integer above -10000 bps: ${rate}`)
	}
	const cached = cache.get(rate)
	if (cached !== undefined) return cached
	const numerator = (RATE_SCALE + BigInt(rate)) * FACTOR_BASE ** BigInt(DAYS_PER_YEAR)
	const factor = nthRootFloor(numerator / RATE_SCALE, DAYS_PER_YEAR)
	cache.set(rate, factor)
	return factor
}
