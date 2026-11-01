import { describe, expect, it } from "bun:test"
import { thaiEmployee } from "../fixtures/thai-employee"
import { expected, problemsFor, REMOVE } from "../testing"

function emptyIdFlows(): unknown[] {
	return thaiEmployee.scenario.flows.map((flow, i) => (i < 2 ? { ...flow, id: "" } : flow))
}

describe("check() ids and references", () => {
	it("rejects duplicate account ids", () => {
		const duplicate = { id: "cash", kind: "asset", rate: 0 }
		expect(problemsFor({ scenario: [["accounts", 4], duplicate] })).toEqual(
			expected("DUPLICATE_ID", ["scenario", "accounts", 4, "id"]),
		)
	})

	it("rejects duplicate flow ids", () => {
		expect(problemsFor({ scenario: [["flows", 2, "id"], "salary"] })).toEqual(
			expected("DUPLICATE_ID", ["scenario", "flows", 2, "id"]),
		)
	})

	it("rejects a duplicate baseline balance account", () => {
		expect(problemsFor({ baseline: [["balances", 1, "account"], "cash"] })).toEqual(
			expected("DUPLICATE_ID", ["baseline", "balances", 1, "account"]),
		)
	})

	it("rejects a repeated account in withdraw", () => {
		expect(problemsFor({ scenario: [["cashflow", "withdraw", 3], "cash"] })).toEqual(
			expected("DUPLICATE_ID", ["scenario", "cashflow", "withdraw", 3]),
		)
	})

	it("rejects a repeated account in surplus", () => {
		const step = { account: "cash" }
		expect(problemsFor({ scenario: [["cashflow", "surplus", 2], step] })).toEqual(
			expected("DUPLICATE_ID", ["scenario", "cashflow", "surplus", 2, "account"]),
		)
	})

	it("reports only EMPTY_STRING for two empty flow ids, not DUPLICATE_ID", () => {
		expect(problemsFor({ scenario: [["flows"], emptyIdFlows()] })).toEqual([
			{ code: "EMPTY_STRING", path: ["scenario", "flows", 0, "id"] },
			{ code: "EMPTY_STRING", path: ["scenario", "flows", 1, "id"] },
		])
	})

	it("rejects a baseline balance whose account is not declared", () => {
		const problems = problemsFor({ baseline: [["balances", 0, "account"], "ghost"] })
		expect(problems).toEqual(
			expected("UNDECLARED_BALANCE_ACCOUNT", ["baseline", "balances", 0, "account"]),
		)
	})

	it("allows a declared account with no balance", () => {
		const brokerage = { id: "brokerage", kind: "asset", rate: 600 }
		expect(problemsFor({ scenario: [["accounts", 4], brokerage] })).toEqual([])
	})

	it("rejects a contribution target that is not declared", () => {
		expect(problemsFor({ scenario: [["flows", 3, "target"], "ghost"] })).toEqual(
			expected("UNKNOWN_ACCOUNT", ["scenario", "flows", 3, "target"]),
		)
	})

	it("rejects an undeclared surplus account", () => {
		expect(problemsFor({ scenario: [["cashflow", "surplus", 1, "account"], "ghost"] })).toEqual(
			expected("UNKNOWN_ACCOUNT", ["scenario", "cashflow", "surplus", 1, "account"]),
		)
	})

	it("rejects an undeclared withdraw account", () => {
		expect(problemsFor({ scenario: [["cashflow", "withdraw", 0], "ghost"] })).toEqual(
			expected("UNKNOWN_ACCOUNT", ["scenario", "cashflow", "withdraw", 0]),
		)
	})

	it("rejects a liability as a surplus target", () => {
		expect(problemsFor({ scenario: [["cashflow", "surplus", 1, "account"], "mortgage"] })).toEqual(
			expected("LIABILITY_MISUSE", ["scenario", "cashflow", "surplus", 1, "account"]),
		)
	})

	it("rejects a liability as a withdrawal source", () => {
		expect(problemsFor({ scenario: [["cashflow", "withdraw", 2], "mortgage"] })).toEqual(
			expected("LIABILITY_MISUSE", ["scenario", "cashflow", "withdraw", 2]),
		)
	})

	it("rejects a locked liability", () => {
		const edits = { scenario: [["accounts", 3, "lockedUntil"], "2040-01-01"] } as const
		expect(problemsFor(edits)).toEqual(
			expected("LIABILITY_MISUSE", ["scenario", "accounts", 3, "lockedUntil"]),
		)
	})

	it("requires a target on contribution flows", () => {
		expect(problemsFor({ scenario: [["flows", 3, "target"], REMOVE] })).toEqual(
			expected("MISSING_KEY", ["scenario", "flows", 3, "target"]),
		)
	})

	it("requires the earned flag on income flows", () => {
		expect(problemsFor({ scenario: [["flows", 0, "earned"], REMOVE] })).toEqual(
			expected("MISSING_KEY", ["scenario", "flows", 0, "earned"]),
		)
	})

	it("rejects earned on a non-income flow", () => {
		expect(problemsFor({ scenario: [["flows", 2, "earned"], true] })).toEqual(
			expected("UNKNOWN_KEY", ["scenario", "flows", 2, "earned"]),
		)
	})

	it("rejects target on a non-contribution flow", () => {
		expect(problemsFor({ scenario: [["flows", 0, "target"], "cash"] })).toEqual(
			expected("UNKNOWN_KEY", ["scenario", "flows", 0, "target"]),
		)
	})
})
