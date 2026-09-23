# Clean-room frontend constraint

PATHCLOCK is deliberately not a derivative of previous `ometere123` frontends.

## Prohibited reuse

Do not copy, port, rename, paraphrase, or mechanically transform any frontend artifact from a repository under `github.com/ometere123`, including:

- JSX/TSX;
- CSS and design tokens;
- route structures;
- global header/footer patterns;
- sidebar/operations-rail patterns;
- generic wallet button components;
- transaction-notice components;
- page composition;
- card/ledger/dossier structures;
- wording and hero-section composition.

## Locked PATHCLOCK information architecture

Only:

```text
/
/console
/release/[reviewKey]
/proof/[receiptKey]
```

Do not add `/dashboard`, `/account`, `/protocol`, `/new`, `/evidence`, `/consensus`, `/finality`, `/reviews`, `/releases`, `/settings`, or module-style top-level routes.

## Product visual language

PATHCLOCK is a forensic security-release workstation:

- warm paper/neutral surface rather than dark Web3 console;
- editorial serif only for key security statements;
- utilitarian sans serif for application controls;
- monospace only for hashes/commits/addresses;
- thin rules and whitespace instead of grids of generic cards;
- diff/evidence-document treatment;
- restrained semantic color;
- no permanent oversized wallet CTA.

## Final similarity check

Before submission, have the finishing agent inspect PATHCLOCK and compare its route graph, component tree, screenshots and CSS vocabulary against prior `ometere123` frontends. If the app has converged toward those structures, redesign PATHCLOCK rather than merely renaming components.
