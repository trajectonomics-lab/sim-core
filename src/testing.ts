import { check } from "./check"
import type { ErrorCode, Path, Problem } from "./check/codes"
import { thaiEmployee } from "./fixtures/thai-employee"

/** Sentinel for `edit`: delete the key at the path. */
export const REMOVE: unique symbol = Symbol("remove")

export type Edit = readonly [path: Path, value: unknown]
export interface Edits {
	readonly baseline?: Edit
	readonly scenario?: Edit
	readonly timeline?: Edit
}

type Node = Record<string | number, unknown>

/** Returns a deep JSON clone of `root` with the value at `path` replaced (or removed). */
export function edit(root: unknown, [path, value]: Edit): unknown {
	const clone: unknown = JSON.parse(JSON.stringify(root))
	if (path.length === 0) return value
	const parent = path.slice(0, -1).reduce<unknown>((node, key) => (node as Node)[key], clone)
	const last = path[path.length - 1] as string | number
	if (value === REMOVE) delete (parent as Node)[last]
	else (parent as Node)[last] = value
	return clone
}

/** Runs `check` on the Thai employee fixture with the given edits applied. */
export function problemsFor(edits: Edits): readonly Problem[] {
	const { baseline, scenario, timeline } = thaiEmployee
	const apply = (root: unknown, e: Edit | undefined): unknown => (e ? edit(root, e) : root)
	return check(
		apply(baseline, edits.baseline),
		apply(scenario, edits.scenario),
		apply(timeline, edits.timeline),
	)
}

/** The exact problem list expected after `edits`, for `toEqual`. */
export function expected(code: ErrorCode, path: Path): readonly Problem[] {
	return [{ code, path }]
}
