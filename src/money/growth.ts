import type { BasisPoints } from "../types"
import { DAYS_PER_YEAR, dailyFactor, FACTOR_BASE, RATE_SCALE } from "./factor"
import { powBigInt } from "./pow"
import { roundHalfUp } from "./round"

interface FactorParts {
	readonly numerator: bigint
	readonly denominator: bigint
}

function splitDays(days: number): readonly [years: number, remainder: number] {
	if (!Number.isSafeInteger(days) || days < 0) {
		throw new RangeError("Growth expects a non-negative safe integer day count")
	}
	const years = Math.floor(days / DAYS_PER_YEAR)
	return [years, days - years * DAYS_PER_YEAR]
}

/** `(10000 + rate)^years * f^remainder / (10000^years * 10^(30*remainder))`. */
function factorParts(rate: BasisPoints, days: number): FactorParts {
	const [years, remainder] = splitDays(days)
	const factor = dailyFactor(rate)
	return {
		numerator: powBigInt(RATE_SCALE + BigInt(rate), years) * powBigInt(factor, remainder),
		denominator: powBigInt(RATE_SCALE, years) * powBigInt(FACTOR_BASE, remainder),
	}
}

/** Grows `amount` over `days` counted days with one half-up rounding at the end. */
export function grow(amount: bigint, rate: BasisPoints, days: number): bigint {
	const parts = factorParts(rate, days)
	return roundHalfUp(amount * parts.numerator, parts.denominator)
}

/** Today's-money value of `amount` at `inflation`, over `days` counted days. */
export function deflate(amount: bigint, inflation: BasisPoints, days: number): bigint {
	const parts = factorParts(inflation, days)
	return roundHalfUp(amount * parts.denominator, parts.numerator)
}
