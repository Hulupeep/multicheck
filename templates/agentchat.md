<!--
multicheck/agentchat.md — shared coordination ledger
Append-only by both agents.

Builder posts as [S-NNN].
Reviewer posts as [R-NNN].
Human posts as [H-NNN] for authorization, override, or scope decisions.

═══════════════════════════════════════════════════════════════════════════════
STATE values (builder)
═══════════════════════════════════════════════════════════════════════════════
  building          — work in progress, no verification claim yet
  verifying         — running tests, hitting URLs, querying DB
  blocked           — cannot proceed without external action
  bypass-request    — wants to use --no-verify / --force / similar; MUST wait
                      for H-NNN or R-NNN authorization before proceeding
  scope-expansion   — committing files outside in-scope list; post BEFORE commit
  self-correction   — caught own mistake before reviewer; cite prior entry,
                      state correction, re-verify (HIGHEST-VALUE BEHAVIOR)
  ready-for-review  — slice complete and FULL end-gate passed (not a subset)
  accepted          — reviewer-only; never set by builder

═══════════════════════════════════════════════════════════════════════════════
DECISION values (reviewer)
═══════════════════════════════════════════════════════════════════════════════
  accept                    — technical AND process clean
  accept-with-stipulations  — technical correct, process violation noted
  reject                    — technical claim wrong or unverifiable
  needs-more-proof          — claim might be true but proof incomplete
  active-review             — verification started, verdict pending

Two-axis verdicts: TECHNICAL and PROCESS are independent.

═══════════════════════════════════════════════════════════════════════════════
Anti-vocabulary (reviewer auto-rejects)
═══════════════════════════════════════════════════════════════════════════════
  "looks good"      "should work"       "probably"
  "pragmatic fix"   "we can just bypass"   "let's downgrade for now"
  "fixed locally"

Replacement: invariant + mechanism + why-fix-preserves-invariant + end-gate.

═══════════════════════════════════════════════════════════════════════════════
Required entry formats
═══════════════════════════════════════════════════════════════════════════════

### [S-NNN] HH:MM UTC — #ticket-or-topic
STATE: <state>
CLAIM: one sentence
PROOF:
- code: <file:line or commit>
- test: <exact command + pass/fail counts>
- live: <URL + status>
- db: <query + rows>
RISK: none | low | medium | high
ASK: review | deploy-check | issue-comment | human-authorization | none
NEXT: one concrete next action

### [R-NNN] HH:MM UTC — #ticket-or-topic
DECISION: <decision>
TECHNICAL: accept | reject
PROCESS: accept | reject
WHY:
- <bullets>
MISSING:
- <bullets>
INDEPENDENT VERIFICATION:
- <commands run + output>
NEXT:
- <single next action>

### [H-NNN] HH:MM UTC — #ticket-or-topic
DECISION: bypass-authorized | override | scope-change | dispute-resolution
SCOPE: <what is and is not authorized>
WHY:
- <bullets>

═══════════════════════════════════════════════════════════════════════════════
File invariants
═══════════════════════════════════════════════════════════════════════════════
  - APPEND-ONLY to the END of this file. Never insert in the middle.
  - Tags must be MONOTONICALLY INCREASING and UNIQUE. Never reuse a number.
  - Reordering, renumbering, or middle-inserts break human readability and
    create duplicate-tag confusion. This is a hard rule.

═══════════════════════════════════════════════════════════════════════════════
Canonical write pattern: heredoc append
═══════════════════════════════════════════════════════════════════════════════

  cat >> multicheck/agentchat.md <<'AGENTCHAT_EOF'

  ### [S-NNN] HH:MM UTC — #ticket
  STATE: ...
  CLAIM: ...
  ...
  AGENTCHAT_EOF

  - cat >> is byte-atomic (O_APPEND syscall). It cannot race with concurrent
    writers. Use this instead of Edit/Write tools, which hit "file modified
    since read" errors when anything else touches the file.
  - <<'AGENTCHAT_EOF' with single quotes prevents shell expansion of $, backticks,
    and other metacharacters that appear in code refs, commit hashes, test output,
    and error messages.
  - Edit/Write are a fallback only.
-->

# Agent Chat
