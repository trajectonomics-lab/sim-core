import { describe, expect, it } from "bun:test"
import { dailyFactor, FACTOR_BASE, RATE_SCALE } from "./factor"

function bound(rate: number): bigint {
	return (RATE_SCALE + BigInt(rate)) * FACTOR_BASE ** 365n
}

describe("dailyFactor", () => {
	it.each([-9999, -1000, -1, 0, 400, 5000, 100_000, Number.MAX_SAFE_INTEGER])(
		"is the largest integer root at %d bps",
		(rate) => {
			const factor = dailyFactor(rate)
			const limit = bound(rate)
			expect(RATE_SCALE * factor ** 365n <= limit).toBe(true)
			expect(RATE_SCALE * (factor + 1n) ** 365n > limit).toBe(true)
		},
	)

	it("is exactly 10^30 at 0 bps", () => {
		expect(dailyFactor(0)).toBe(FACTOR_BASE)
	})

	it("moves in the rate's direction", () => {
		expect(dailyFactor(-1000)).toBeLessThan(FACTOR_BASE)
		expect(dailyFactor(400)).toBeGreaterThan(FACTOR_BASE)
		expect(dailyFactor(5000)).toBeGreaterThan(dailyFactor(400))
	})

	it("rejects rates at or below -10000 bps and non-integers", () => {
		expect(() => dailyFactor(-10000)).toThrow(RangeError)
		expect(() => dailyFactor(1.5)).toThrow(RangeError)
	})
})
