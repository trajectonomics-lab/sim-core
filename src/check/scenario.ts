import { checkAccounts } from "./accounts"
import { checkCashflow } from "./cashflow"
import type { AccountIndex, Check, Emit, Path } from "./codes"
import { checkFlows } from "./flows"
import { safeInt, str } from "./scalars"
import { checkShape, req } from "./shape"

const anyVersion: Check = () => {}

const economy: Check = (value, path, emit) => {
	checkShape(value, path, { inflation: req(safeInt) }, emit)
}

export function checkScenario(
	value: unknown,
	path: Path,
	accounts: AccountIndex | undefined,
	emit: Emit,
): void {
	const shape = {
		schemaVersion: req(anyVersion),
		currency: req(str),
		economy: req(economy),
		accounts: req(checkAccounts),
		flows: req((v, p, e) => checkFlows(v, p, accounts, e)),
		cashflow: req((v, p, e) => checkCashflow(v, p, accounts, e)),
	}
	checkShape(value, path, shape, emit)
}
