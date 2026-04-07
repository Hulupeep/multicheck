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
