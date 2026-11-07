import { isSafeInteger } from "../engine/overflow"
import type { Levy, LevyContext, MeasuresResult, Tallies } from "../types"
import { dependencyOrder } from "./order"
import { step } from "./step"

/**
 * Evaluates every Measure of a Levy in exact BigInt arithmetic. `levy` must have passed `check()`.
 * A Measure whose exact value is not a safe integer yields `VALUE_OVERFLOW` at `context.date`
 * instead of a value. The result map follows the Levy's own Measure order.
 */
export function evaluateMeasures(
	levy: Levy,
	tallies: Tallies,
	context: LevyContext,
): MeasuresResult {
	const exact = new Map<string, bigint>()
	const get = (id: string): bigint => {
		const value = exact.get(id)
		if (value === undefined) throw new RangeError(`Measure ${id} is not evaluated before use`)
		return value
	}
	for (const measure of dependencyOrder(levy.measures)) {
		const value = step(measure, get, tallies, context)
		if (!isSafeInteger(value)) {
			return { ok: false, problem: { code: "VALUE_OVERFLOW", date: context.date } }
		}
		exact.set(measure.id, value)
	}
	const values = new Map<string, number>()
	for (const measure of levy.measures) values.set(measure.id, Number(get(measure.id)))
	return { ok: true, values, due: Number(get(levy.due)) }
}
