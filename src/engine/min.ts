export function minBigInt(left: bigint, right: bigint): bigint {
	if (left < right) return left
	return right
}
