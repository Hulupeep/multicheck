# PENDING — queued protocol changes during data-collection freeze

This file lists protocol changes proposed during a data-collection freeze period. **Items here are NOT in the protocol yet.** They will be batched and folded into a single "protocol v1.x" commit when the freeze ends.

## Freeze rules

During the freeze:

- Only bug fixes to existing rules are allowed upstream
- New rules, new vocabulary, new templates, new verification recipes are **queued here**
- Session-specific application IS allowed via `multicheck/details.md` "Active Protocol" section (Layer 3 of the 3-layer architecture) — that's explicitly for session-specific overrides
- **Do NOT** modify `CLAUDE.md` / `AGENTS.md` in the target project mid-session — those are Layer 2 project anchors that mirror the frozen upstream. Modifying them creates drift.
- Catches still flow into `metrics.md` (that's data, not protocol — append-only is fine during the freeze)

When the freeze ends, this file gets read through, each queued item is folded (or rejected with rationale), and the file is reset to empty with a comment linking to the fold-in commit.

## Why the freeze

If the protocol changes every day, we can't compare session N to session N-1 — the rules under which each session ran are different, so the metrics distribution stops being meaningful. The freeze is a 3-5 day window of rule stability so that 3+ sessions produce comparable data. See README.md "3-layer architecture" + the freeze-rationale commentary in the PR that introduced this file.

---

## Queued items

### 1. Diff-content check for cascaded files

- **Date queued**: 2026-04-07
- **Source**: live `claims-monorepo` session reviewer, mid-session feedback
- **Proposed location**: `REVIEWER.md` "Verification recipes" section, after the "Working-tree grep vs git ref grep" recipe
- **Secondary location**: add as rule #8 (or next available) in `templates/claude-md.md` top rules
- **Severity**: high — caught a near-miss that would have shipped a production-breaking regression
- **Metrics evidence**: see `metrics.md` row dated 2026-04-07, catch type `near-miss`

#### Incident

In a 5-PR calendar consolidation cascade, the WHERE clause in `onboarding.repository.ts` was silently simplified from 3 conditions to 2 during cascade rebase conflict resolution. The slice-purity check (`git diff --name-only`) reported the file as "in slice scope with expected size delta" — it did not detect the content drift. The bug would have counted cancelled and no-show meetings as "consultation exists" and broken readiness gating in production. Caught by a pre-promotion audit using `git diff <prior>..<current> -- <file>`, not by the slice-purity recipe.

#### Proposed rule text

To be edited during fold-in. Reviewer's verbatim draft:

> ### Diff-content check for cascaded files
>
> When a file is touched across multiple slices in a stacked PR cascade, verify the file's **content** at each cascade SHA, not just whether the filename appears in the slice diff.
>
> `git diff --name-only A..B` shows WHICH files changed between commits. It does NOT detect content drift within an already-touched file scope. A rebase conflict resolution can silently mutate a file's contents while preserving the file's presence in the slice.
>
> **Reference incident**: in a 5-PR calendar cascade, the consultation-status filter in `onboarding.repository.ts` was lost during a cascade rebase. The slice-purity check (`git diff --name-only`) reported the file as "in slice scope, expected size delta" while the file's WHERE clause had silently simplified from 3 conditions to 2 conditions. The regression shipped through multiple reviewer verdicts before a pre-promotion audit caught it. The bug would have caused onboarding to incorrectly count cancelled and no-show meetings as "consultation exists", silently breaking the readiness gating in production.
>
> **Rule**: for any file appearing in multiple cascade SHAs, run:
>
> ```bash
> git diff <prior-cascade-sha>..<current-cascade-sha> -- <file>
> ```
>
> ...and check that the diff is either empty (file unchanged) or matches the slice's intended additions. Surprising deletions, condition simplifications, or removed function arguments are silent regressions.
>
> This is especially important when:
>
> - A file is touched by both an early slice and a late slice in the cascade (the early slice's content is at risk during the late slice's rebase conflict resolution)
> - A file has multi-condition predicates (`and(...)`, `or(...)`) where conditions can be silently dropped
> - The slice's tests only verify call sites, not call arguments

#### Action during freeze

- **Upstream `REVIEWER.md`**: no change (queued here)
- **Upstream `templates/claude-md.md`**: no change (queued here)
- **Target project `CLAUDE.md`**: no change (Layer 2, mirrors frozen upstream)
- **Target project `multicheck/details.md` "Active Protocol"**: **DO** add a one-bullet session-scoped reminder. Example bullet:
  > For files touched by multiple slices in a stacked cascade, run a diff-content check (`git diff <prior>..<current> -- <file>`), not just a filename check. Slice-purity (`git diff --name-only`) misses silent content drift from rebase conflict resolution. See PENDING.md item #1 in the multicheck upstream for the full incident writeup — rule will be folded upstream when the freeze ends.

#### Fold-in plan

When the freeze ends:

1. Copy the proposed rule text into `REVIEWER.md` "Verification recipes" section, after the "Working-tree grep vs git ref grep" recipe
2. Add a one-line cross-reference in `templates/claude-md.md` top rules: *"For cascaded stacked PRs, run diff-content check — see REVIEWER.md 'Diff-content check for cascaded files'."*
3. Delete this queued item from `PENDING.md`
4. The commit message should cite the incident and the metrics.md row so future operators can trace the rule back to the originating near-miss

---

### 2. Branch-base sanity check at slice start

- **Date queued**: 2026-04-08
- **Source**: live `claims-monorepo` session reviewer, mid-session feedback
- **Proposed location**: `BUILDER.md` Phase 0 / slice-start section — **this is a new foundational invariant**, belongs near the top as a pre-condition for every slice, not inside the "Verification recipes" section
- **Secondary locations**: `REVIEWER.md` Phase 0 pre-flight (reviewer verifies builder's merge-base claim), `templates/agents-md.md` and `templates/claude-md.md` top rules
- **Severity**: high — cost 4 hours of wasted work in a real session; exposed a blind spot every existing stage 0 gate missed
- **Metrics evidence**: see `metrics.md` rows dated 2026-04-08, catch types `near-miss` and `test-gap`

#### Incident

In a live session G-003 slice, the builder started work on ticket #610 by `git checkout`-ing an existing branch `calendar/cal-11-04-11-07-meeting-lifecycle-milestone` that had been created weeks earlier during G-002. They did not verify the branch base against current `origin/main`. All existing stage 0 gates passed:

- **Targeted tests green** — true (tests run against the working tree, not the merge context)
- **Husky pre-commit hook passed** — true (hook checks Prettier + contract suite, not branch topology)
- **Gotcha checklist passed** — true (documented checklist did not include branch-base verification)
- **Prior reviewer findings addressed** — true (builder applied `[R-034]` findings to the file they were editing)

All four claims were factually correct. The builder posted `STATE: ready-for-review` in good faith. The problem was invisible until the `pr.md` audit at stage 3 computed the PR diff and surfaced the stale merge-base as a slice-purity violation:

- `git merge-base HEAD origin/main` → `325095ea` (weeks-old)
- `git rev-parse origin/main` → `10b7065c` (current)
- PR diff contained ~20+ `.changeset/*` files plus already-merged G-002 calendar work

The branch was based on a stale main from before those had landed. 4 hours of work had to be thrown out and redone on a fresh branch from current `origin/main`.

**Secondary finding** (logged as separate metrics row): the reviewer's prior `[R-034]` audit had verified the right *behavior* against the *wrong file target*. The audit checked `consultation.repository.ts`, but `consultation.repository.ts` had been deleted/renamed to `meetingsRepository` between the branch base and current main. The builder caught this when a cherry-pick failed on the missing file during the rebuild. **If the builder had done fresh implementation from scratch on current main instead of checking out the stale branch, both problems would have been impossible.**

#### Proposed rule text

To be edited during fold-in. Reviewer's verbatim draft (paraphrased):

> ### Branch-base sanity check
>
> Before posting `[S-NNN] STATE: building` for a new slice, verify the branch you are working on is based on current `origin/main`. The sequence:
>
> ```bash
> git fetch origin
> git rev-parse origin/main                      # current main HEAD
> git merge-base HEAD origin/main                # base this branch is built from
> git log --oneline origin/main..HEAD            # what's on this branch, not on main
> git log --oneline HEAD..origin/main            # what's on main, not on this branch
> git diff --name-only origin/main...HEAD        # three-dot: files added vs common ancestor
> ```
>
> **Rule**: `git merge-base HEAD origin/main` must equal `git rev-parse origin/main` (or be within the last few commits of it, depending on how long `origin/main` has been advancing during the session). If it doesn't match, **either rebase the branch onto `origin/main` OR create a fresh branch from `origin/main`** before writing any code.
>
> **PROOF section of the first `[S-NNN]` entry for the slice must include**:
>
> ```
> PROOF:
> - git fetch origin: <result>
> - git rev-parse origin/main: <sha>
> - git merge-base HEAD origin/main: <sha>
> - Branch base matches current main: YES | NO (with rebase plan if NO)
> - git diff --name-only origin/main...HEAD: <file count + spot-check>
> ```
>
> **Why every existing gate misses this**:
>
> - Targeted tests (`--runTestsByPath`) run against the working tree, not the merge context. They don't know or care what `origin/main` looks like.
> - Pre-commit hooks check file content in isolation. They don't verify branch topology.
> - The existing "slice-purity" verification recipe (`git diff --name-only A..B`) measures what changed between two commits but doesn't verify either commit is based on current main.
> - PR diff / merge-base issues are only surfaced when someone computes the actual merge context — which usually happens at stage 3 (PR audit) or stage 4 (CI). By then hours of work have accumulated on the wrong base.
>
> **Especially important when**:
>
> - You are resuming work on a branch created in an earlier feature set or session
> - The feature set branch has been sitting while other work merged to `main`
> - A previous reviewer audit verified the file against an older main state (the audit itself can be stale-against-current-main even when the file is correct-against-old-main)
> - File renames or deletions between branch base and current main will silently mask incorrect file targets

#### Action during freeze

- **Upstream `BUILDER.md` / `REVIEWER.md` / `templates/*`**: no change (queued here)
- **Target project `CLAUDE.md` / `AGENTS.md`**: no change (Layer 2 mirrors frozen upstream)
- **Target project `docs/review-process.md`**: **DO NOT modify during freeze.** Even though this file is project-owned and not mirrored from multicheck, adding a new stage 0 rule mid-session changes what future sessions run under, which breaks session-to-session comparability — the whole point of the freeze. The reviewer should defer this edit until the freeze ends and the upstream fold-in lands. At that point, updating `docs/review-process.md` becomes part of the unfreeze batch.
- **Target project `multicheck/details.md` "Active Protocol" (or `specs/details.md` in legacy layout)**: **DO** add a session-scoped bullet. Example:
  > Before posting `[S-NNN] STATE: building` for a new slice, run `git fetch && git merge-base HEAD origin/main` and verify it equals `git rev-parse origin/main`. If not, rebase or create a fresh branch from `origin/main` before writing code. Include the merge-base SHA in the PROOF section of the first slice entry. See PENDING.md item #2 in the multicheck upstream for the full incident writeup — rule will be folded upstream when the freeze ends.

#### Fold-in plan

When the freeze ends:

1. Add the recipe to `BUILDER.md` as a new "Branch-base sanity check" section inside Phase 0 (before the message format section, since it's a pre-condition for every slice). Include the mandatory PROOF fields.
2. Add a matching entry to `REVIEWER.md` Phase 0 pre-flight: reviewer should verify the builder's merge-base claim on the first `[S-NNN]` of each slice before accepting anything downstream.
3. Add a one-line cross-reference in `templates/agents-md.md` top rules: *"Before `STATE: building` on any slice, run branch-base sanity check — see BUILDER.md 'Branch-base sanity check'."*
4. Add to `templates/claude-md.md` reviewer rules: *"Verify branch-base claims on the first `[S-NNN]` of every slice."*
5. Delete this queued item from `PENDING.md`
6. Update `claims-monorepo/docs/review-process.md` stage 0 at the same time (operator or reviewer action, not mine)
7. Commit message cites both metrics.md rows (the stale-branch near-miss AND the wrong-file-target audit finding) so future operators can trace the rule back to the incident

#### Why this is a bigger rule than #1

Item #1 (diff-content check) addresses a gap in the existing slice-purity recipe — it's a refinement of something the protocol already does.

Item #2 (branch-base check) addresses a gap that **every existing stage 0 gate misses**. It's a **new foundational invariant** rather than a refinement. When folded in, it probably belongs near the top of BUILDER.md Phase 0 because it's a pre-condition for every slice, not just cascaded ones. Mentally file this as "protocol v1.x architectural addition" rather than "recipe tweak."

It's also the first rule in the queue that would benefit from **automated enforcement** — a husky pre-commit hook or a git hook that runs the merge-base check on every commit would catch this before any `STATE: building` entry gets posted. That's a Phase 2+ tooling consideration, but worth noting. The markdown rule alone is not enough; the builder in the live session was entirely reasonable and still missed it because the existing checklist didn't include the check.

#### Local deviation applied (2026-04-08)

The claims-monorepo live session reviewer chose to apply this rule at Layer 2 (project-level `docs/review-process.md`) **in addition to** Layer 3, despite the freeze recommendation to apply at Layer 3 only. Their reasoning:

- `docs/review-process.md` is project-owned by the reviewer (they created it in G-003)
- Not mirrored from multicheck upstream → not covered by the multicheck freeze
- Layer 1 (upstream) was explicitly respected — they did NOT touch `~/projects/code/multicheck/REVIEWER.md`

This is principled disagreement, not rule-breaking. The reviewer documented their choice in `[R-035]` and flagged it for the session-end report for upstream propagation. The deviation is acknowledged and logged here.

**Where the rule now lives locally in claims-monorepo**:

| File | Layer | Change |
|---|---|---|
| `specs/details.md:70` | Layer 3 (session state) | Active Protocol bullet added after the cascaded-slices rule |
| `docs/review-process.md:51` | Layer 2 (project stable) | Stage 0 "What happens" list now leads with the topology check; "Why it matters" and "Example" sections extended with the #610 post-mortem |
| `specs/agentchat.md [R-035]` | Audit trail | Reviewer self-correction with full incident analysis and verbatim rule text |

**Data integrity implication**: claims-monorepo sessions from 2026-04-08 onward run under a different stage 0 rule set than sessions before 2026-04-08. When analyzing metrics.md for session-to-session comparability, treat claims-monorepo as having TWO protocol versions:

- **pre-2026-04-08** (G-001 + G-002 + early G-003): no branch-base check at stage 0
- **2026-04-08 onward** (late G-003 + future sessions): branch-base check at stage 0

Catches that would have been caught by the branch-base check in the pre-period are valid evidence for the rule. Catches in the post-period that the branch-base check catches are evidence the rule is working. Don't cross-compare catch rates between the two periods without noting the rule set difference.

**Fold-in implications**: when the freeze ends and this item gets folded upstream, the fold-in should:

1. Add the rule to `BUILDER.md` / `REVIEWER.md` / `templates/*` as planned
2. **NOT** add it to claims-monorepo's `docs/review-process.md` (already there)
3. **NOT** add it to claims-monorepo's `specs/details.md` Active Protocol (already there; next session rotation will regenerate details.md and the rule needs to carry over)
4. The fold-in commit message should reference the local deviation so the audit trail is complete

**Freeze discipline lesson**: the freeze rules as written cover multicheck upstream and CLAUDE.md/AGENTS.md mirrors, but do NOT explicitly cover project-owned docs like `docs/review-process.md`. A strong-conviction reviewer will (reasonably) apply rules in files they own during a mid-session emergency, even when the operator requests otherwise. **For future freezes**: either tighten the rule to cover all files that govern session behavior, or accept that Layer 2 project-owned files are operator-permissive and track them with explicit "pre/post rule set" markers in metrics analysis. The current event is logged here as the first data point on this tension.

---

## Meta-observations

Observations about patterns across queued items. Not rules themselves, but candidates for synthesized rules or architectural commentary in the unfreeze batch.

### M1. Both queued rules share the same shape: "verify one level above"

Items #1 (diff-content check) and #2 (branch-base check) are both instances of a deeper pattern: **the reviewer verified one level deep, missed the level above**.

- Item #1: verified WHICH files changed in a cascade; missed WHETHER the file's content changed in unexpected ways
- Item #2: verified the branch name and the tests on the branch; missed WHETHER the branch was based on current main

The generalization: **for every claim, verify the claim AND the context the claim depends on.** A claim about "this file is correct" depends on "this file exists at this location on current main." A claim about "this test passes" depends on "the test is running against the correct base." The reviewer's verification recipe should always include one step above the level of the claim itself.

This is a meta-rule that could become a new recipe in REVIEWER.md "Verification recipes" when the freeze ends: *"Verify the context the claim depends on, not just the claim itself. For content claims, verify file identity. For test claims, verify test context. For branch claims, verify branch base. One level above is often the silent-failure layer."*

Synthesizing this meta-rule into the upstream is a judgment call for the unfreeze batch — it may be better to keep items #1 and #2 as separate concrete recipes (easier for new readers to follow) and mention the shared shape as a comment rather than folding them into a single abstract rule.

### M2. Markdown rules have a ceiling of effectiveness

Item #2 surfaces a real limit: the builder in the live session was entirely reasonable, had a 15+ item gotcha checklist, ran every check they knew to run — and still missed the branch-base condition because it wasn't in the playbook. Adding a 16th rule to the checklist addresses this specific gap but doesn't address the meta-problem: checklists of this size have diminishing marginal effectiveness.

For Phase 2+ tooling considerations, consider:

- A pre-commit hook that runs a subset of the checklist automatically (branch-base, scope, heredoc format, monotonic tags) and blocks commits that fail
- A "stage 0 sanity script" that the builder runs once before `STATE: building` — takes 5 seconds, returns pass/fail on 10 checks
- Husky hook integration for any claims-monorepo-style project using husky

Markdown discipline + automation catches what markdown discipline alone misses. The multicheck framework is Phase 1 frameworkless on purpose, but the roadmap should acknowledge this ceiling.
