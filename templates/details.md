# Project Details

<!--
Filled by the builder during Phase 0 setup.
Do not leave placeholders. Use real values from the target repo.
The reviewer reads this as source of truth — inaccurate details = unverifiable session.

The full protocol summary is NOT in this file. It lives in:
- CLAUDE.md (reviewer instructions, auto-loaded by Claude Code)
- AGENTS.md (builder instructions, auto-loaded by Codex)
- multicheck/.framework/REVIEWER.md and BUILDER.md (full specs)

This file is for project-specific brief + session state. The "Active Protocol"
section near the bottom is the manually-maintained session-state summary —
chat path, active goal, any session-specific overrides. The builder updates it
as the session evolves.
-->

## Pairing

<!--
Closed enum — three accepted values. Set once per session during Phase 0.
Operator declares via BUILDER.md Phase 0 step 6 prompt; the chosen value is
written here. install-monitors.sh reads this key and installs Claude-side
Monitor config only on the Claude terminal(s). Absent or invalid value → the
installer fails closed.

Three accepted values (closed enum):

- codex-builder+claude-reviewer   ← default per README v0.5.3 §Current provider pairing recommendation
- claude-builder+codex-reviewer   ← flipped; preserves asymmetric blind-spots
- claude-builder+claude-reviewer  ← same-provider; loses ~80% of asymmetric-blind-spots value per README §Why it works

Pairing flip mid-session: post `STATE: pairing-flip`, post a new [G-NNN] goal
packet, update this line, re-run Phase 0 step 5 (anchor refresh), re-run
install-monitors.sh. See REVIEWER.md §Pairing flip handling.
-->
pairing:

## Repo
- URL:
- Branch:
- Local path:
- Latest commit:

## Board / Tickets
- Source: <gh | linear | jira | file>
- URL:
- Current focus issues:

## Objective
<!-- One paragraph: what this project does and the current goal -->

## Wave plan
<!-- Numbered list of waves with the issue numbers in each -->
- W1:
- W2:
- W3:

## Environments
- Local URL:
- Production URL:
- Staging URL (if any):

## Database
- Provider:
- How to query (CLI / connection / dashboard):
- Key tables relevant to current work:

## Deploy
- Platform:
- Auto-deploy branch:
- How to verify a deploy is live:

## In-scope files (per current ticket)
<!--
The exact file list this ticket is allowed to touch.
If the builder commits a file not on this list, they must first post STATE: scope-expansion.
Update this section when starting a new ticket.
-->
- Ticket #:
- Files:

## End-gate command
<!--
The EXACT command the pre-commit hook runs. Not a targeted subset.
A targeted test (--runTestsByPath, --grep, -k, --filter) does NOT count as the end gate.
This is what the builder must run before declaring STATE: ready-for-review.
-->
- Local:
- Production:

## Test
- Run locally:
- Run against production:
- Last known green:

## Verification Surfaces (reviewer fills during Phase 0 capability check)
<!--
The reviewer must prove it can actually use each surface.
If a surface fails, the reviewer's authority on related claims is downgraded to "code-only"
and the reviewer must say so in every relevant verdict.
-->
- [ ] Test command runnable — `passed | failed`
- [ ] Production URL reachable — `passed | failed`
- [ ] Database queryable — `passed | failed`
- [ ] gh issue comments postable — `passed | failed`
- [ ] Screenshots possible (UI work only) — `passed | failed | n/a`

## Baseline health (reviewer fills during Phase 0, BEFORE builder begins)
<!--
The reviewer runs the end-gate command on origin/main and records the result here.
This is what makes "unrelated baseline failure" claims verifiable, not assertable.
Pre-existing failures discovered now are not the builder's problem.
Pre-existing failures discovered later become disputes that burn hours.
-->
- Date (UTC):
- Commit (HEAD):
- End-gate result:
- Pre-existing failures:
- Pre-existing warnings:

## Reviewer First Checks (per-ticket)
<!--
Per-ticket items the reviewer must verify item-by-item before accepting the slice.
NOT the same as the pre-flight Q1-Q7 (which is per-story-start) or the pr.md gate
(which is per-PR). These are the content-level checks specific to this ticket.

The reviewer MUST post a structured block in their verdict entry with PASS/FAIL/SKIP
per item — not narrative prose, not "covered organically." Every item from this section
must appear in the reviewer's output. See REVIEWER.md "Structured first-checks output."

Example items (customize per ticket):
- Authorization check on any new state-mutating endpoint
- New enum values appear in all declared layers (DB / Drizzle / TS / Zod / switches)
- Migration is reversible (has a down migration or documented manual rollback)
- Test covers the error path, not just the happy path
- No hardcoded secrets, API keys, or credentials
-->
-
-
-

## Definition of Done
- [ ] Code matches the ticket
- [ ] In-scope file list matches the committed file list (or a scope-expansion entry exists)
- [ ] End-gate command passes (full, not subset)
- [ ] Tests pass against production (if applicable)
- [ ] Real user flow verified, DB rows confirmed (if applicable)
- [ ] Evals pass (if declared — see Evals section below)
- [ ] Reviewer signed off in agentchat.md
- [ ] gh issue comment posted with proof and timestamp

## Evals
<!--
Optional. For complex logic where unit tests are insufficient, list custom evals that prove
the slice is done. Evals are project-owned — multicheck just has a slot for them.

An eval is a custom verification script that probes a specific behavior. Examples:
- A script that replays a known production incident and confirms the fix prevents recurrence
- A probabilistic check that runs a classifier against 100 inputs and confirms 95%+ correct
- A differential test that compares the new implementation's output against the old one
  across a fixed corpus
- A long-running test that exercises a code path under memory pressure

Evals become more valuable as builder model capability increases — unit tests catch what they
were written to catch; evals catch what you actually care about.
-->
- Eval name: <path to eval script>
  - What it tests: <one-line description>
  - Pass criteria: <specific output that proves done>
  - Run command: <exact command the reviewer will run>

## Open blockers / human authorization required
<!-- Any item that requires the human operator. Be explicit. -->
-

## Notes
<!-- Anything else the reviewer needs to verify the work -->

## Active Protocol
<!--
Session-state summary, manually maintained by the builder/operator.
This is the "what's currently true for this session" section, distinct from
the stable protocol anchors in CLAUDE.md / AGENTS.md.

Update this whenever the chat path moves (e.g., after archive-request rotation),
when a new [G-NNN] becomes active, or when session-specific protocol overrides
are agreed.
-->

- **Live chat path**: `multicheck/agentchat.md` (or `specs/agentchat.md` if pre-rotation)
- **Active goal**: `[G-NNN]` (cite the goal packet number)
- **Framework version**: `multicheck c<commit-sha>` (from `multicheck/.framework/`)
- **Pairing**: Claude reviewer + Codex builder (or note if flipped)
- **Session-specific overrides**: none (or list)
- **For full protocol**: see `CLAUDE.md` (reviewer) / `AGENTS.md` (builder) / `multicheck/.framework/`
