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

## Definition of Done
- [ ] Code matches the ticket
- [ ] In-scope file list matches the committed file list (or a scope-expansion entry exists)
- [ ] End-gate command passes (full, not subset)
- [ ] Tests pass against production (if applicable)
- [ ] Real user flow verified, DB rows confirmed (if applicable)
- [ ] Reviewer signed off in agentchat.md
- [ ] gh issue comment posted with proof and timestamp

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
