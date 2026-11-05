# Simulation Core Glossary

Domain vocabulary for `sim-core` (personal-finance projection engine).

**Design rule:** a primitive is defined by how the simulation treats it, not by its real-world name. Things that behave the same are the same primitive.

## Core Concepts

**Baseline**:
The opening snapshot: balances per account at the Timeline start. Nothing else.
_Avoid_: Initial state, starting ledger, opening balance

**Scenario**:
The complete, self-contained set of rules and plan applied to a Baseline: currency, economy, accounts, flows, and cashflow routing. Not a diff; callers build variants by editing a copy.
_Avoid_: What-if model, fork, experiment

**Timeline**:
The run parameters `{ start, horizon, resolution }`. `start` is the date the Baseline balances are measured at. `resolution` (`day` or `month`) only selects which rows the Projection reports; it never changes the numbers.
_Avoid_: Date list, time steps

**Projection**:
The deterministic output of a Baseline, Scenario and Timeline: states and cashflows over the horizon.
_Avoid_: Forecast, prediction, simulation run

**Occurrence**:
A date on which at least one Flow lands. Only Occurrences change balances; the Timeline's `start` and `horizon` are both inclusive.
_Avoid_: Tick, step, period

**Annual roll-up**:
Totals over one twelve-month period of a Projection, running from an anniversary of `start` to the day before the next one. The last period is cut short by the horizon or a Shortfall and marked partial.
_Avoid_: Year, fiscal year

**Account**:
A named balance with an explicit rule in the Scenario: `kind` (`asset` or `liability`), effective annual rate in basis points (one year grows the balance by exactly the rate), optional `lockedUntil`. Every account with a balance must have a rule. A liability's balance is the positive amount owed.
_Avoid_: Wallet, holding

**Flow**:
A dated cash movement of kind `income`, `expense` or `contribution`, with a frequency (including `once`), a start, an optional end, and growth. Replaces the former Stream and Event.
_Avoid_: Stream, Event, Transaction, Recurring transaction, Schedule

**Contribution**:
A Flow that moves money from cashflow into an Account. Not an expense: net worth is unchanged at that instant. Into a liability account it is a debt payment and an obligation. Into an asset account it is a target: it is limited to the Available cashflow on that Occurrence and is never funded from existing assets. Same-date amounts are summed per Account, and `cashflow.contribute` sets the funding priority.

**Available cashflow**:
The income on one Occurrence minus its expenses and debt payments actually made, floored at zero. Other dates are ignored; this is the ceiling for asset contributions.
_Avoid_: Free cashflow, disposable income

**Unfunded contribution**:
The part of an asset contribution's planned amount, after same-date summing per Account, that Available cashflow could not cover. It is dropped, not carried over. Debt planned above the amount owed is not unfunded.
_Avoid_: Missed contribution

**Earned income**:
Income from work, marked `earned: true`. It is the only income that stops in the FI test.
_Avoid_: Active income, salary income

**Passive income**:
Income marked `earned: false`. It continues when earned income stops.
_Avoid_: Investment income, unearned income

**Cashflow**:
The routing rules for net money each time flows land: ordered `surplus` steps (account, optional fixed `upTo`), an ordered `contribute` list of asset accounts (funding priority), and an ordered `withdraw` list.
_Avoid_: Income/expense delta

**Shortfall**:
Money owed on an Occurrence that no unlocked Account in the `withdraw` list can supply. Expenses and debt payments are never refused; asset contributions are capped before this point. A debt payment can cause one; an asset contribution cannot. The Projection ends on that date.
_Avoid_: Overdraft, deficit

**Runs-out date**:
The date of the first Shortfall, recorded with the unmet amount. Absent when money lasts to the horizon.
_Avoid_: Depletion date, bankruptcy

**Net worth / Accessible net worth**:
Net worth counts every Account, including locked ones. Accessible net worth leaves out Accounts before their `lockedUntil`; it is what Cashflow can actually draw on.
_Avoid_: Liquid assets, spendable

**Financial Independence (FI)**:
The earliest month in which earned income can stop and the Projection has no Shortfall through the horizon. The FI method fixes the exact test and any extra condition, such as a minimum buffer.
_Avoid_: Retirement, target date

**Financial Independence month**:
The first day of the earliest month at which the FI test passes. It is a date; age is a caller concern.
_Avoid_: FI date, retirement date

**Retirement spending**:
The monthly spending that replaces planned expenses from the FI month onward when the FI method is given an override.
_Avoid_: Post-retirement expenses, withdrawal rate

**Minimum buffer**:
The number of months of expenses the FI method requires as accessible net worth.
_Avoid_: Emergency fund, cash reserve

## Input Conventions

- All dates are `YYYY-MM-DD`, in years 0001-9998. There are no ages in the core; callers convert ages to dates.
- All money is integer minor units in one currency per Scenario; callers convert before calling.
- All rates are integer basis points.
- Collections are arrays of objects with unique `id`s, never objects keyed by id.
- Inputs are checked by a hand-written `check()` returning `{ code, path }[]`; unknown keys are rejected.
