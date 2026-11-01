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

**Account**:
A named balance with an explicit rule in the Scenario: `kind` (`asset` or `liability`), rate in basis points, optional `lockedUntil`. Every account with a balance must have a rule. A liability's balance is the positive amount owed.
_Avoid_: Wallet, holding

**Flow**:
A dated cash movement of kind `income`, `expense` or `contribution`, with a frequency (including `once`), a start, an optional end, and growth. Replaces the former Stream and Event.
_Avoid_: Stream, Event, Transaction, Recurring transaction, Schedule

**Contribution**:
A Flow that moves money from cashflow into an Account. Not an expense: net worth is unchanged at that instant. A debt payment is a contribution into a liability account.

**Cashflow**:
The routing rules for net money each time flows land: ordered `surplus` steps (account, optional fixed `upTo`) and an ordered `withdraw` list.
_Avoid_: Income/expense delta

**Financial Independence (FI)**:
The milestone point along a Projection timeline where passive cashflow or sustainable portfolio withdrawals reliably cover projected living expenses.
_Avoid_: Retirement, target date

## Input Conventions

- All dates are `YYYY-MM-DD`. There are no ages in the core; callers convert ages to dates.
- All money is integer minor units in one currency per Scenario; callers convert before calling.
- All rates are integer basis points.
- Collections are arrays of objects with unique `id`s, never objects keyed by id.
- Inputs are checked by a hand-written `check()` returning `{ code, path }[]`; unknown keys are rejected.
