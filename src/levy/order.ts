import type { Measure } from "../types"
import { operandsOf } from "./refs"

/**
 * Measures in dependency order: every Measure comes after the ones it reads. Needs a Levy that
 * `check()` accepted (unique ids, known operands, no cycle); for any other input the order is
 * still finite but a Measure may precede its operands.
 */
export function dependencyOrder(measures: readonly Measure[]): readonly Measure[] {
	const byId = new Map(measures.map((measure) => [measure.id, measure]))
	const seen = new Set<string>()
	const ordered: Measure[] = []
	const visit = (measure: Measure): void => {
		if (seen.has(measure.id)) return
		seen.add(measure.id)
		for (const operand of operandsOf(measure)) {
			const found = byId.get(operand)
			if (found !== undefined) visit(found)
		}
		ordered.push(measure)
	}
	for (const measure of measures) visit(measure)
	return ordered
}
