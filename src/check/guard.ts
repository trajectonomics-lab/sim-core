import type { Emit } from "./codes"

export type Root = "baseline" | "scenario" | "timeline"

/**
 * Runs `run`, turning an exception (a throwing getter, a revoked Proxy) into one `NOT_AN_OBJECT`
 * problem at the input's root, reported at most once per root. Returns `fallback` on failure.
 */
export function makeGuard(emit: Emit): <T>(root: Root, fallback: T, run: () => T) => T {
	const failed = new Set<Root>()
	return (root, fallback, run) => {
		try {
			return run()
		} catch {
			if (!failed.has(root)) emit("NOT_AN_OBJECT", [root])
			failed.add(root)
			return fallback
		}
	}
}
