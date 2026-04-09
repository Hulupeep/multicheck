# Case study — claims-monorepo calendar consolidation (G-002 + G-003)

**Period**: 2026-04-07 through 2026-04-09
**Project**: `claims-monorepo` (AI-Claims-LLC), property claims management platform
**Milestones**:
- **G-002** — Calendar consolidation (tickets #607-#621, 5-PR stacked chain)
- **G-003** — Operational meetings milestone (tickets #610-#613, started partway through)

**Builder**: Codex (GPT-5)
**Reviewer**: Claude Opus 4.6 (1M context) running as `theboss` via `scripts/agentchat_watchdog.py`

This case study preserves the full audit trail that drove the multicheck v0.5.0 release. Every protocol rule, pre-flight question, hook script, and reviewer recipe added in v0.5.0 has a direct reference to an incident in these files.

---

## Why this case study matters

This is the reference session for multicheck's evolution from pure Phase 1 (markdown-only) to Phase 1.5 (markdown + minimal hooks). Six protocol rules folded into upstream during or immediately after this session:

1. **Heredoc append as the canonical write pattern** — from the race conditions hit by the reviewer's early `Edit`/`Write` attempts against the watchdog
2. **Append-only / monotonic / no middle-inserts** — from the `[S-022..S-025]` mid-file insertion incident and duplicate tag confusion
3. **Pre-flight question set (Q1-Q6, later Q7 reconnaissance)** — from the 4-hour stale-branch-base incident and the reviewer's independent analysis
4. **`hooks/pre-push.sh` branch-base enforcement** — from the same stale-branch incident plus the 2026-04-09 multi-author drift capture in R-041
5. **Harness-failure triage framework** — from the `#611` pino-http / better-auth / app-factory stubbing cascade
6. **Cross-layer value consistency (cascaded slices)** — from the `onboarding.repository.ts` WHERE clause silent regression caught in the #621 pre-promotion audit
7. **External asymmetric reviewer as a documented layer** — from the `#610` `consultation_no_show` cross-layer gap caught by `ruflo/claude-flow agent-code-review-swarm` only

Each of those rules maps to specific entries in the files in this directory. The case study is as instructive as the final protocol state.

---

## Files in this case study

### `agentchat-2026-04-07-calendar-consolidation.md` (2653 lines)

The full archived chat for G-002 calendar consolidation (2026-04-07). Contains:

- The original 5-PR cascade build (#617 → #618 → #619 → #620 → #621)
- `[R-028]` introducing the diff-content check for cascaded files (now PENDING item #1)
- `[R-035]` topology self-correction (now the basis for pre-flight Q2 and `hooks/pre-push.sh`)
- `[R-040]` cross-layer value consistency gap caught by external swarm (now PENDING item #3)
- The first `[G-NNN]` goal packet implementation as a mid-session protocol addition
- The heredoc append pattern discovery and adoption
- 4 pre-emptive builder self-corrections (the headline metric for the session)

**Read this file for**: how the protocol's foundational rules were discovered in real time from real failures, not from design sessions. Also a good reference for the asymmetric builder/reviewer value — 4-of-4 drafted reviewer challenges were obsoleted by builder self-correction before they could be posted.

### `agentchat-2026-04-08-cal-11-04-claimant-entrypoint.md` (1239 lines)

The archived chat for `#610` (cal-11-04 claimant entrypoint). Contains:

- The 4-hour stale-branch-base incident in detail — `[R-035]` through `[R-041]`
- `[R-034]` cross-layer audit that verified the right behavior against the wrong file (file had been renamed between branch base and current main)
- `[R-041]` multi-author drift capture (Robert Fall layered commits on the same branch)
- The recovery and rebuild on a fresh branch from current main
- The #611 pino-http / better-auth / app-factory stubbing cascade (now the motivation for harness-failure triage framework)

**Read this file for**: the canonical example of what happens when topology isn't verified at story start. Also the canonical motivation for the harness triage framework — three rounds of reflexive stubbing followed by the correct answer (app-factory refactor).

### `pr-gate-evolution/`

Three snapshots of the claims-monorepo `specs/pr.md` showing its evolution over 2 days:

- **`pr-2026-04-08-pre-promotion-gate.md`** (198 lines) — early version, §0.5 topology check added, pre-§11a
- **`pr-2026-04-08-promotion-gate.md`** (391 lines) — mid-session version with §11a-§11d added
- **`pr-2026-04-09-current.md`** (563 lines) — post-R-040 version with §11e cross-layer check and §11f persona sweep and §11g external reviewer hook

The evolution is as instructive as the final state. Each section addition maps to a specific reviewer entry in the chat files above. The pr.md file is the project-level Layer 2 in the 3-layer architecture — a project-owned promotion gate that layers on top of multicheck's upstream rules.

**Read these files for**: how a project-level PR gate can co-evolve with upstream multicheck. Each addition is grounded in a specific failure mode the reviewer encountered.

---

## Key incidents indexed by multicheck rule

| Multicheck rule | Incident in this case study |
|---|---|
| Heredoc append hard rule | `agentchat-2026-04-07` reviewer's early `Edit` race failures → switch to `cat >> <<'EOF'` |
| Append-only / monotonic / no middle inserts | `agentchat-2026-04-07` `[S-022..S-025]` mid-file insertion with duplicate tags |
| Pre-flight Q1 goal fit | General; grounded in the goal-divergence rejection template |
| Pre-flight Q2 branch topology | `agentchat-2026-04-08` `[R-035]` 4-hour stale branch base incident |
| Pre-flight Q3 file targets | `agentchat-2026-04-08` `[R-034]` wrong-file-target audit (consultation.repository.ts renamed to meetingsRepository) |
| Pre-flight Q4 scope declaration | `agentchat-2026-04-07` `#607` silent scope expansion from 5 to 7 files |
| Pre-flight Q5 value-set parity | `agentchat-2026-04-07` `[R-040]` `consultation_no_show` cross-layer gap caught by external swarm |
| Pre-flight Q6 end-gate + risk | `agentchat-2026-04-07` `[S-005] → [S-010]` targeted-test-to-bypass chain |
| Pre-flight Q7 reconnaissance | `agentchat-2026-04-08` `#611` pino-http / better-auth / app-factory stubbing cascade |
| Harness-failure triage framework | Same: `#611` three rounds of reflexive stubbing before the correct refactor |
| `hooks/pre-push.sh` | `agentchat-2026-04-08` stale-branch incident + `[R-041]` multi-author drift capture |
| Dress rehearsal note | `agentchat-2026-04-09` five Prettier stops in a single session |
| Cross-layer value consistency check | `agentchat-2026-04-07` `[R-040]` and `agentchat-2026-04-08` `[R-028]` diff-content check |
| Goal packet `[G-NNN]` format | `agentchat-2026-04-07` mid-session introduction of the goal packet |
| External asymmetric reviewer as a layer | `agentchat-2026-04-07` `[R-040]` (external swarm caught what internal reviewer missed) |

---

## Do NOT edit these files

These are preserved as-is for audit trail integrity. If you want to use these patterns for your own project, copy them to your own repo and modify them there. The case study is a historical reference, not a template.

The one exception is this `README.md` — it can be updated if new incidents or new rules reference these case study files.

---

## Session summary (from the reviewer's R-FINAL reports)

**G-002 calendar consolidation (2026-04-06 / 07)**:
- 14 builder entries, 9 reviewer entries
- 4 pre-emptive builder self-corrections (headline metric — 4 of 4 drafted reviewer challenges obsoleted)
- 7 tickets touched, 1 new ticket created mid-session (#614)
- 7 durable `gh` comments left
- 2 commits independently verified
- 6 contract test runs executed by the reviewer
- 1 bypass incident surfaced and remediated
- 1 reviewer recommendation corrected before posting

**G-003 stack promotion + #610 rebuild (2026-04-08)**:
- Stale-branch-base incident: 4 hours of wasted work
- R-034 wrong-file-target audit
- R-035 reviewer self-correction on topology
- R-040 cross-layer gap caught by external swarm
- R-041 multi-author drift capture

**G-003 #611 harness cascade (2026-04-09)**:
- pino-http reflexive stub
- better-auth reflexive stub
- app-factory refactor (the correct answer, reached as the third choice)
- 5 Prettier stops in a single session
- Multicheck_upd.md handoff document produced with 11 proposals
- Full v0.5.0 batch fold-in of 4 items
