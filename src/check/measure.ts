import { MEASURE_OPS, ROUNDINGS, TALLY_BASES } from "../vocab"
import type { Check } from "./codes"
import { boundedInt, date, growth, oneOf, safeInt, str } from "./scalars"
import { checkShape, isRecord, opt, req, type Shape } from "./shape"

const denominator: Check = boundedInt(1, Infinity, "INVALID_DENOMINATOR")

const operands = { a: req(str), b: req(str) }

/** Keys beyond `id` and `op` that each op takes. */
const OP_SHAPES: Readonly<Record<string, Shape>> = {
	const: { value: req(safeInt), asOf: opt(date), growth: opt(growth) },
	tally: { label: req(str), basis: req(oneOf(TALLY_BASES, "INVALID_BASIS")) },
	add: operands,
	sub: operands,
	min: operands,
	max: operands,
	scale: {
		of: req(str),
		num: req(safeInt),
		den: req(denominator),
		rounding: req(oneOf(ROUNDINGS, "INVALID_ROUNDING")),
	},
	pick: {
		...operands,
		// biome-ignore lint/suspicious/noThenProperty: `then` is a Measure operand key, not a thenable
		then: req(str),
		else: req(str),
	},
}

/** Every op's keys, all optional: an unknown op reports only `INVALID_OP`, not its other keys. */
const ANY_OP: Shape = Object.fromEntries(
	Object.values(OP_SHAPES).flatMap((shape) =>
		Object.entries(shape).map(([key, field]) => [key, opt(field.check)] as const),
	),
)

const common: Shape = { id: req(str), op: req(oneOf(MEASURE_OPS, "INVALID_OP")) }

export const measure: Check = (value, path, emit) => {
	const op = isRecord(value) ? value["op"] : undefined
	const own = typeof op === "string" && Object.hasOwn(OP_SHAPES, op) ? OP_SHAPES[op] : ANY_OP
	const found = checkShape(value, path, { ...common, ...own }, emit)
	if (found && op === "const" && Object.hasOwn(found, "growth") && !Object.hasOwn(found, "asOf")) {
		emit("MISSING_KEY", [...path, "asOf"])
	}
}
