# multicheck — catches from real sessions

Aggregate catch log across multicheck sessions and operators. Format spec is in `METRICS.md`. New session catches go in `<target-project>/multicheck/metrics.md` first; operators may PR them upstream into this file.

This file is **append-only**. New sessions add rows at the end. Existing rows are never edited or deleted (except for typo fixes by maintainers).

If you are an operator who wants to add your session's catches, see the "Sharing back upstream" section in `METRICS.md`.

---

## Catch types legend

| Type | Meaning |
|---|---|
| `pre-emptive-self-correction` | Builder caught its own mistake before the reviewer challenged (highest-value behavior) |
| `process-violation` | --no-verify, --force, undisclosed scope expansion, missing tagged disclosure, anti-vocabulary, middle-insert |
| `technical-bug` | Code is wrong; reviewer caught a real defect |
| `goal-divergence` | Work technically clean but doesn't advance the active [G-NNN] goal |
| `near-miss` | Almost shipped wrong; caught pre-commit or pre-merge |
| `wrong-file` | Builder edited a file production doesn't import from |
| `test-gap` | Test passes but asserts the wrong thing |
| `slice-impurity` | Stacked PR commit contains files outside declared scope |
| `bonus-structural-verification` | Reviewer verified an invariant the builder didn't claim |
| `recommendation-corrected` | Reviewer caught its own draft fix that would have created inconsistency |
| `baseline-pre-existing-failure` | Pre-flight on origin/main surfaced a failure before builder began |
| `heredoc-race-avoided` | Heredoc append succeeded where Edit/Write would have raced |
| `other` | Other; explained in Description |

Severity: `low` | `medium` | `high` | `critical`. Caught by: `builder` | `reviewer` | `operator` | `hook` (as of v0.5.0 — mechanical catches by `hooks/pre-push.sh` or similar).

---

## Catches

| Date | Catch type | Severity | Caught by | Description | Evidence |
|---|---|---|---|---|---|
| 2026-04-06 | pre-emptive-self-correction | medium | builder | builder corrected own [S-004] "compile-time pre-existing @claims/errors" misdiagnosis — was actually runtime + wrong file (`pipeline.schema.ts` not `pipeline-engine.test.ts`); caught self before reviewer challenged | [S-007] |
| 2026-04-06 | pre-emptive-self-correction | medium | builder | builder surfaced runtime-meetings absence as a #608 blocker, created #614 mid-session, posted on #606 + #608 — caught self before reviewer raised the dependency | [S-008] |
| 2026-04-06 | pre-emptive-self-correction | high | builder | builder acknowledged the [S-010] `--no-verify` bypass was a process mistake, re-verified failure on origin/main, corrected the file citation; posted before reviewer's planned challenge could land | [S-013] |
| 2026-04-06 | pre-emptive-self-correction | medium | builder | builder executed baseline remediation broader than reviewer's [R-006] scope estimate, surfacing the work proactively | [S-014] |
| 2026-04-06 | process-violation | high | reviewer | builder used `git commit --no-verify` on commit 58327df claiming "unrelated baseline failure"; reviewer reproduced the failure independently, confirmed it was real, but flagged the bypass as a CLAUDE.md violation regardless of root cause; two-axis verdict technical-accept process-reject | [R-006], commit 58327df |
| 2026-04-06 | slice-impurity | medium | reviewer | #607 silently expanded from 5 in-scope files (per details.md) to 7 committed files; jest.config.cjs and tsconfig.jest.json added without prior disclosure | grep against details.md vs `git show 5f90949 --name-only` |
| 2026-04-06 | technical-bug | medium | reviewer | builder cited test file `pipeline-engine.test.ts` for the failure; reviewer grepped and got zero matches; the actual file was `pipeline.schema.ts` lines 60/69/78/82/89 | `git grep "z.uuid" pipeline-engine.test.ts` returned 0; `grep -rn` found the real location |
| 2026-04-06 | goal-divergence | high | reviewer | builder proposed cutting #608 onboarding read-path before #609 booking write-path; ordering would have regressed onboarding because legacy callers still target the old table | reviewer inspected `consultation.repository.ts` and `onboarding.repository.ts` directly; corrected order is #607 → #614 → #609 → #608 |
| 2026-04-06 | bonus-structural-verification | medium | reviewer | builder claimed `meetings.case_id` is non-null per the migration; reviewer verified at BOTH the migration DDL (line 4) AND the Drizzle TS schema (lines 12-13) — stronger invariant than the builder claimed | [R-008] |
| 2026-04-06 | recommendation-corrected | high | reviewer | reviewer drafted a fix recommendation in [R-006] that would have only patched `pipeline.schema.ts`; before posting, reviewer grepped wider and found 3 other packages using the same `z.uuid()` pattern — recommendation would have created cross-package syntax inconsistency | [R-009] (corrected version) |
| 2026-04-06 | baseline-pre-existing-failure | high | reviewer | post-hoc finding (not caught at pre-flight): the `pipeline.schema.ts` zod failure was pre-existing on `origin/main` from before session start. If reviewer had run mandatory Phase 0 baseline health check on origin/main, the failure would have surfaced as someone else's problem and the entire `--no-verify` bypass conversation would not have happened | reference session post-mortem; led to the baseline health check rule in REVIEWER.md |
| 2026-04-06 | heredoc-race-avoided | low | reviewer | reviewer hit "file modified since read" 3 times using Edit/Write against agentchat.md while watchdog was running; switched to `cat >> file <<'EOF'` heredoc append pattern; subsequent ~10 writes had zero races | reviewer meta-review session 1 |
| 2026-04-06 | process-violation | medium | reviewer | builder tooling middle-inserted entries [S-022..S-025] at line ~401 with duplicate S-023 and S-025 tags; reviewer reconstructed correct order from offsets but flagged the violation; led to "append-only / monotonic / no middle inserts" hard rule | reference session file disorder, ENTRY_RE offset detection |
| 2026-04-06 | other | low | operator | watchdog auto-tag `R-AUTO` did not match the watchdog's own ENTRY_RE regex `[A-Z]-\d+`, so R-AUTO entries were unparseable by the watchdog itself; tooling bug surfaced by reviewer's session 2 meta-review | scripts/agentchat_watchdog.py ENTRY_RE |
| 2026-04-07 | slice-impurity | medium | reviewer | verified 5-PR cascade rebase chain by `git diff --name-only A..B` between every adjacent commit (#617 → #618 → #619 → #620 → #621); each diff matched declared scope file-for-file; no contamination found, but the recipe itself caught a pre-rebase impurity in the prior round | reviewer's slice-purity verification recipe |
| 2026-04-07 | process-violation | high | reviewer | builder made TWO substantive changes (deprecated z.uuid() patch round + test file fix round) without posting tagged [S-029]/[S-030] disclosures; reviewer reconstructed timeline from `git log` and demanded backfill before allowing the audit trail to freeze; led to "missing tagged disclosure" being added to the process violations list in REVIEWER.md | [R-021] |
| 2026-04-07 | other | medium | reviewer | reviewer almost incorrectly accused builder of false claims because `git grep "z.uuid" fix/zod-v4-uuid-baseline` returned the original (uncommitted-fix) string; should have used filesystem `grep -rn` for staged-but-uncommitted changes; caught by reviewer self-check before posting | reference session — added "Working-tree grep vs git ref grep" gotcha to REVIEWER.md |
| 2026-04-07 | technical-bug | high | reviewer | builder wrote `z.uuid()` fix, then wrote a revert, but left `invitation-routes.test.ts:27` inconsistent with the canonical pattern; caught by reviewer (different model than builder); same-model pairing would have missed it because the builder's blind spot was the same in both writes | invitation-routes.test.ts:27 |
| 2026-04-07 | bonus-structural-verification | medium | reviewer | builder claimed `case_id` was non-null per the migration; reviewer went beyond the ask and verified at BOTH the migration DDL AND the Drizzle TS schema layers — stronger guarantee than what was claimed | [R-008] (also recorded earlier as a separate row from session 1) |
| 2026-04-07 | other | high | reviewer | CI trigger gap on stacked PR #618: GitHub Actions silently filtered the workflow because `pull_request: branches: [main] + base-change-doesn't-fire-synchronize`; neither builder nor CI itself flagged it because both were looking at the wrong angle of the event stream; caught by reviewer checking the CI from outside the builder's perspective | #618 GitHub Actions, known stacked-PR pattern |
| 2026-04-07 | other | medium | reviewer | `feature_calendar_service.yml` was not registered in `CONTRACT_INDEX.yml` on `origin/main`; PR #601 added other contracts without registering the calendar contracts; caught by reviewer's independent grep against origin/main, not by reading the working tree | grep CONTRACT_INDEX.yml on origin/main |
| 2026-04-07 | other | critical | builder | builder diagnosed mid-session protocol drift caused by rules living only in the running ledger (`specs/agentchat.md`), not in any stable project-memory file; created Active Protocol section in `specs/details.md` as local fix; led to upstream `protocol-summary` template + 3-file refresh in Phase 0, later refined to role-split (claude-md.md / agents-md.md) at multicheck commit 529c9b5 | claims-monorepo [S-046], multicheck commits db0c8bf and 529c9b5 |
| 2026-04-07 | other | high | operator | reviewer self-assessment: spent [R-018], [R-022], [R-025], [R-026] flagging symptoms of stable-context-file gap (duplicate tags, middle inserts, format drift) without identifying the root cause; the builder caught the root cause in [S-046] before the reviewer did; reviewer was treating symptoms not the disease | reference session R-FINAL self-assessment |
| 2026-04-07 | process-violation | medium | reviewer | builder used non-canonical heading format `[S-NNN][builder][datestamp]` (vs the canonical `### [S-NNN] HH:MM UTC — #ticket`) for entries S-029 through S-034; format drift wasn't detected immediately because the watchdog silently skipped unparseable entries instead of escalating; led to "fail-loud watchdog" recommendation for Phase 2 | S-029 to S-034 format drift |
| 2026-04-07 | near-miss | high | reviewer | silent condition drift during cascade rebase in `onboarding.repository.ts`: WHERE clause simplified from 3 conditions to 2 during conflict resolution, which would have counted cancelled and no-show meetings as "consultation exists" and broken onboarding readiness gating in production; slice-purity check (`git diff --name-only`) showed the file in scope with expected size delta but did NOT detect the content regression; caught by pre-promotion audit running `git diff <prior>..<current> -- <file>`; exposes a gap in the existing slice-purity verification recipe — rule queued in PENDING.md item #1 for fold-in after data-collection freeze | claims-monorepo pre-promotion audit, calendar consolidation cascade, PENDING.md #1 |
| 2026-04-08 | near-miss | high | reviewer | stale branch base went undetected through every stage 0 gate: builder `git checkout`-ed an existing `calendar/cal-11-04-11-07-meeting-lifecycle-milestone` branch created weeks earlier during G-002 without verifying its base against current `origin/main`; `git merge-base HEAD origin/main = 325095ea` (weeks-old) vs `git rev-parse origin/main = 10b7065c` (current); PR diff contained ~20+ `.changeset/*` files plus already-merged G-002 work; 4 hours of builder work had to be thrown out and redone on a fresh branch from current `origin/main`; targeted tests + husky hook + gotcha checklist + prior reviewer findings all passed because none of them check branch topology; caught only at stage 3 `pr.md` audit when the PR diff was actually computed; exposes a foundational invariant gap, not a recipe refinement — rule queued in PENDING.md item #2 for fold-in after data-collection freeze | claims-monorepo G-003 #610 branch, PENDING.md #2 |
| 2026-04-08 | test-gap | high | reviewer | reviewer's `[R-034]` audit verified the right behavior against the wrong file target: audit checked `consultation.repository.ts` for the createdByUserId / legacyConsultationWrite / schema validation findings, but that file had been deleted/renamed to `meetingsRepository` between the stale branch base and current main; audit verdict was technically correct against the file that existed at the branch base, but completely irrelevant to current main where the file no longer existed; caught by the builder when a cherry-pick failed on the missing file during rebuild; secondary finding from the stale-branch incident — had the branch base been verified at slice start, the wrong-file-target condition would never have existed because the rename would have forced a rebase before any audit began | `[R-034]`, claims-monorepo G-003 #610 rebuild, PENDING.md #2 (root cause) |
| 2026-04-08 | technical-bug | high | reviewer | cross-layer enum drift in claims-monorepo #610: SQL migration added `consultation_no_show` enum value but the corresponding TypeScript union type in `booking.types.ts` was not updated; would have caused a runtime type mismatch when the DB returned the new status value; NOT caught by `pr.md` slice-purity/topology/content gates; NOT caught by the primary internal reviewer; caught by EXTERNAL `ruflo/claude-flow agent-code-review-swarm` running as a third reviewer layer on the final PR head; the swarm's "architecture agent" persona prompts for layer violations and SOLID/DRY consistency, which primed the underlying LLM to spot the enum/type drift that the other two reviewers missed; empirical validation of the multi-reviewer asymmetry thesis at N=3 (pr.md + primary reviewer + external swarm) — queued in PENDING.md items #3 (cross-layer value consistency recipe) and #4 (specialist-persona sweep), plus meta-observations M3 (multi-reviewer asymmetry is multicheck's core thesis) and M4 (external swarm as optional third reviewer layer) | claims-monorepo #610, PR #636, `ruflo/claude-flow agent-code-review-swarm` |

---

## Aggregate stats

These are derived from the rows above and should be re-derived (not manually maintained) when this file grows substantially.

- **Total catches logged**: 25
- **Sessions represented**: 2 (2026-04-06 calendar consolidation, 2026-04-07 stack rebase + protocol meta-fixes)
- **Pre-emptive self-corrections**: 4 (16% of all catches, all from session 1)
- **Process violations**: 4 (--no-verify, middle-insert, missing disclosure, format drift)
- **Technical bugs caught**: 2
- **Reviewer recommendations corrected before posting**: 1
- **Bonus structural verifications**: 2 (going beyond the ask)
- **Asymmetric-blind-spot catches**: 2 confirmed (z.uuid round-trip, file citation error) — these would have been missed by same-model pairing
- **High-or-critical severity**: 9
- **Operator catches**: 2 (one tooling bug, one reviewer self-assessment)
- **Catches that produced new protocol rules**: 9
  - `baseline-pre-existing-failure` → mandatory pre-flight in REVIEWER.md
  - `process-violation` middle-insert → append-only / monotonic hard rule
  - `process-violation` missing disclosure → first-class rejection ground
  - `recommendation-corrected` → wider grep before posting recipe
  - `other` git ref grep gotcha → working-tree grep recipe in REVIEWER.md
  - `heredoc-race-avoided` → canonical write pattern, hard rule in both BUILDER.md and REVIEWER.md
  - `other` stable-context-file gap → role-split CLAUDE.md / AGENTS.md anchoring (Phase 0 step 5)
  - `process-violation` format drift → STATE vocabulary extensibility doc + state-your-model in R-001
  - 3-layer architecture documented in README

**~36% of catches in the seed data produced new protocol rules.** That ratio will drop as the protocol matures, but the metrics file is also the input that drives those improvements. Honest catch logging is what makes the protocol self-correcting.

## What the data says about value

Looking at catch type distribution across the seed:

| Catch type | Count | % of total |
|---|---|---|
| process-violation | 4 | 16% |
| pre-emptive-self-correction | 4 | 16% |
| other (mostly meta/protocol) | 5 | 20% |
| recommendation-corrected | 1 | 4% |
| technical-bug | 2 | 8% |
| bonus-structural-verification | 2 | 8% |
| slice-impurity | 2 | 8% |
| goal-divergence | 1 | 4% |
| baseline-pre-existing-failure | 1 | 4% |
| heredoc-race-avoided | 1 | 4% |

**Code defects (`technical-bug`) are 8% of catches. Process and meta findings are ~60%.** This is the dominant value the protocol delivers — automated tooling already catches code bugs at 90% recall; what it doesn't catch is process discipline erosion. Multicheck's value is in the 60%, not the 8%.

The asymmetric-blind-spots argument (different-model-pairing > same-model-pairing) is empirically validated by 2 specific catches in the seed where a same-model pairing would have missed the finding because the builder's blind spot was the same in both writes.
