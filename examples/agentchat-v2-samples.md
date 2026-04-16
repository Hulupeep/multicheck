# agentchat.md v2 — sample fixtures

This file provides **positive and negative fixtures** for the MON-002 v2
message format (`tests/contracts/mon-002.test.js` asserts against these).
Positive fixtures exercise every v2 vocabulary value; the negative fixture
proves v1 entries do NOT match the v2 Monitor grep pattern.

**Canonical grep pattern** (MON-002-002):
`^\*\*Verdict:\*\* (PASS|FAIL|ESCALATE)$`

**Heading vocabulary** (MON-002-001):
`### BUILDER SUBMISSION` / `### BUILDER RESUBMISSION` / `### REVIEW`

---

## Positive fixture — SUBMISSION (MON-002-001, MON-002-006, J-MON-002-SUBMIT)

### BUILDER SUBMISSION
**Task-id:** #432
**Timestamp:** 2026-04-20T14:30:00Z
**Files changed:** src/foo.ts, src/bar.ts, tests/foo.test.ts
**Tests run:** 59 suites / 700 passed / 0 failed / 9 skipped / 3 todo
**Implementation notes:**
- Renamed `fooBar` to `foo_bar` across 12 callsites (codemod + manual review)
- Updated Drizzle schema + generated migration `0042_rename_foo.sql`
- Deferred the component-side rename to #433 (separate PR, non-blocking)

---

## Positive fixture — REVIEW / PASS (MON-002-002, J-MON-002-VERDICT)

### REVIEW
**Task-id:** #432
**Timestamp:** 2026-04-20T14:35:22Z
**Reviewer:** claude-opus-4-6
**Verdict:** PASS
**Findings:**
- End-gate `npm test` verified at commit 58327df — 59 suites / 700 passed / 9 skipped / 3 todo, delta matches pre-flight prediction exactly.
- Slice purity verified: `git diff --name-only origin/main...HEAD` matches `details.md` in-scope list, zero unrelated files.
- Drizzle migration 0042 reviewed at tests/migration.test.ts:45 — idempotent + forward-only + no data loss path.

---

## Positive fixture — REVIEW / FAIL (MON-002-002, MON-002-004, J-MON-002-VERDICT)

### REVIEW
**Task-id:** #433
**Timestamp:** 2026-04-20T15:10:00Z
**Reviewer:** claude-opus-4-6
**Verdict:** FAIL
**Findings:**
- Component rename referenced at src/components/Foo.tsx:18 was not applied; it still imports `fooBar`.
- tests/Foo.test.ts:22 references the old name and passes only because the codemod skipped test files.
- `npm test` shows 3 new failures under `tests/Foo.test.ts` — not mentioned in submission's Tests run.
**Required fixes:**
- [ ] Apply rename at src/components/Foo.tsx:18 (`fooBar` → `foo_bar`).
- [ ] Extend codemod or manually update tests/Foo.test.ts line 22 and 45.
- [ ] Re-run `npm test` and paste the full pass/fail line verbatim in the resubmission.

---

## Positive fixture — REVIEW / ESCALATE (MON-002-002, MON-002-005, J-MON-002-VERDICT)

### REVIEW
**Task-id:** #434
**Timestamp:** 2026-04-20T16:00:00Z
**Reviewer:** claude-opus-4-6
**Verdict:** ESCALATE
**Findings:**
- 3rd consecutive FAIL on #434 — auto-ESCALATE threshold reached per MON-004.
- Each FAIL/RESUBMISSION cycle introduced a different regression in the same file (src/bar.ts), suggesting an incomplete mental model rather than a mechanical fix loop.
**Reason:**
The builder has posted three consecutive resubmissions for #434, each addressing the reviewer's prior fix list but introducing a new regression (2026-04-20T14:00Z, 14:45Z, 15:30Z). The underlying bar.ts logic interacts with a cache invariant that neither agent seems to be modeling correctly. Human review of the file's invariants is required before further mechanical fixing. Attach `git log src/bar.ts` for history and `tests/bar.test.ts` current output for the operator.

---

## Positive fixture — RESUBMISSION (MON-002-001, J-MON-002-RESUBMIT)

### BUILDER RESUBMISSION
**Task-id:** #433
**Timestamp:** 2026-04-20T15:25:12Z
**Files changed:** src/components/Foo.tsx, tests/Foo.test.ts
**Tests run:** 59 suites / 700 passed / 0 failed / 9 skipped / 3 todo
**Required fixes addressed:**
- [x] Applied rename at src/components/Foo.tsx:18 — `fooBar` → `foo_bar` (1 line).
- [x] Updated tests/Foo.test.ts lines 22 and 45 — both references updated + 1 additional reference caught at line 67.
- [x] Re-ran `npm test` — full output: `Test Suites: 59 passed, 59 total / Tests: 3 todo, 700 passed, 9 skipped, 712 total`.
**Implementation notes:**
- Caught a third rename site the reviewer didn't enumerate (tests/Foo.test.ts:67). Included in this resubmission; flagging for the reviewer to confirm in-scope.

---

## Positive fixture — self-correction with structured M4 format

<!-- Shown here as a v2-section because M4 applies to both v1 and v2.
     A v1-style self-correction has the same fields but uses [S-NNN] tag
     format with STATE: self-correction header. -->

### BUILDER SUBMISSION
**Task-id:** #435
**Timestamp:** 2026-04-20T17:05:00Z
**Files changed:** (none — self-correction on prior submission at 16:50Z)
**Tests run:** (unchanged — self-correction on framing, not code)
**Implementation notes:**
PRIOR POSITION: Prior submission at 16:50Z claimed "the rename is semantically identical to the src/foo.ts rename from #432; no new invariants introduced." On re-read during reviewer's implicit gap, I realized that src/baz.ts has a cache-dependent read path that src/foo.ts does not, so the rename here interacts with a cache invariant that the #432 slice did not touch.
NEW POSITION: The #435 rename touches src/baz.ts's cache-read path, which is a new invariant surface. Reviewer should verify cache correctness at src/cache.ts:78 in addition to the rename mechanics.
SCOPE LABEL: REVERSED
Rationale: prior claim of "no new invariants" is contradicted by the cache-read finding. Not a rewording — an actual reversal of the invariant-surface claim. Updating the submission to reflect this; reviewer should re-scope verification accordingly.

---

## Negative fixture — v1 entry that MUST NOT match v2 grep (MON-002-003)

The following is a valid v1 `[R-NNN]` entry. The v2 Monitor grep
(`^\*\*Verdict:\*\*`) MUST return zero hits for this block.
`tests/contracts/mon-002.test.js` asserts this explicitly.

### [R-018] 14:32 UTC — #432
DECISION: accept
WHY:
- End-gate passed at commit 58327df — 59/700/9/3.
- Slice purity verified against details.md in-scope list.
INDEPENDENT VERIFICATION:
- `npm test` from my shell — 59 suites passed.
- `git diff --name-only origin/main...HEAD` — matches.
NEXT:
- Builder posts STATE: ready-for-commit; operator opens draft PR.

<!-- End of v1 negative fixture. Note: no `**Verdict:**` line anywhere above;
     v1 uses `DECISION:` field under the [R-NNN] heading. The Monitor grep
     targets only the v2 **Verdict:** pattern, so v1 entries are correctly
     invisible to the Monitor (backward-compat invariant preserved). -->
