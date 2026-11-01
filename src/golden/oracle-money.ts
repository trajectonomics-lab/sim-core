import type { BasisPoints } from "../types"

const RATE_SCALE = 10000n
const FACTOR_BASE = 10n ** 30n
const factors = new Map<BasisPoints, bigint>()

function rootFloor(value: bigint, degree: number): bigint {
	const n = BigInt(degree)
	let x = 1n << BigInt(Math.ceil(value.toString(2).length / degree) + 1)
	while (true) {
		const next = ((n - 1n) * x + value / x ** (n - 1n)) / n
		if (next >= x) break
		x = next
	}
	while (x ** n > value) x--
	while ((x + 1n) ** n <= value) x++
	return x
}

function factor(rate: BasisPoints): bigint {
	const cached = factors.get(rate)
	if (cached !== undefined) return cached
	const scaled = (RATE_SCALE + BigInt(rate)) * FACTOR_BASE ** 365n
	const value = rootFloor(scaled / RATE_SCALE, 365)
	factors.set(rate, value)
	return value
}

function round(numerator: bigint, denominator: bigint): bigint {
	return (numerator * 2n + denominator) / (denominator * 2n)
}

export function oracleGrow(amount: bigint, rate: BasisPoints, days: number): bigint {
	const years = Math.floor(days / 365)
	const rest = days - years * 365
	const numerator =
		amount * (RATE_SCALE + BigInt(rate)) ** BigInt(years) * factor(rate) ** BigInt(rest)
	const denominator = RATE_SCALE ** BigInt(years) * FACTOR_BASE ** BigInt(rest)
	return round(numerator, denominator)
}

export function oracleDeflate(amount: bigint, inflation: BasisPoints, days: number): bigint {
	const years = Math.floor(days / 365)
	const rest = days - years * 365
	const numerator = amount * RATE_SCALE ** BigInt(years) * FACTOR_BASE ** BigInt(rest)
	const denominator =
		(RATE_SCALE + BigInt(inflation)) ** BigInt(years) * factor(inflation) ** BigInt(rest)
	return round(numerator, denominator)
}
