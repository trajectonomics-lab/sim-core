import { describe, expect, it } from "bun:test"
import { contribution, expense, income } from "../engine/test-flows"
import { amounts, makeFixture, rowAt, run } from "../engine/test-helpers"
import type { Fixture } from "../fixtures/fixture"
import type { Account } from "../types"
import type { Projection } from "../types/projection"
import { oracleView } from "./oracle-view"

function expectOracleMatch(fixture: Fixture, projection: Projection): void {
	const view = oracleView(
		fixture,
		projection.rows.map((row) => row.date),
	)
	expect(projection.rows).toEqual(view.rows)
	expect(projection.runsOut).toEqual(view.runsOut)
	expect(projection.annual).toEqual(view.annual)
}

const cash: Account = { id: "cash", kind: "asset", rate: 0 }

describe("shortfall and payoff golden cases", () => {
	it("books the unmet amount without inventing interest", () => {
		const setup = {
			accounts: [cash, { id: "vault", kind: "asset", rate: 0, lockedUntil: "2027-01-01" }],
			balances: { cash: 50, vault: 1000 },
			flows: [expense("bill", 500), contribution("save", "vault", 100)],
			surplus: [{ account: "cash" }],
			withdraw: ["cash", "vault"],
		} as const satisfies Parameters<typeof makeFixture>[0]
		const projection = run(setup)
		expect(projection.runsOut).toEqual({ date: "2026-01-01", unmet: 550 })
		expect(projection.annual).toEqual([
			{
				index: 0,
				from: "2026-01-01",
				to: "2026-01-01",
				openingNetWorth: 1050,
				closingNetWorth: 1100,
				income: 0,
				expense: 500,
				contributions: 100,
				interest: 0,
				unmet: 550,
				partial: true,
			},
		])
		expectOracleMatch(makeFixture(setup), projection)
	})

	it("pays a liability off mid-schedule and routes the excess to surplus", () => {
		const setup = {
			accounts: [cash, { id: "loan", kind: "liability", rate: 0 }],
			balances: { cash: 0, loan: 250 },
			flows: [
				income("pay", 1000, { frequency: "monthly" }),
				contribution("repay", "loan", 100, { frequency: "monthly" }),
			],
			surplus: [{ account: "cash" }],
			horizon: "2026-04-01",
			resolution: "month",
		} as const satisfies Parameters<typeof makeFixture>[0]
		const projection = run(setup)
		expect(amounts(rowAt(projection, "2026-04-01"))).toEqual({ cash: 3750, loan: 0 })
		expect(projection.annual[0]).toMatchObject({ contributions: 250, interest: 0 })
		expectOracleMatch(makeFixture(setup), projection)
	})

	it("projects through the last supported year without throwing", () => {
		for (const resolution of ["day", "month"] as const) {
			const projection = run({
				accounts: [{ id: "cash", kind: "asset", rate: 500 }],
				balances: { cash: 1000 },
				flows: [
					income("pay", 10, { frequency: "annual", start: "9998-01-01" }),
					income("tick", 1, { frequency: "weekly", start: "9998-01-01" }),
				],
				surplus: [{ account: "cash" }],
				start: "9998-01-01",
				horizon: "9998-12-31",
				resolution,
			})
			expect(projection.rows.at(-1)?.date).toBe("9998-12-31")
		}
	})
})
