#!/bin/sh
# multicheck hook installer
#
# Installs the multicheck git hooks into the current repo's .git/hooks/
# directory. Must be run from the root of a git repo.
#
# Usage:
#   cd /path/to/target-project
#   sh ~/code/multicheck/install-hooks.sh
#
# Or from within a multicheck/.framework/ snapshot in a target project:
#   sh multicheck/.framework/install-hooks.sh
#
# The installer:
#   - Copies hooks/pre-push.sh to .git/hooks/pre-push
#   - Makes it executable
#   - Preserves any existing hook by renaming it to <hook>.pre-multicheck.bak
#
# To uninstall, delete .git/hooks/pre-push (or restore from the .bak file).
#
# Optional hooks (not installed by default):
#   - templates/hooks/pre-commit-gate-file.sh.example — proceed-to-code
#     gate lock for projects using a reviewer-ledger pattern. See the
#     file's header for install instructions.

set -e

# Locate the multicheck framework root relative to this script
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
FRAMEWORK_ROOT="$SCRIPT_DIR"

# Verify we're in a git repo
if [ ! -d .git ]; then
  echo "multicheck: error — not in a git repo root" >&2
  echo "multicheck: cd into the target project root first" >&2
  exit 1
fi

# Verify the source hook exists
SRC_HOOK="$FRAMEWORK_ROOT/hooks/pre-push.sh"
if [ ! -f "$SRC_HOOK" ]; then
  echo "multicheck: error — hook source not found at $SRC_HOOK" >&2
  exit 1
fi

TARGET_HOOK=".git/hooks/pre-push"

# Back up any existing hook
if [ -f "$TARGET_HOOK" ]; then
  BACKUP="$TARGET_HOOK.pre-multicheck.bak"
  if [ ! -f "$BACKUP" ]; then
    cp "$TARGET_HOOK" "$BACKUP"
    echo "multicheck: backed up existing pre-push hook to $BACKUP"
  else
    echo "multicheck: backup already exists at $BACKUP, not overwriting"
  fi
fi

# Install the hook
cp "$SRC_HOOK" "$TARGET_HOOK"
chmod +x "$TARGET_HOOK"

echo "multicheck: installed pre-push topology check"
echo "multicheck: threshold: 5 commits behind origin/main (override with MULTICHECK_PREPUSH_THRESHOLD)"
echo "multicheck: self-disables when origin is unreachable or origin/main is missing"
echo ""
echo "Optional hooks (not installed by default):"
echo "  - templates/hooks/pre-commit-gate-file.sh.example"
echo "    For projects using a reviewer-gate pattern with a shared ledger file."
echo "    See the file header for configuration and install instructions."
