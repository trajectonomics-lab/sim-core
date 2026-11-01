import type { AccountIndex, Check } from "./codes"
import { str } from "./scalars"

/** Account id that must be declared in `scenario.accounts` (skipped when unknown). */
export function accountRef(accounts: AccountIndex | undefined): Check {
	return (value, path, emit) => {
		str(value, path, emit)
		if (accounts && typeof value === "string" && !accounts.has(value)) {
			emit("UNKNOWN_ACCOUNT", path)
		}
	}
}

/** Like `accountRef`, but liabilities are rejected (surplus targets and withdrawal sources). */
export function spendableRef(accounts: AccountIndex | undefined): Check {
	const ref = accountRef(accounts)
	return (value, path, emit) => {
		ref(value, path, emit)
		if (typeof value === "string" && accounts?.get(value) === "liability") {
			emit("LIABILITY_MISUSE", path)
		}
	}
}

/** Baseline balance account: must have a rule in `scenario.accounts`. */
export function balanceRef(accounts: AccountIndex | undefined): Check {
	return (value, path, emit) => {
		str(value, path, emit)
		if (accounts && typeof value === "string" && !accounts.has(value)) {
			emit("UNDECLARED_BALANCE_ACCOUNT", path)
		}
	}
}
