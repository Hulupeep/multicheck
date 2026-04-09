Review these branches / commits in order:
(You need to fill in these prior)
-  
Also review them against the architecture docs in:
docs/

Your task is to audit for slice quality, architectural conformity, domain correctness, and noise.

Do not summarize. Return PASS/FAIL with explicit violations.

---

🚨 0. BREAK CONDITION (MANDATORY)

If ANY of the following occur:
- SpecFlow / contract noise detected
- Domain logic incorrectly placed
- Architecture boundary violation
- Database structural error (new table that should not exist)

THEN:
- Immediately mark branch as FAIL
- STOP analysis for that branch
- Do NOT continue evaluating remaining sections for that branch

---

🚨 0.5 TOPOLOGY & FRESHNESS (MANDATORY — HARD FAIL)

Source rule: `specs/details.md` "Active Protocol" — branch-base topology check (R-035).

This MUST run before any content audit. Content-level verification is worthless
until topology is correct.

Commands to run (record output verbatim):

```
git fetch origin
git merge-base HEAD origin/main        # current branch's merge-base
git rev-parse origin/main              # current main HEAD
git log HEAD..origin/main --oneline    # commits on main not yet in branch
git diff --name-only origin/main...HEAD  # three-dot diff = what PR view shows
```

FAIL conditions (trigger break, stop here):

- Merge-base is not current `origin/main` HEAD OR is not very close to it
  (release/CI drift commits are acceptable; functional commits are not).
- Three-dot diff contains files NOT in `specs/details.md`'s
  "Files currently in scope for #NNN" section for the active slice.
- Three-dot diff is missing files the builder claimed to have committed.

Reference incident: `#610`'s draft PR `#636` at commit `f15c4ae8` was based on
`325095ea` (weeks-old) instead of current main. The three-dot diff was
contaminated with ~20 already-merged files. `pr.md` stage-3 caught it because
`pr.md` computes merge-base explicitly. `[R-034]` missed it because it ran
working-tree checks instead of topology checks. Fixed in `[R-035]`.

---

1. SLICE PURITY

- Does this PR contain unrelated edits?
- Does it mix concerns (UI + infra + domain + schema)?
- Identify any file that should not be in this slice.
- **Cross-check against `specs/details.md`** "Files currently in scope for #NNN"
  for the active ticket. The three-dot diff file set MUST be a subset
  (or exact match) of that declared list. Any file in the PR but not in
  `details.md` = FAIL. Any file in `details.md` but not in the PR = flag as
  incomplete slice (not automatic fail, but reviewer must justify).

---

2. DOMAIN PLACEMENT (CRITICAL)

For every function/class/module introduced:

- Should this belong in the **Domain layer**?
- If YES and it is not in Domain → FAIL (trigger break)
- If NO but it is in Domain → FAIL (trigger break)

Specifically check:
- business rules
- scheduling logic
- meeting lifecycle logic
- validation rules

Output:
- MISPLACED DOMAIN LOGIC:
  - file → reason → correct location

---

3. SHARED FUNCTIONS / DRY

- Are there duplicated functions across files?
- Are similar transformations repeated instead of abstracted?

Output:
- DUPLICATION:
  - function A duplicated in X, Y
- SHOULD BE SHARED:
  - what should be extracted and where

---

4. SIMPLICITY (ANTI-COMPLEXITY CHECK)

- Is any implementation more complex than required?
- Are there:
  - unnecessary abstractions
  - premature generalization
  - over-engineered patterns

Flag:
- where a simpler approach exists

---

5. SPECFLOW / CONTRACT NOISE (HARD FAIL)

- Are any SpecFlow files, ADRs, or contract docs included in the PR?

If YES:
- classify each as:
  - required (enforcement)
  - noise (documentation / unused)

If ANY noise → FAIL (trigger break)

---

6. ARCHITECTURE CONFORMITY (ARD)

Validate against architecture docs:

- domain isolated from infra
- adapters used for external systems (e.g. Google Workspace)
- no external API types leaking into domain
- orchestration/state logic not embedded in UI
- auditability preserved (events / logs)

If violation found → FAIL (trigger break)

---

7. DDD CONFORMITY

Check:

- clear domain language (meeting, consultation, scheduling)
- domain not anemic
- infra models not masquerading as domain
- external systems abstracted out

Flag issues (non-breaking unless severe)

---

8. DATABASE REVIEW (CRITICAL)

- List all schema changes

For each new table:

- Should this be:
  - a new table → justify
  - part of an existing table → FAIL (trigger break)
  - part of existing JSONB / case data → FAIL (trigger break)

Check:
- duplication of entities
- fragmentation of domain data
- violation of existing patterns (cases, events, action_runs)

Output:
- NEW TABLES:
- SHOULD MERGE INTO:
- REDUNDANT STRUCTURES:

---

9. STATE / WORKFLOW INTEGRITY

- Are scheduling + consultation flows aligned with state machine?
- Any hidden state outside case/events?
- Any implicit transitions not logged?

Flag:
- silent state mutation
- missing events
- non-deterministic flow

---

10. SEQUENCING VALIDATION

Across all branches:

- Was foundation built before usage?
- Did later slices compensate for missing earlier abstractions?
- Any backfilled logic that should have existed earlier?

---

🚨 11. PROMOTION-READINESS GATE (MANDATORY — RUNS ON FINAL HEAD ONLY)

Sections 1–10 audit content. Section 11 audits the cumulative, final-state
coherence of the slice — what will actually land on main when GitHub squashes.

**This entire section runs against the FINAL head of the slice branch, not
against individual correction commits.** If the slice has had multiple
correction rounds, the incremental reviews are necessary but not sufficient.

Source rule: added 2026-04-08 after `#610` on the milestone branch accumulated
three correction rounds (218bf852 → aa6cd01e → stipulation fix) and raised the
question "how do we know the final state isn't a jumbled mess of partial fixes?"

---

11a. FULL HOOK-GATE RERUN ON FINAL HEAD

The builder's per-commit hook gate proves each commit was green in isolation.
It does NOT prove the squashed final state is green. Rerun explicitly:

```
# from repo root, on final head
npx jest --config jest.config.cjs --bail
```

FAIL conditions:
- Any suite fails on final head.
- Suite/test counts do not match the builder's claimed counts in the latest
  `[S-NNN] STATE: ready-for-review` packet (±acknowledged deltas only).
- Reviewer skipped this step on the grounds that "the focused test is green."
  Focused-test-only shortcuts are not acceptable at promotion time.

Record verbatim in verdict: `N suites / M passed / K skipped / T todo / total in Xs`.

---

11b. PRETTIER STABILITY CHECK

Files can pass the pre-commit Prettier hook at commit N but drift if commit N+1
touches them without re-running Prettier on the full file set. Verify the
cumulative state is formatter-clean.

**Important**: Stock Prettier in this repo has parsers ONLY for the file types
the repo's `.prettierrc`/plugins cover (TS, TSX, JS, JSX, JSON, MD, YAML, CSS).
Raw `.sql` files have no parser unless `prettier-plugin-sql` is installed —
which this repo does not install — and binary / lock / generated files have
no parser at all. Piping the entire three-dot file set to Prettier blindly
will crash on the FIRST unsupported file with "No parser could be inferred",
which gives a false-positive failure even when every formatter-supported file
is clean.

Filter unsupported extensions before piping. The canonical command is:

```
git diff --name-only origin/main...HEAD \
  | grep -E '\.(ts|tsx|js|jsx|mjs|cjs|json|md|mdx|yml|yaml|css|scss|html)$' \
  | xargs --no-run-if-empty npx prettier --check
```

If the unfiltered list contains any file the Prettier extension allow-list
above does NOT cover, that file MUST be explicitly disclosed in the verdict
under `STIPULATIONS` as "non-formattable file in slice: <path> (<reason>)".
This forces the reviewer to consciously acknowledge files Prettier cannot
guard, rather than silently skipping them.

FAIL conditions:
- Any file in the FILTERED three-dot diff is Prettier-dirty on final head.
- The builder ran Prettier on a subset (e.g. "only the files I changed in
  this round") instead of the cumulative formatter-supported file set.
- The slice contains a non-formattable file that was NOT disclosed in the
  verdict's `STIPULATIONS` section. Silent skips are not acceptable.

Reference incident: `#610` final head `02202f1f` shipped a hand-written
`packages/domains/db/drizzle/0028_meetings_consultation_rebooking.sql`
migration. The original `pr.md` 11b command crashed with `[error] No parser
could be inferred` on first builder use. The substance was fine — the SQL is
hand-curated by intent — but the gate command was wrong. Fixed in this
revision by adding an extension allow-list and a disclosure rule for files
outside it. See `[S-110]` and `[R-037]` in `specs/agentchat.md`.

---

11c. SQUASH PREVIEW — audit the diff that will actually hit main

GitHub will squash-merge the slice branch. The reviewer has been looking at
incremental commits; main will see the squashed result. Render and audit THAT:

```
git diff origin/main...HEAD > /tmp/squash-preview.diff
git diff --stat origin/main...HEAD
```

Re-run the gotcha-pattern checks from sections 1, 2, 6, 8, and 9 against the
squash preview. Specifically look for:

- **Self-cancelling edits**: round 1 adds a thing, round 2 removes it — the
  squashed diff shows neither. Usually harmless, but sometimes masks intent.
- **Half-reverted rules**: round 1 adds an invariant guard, round 2 partially
  undoes it during a rebase conflict resolution. This is the R-028 failure mode
  at the cumulative level.
- **Orphaned imports / dead code**: round 1 adds a helper, round 2 stops using
  it, squashed diff still imports it. Dead code on main.
- **Stale comments referencing prior round artifacts**: e.g. `#610`'s
  `meetings.ts:56` comment still said "migration 0026" because rounds 2 and 3
  updated body text but not the number. Flag as stipulation.
- **Test coverage gap vs claim**: if the builder claims to have fixed invariant
  X but the squashed diff shows no test asserting X, flag as stipulation. This
  is the `[R-036]` blocker-#1 failure mode at the cumulative level.

Output:
- SQUASH PREVIEW FINDINGS:
  - self-cancelling edits (if any):
  - half-reverted rules (if any):
  - orphaned imports / dead code (if any):
  - stale comments / references (if any):
  - claim-vs-coverage gaps (if any):

---

11d. CORRECTION-ROUND BUDGET

Count the number of correction commits on the slice branch since the first
`ready-for-review` packet. "Correction commit" = any commit posted after the
initial ready-for-review that was itself followed by another ready-for-review
packet in `specs/agentchat.md`.

Thresholds:

- **1 correction round**: normal. No action.
- **2 correction rounds**: acceptable. Reviewer notes in verdict.
- **3+ correction rounds**: STOP. Builder MUST post an
  `[S-NNN] STATE: promote-or-rebuild` decision packet in `specs/agentchat.md`
  before this gate can be re-entered. The packet must answer:
  - Is the cumulative diff still a coherent single slice?
  - Would a rebuild from current main land a cleaner, smaller diff?
  - Which round introduced drift vs intent?
  - Explicit choice: PROMOTE or REBUILD.

Reference incident: `#610` reached 3 rounds (`218bf852`, `aa6cd01e`,
stipulation fix) before this rule existed. The slice held together but the
question "is this still one slice or three patches taped together?" had no
formal answer path.

FAIL condition:
- 3+ rounds and no `promote-or-rebuild` packet posted.

---

12. FINAL OUTPUT FORMAT

For each branch:

BRANCH: <name> @ <sha>

RESULT: PASS | FAIL | PASS-WITH-STIPULATIONS

IF FAIL:
- STOPPED_AT: <section number>
- REASON:

IF PASS or PASS-WITH-STIPULATIONS:
- TOPOLOGY: merge-base / main HEAD / three-dot file count
- NOISE:
- DOMAIN MISPLACEMENT:
- DUPLICATION:
- COMPLEXITY ISSUES:
- ARCHITECTURE NOTES:
- DATABASE NOTES:
- PROMOTION-READINESS:
  - full hook gate on final head: N suites / M passed / K skipped / T todo
  - prettier check on three-dot file set: clean / N files dirty
  - squash preview findings: (list from 11c)
  - correction-round count: N
- STIPULATIONS: (if any — must be acknowledged before promotion)

---

Then:

OVERALL SEQUENCE VERDICT:

FILES TO REMOVE:
FILES TO MOVE:
MISSING DOMAIN ABSTRACTIONS:
DATABASE FIXES REQUIRED:
RE-SLICING PLAN:
