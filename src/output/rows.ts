import type { EngineSnapshot } from "../engine/snapshot"
import type { BasisPoints, Timeline } from "../types"
import type { AccountAmount, ProjectionProblem, ProjectionRow } from "../types/projection"
import { realValues } from "./real"
import type { RuleMap } from "./rules"

export interface RowsOutcome {
	readonly rows: readonly ProjectionRow[] | undefined
	readonly problem: ProjectionProblem | undefined
}

function nominalAmounts(snapshot: EngineSnapshot): readonly AccountAmount[] {
	return snapshot.balances.map((balance) => ({
		account: balance.account,
		amount: Number(balance.amount),
	}))
}

export function buildRows(
	snapshots: readonly EngineSnapshot[],
	timeline: Timeline,
	rules: RuleMap,
	inflation: BasisPoints,
): RowsOutcome {
	const rows: ProjectionRow[] = []
	for (const snapshot of snapshots) {
		const real = realValues(snapshot, rules, timeline.start, inflation)
		if (real.problem !== undefined) return { rows: undefined, problem: real.problem }
		const values = real.values!
		rows.push({
			date: snapshot.date,
			balances: nominalAmounts(snapshot),
			netWorth: Number(snapshot.netWorth),
			accessibleNetWorth: Number(snapshot.accessibleNetWorth),
			realBalances: values.balances,
			realNetWorth: Number(values.netWorth),
			realAccessibleNetWorth: Number(values.accessibleNetWorth),
		})
	}
	return { rows, problem: undefined }
}
