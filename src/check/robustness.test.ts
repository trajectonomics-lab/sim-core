import { describe, expect, it } from "bun:test"
import { check } from "../check"
import { thaiEmployee } from "../fixtures/thai-employee"
import { expected, problemsFor } from "../testing"
import { ERROR_CODES } from "./codes"

const { baseline, scenario, timeline } = thaiEmployee

/** Copy of `items` with a sparse-array hole inserted at index `at` (everything after shifts). */
function withHole(items: readonly unknown[], at: number): unknown[] {
	const out = new Array<unknown>(items.length + 1)
	items.forEach((item, i) => {
		out[i < at ? i : i + 1] = item
	})
	return out
}

describe("check() sparse arrays", () => {
	it("flags every hole in an all-hole flows array", () => {
		expect(problemsFor({ scenario: [["flows"], new Array(3)] })).toEqual([
			{ code: "NOT_AN_OBJECT", path: ["scenario", "flows", 0] },
			{ code: "NOT_AN_OBJECT", path: ["scenario", "flows", 1] },
			{ code: "NOT_AN_OBJECT", path: ["scenario", "flows", 2] },
		])
	})

	it("flags a hole in balances", () => {
		const balances = withHole(baseline.balances, 0)
		expect(problemsFor({ baseline: [["balances"], balances] })).toEqual(
			expected("NOT_AN_OBJECT", ["baseline", "balances", 0]),
		)
	})

	it("flags a hole in withdraw", () => {
		expect(problemsFor({ scenario: [["cashflow", "withdraw"], withHole(["cash"], 0)] })).toEqual(
			expected("WRONG_TYPE", ["scenario", "cashflow", "withdraw", 0]),
		)
	})

	it("flags a hole in surplus", () => {
		const surplus = withHole(scenario.cashflow.surplus, 1)
		expect(problemsFor({ scenario: [["cashflow", "surplus"], surplus] })).toEqual(
			expected("NOT_AN_OBJECT", ["scenario", "cashflow", "surplus", 1]),
		)
	})

	it("flags a hole in accounts without losing the other accounts", () => {
		const accounts = withHole(scenario.accounts, 0)
		expect(problemsFor({ scenario: [["accounts"], accounts] })).toEqual(
			expected("NOT_AN_OBJECT", ["scenario", "accounts", 0]),
		)
	})

	it("still detects a duplicate id that follows a hole", () => {
		const flow = scenario.flows[0]
		const flows = withHole([flow, flow], 0)
		expect(problemsFor({ scenario: [["flows"], flows] })).toEqual([
			{ code: "NOT_AN_OBJECT", path: ["scenario", "flows", 0] },
			{ code: "DUPLICATE_ID", path: ["scenario", "flows", 2, "id"] },
		])
	})
})

describe("check() when accounts is not an array", () => {
	it("reports exactly one NOT_AN_ARRAY and skips account-reference checks", () => {
		expect(problemsFor({ scenario: [["accounts"], {}] })).toEqual(
			expected("NOT_AN_ARRAY", ["scenario", "accounts"]),
		)
	})
})

describe("check() never throws", () => {
	const boom = (): never => {
		throw new Error("boom")
	}

	it("reports one NOT_AN_OBJECT for a scenario with a throwing getter", () => {
		const hostile = { ...scenario }
		Object.defineProperty(hostile, "currency", { enumerable: true, get: boom })
		expect(check(baseline, hostile, timeline)).toEqual(expected("NOT_AN_OBJECT", ["scenario"]))
	})

	it("reports one NOT_AN_OBJECT for a nested throwing getter", () => {
		const hostile = { ...baseline, balances: [{ account: "cash" }] }
		Object.defineProperty(hostile.balances[0], "amount", { enumerable: true, get: boom })
		expect(check(hostile, scenario, timeline)).toEqual(expected("NOT_AN_OBJECT", ["baseline"]))
	})

	it("reports one NOT_AN_OBJECT for a throwing accounts getter", () => {
		const hostile = { ...scenario }
		Object.defineProperty(hostile, "accounts", { enumerable: true, get: boom })
		expect(check(baseline, hostile, timeline)).toEqual(expected("NOT_AN_OBJECT", ["scenario"]))
	})

	it.each(["baseline", "scenario", "timeline"] as const)(
		"handles a revoked Proxy as %s",
		(root) => {
			const { proxy, revoke } = Proxy.revocable({}, {})
			revoke()
			const inputs = { baseline, scenario, timeline, [root]: proxy }
			expect(check(inputs.baseline, inputs.scenario, inputs.timeline)).toEqual(
				expected("NOT_AN_OBJECT", [root]),
			)
		},
	)
})

describe("ERROR_CODES", () => {
	it("is a closed set of unique codes", () => {
		expect(new Set(ERROR_CODES).size).toBe(ERROR_CODES.length)
	})

	it("is frozen at runtime", () => {
		expect(Object.isFrozen(ERROR_CODES)).toBe(true)
		expect(() => (ERROR_CODES as unknown as string[]).push("X")).toThrow()
	})
})
