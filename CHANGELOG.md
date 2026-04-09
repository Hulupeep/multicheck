# Changelog

All notable changes to the multicheck protocol are documented here.

The protocol follows [semver](https://semver.org/) starting with `v0.5.0`. Minor bumps cover additive new behavior (new rules, new hooks, new templates). Patch bumps cover doc-only fixes. Pre-`v0.5.0` work is in git history as the initial Phase 1 frameworkless releases.

## v0.5.0 — 2026-04-09

First versioned release. Ends the first data-collection freeze (2026-04-07 through 2026-04-09) with a batch fold-in of 4 ready-to-ship items from real-session evidence.

### Protocol additions (markdown)

- **Pre-flight Q7 reconnaissance** — new mandatory question in the story pre-flight requiring the builder to trace imports, survey sibling tests, identify factory patterns, map ESM/jest transform boundaries, survey existing mocks, enumerate propagation layers, and list invariant categories BEFORE answering Q1-Q6. Prevents harness-stubbing cascades, missing-factory-pattern refactors, and cross-layer value drift. (`BUILDER.md` Pre-flight section, `REVIEWER.md` Q7 verification row.)
- **Harness-failure triage framework** — new BUILDER.md section with a 5-step decision tree: (1) existing factory/helper? (2) sibling test mock pattern? (3) product-code shape problem? (4) test at wrong boundary? (5) only then stub with a reasoned comment. Required output as a `HARNESS TRIAGE:` block in the next `[S-NNN]` entry. Reviewer verifies the triage was actually applied, not just referenced. (`BUILDER.md` new section, `REVIEWER.md` verify HARNESS TRIAGE block subsection.)
- **Dress rehearsal note** — one-paragraph guidance in BUILDER.md suggesting the builder run `.husky/pre-commit` manually against staged files before typing `git commit`. Catches Prettier and contract-scan failures at the cheap moment.
- **`templates/claude-md.md` and `templates/agents-md.md`** — new top rules (#11 pre-flight 7-question + Q7, #12 harness triage, #13 dress rehearsal for builder; #11 pre-flight verification 7-question + Q7, #12 HARNESS TRIAGE verification for reviewer) auto-injected into project memory via Phase 0 refresh.

### Tooling additions

- **`hooks/pre-push.sh`** — new pre-push git hook that blocks pushes from stale branch bases. Self-disables when offline or when `origin/main` is unreachable. Tolerates up to 5 commits of drift to cover release/CI chore commits. Closes meta-observation M2 ("markdown rules have a ceiling of effectiveness"). Addresses the 4-hour stale-branch incident from the 2026-04-08 reference session and the multi-author drift incident from 2026-04-09. The markdown pre-flight Q2 remains the primary discipline; the hook is belt-and-suspenders for cases where the builder is tired, rushed, or new to the protocol.
- **`install-hooks.sh`** — new installer script that wires `hooks/pre-push.sh` into a target project's `.git/hooks/`.
- **`templates/hooks/pre-commit-gate-file.sh.example`** — optional template (not core) for projects using a reviewer-gate pattern with a shared ledger file. Enforces that source-code commits require an explicit reviewer clearance in the ledger file before they can land. Opt-in; not installed by default. Addresses the `#611` gate-skip incident from the 2026-04-09 session.
- **`README.md`** — new "Hooks" section documenting `hooks/pre-push.sh` and the optional gate-file template. Framing update: multicheck is moving from pure Phase 1 (markdown-only) to hybrid Phase 1.5 (markdown + minimal hooks for automation where markdown has hit its ceiling). Hooks are optional, self-disabling in hostile environments, and never replace the markdown discipline.
- **`METRICS.md` and `metrics.md`** — new `caught by: hook` value in the schema. Legend updated. Example row provided for hook-caught incidents.

### Examples and case studies

- **`examples/pr-gate-claims-monorepo.md`** — reference implementation of a project-level PR promotion gate, pulled from `claims-monorepo/specs/pr.md` with a header noting project-owned vs universal sections. Evolution over 2 days of live sessions reflects R-028, R-035, R-038, R-040 learnings inline.
- **`examples/details-md-active-protocol.md`** — reference implementation of the Layer-3 reification pattern, pulled from claims-monorepo `specs/details.md` Active Protocol section.
- **`case-studies/2026-04-08-claims-monorepo-calendar-consolidation/`** — full case study of a multi-round slice (#610) including two reviewer self-corrections (R-035 topology miss, R-040 cross-layer miss), multi-author drift capture (R-041), and the protocol-violation pattern (skipped R-045 gate in #611). Preserved as-is for audit trail integrity.

### Meta-observations

- **M2 closed** — "markdown rules have a ceiling of effectiveness" closed by the pre-push topology check hook. The hook is the Phase 2+ automation that M2 identified as needed. Evidence: 2026-04-09 session independently surfaced the same failure mode from a second reviewer session and converged on the hook as the right fix.

### Freeze lifecycle

- **Freeze started**: 2026-04-07 (implicit, at `a83ac4a` initial Phase 1 frameworkless release)
- **Partial unfreeze #1**: 2026-04-08 for item #5 (pre-flight Q1-Q6 only) — commit `7f73c1b`
- **Full unfreeze / v0.5.0**: 2026-04-09 for the 4 items above

PENDING items #1 (diff-content check for cascaded files), #2 (branch-base rule — now subsumed by Q2 pre-flight + pre-push hook), #3 (cross-layer value consistency — reviewer-time counterpart to the v0.5.1 propagation manifest), and #4 (specialist-persona sweep) remain queued. Item #2's automation half is now implemented via `hooks/pre-push.sh`; the markdown discipline half remains queued. Meta-observations M1, M3, M4 remain open.

### What's not in v0.5.0 (deferred to v0.5.1 or v0.6.0)

- **Propagation manifest** — contract schema extension + compliance hook for cross-layer value consistency check at write time. Deferred because the false-positive hazards (project-specific paths, noise filtering) require claims-monorepo prototype data to tune before shipping upstream.
- **PENDING items #1, #3, #4** — recipe refinements that benefit from more session data before fold-in.

## Earlier releases (pre-versioned, by commit)

- **`7f73c1b`** 2026-04-08 — Freeze break for pre-flight only: fold PENDING #5 into active protocol
- **`c0463a6`** 2026-04-08 — Queue item #5: six-question pre-flight before every story
- **`cddc540`** 2026-04-08 — Queue items #3 + #4 + meta-observations M3/M4: external swarm finding
- **`14a49fd`** 2026-04-08 — Track local deviation on PENDING #2 + add meta-observations section
- **`1b1dbce`** 2026-04-07 — Queue item #2: branch-base sanity check + 2 new metrics catches
- **`6b6ebda`** 2026-04-07 — Queue diff-content-check recipe; add near-miss incident to metrics
- **`aed2c16`** 2026-04-07 — Fold reviewer R-FINAL feedback: state-your-model, STATE extensibility, process-as-dominant-value, 8 new catches
- **`529c9b5`** 2026-04-07 — Refactor stable-context anchoring to role-split: CLAUDE.md = reviewer, AGENTS.md = builder
- **`db0c8bf`** 2026-04-07 — Add stable-context protocol summary; auto-inject into AGENTS.md / CLAUDE.md / details.md
- **`c35afdd`** 2026-04-07 — Add metrics protocol: manual catch log with daily-ask prompts
- **`c774b90`** 2026-04-07 — Add operator-instructed archive protocol
- **`b78e8e1`** 2026-04-07 — Add goal packet protocol [G-NNN]
- **`21fd44d`** 2026-04-06 — Fold operational lessons from reference session into protocol
- **`a83ac4a`** 2026-04-06 — Initial commit: frameworkless multi-LLM builder/reviewer protocol
