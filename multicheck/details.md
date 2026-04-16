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
Current ticket: #28 MON-004 (Claude-Builder-side reaction protocol — 3-FAIL auto-ESCALATE).
Authorized by [R-027] DECISION: accept on revised [S-026] pre-flight at HEAD 6d2e5ed against issue #28 body re-edited per option (c) at 15:15 UTC.
Prior tickets: #25 MON-001 at 8ee2b15; #26 MON-002 at b0eda73; #27 MON-003 at 6d2e5ed; The_8_Layers.md at 612a0d9 (per [H-006]).
-->
- Ticket #: 28 (MON-004)
- Files:
  - `BUILDER.md` — new §Claude-as-Builder Monitor reactions section describing PASS/FAIL/ESCALATE state machine + 3-FAIL cap (auto-ESCALATE with `**Reviewer:** claude-builder-auto` + `**Reason:** max-fail-cycles-reached`) + notify-send/terminal-bell fallback + irreversible-gate preservation (v0.5.1) + fail_counter read/write against details.md + malformed-verdict/unrecognized-task-id defensive branches.
  - `templates/details.md` — `fail_counters:` key schema documented alongside `pairing:` (MON-001 precedent for details.md additions); per-Task-id counter with reset-on-new-task semantic.
  - `templates/agentchat.md` — extend STATE vocabulary block with 4 new values per F-R023-02 operator authorization: `verdict-accepted` (builder reacts to PASS), `awaiting-human` (builder reacts to ESCALATE or irreversible-gate), `malformed-verdict` (builder refuses FAIL with empty fixes list), `verdict-unrecognized` (builder refuses verdict referencing unknown task-id).
  - `tests/contracts/mon-004.test.js` — promote 11 test.todo → test() per [S-026]/[R-027] disposition (MON-004-001/-002/-003/-004/-005/-006 + INV-001/-002 + J-PASS/J-FAIL-RESUBMIT/J-AUTO-ESCALATE) + 3 DEFER test.todo (MON-004-007 covered-by-§Harness-triage; INV-003 negative-covered-by-001; J-HUMAN-ESCALATE covered-by-004).
- OUT OF SCOPE per [H-010] lean-scope direction: M2 (reviewer re-read-to-EOF) / hook-gate / ticket-auth-trail → routed to MON-005.
- OUT OF SCOPE per issue #28 body (c) framing: non-Claude-side reaction protocols (Codex-Builder, etc.) → routed to MON-006.

- Prior-ticket scope (for reference, not this slice):
- Ticket #: 27 (MON-003)
- Files:
  - `BUILDER.md` — new §Start Monitor at session entry (MON-003) between §v2 message format and §Structured self-correction format. Canonical builder-side prompt pattern: `tail -F multicheck/agentchat.md | grep -E --line-buffered '^### \[[RH]-[0-9]+\]|^**Verdict:** (PASS|FAIL|ESCALATE)$'` + `persistent: true` + role-appropriate reaction on PASS/FAIL/ESCALATE/monitor-dead.
  - `REVIEWER.md` — new §Start Monitor at session entry (MON-003). Canonical reviewer-side prompt pattern: `tail -F multicheck/agentchat.md | grep -E --line-buffered '^### \[[SH]-[0-9]+\]|^### BUILDER SUBMISSION$|^### BUILDER RESUBMISSION$'` + `persistent: true` + reaction (read latest submission + run 7-step verification).
  - `README.md` — new §Monitor-driven coordination (v2.0) user-facing paragraph; links to BUILDER.md / REVIEWER.md §Start Monitor.
  - `templates/agentchat.md` — extend STATE vocabulary block with `monitor-dead` (Monitor was active but terminated mid-session — cancel / restart / runtime error; session posts this STATE + falls back to v1 `check chat` relay).
  - `templates/claude-md.md` — add one-line session-entry hint pointing at BUILDER.md / REVIEWER.md §Start Monitor (so auto-loaded anchor surfaces the protocol).
  - `templates/agents-md.md` — same session-entry hint.
  - `tests/contracts/mon-003.test.js` — promote 7 test.todo → test() per [S-020] disposition (rows 1, 2, 7, 8, 9, 11, 13: canonical prompt presence in BUILDER.md + REVIEWER.md; `monitor-dead` STATE in templates/agentchat.md + reaction docs; Monitor-inside-session-runtime vocabulary; read-only command pipeline; §Start Monitor section + role-specific grep pattern; `monitor-dead` reaction guidance). 6 DEFER with deferral comments (rows 3, 4, 5, 6: WITHDRAWN under [S-017]/narrow; row 10: cross-ref to MON-001/007; row 12: collapsed under narrow).
  - `tests/e2e/mon-003.test.js` — all 7 e2e test.todos DEFER with "no installer under prompt-pattern scope; Monitor invocation is agent-runtime-side; e2e requires session runtime, out of repo test scope" rationale.
- OUT OF SCOPE (per F-R018-03 operator narrow 14:12 UTC): Bedrock / Vertex AI / Foundry compatibility docs, `DISABLE_TELEMETRY` / `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` handling, `monitor-unavailable` STATE, version-requirement prose (v2.1.98+), fallback-on-unavailability docs.

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
