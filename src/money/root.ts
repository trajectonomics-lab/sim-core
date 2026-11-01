import { powBigInt } from "./pow"

/** Largest integer `r` with `r ** degree <= value` (`value >= 0`, `degree >= 1`). */
export function nthRootFloor(value: bigint, degree: number): bigint {
	if (value < 0n || !Number.isSafeInteger(degree) || degree < 1) {
		throw new RangeError("nthRootFloor expects a non-negative value and positive degree")
	}
	if (value < 2n) return value
	let high = 1n
	while (powBigInt(high, degree) <= value) high *= 2n
	let low = high / 2n
	while (low + 1n < high) {
		const middle = (low + high) / 2n
		if (powBigInt(middle, degree) <= value) low = middle
		else high = middle
	}
	return low
}
