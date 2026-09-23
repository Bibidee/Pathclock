# PATHCLOCK architecture

## Product invariant

A candidate release may not receive PATHCLOCK release authority until GenLayer has finalized a substantive semantic review of the frozen requirement against the committed evidence set.

## Contract graph

```text
RemediationRegistry
       │ synchronous final-state view
       ▼
PatchReviewEngine
       │ nondeterministic evidence fetch + LLM
       │ independent validator reconstruction
       │
       └──── internal message on="finalized" ────► ReleaseAuthority
                                                   │
                                                   └─ exact-once release receipt
```

### RemediationRegistry

- immutable specification records;
- creator ownership recorded;
- exact public repository/advisory URL;
- frozen security requirement;
- bounded evidence policy;
- explicit allowed evidence origins;
- no mutation method for a frozen specification.

### PatchReviewEngine

The leader and validator both fetch the same committed public evidence independently. Evidence content is treated as hostile data, never instructions.

The decision-bearing fields are:

- outcome;
- requirement satisfied;
- candidate identity verified;
- regression tests pass;
- patch evidence consistent;
- deployment evidence consistent;
- material findings;
- evidence conflicts.

The validator rejects substantive disagreement on the outcome or the material boolean/conflict fields. It does not merely check JSON validity or enum shape.

Explicit uncertainty exists. Missing/contradictory evidence can produce `INCONCLUSIVE`; unavailability is not silently converted into failure or remediation.

### ReleaseAuthority

- engine address configured once by administrator;
- only the engine can mint an authorization;
- authorization is exact-once by review key;
- authorization may be consumed once by the recorded release owner;
- minting is initiated by the review engine with `emit(on="finalized")`, so provisional acceptance cannot authorize a release.

## Frontend data direction

```text
screen -> feature command -> chain adapter -> wallet/RPC -> GenLayer
GenLayer -> final read model -> domain projector -> screen
```

React screens never call raw RPC methods directly.

## Transaction lifecycle

```text
AWAITING_SIGNATURE
    -> SUBMITTED
    -> CONSENSUS_RUNNING
    -> ACCEPTED (PROVISIONAL ONLY)
    -> FINALIZE action when available
    -> FINALIZED
    -> EXECUTION_CONFIRMED
    -> FINAL STATE REREAD
    -> RELEASE_AUTHORIZED
```

`UNDETERMINED`, execution failure, user rejection and source unavailability are separate states. None is coerced into success.

## Evidence model

Each review binds:

- frozen specification ID;
- candidate version;
- candidate commit/reference;
- patch evidence URL;
- regression-test evidence URL;
- deployment evidence URL;
- advisory URL inherited from the frozen specification.

During review, each validator fetches the evidence and constructs a digest of the exact bounded text it evaluated. The durable review record stores the evidence manifest returned by consensus.

## Why the architecture is multi-contract

The contracts split three genuine trust boundaries:

- registry: immutable policy/specification authority;
- review engine: nondeterministic semantic decision authority;
- release authority: irreversible finalized consequence.

Merging release authorization into the review contract would make the finality boundary less explicit; adding more contracts would be architecture for file count rather than necessity.
