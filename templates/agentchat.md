<!--
multicheck/agentchat.md — shared coordination ledger
Append-only by both agents.

Builder posts as [S-NNN] for work entries.
Builder posts as [G-NNN] for goal packets (before each new feature set).
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
  archive-request   — operator instructed feature-set rotation; MUST wait for
                      [R-NNN] ack before moving any files. See BUILDER.md
                      "Archive policy" for the 8-step rotation procedure.
  scope-expansion   — committing files outside in-scope list; post BEFORE commit
  self-correction   — caught own mistake before reviewer; cite prior entry,
                      state correction, re-verify (HIGHEST-VALUE BEHAVIOR).
                      MUST include fields: PRIOR POSITION, NEW POSITION,
                      SCOPE LABEL ∈ {REVERSED | REWORDED-ONLY |
                      SCOPE-NARROWED | SCOPE-EXPANDED}. Forces honesty
                      about substantive vs cosmetic correction.
                      See v2 format section below for full semantics.
  ready-for-review  — slice complete and FULL end-gate passed (not a subset)
  accepted          — reviewer-only; never set by builder

═══════════════════════════════════════════════════════════════════════════════
DECISION values (reviewer)
═══════════════════════════════════════════════════════════════════════════════
  accept                    — every FIRST CHECK passed, no FINDINGS
  reject                    — one or more FINDINGS (technical OR process)
  needs-more-proof          — claim might be true but proof incomplete
  active-review             — verification started, verdict pending

Verdicts are binary (accept or reject). Process violations are FINDINGS that
block merge — same as technical bugs. See REVIEWER.md §DECISION values.

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
WHY:
- <bullets>
MISSING:
- <bullets>
INDEPENDENT VERIFICATION:
- <commands run + output>
NEXT:
- <single next action>

### [G-NNN] HH:MM UTC — feature set name
BIG_GOAL: <one sentence — long-term destination>
CURRENT_GOAL: <one sentence — concrete deliverable for this feature set>
NON_GOALS:
- <bullets — explicit out-of-scope, including things that would be wrong to do>
TICKETS:
- #N — one-line description
- #M — one-line description
DONE_SIGNAL: <observable completion state>

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

═══════════════════════════════════════════════════════════════════════════════
v2 message format (MON-002) — Monitor-greppable sections
═══════════════════════════════════════════════════════════════════════════════

v2 introduces a structured, Monitor-greppable section format that COEXISTS
with v1 [S-NNN]/[R-NNN] tagged entries documented above. v1 remains valid
indefinitely for within-session work. v2 is for Claude-side Monitor
automation (MON-003/004/005) and new-session adoption.

Heading vocabulary (closed enum — exact strings, on a line by themselves):
  ### BUILDER SUBMISSION
  ### BUILDER RESUBMISSION
  ### REVIEW

Verdict line (closed enum, canonical grep pattern — REQ MON-002-002):
  Pattern: ^\*\*Verdict:\*\* (PASS|FAIL|ESCALATE)$
  Values:  PASS | FAIL | ESCALATE
  Rule:    line-anchored, case-sensitive, NO trailing text on the line.

Required section formats per verdict value:
  FAIL verdicts MUST include a **Required fixes:** section with GFM
    checkbox items. Claude-Builder reads the list on FAIL wake (MON-004).
  ESCALATE verdicts MUST include a **Reason:** section stating why
    human intervention is required. Free-form narrative.
  Submissions + Resubmissions SHOULD include a **Task-id:** line
    matching #<gh-issue> OR T-<numeric> for per-task correlation.

### BUILDER SUBMISSION skeleton

  ### BUILDER SUBMISSION
  **Task-id:** #<issue>
  **Timestamp:** <ISO-8601 UTC>
  **Files changed:** <comma-separated list>
  **Tests run:** <suites / passed / failed / skipped / todo>
  **Implementation notes:**
  - <bullet>

### BUILDER RESUBMISSION skeleton

  Same shape as SUBMISSION plus an explicit reference to the prior
  verdict's **Required fixes:** list stating what changed to address
  each item.

### REVIEW skeleton

  ### REVIEW
  **Task-id:** #<issue>
  **Timestamp:** <ISO-8601 UTC>
  **Reviewer:** <model-id>
  **Verdict:** PASS | FAIL | ESCALATE
  **Findings:**
  - <bullet>
  **Required fixes:**       (ONLY if Verdict is FAIL)
  - [ ] <item>
  **Reason:**                (ONLY if Verdict is ESCALATE)
  <narrative>

Backward-compat invariant (REQ MON-002-003):
  v1 [S-NNN] / [R-NNN] tagged entries MUST NOT match the v2 Monitor
  grep ^\*\*Verdict:\*\*. Monitor greps only v2 vocabulary; v1 entries
  do not trigger wake events. One task = one vocabulary throughout;
  mixing within a task is a process violation.

Structured self-correction format (M4 — applies to BOTH v1 and v2):
  Any entry with STATE: self-correction (v1) or a self-correction
  section (v2) MUST include three fields:

    PRIOR POSITION: <what I previously claimed>
    NEW POSITION:   <what I now claim>
    SCOPE LABEL:    REVERSED | REWORDED-ONLY | SCOPE-NARROWED | SCOPE-EXPANDED

  SCOPE LABEL semantics:
    REVERSED       — new position contradicts prior (e.g., "X and Y are
                     equivalent" → "X and Y take opposite positions").
    REWORDED-ONLY  — same position, different words. If you reach for
                     this, consider whether the self-correction adds
                     signal or just noise.
    SCOPE-NARROWED — new position is a subset of prior; some prior
                     claims retained, others retracted.
    SCOPE-EXPANDED — new position adds to prior without retracting;
                     superset relationship.

  Forces honesty about whether the correction is substantive or cosmetic.
  See [R-007] (caught [S-005]'s REVERSED framing mislabeled as equivalence)
  for the canonical example of why this structure exists.

-->

# Agent Chat
