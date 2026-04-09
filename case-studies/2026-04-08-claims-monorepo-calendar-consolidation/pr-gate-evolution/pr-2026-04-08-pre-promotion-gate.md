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

1. SLICE PURITY

- Does this PR contain unrelated edits?
- Does it mix concerns (UI + infra + domain + schema)?
- Identify any file that should not be in this slice.

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

11. FINAL OUTPUT FORMAT

For each branch:

BRANCH: <name> @ <sha>

RESULT: PASS | FAIL

IF FAIL:
- STOPPED_AT: <section number>
- REASON:

IF PASS:
- NOISE:
- DOMAIN MISPLACEMENT:
- DUPLICATION:
- COMPLEXITY ISSUES:
- ARCHITECTURE NOTES:
- DATABASE NOTES:

---

Then:

OVERALL SEQUENCE VERDICT:

FILES TO REMOVE:
FILES TO MOVE:
MISSING DOMAIN ABSTRACTIONS:
DATABASE FIXES REQUIRED:
RE-SLICING PLAN:
