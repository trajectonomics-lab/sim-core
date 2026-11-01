import type { Check, Emit, Path } from "./codes"

export interface Field {
	readonly required: boolean
	readonly check: Check
}
export type Shape = Readonly<Record<string, Field>>

export const req = (check: Check): Field => ({ required: true, check })
export const opt = (check: Check): Field => ({ required: false, check })

export function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
	return typeof value === "object" && value !== null && !Array.isArray(value)
}

function checkField(
	value: Readonly<Record<string, unknown>>,
	path: Path,
	key: string,
	field: Field,
	emit: Emit,
): void {
	if (Object.hasOwn(value, key)) field.check(value[key], [...path, key], emit)
	else if (field.required) emit("MISSING_KEY", [...path, key])
}

/** Validates an object against `shape`: not-an-object, unknown keys, missing keys, field checks. */
export function checkShape(
	value: unknown,
	path: Path,
	shape: Shape,
	emit: Emit,
): Readonly<Record<string, unknown>> | undefined {
	if (!isRecord(value)) {
		emit("NOT_AN_OBJECT", path)
		return undefined
	}
	for (const key of Object.keys(value)) {
		if (!Object.hasOwn(shape, key)) emit("UNKNOWN_KEY", [...path, key])
	}
	for (const [key, field] of Object.entries(shape)) checkField(value, path, key, field, emit)
	return value
}

/** Builds a check that validates every element of an array with `item`. */
export function list(item: Check): Check {
	return (value, path, emit) => {
		if (!Array.isArray(value)) return emit("NOT_AN_ARRAY", path)
		value.forEach((element: unknown, index) => {
			item(element, [...path, index], emit)
		})
	}
}

/** Emits `DUPLICATE_ID` at the second and later occurrences of a string `key` in `items`. */
export function checkUnique(items: unknown, path: Path, key: string, emit: Emit): void {
	if (!Array.isArray(items)) return
	const seen = new Set<unknown>()
	items.forEach((item: unknown, index) => {
		if (!isRecord(item) || typeof item[key] !== "string") return
		if (seen.has(item[key])) emit("DUPLICATE_ID", [...path, index, key])
		seen.add(item[key])
	})
}
