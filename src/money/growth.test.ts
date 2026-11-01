import { describe, expect, it } from "bun:test"
import { addMonthsClamped } from "../calendar/arith"
import { countedDays } from "../calendar/counted"
import { deflate, grow } from "./growth"

function oracleRoot(value: bigint, degree: number): bigint {
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

const oracleFactors = new Map<number, bigint>()

function oracleFactor(rate: number): bigint {
	const cached = oracleFactors.get(rate)
	if (cached !== undefined) return cached
	const scaled = (10000n + BigInt(rate)) * 10n ** 10950n
	const factor = oracleRoot(scaled / 10000n, 365)
	oracleFactors.set(rate, factor)
	return factor
}

function oracleRound(numerator: bigint, denominator: bigint): bigint {
	return (numerator * 2n + denominator) / (denominator * 2n)
}

function oracleGrow(amount: bigint, rate: number, days: number): bigint {
	const years = Math.floor(days / 365)
	const rest = days - years * 365
	const factor = oracleFactor(rate)
	const numerator = amount * (10000n + BigInt(rate)) ** BigInt(years) * factor ** BigInt(rest)
	const denominator = 10000n ** BigInt(years) * (10n ** 30n) ** BigInt(rest)
	return oracleRound(numerator, denominator)
}

describe("grow", () => {
	it("hits the half-up tie: 1 at 5000 bps for one year becomes 2", () => {
		expect(grow(1n, 5000, 365)).toBe(2n)
		expect(grow(10n, 5000, 365)).toBe(15n)
	})

	it("grows a 10-satang balance rather than freezing it", () => {
		expect(grow(10n, 400, 365)).toBe(10n)
		expect(grow(10n, 400, 730)).toBe(11n)
	})

	it("matches an exact one-year rational for a span containing Feb 29", () => {
		const start = "2024-01-01"
		const end = addMonthsClamped(start, 12)
		expect(countedDays(start, end)).toBe(365)
		expect(grow(1000n, 500, 365)).toBe(1050n)
		expect(grow(1000n, 500, countedDays(start, end))).toBe(1050n)
		expect(grow(1000n, 500, countedDays("2024-02-29", "2025-02-28"))).toBe(1050n)
	})

	it("keeps whole years exact and rounds once from the original", () => {
		expect(grow(100n, 250, 730)).toBe(105n)
		expect(grow(100n, 250, 365)).toBe(103n)
		expect(grow(100n, -1000, 365)).toBe(90n)
	})

	it("matches an independent rational oracle", () => {
		const rates = [-500, 0, 400, 2500, 5000]
		const days = [0, 1, 30, 364, 365, 366, 730, 1095, 3650]
		for (const rate of rates) {
			for (const count of days)
				expect(grow(123_456n, rate, count)).toBe(oracleGrow(123_456n, rate, count))
		}
	})
})

describe("deflate", () => {
	it("round-trips a grown nominal value", () => {
		expect(deflate(grow(1000n, 250, 365), 250, 365)).toBe(1000n)
	})

	it("uses today's money for positive, zero and negative inflation", () => {
		expect(deflate(1000n, 200, 365)).toBe(980n)
		expect(deflate(1000n, 0, 365)).toBe(1000n)
		expect(deflate(1000n, -200, 365)).toBe(1020n)
	})
})
