# Simulation Core Glossary

Domain vocabulary for `sim-core` (personal-finance projection engine).

## Core Concepts

**Baseline**:
The initial financial snapshot at the simulation start date (as-of date), including starting account balances, existing income/expense streams, asset holdings, and liabilities.
_Avoid_: Initial state, starting ledger, opening balance

**Scenario**:
A discrete, hypothesized modification applied to a Baseline, specifying hypothetical events, stream adjustments, or parameter overrides.
_Avoid_: What-if model, fork, experiment

**Projection**:
The deterministic sequence of projected financial states and cash flows over a specified time horizon generated from a Baseline and an optional Scenario.
_Avoid_: Forecast, prediction, simulation run

**Timeline**:
The discrete chronological sequence of simulation periods (e.g. monthly or annual intervals) spanning from the start date to the target horizon date.
_Avoid_: Date list, time steps

**Stream**:
A recurring cashflow component (income, fixed expense, debt payment, contribution) defined with frequency, start/end dates, amount or calculation rule, and growth adjustments.
_Avoid_: Recurring transaction, schedule

**Event**:
A one-time or scheduled discrete change occurring at a specific point on the timeline (e.g. asset purchase, liquidity event, windfalls, tax settlement).
_Avoid_: Transaction, trigger, action

**Cashflow**:
The net movement of money into or out of financial accounts during a specific simulation interval.
_Avoid_: Income/expense delta

**Financial Independence (FI)**:
The milestone point along a Projection timeline where passive cashflow or sustainable portfolio withdrawals reliably cover projected living expenses.
_Avoid_: Retirement, target date
