#!/bin/sh
# multicheck pre-push topology check
#
# Prevents pushes from stale branch bases. This is the Phase 1.5 automation
# half of the branch-base sanity check that was added to the pre-flight as
# Q2 in v0.5.0. It closes meta-observation M2 ("markdown rules have a
# ceiling of effectiveness") by mechanically enforcing the rule at
# `git push` time.
#
# Reference incidents:
#   - claims-monorepo #610 draft PR #636 at weeks-old base 325095ea
#     (2026-04-08) — 4 hours of wasted work on a stale branch
#   - claims-monorepo #610 multi-author drift captured in R-041
#     (2026-04-09) — the pre-push hook would have caught the stale
#     pre-rebase state before the multi-author commits layered on top
#
# Self-disables when:
#   - origin is unreachable (offline work)
#   - origin/main does not exist
#   - merge-base cannot be computed
#
# Threshold: up to 5 commits behind is tolerated to cover release/CI
# chore commits in active repos. Tighter thresholds produce false
# positives; 5 is the specflow agent's recommendation after reviewing
# real project churn rates. Override the threshold with the
# MULTICHECK_PREPUSH_THRESHOLD environment variable.
#
# Override the hook for a specific push with `git push --no-verify`
# if you know what you're doing and are confident the stale-base
# commits don't affect your slice.

set -e

# Try to fetch origin/main quietly. If origin is unreachable, skip silently.
if ! git fetch origin main --quiet 2>/dev/null; then
  exit 0
fi

# Resolve merge-base and origin/main. If either fails, skip silently.
MB=$(git merge-base HEAD origin/main 2>/dev/null) || exit 0
OM=$(git rev-parse origin/main 2>/dev/null) || exit 0

# If already current, pass.
if [ "$MB" = "$OM" ]; then
  exit 0
fi

# Count how many commits main has that this branch doesn't.
BEHIND=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo 0)

# Allow up to THRESHOLD commits of drift (default 5).
THRESHOLD=${MULTICHECK_PREPUSH_THRESHOLD:-5}
if [ "$BEHIND" -le "$THRESHOLD" ]; then
  exit 0
fi

# Stale. Block the push with an informative message.
echo "" >&2
echo "============================================================" >&2
echo "  MULTICHECK PRE-PUSH TOPOLOGY CHECK - STALE BRANCH BASE" >&2
echo "============================================================" >&2
echo "" >&2
echo "  Your branch is $BEHIND commits behind origin/main." >&2
echo "  Threshold: $THRESHOLD commits behind." >&2
echo "" >&2
echo "    merge-base:  $MB" >&2
echo "    origin/main: $OM" >&2
echo "" >&2
echo "  Pushing now would produce a PR diff contaminated with" >&2
echo "  already-merged changes from main." >&2
echo "" >&2
echo "  Rebase onto current main OR create a fresh branch from main" >&2
echo "  before pushing:" >&2
echo "" >&2
echo "    git fetch origin" >&2
echo "    git rebase origin/main" >&2
echo "" >&2
echo "  (Override with --no-verify if you know what you're doing" >&2
echo "   and are confident the stale-base commits don't affect" >&2
echo "   your slice.)" >&2
echo "" >&2
echo "  Raise the threshold for this specific push:" >&2
echo "" >&2
echo "    MULTICHECK_PREPUSH_THRESHOLD=$BEHIND git push" >&2
echo "" >&2
exit 1
