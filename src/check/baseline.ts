import type { AccountIndex, Check, Emit, Path } from "./codes"
import { balanceRef } from "./refs"
import { amount } from "./scalars"
import { checkShape, checkUnique, list, req } from "./shape"

const anyVersion: Check = () => {}

export function checkBaseline(
	value: unknown,
	path: Path,
	accounts: AccountIndex | undefined,
	emit: Emit,
): void {
	const balance: Check = (item, at, e) =>
		void checkShape(item, at, { account: req(balanceRef(accounts)), amount: req(amount) }, e)
	const shape = { schemaVersion: req(anyVersion), balances: req(list(balance)) }
	const baseline = checkShape(value, path, shape, emit)
	checkUnique(baseline?.["balances"], [...path, "balances"], "account", emit)
}
