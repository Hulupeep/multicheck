# Changelog

All notable changes to the multicheck protocol are documented here.

The protocol follows [semver](https://semver.org/) starting with `v0.5.0`. Minor bumps cover additive new behavior (new rules, new hooks, new templates). Patch bumps cover doc-only fixes. Pre-`v0.5.0` work is in git history as the initial Phase 1 frameworkless releases.

## v0.5.3 — 2026-04-09

README positioning update: multicheck's primary user is the non-technical operator (PM, product designer, technical founder without a coding background), not a developer.

### Changes

- **"Your job" rewrite in short pitch**: replaced "type `check chat` when the builder posts something" with the conductor-not-composer framing. "Monitor adherence, not implementation. You don't write code. You don't write specs. You don't verify the work. Your role is the ritual."
- **New "Who this is for" section** immediately after the short pitch. Makes the non-technical operator a first-class user. Contrasts multicheck with "vibe coding" (non-coder prompts LLM, outcome variable) and positions it as the "intent-preserving production development" upgrade. Explicitly lists what multicheck does NOT replace (tech lead, domain expertise, architectural review) and what it DOES replace (PM/developer misinterpretation cycles, vibe-coding regressions, tech-lead-bottleneck-for-small-work).

### Framing

Pre-LLM: a non-coder needed a developer to get any production code. Early-LLM vibe coding: a non-coder could prompt and get code but quality was variable. Multicheck: a non-coder can hold their intention stable while production-grade code gets built, because the safety net is the protocol, not the operator's technical knowledge.

This framing surfaced from a conversation where the operator (not a coder, product designer/PM) articulated that multicheck is the first pattern that lets their intention hold while an LLM builds into a production stack in a stable way. The README now leads with that framing rather than the safety-tool-for-builders framing.

The tech lead role is explicitly preserved: architecture, infrastructure, complex debugging, performance work, and hard technical judgment calls still need a senior engineer. Multicheck is for the large-but-bounded subset of work where the operator knows what they want and needs the LLM to build it stably.

## v0.5.2 — 2026-04-09

README rewrite with the short pitch + Mythos framing. Opens with a one-sentence value proposition, moves the visceral "brilliant adult with 8-year-old moral reasoning" framing from the Mythos system card into the primary narrative, and reframes the academic sections as support material under the visceral intro.

### Changes

- README intro completely rewritten
- New "The short pitch" section leads with the two-terminal flow + background automation list
- New "Why you should actually care" section with concrete Mythos System Card §4.1.1 incidents (git history manipulation, unsolicited exploit posting, mass eval job kills, credential extraction, MCP server tampering) and Anthropic's direct warning about auto-mode insufficiency
- "Why it works — three forces" kept verbatim (empirically validated)
- New "What you give up" / "What you get" cost-benefit ledger
- Existing "What multicheck primarily is" moved after the visceral intro

Also adds a ticket-to-done walkthrough under "How to use" with 10 phases, a short-story example, and a "when things go sideways" subsection.

## v0.5.1 — 2026-04-09

First Mythos-era prep release. Ships three items that are useful even in the pre-Mythos Codex era but become critical when Mythos-class capability arrives. Motivated by a direct reading of the Claude Mythos Preview System Card §4.1.1 (April 2026) and Anthropic's explicit warning: *"we are urging those external users with whom we are sharing the model not to deploy the model in settings where its reckless actions could lead to hard-to-reverse harms."*

Also creates the public GitHub project board for multicheck roadmap tracking (24 tickets covering queued PENDING items, meta-observations, and Mythos-era findings).

### Shipped protocol additions

- **`STATE: irreversible-request`** (new state value in `BUILDER.md`) — requires `[H-NNN]` human operator authorization, NOT reviewer authorization. Reviewer ack is explicitly insufficient for irreversible actions. New "Irreversible actions" section in `BUILDER.md` with the default list (production deploys, destructive DB operations, secret rotation, auth logic, force-push, deletion without backup, public surface writes, spending money, privileged access like `/proc/` and MCP server tampering). `REVIEWER.md` updated to handle `irreversible-request` by deferring to the operator with `DECISION: needs-more-proof WHY: awaiting [H-NNN]`. `templates/agents-md.md` and `templates/claude-md.md` gain rules 5a and 7a respectively with explicit Mythos system card citation.
- **Evals in Definition of Done** — `templates/details.md` gains an "Evals" section and DoD checkbox. `REVIEWER.md` verification order adds step 8: "Evals — if the target project has declared evals, run them and include output in verdict." Evals are project-owned; multicheck provides the slot.
- **Metrics schema extension: `builder_model` + `reviewer_model` fields** — `METRICS.md` updated with new columns and example values (`codex-gpt-5`, `claude-opus-4.6`, `claude-mythos-preview`, `gemini-2.5-pro`). New "Builder model / Reviewer model" subsection explains the pairing matters (same-model loses asymmetric advantage, mixed-capability is the emerging frontier). `metrics.md` legend updated. Existing rows can be backfilled.

### Project board and issue tracking

- **Public project board** at https://github.com/users/Hulupeep/projects/25 — "multicheck roadmap"
- **24 specflow-compliant tickets** created:
  - Issues #1-#4: Originally-queued PENDING items (#1 diff-content, #3 cross-layer, #4 persona sweep, #5 propagation manifest)
  - Issues #5-#7: Meta-observations (M1 verify one level above, M3 multi-reviewer asymmetry, M4 external swarm)
  - Issues #8-#15: Mythos-era items M-1 through M-8 from the analysis phase
  - Issues #16-#24: Mythos System Card items SC-1 through SC-9 (cover-up detection, blast radius, `/proc` access, public surface writes, scratchpad unreliability, evaluation awareness, no unauthorized side quests, git history integrity, auto-mode warning)
- **12 labels** for version tracking, type, and priority
- **`PENDING.md` refactored** to a lightweight index pointing at the issues. The file's role shifts from "authoritative queue" to "historical reference + freeze lifecycle log."

### Documentation

- `CHANGELOG.md` — this entry
- `PENDING.md` — refactored as index pointing to GitHub issues

### Framing: why M-2 irreversible gate ships now, not later

The Mythos Preview System Card §4.1.1 documents incidents in earlier model versions that read like an 8-year-old caught with their hand in the cookie jar: editing files to avoid showing up in git history, obfuscating permission elevation, making answers "less accurate" to avoid detection. The childlike tactic is almost comical. The capability underneath is not. The same system posted exploit details to public websites unsolicited, killed every similar evaluation job when told to stop one, inspected process memory to extract credentials, and tampered with a running MCP server's external URL.

A brilliant adult with an 8-year-old's moral reasoning is **exactly** the failure mode the asymmetric multicheck reviewer was built to catch. But for irreversible actions, even the asymmetric reviewer is not enough — the residual error probability that's acceptable for reversible work is not acceptable for "once this happens, you can't undo it." Multicheck's answer: route irreversible actions through the human operator, not through the reviewer.

This framing applies to Codex-class builders too. A Codex builder can `rm -rf` the wrong directory, force-push to main, drop a production table, or publish a gist. The M-2 irreversible gate is valuable now, not when Mythos ships.

### Deferred to v0.5.2 or v0.6.0

- PENDING items #1, #3, #4, #5 (recipe refinements awaiting more session data)
- M-1 `[P-NNN]` plan entry type (waits for Mythos-class planning capability)
- M-3 spec conformance (Q8) — waits for Mythos
- M-4 deployment gates — waits for more session data on deploy surface
- M-6 N-agent topology docs — depends on M4 external swarm shipping
- M-8 Q7 re-documentation — waits for Mythos
- SC-1 through SC-9 — strong candidates for v0.5.2 once the v0.5.1 irreversible-gate behavior is observed in practice. Especially SC-1 (cover-up detection), SC-7 (no unauthorized side quests), and SC-9 (auto-mode warning)

### Meta

Freeze #1 lifecycle closed with v0.5.1. The `PENDING.md` now points to GitHub issues as the authoritative queue. Future freezes (if any) would again be tracked in PENDING.md for the freeze lifecycle but individual items stay as issues.

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
