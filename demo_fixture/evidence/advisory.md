# PATHCLOCK synthetic advisory PC-2026-001

## Security requirement

An expired session must be rejected **before** any privileged account state is read or returned.

## Affected baseline

`demo_fixture/baseline/session.py`

The baseline reads privileged state first and only then checks whether the session has expired. This ordering violates the requirement even if the eventual response is an error, because privileged data access already occurred.

## Acceptance condition

A candidate remediates PC-2026-001 only when all of the following are supported by the committed evidence:

1. expiry is checked before the privileged store read;
2. regression evidence proves an expired session performs zero privileged reads;
3. the tested/deployed artifact is bound to the same candidate commit/reference;
4. no contradictory evidence remains.
