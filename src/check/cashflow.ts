import type { AccountIndex, Check, Emit, Path } from "./codes"
import { spendableRef } from "./refs"
import { amount } from "./scalars"
import { checkShape, checkUnique, checkUniqueValues, list, opt, req } from "./shape"

export function checkCashflow(
	value: unknown,
	path: Path,
	accounts: AccountIndex | undefined,
	emit: Emit,
): void {
	const account = spendableRef(accounts)
	const step: Check = (item, at, e) =>
		void checkShape(item, at, { account: req(account), upTo: opt(amount) }, e)
	const cashflow = checkShape(
		value,
		path,
		{ surplus: req(list(step)), withdraw: req(list(account)) },
		emit,
	)
	checkUnique(cashflow?.["surplus"], [...path, "surplus"], "account", emit)
	checkUniqueValues(cashflow?.["withdraw"], [...path, "withdraw"], emit)
}
