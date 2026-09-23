# Regression-test evidence

Expected security regression:

```text
case: expired session
expected: PermissionError("expired session")
privileged store reads: 0
result: PASS

case: active session
expected: privileged state returned
privileged store reads: 1
result: PASS
```

Canonical finishing step: replace this static demonstration text with the actual final CI run link and candidate commit SHA after pushing the repository. The live evidence must bind this result to the same commit submitted to PATHCLOCK.
