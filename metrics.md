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

Severity: `low` | `medium` | `high` | `critical`. Caught by: `builder` | `reviewer` | `operator`.

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

---

## Aggregate stats

These are derived from the rows above and should be re-derived (not manually maintained) when this file grows substantially.

- **Total catches logged**: 17
- **Sessions represented**: 2 (2026-04-06 calendar consolidation, 2026-04-07 stack rebase)
- **Pre-emptive self-corrections**: 4 (24% of all catches, all from a single session)
- **Process violations**: 3 (--no-verify, middle-insert, missing disclosure)
- **Reviewer recommendations corrected before posting**: 1 (would have created cross-package inconsistency)
- **High-or-critical severity**: 6
- **Operator catches**: 1 (tooling bug, not a missed protocol catch)
- **Catches that produced new protocol rules**: 6 (`baseline-pre-existing-failure` → mandatory pre-flight; `process-violation` middle-insert → append-only rule; `process-violation` missing disclosure → first-class rejection ground; `recommendation-corrected` → wider grep before posting; `other` git ref grep gotcha → grep recipe; `heredoc-race-avoided` → canonical write pattern)

The last bullet is the most important one: **1 in 3 catches in the seed data resulted in a protocol improvement.** That ratio will drop as the protocol matures, but the metrics file is also the input that drives those improvements. Honest catch logging is what makes the protocol self-correcting.
