import { FLOW_KINDS, FREQUENCIES } from "../vocab"
import type { AccountIndex } from "./codes"
import { accountRef } from "./refs"
import { amount, bool, date, growth, oneOf, str } from "./scalars"
import { opt, req, type Shape } from "./shape"

const base: Shape = {
	id: req(str),
	kind: req(oneOf(FLOW_KINDS, "INVALID_KIND")),
	amount: req(amount),
	frequency: req(oneOf(FREQUENCIES, "INVALID_FREQUENCY")),
	start: req(date),
	end: opt(date),
	growth: req(growth),
}

/** Keys allowed per flow kind; an invalid kind accepts every optional kind-specific key. */
export function flowShape(kind: unknown, accounts: AccountIndex | undefined): Shape {
	const target = accountRef(accounts)
	if (kind === "income") return { ...base, earned: req(bool) }
	if (kind === "contribution") return { ...base, target: req(target) }
	if (kind === "expense") return base
	return { ...base, earned: opt(bool), target: opt(target) }
}
