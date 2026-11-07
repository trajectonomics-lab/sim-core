/** The keys of a Measure that hold other Measure ids, by `op`. */
export const REF_KEYS: Readonly<Record<string, readonly string[]>> = Object.freeze({
	add: ["a", "b"],
	sub: ["a", "b"],
	min: ["a", "b"],
	max: ["a", "b"],
	scale: ["of"],
	pick: ["a", "b", "then", "else"],
})
