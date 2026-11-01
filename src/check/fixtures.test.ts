import { describe, expect, it } from "bun:test"
import { check } from "../check"
import { freelancer } from "../fixtures/freelancer"
import { thaiEmployee } from "../fixtures/thai-employee"

const fixtures = { "Thai salaried employee": thaiEmployee, freelancer }
const trip = (x: unknown): unknown => JSON.parse(JSON.stringify(x))

describe("check() on realistic fixtures", () => {
	for (const [name, { baseline, scenario, timeline }] of Object.entries(fixtures)) {
		it(`${name} has zero problems`, () => {
			expect(check(baseline, scenario, timeline)).toEqual([])
		})

		it(`${name} round-trips through JSON with nothing lost and zero problems`, () => {
			expect(trip(baseline)).toStrictEqual(baseline)
			expect(trip(scenario)).toStrictEqual(scenario)
			expect(trip(timeline)).toStrictEqual(timeline)
			expect(check(baseline, scenario, timeline)).toEqual([])
			expect(check(trip(baseline), trip(scenario), trip(timeline))).toEqual([])
		})
	}

	it("thai employee has a liability, a locked account and an emergency fund first in withdraw", () => {
		const { accounts, cashflow } = thaiEmployee.scenario
		expect(accounts.some((a) => a.kind === "liability")).toBe(true)
		expect(accounts.some((a) => a.kind === "asset" && a.lockedUntil !== undefined)).toBe(true)
		expect(cashflow.withdraw[0]).toBe("emergency-fund")
	})

	it("freelancer has a liability and a locked retirement account", () => {
		const { accounts } = freelancer.scenario
		expect(accounts.some((a) => a.kind === "liability")).toBe(true)
		expect(accounts.some((a) => a.kind === "asset" && a.lockedUntil !== undefined)).toBe(true)
	})
})
