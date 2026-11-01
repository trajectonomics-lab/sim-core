import { describe, expect, it } from "bun:test"
import { check } from "../check"
import { freelancer } from "../fixtures/freelancer"
import { thaiEmployee } from "../fixtures/thai-employee"
import { ERROR_CODES } from "./codes"

const fixtures = { "Thai salaried employee": thaiEmployee, freelancer }

describe("check() on realistic fixtures", () => {
	for (const [name, { baseline, scenario, timeline }] of Object.entries(fixtures)) {
		it(`${name} has zero problems`, () => {
			expect(check(baseline, scenario, timeline)).toEqual([])
		})

		it(`${name} survives a JSON round-trip`, () => {
			const trip = (x: unknown): unknown => JSON.parse(JSON.stringify(x))
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

	it("exports a closed set of unique error codes", () => {
		expect(new Set(ERROR_CODES).size).toBe(ERROR_CODES.length)
	})
})
