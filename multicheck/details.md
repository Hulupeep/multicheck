# Project Details

<!--
DOGFOODING NOTE. This `multicheck/` working dir lives INSIDE the multicheck
framework repo itself. BUILDER.md Phase 0 step 1 normally guards against this
case; operator has explicitly authorized override (session start, 2026-04-15).
Adjusted Phase 0: no `multicheck/.framework/` clone (we ARE the framework); no
anchor refresh (repo-root `CLAUDE.md` + `AGENTS.md` already document this repo
correctly). `multicheck/` directory is gitignore-pending — operator to decide
whether to add to .gitignore (treat as session state) or commit (treat as
case-study material later).
-->

## Repo
- URL: https://github.com/Hulupeep/multicheck.git
- Branch: main
- Local path: /home/xanacan/projects/code/multicheck
- Latest commit: 96e812a (unpushed; 1 commit ahead of origin/main `bc9bbb7`)

## Board / Tickets
- Source: gh project
- URL: https://github.com/users/Hulupeep/projects/26
- Current focus issues: #25-#35 (MON-001 through MON-010 + #33 EPIC MON-000)

## Objective

Ship multicheck v2.0: Claude-side Monitor-driven coordination that replaces v1
manual `check chat` relay on the Claude side of every pairing, while preserving
asymmetric-blind-spots value, v0.5.3 adversarial reviewer disposition, and
v0.5.1 irreversible-action gate. Work tracked in the #33 EPIC. Dogfooded on the
multicheck framework repo itself — this session is the first real exercise of
the protocol on its own development.

## Wave plan
<!-- Per #33 EPIC dependency ordering -->
- W1: #25 MON-001 + #26 MON-002 (parallel)
- W2: #27 MON-003
- W3: #28 MON-004 + #29 MON-005 (parallel)
- W4: #35 MON-010
- W5: #31 MON-007
- W6: #30 MON-006 + #32 MON-008 (parallel)
- W7: #34 MON-009

## Environments
- Local URL: N/A — multicheck is a markdown-first protocol framework with no runtime service
- Production URL: N/A
- Staging URL (if any): N/A

## Database
- Provider: N/A — no database
- How to query (CLI / connection / dashboard): N/A
- Key tables relevant to current work: N/A

## Deploy
- Platform: N/A — framework is consumed via `git clone`, not deployed as a service
- Auto-deploy branch: N/A
- How to verify a deploy is live: `git pull` in a downstream clone + `git log --oneline -1` matches expected SHA

## In-scope files (per current ticket)
<!--
Updated by the builder at the start of each ticket, before any edits.
Current ticket: #25 MON-001 (Pairing declaration). Authorized by [R-004] DECISION: accept on combined [S-002]+[S-003] pre-flight at HEAD 96e812a.
-->
- Ticket #: 25 (MON-001)
- Files:
  - `templates/details.md` — add `## Pairing` section with `pairing:` placeholder + HTML comment enumerating three enum values + default (MON-001-001, MON-001-003)
  - `BUILDER.md` — augment Phase 0 step 6 with ordered pairing prompt; brief pairing-flip cross-reference (MON-001-004, J-MON-001-DECLARE, MON-001-005)
  - `README.md` — informative "Pairing options" section (supports MON-001-005; not normatively tested)
  - `REVIEWER.md` — add "Pairing flip handling" section (MON-001-005, J-MON-001-FLIP)
  - `tests/contracts/mon-001.test.js` — promote 7 `test.todo()` → real `test()` assertions per [S-003] disposition; keep 3 with deferral comments naming destination ticket

## End-gate command
<!-- Full jest run across all contract + e2e stubs. -->
- Local: `npm test`
- Production: N/A

## Test
- Run locally: `npm test`
- Run against production: N/A
- Last known green: commit `96e812a` — 14 suites / 88 passed / 151 todos / 0 failed

## Verification Surfaces (reviewer fills during Phase 0 capability check)
- [ ] Test command runnable — `pending`
- [ ] Production URL reachable — `n/a`
- [ ] Database queryable — `n/a`
- [ ] gh issue comments postable — `pending`
- [ ] Screenshots possible (UI work only) — `n/a`

## Baseline health (reviewer fills during Phase 0, BEFORE builder begins)
<!-- Reviewer to populate when it joins the session. -->
- Date (UTC): pending
- Commit (HEAD): pending
- End-gate result: pending
- Pre-existing failures: pending
- Pre-existing warnings: pending

## Reviewer First Checks (per-ticket)
<!-- Populated per-ticket; currently empty because no ticket is active. -->
-
-
-

## Definition of Done
- [ ] Code matches the ticket
- [ ] In-scope file list matches the committed file list (or a scope-expansion entry exists)
- [ ] End-gate command passes (`npm test` — full suite, not subset)
- [ ] Tests pass against production (N/A — no production surface)
- [ ] Real user flow verified, DB rows confirmed (N/A — no runtime)
- [ ] Evals pass (none declared for this session)
- [ ] Reviewer signed off in `multicheck/agentchat.md`
- [ ] gh issue comment posted with proof and timestamp on the relevant MON-* issue

## Evals
<!-- None declared. Specflow contract tests are the primary verification. -->
- None

## Open blockers / human authorization required
<!-- Per [S-001] — 4 ASK items for operator. -->
- **Pairing confirmation**: claude-builder + codex-reviewer (default flipped per MON-001 enum) OR claude-builder + claude-reviewer (same-provider, weaker asymmetric blind-spots)?
- **First ticket selection**: default W1 parallel MON-001 + MON-002, or different starting order?
- **`multicheck/` gitignore stance**: add to `.gitignore` (treat as ephemeral session state) OR commit (treat as case-study material for future agents)?
- **`node_modules/` gitignore**: must be added to `.gitignore` BEFORE any commit that would otherwise sweep it up — blocks commit workflow until done.

## Notes

This is a dogfooding session. Novel in that (a) the framework is running on
itself, (b) the builder is Claude (flipped from default Codex-builder), (c) the
specflow test infrastructure was just installed and stubbed for the 10 MON-*
tickets — real test() assertions replace test.todo() progressively as each REQS
item ships.

## Active Protocol

- **Live chat path**: `multicheck/agentchat.md` (this repo, not pre-rotation)
- **Active goal**: `[G-001]` (v2.0 Monitor-driven coordination)
- **Framework version**: SELF-HOSTED on this repo at commit `96e812a` — not a `multicheck/.framework/` clone. BUILDER.md / REVIEWER.md / templates read from repo root.
- **Pairing**: `claude-builder + codex-reviewer` (pending operator confirmation — see Open blockers)
- **Session-specific overrides**:
  - Dogfooding self-hosted mode: Phase 0 framework-clone step skipped
  - Phase 0 anchor refresh skipped (repo-root `CLAUDE.md` + `AGENTS.md` already correct for this repo)
  - End-gate is `npm test` (jest), not a pre-commit hook — specflow was just installed
- **For full protocol**: `BUILDER.md` / `REVIEWER.md` at repo root; role anchors in `CLAUDE.md` / `AGENTS.md` at repo root
