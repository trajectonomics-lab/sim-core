/** Integer exponentiation by squaring; `exponent` is a non-negative safe integer. */
export function powBigInt(base: bigint, exponent: number): bigint {
	if (!Number.isSafeInteger(exponent) || exponent < 0) {
		throw new RangeError("powBigInt expects a non-negative safe integer exponent")
	}
	let result = 1n
	let factor = base
	let remaining = exponent
	while (remaining > 0) {
		if (remaining % 2 === 1) result *= factor
		factor *= factor
		remaining = Math.floor(remaining / 2)
	}
	return result
}
