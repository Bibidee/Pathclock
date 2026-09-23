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

Candidate commit: `dac1a1d`

The live evidence binds this result to the immutable GitHub commit containing the fixture.
