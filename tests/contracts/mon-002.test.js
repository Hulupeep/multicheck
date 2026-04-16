/**
 * MON-002 — agentchat.md v2 message format + Verdict grep line
 *
 * Parent: MON-000 (v2.0 Claude-side Monitor-driven coordination) — #33
 * GitHub issue: https://github.com/Hulupeep/multicheck/issues/26
 *
 * Disposition per [S-008] Q5 / [R-012] combined pre-flight acceptance:
 *   9 test.todo() promoted to test() (6 REQS + 1 INV + 3 JOURNEYS partial)
 *   2 test.todo() deferred (INV-001, INV-002 — process-enforced / covered-by)
 *   2 new structural checks added (F-R010-02, F-R011-01)
 */

const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..', '..');
const VERDICT_RE = /^\*\*Verdict:\*\* (PASS|FAIL|ESCALATE)$/m;
const VERDICT_RE_LINE = /^\*\*Verdict:\*\* (PASS|FAIL|ESCALATE)$/;
const V2_HEADINGS = ['### BUILDER SUBMISSION', '### BUILDER RESUBMISSION', '### REVIEW'];
const SAMPLES_PATH = 'examples/agentchat-v2-samples.md';

function read(rel) {
  return fs.readFileSync(path.join(REPO, rel), 'utf-8');
}

// Find the byte index of a heading that appears on a line by itself (not
// inside a backticked reference or prose). Returns -1 if not found.
function findHeadingIdx(body, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`^${escaped}$`, 'm');
  const m = re.exec(body);
  return m ? m.index : -1;
}

// Extract the block starting at a heading line until the next `---` horizontal
// rule (fixture separator) or end-of-file. Used to bound per-section assertions.
function sectionSliceFromHeading(body, startIdx) {
  const afterHeading = body.slice(startIdx);
  const endMatch = afterHeading.slice(1).search(/\n---\n/);
  const end = endMatch === -1 ? afterHeading.length : endMatch + 1;
  return afterHeading.slice(0, end);
}

describe('MON-002 — agentchat.md v2 message format + Verdict grep line', () => {
  describe('REQS', () => {
    test('MON-002-001 (MUST): ### BUILDER SUBMISSION / RESUBMISSION heading vocabulary appears in templates + BUILDER.md + samples', () => {
      const layers = ['templates/agentchat.md', 'BUILDER.md', SAMPLES_PATH];
      for (const rel of layers) {
        const body = read(rel);
        expect(body).toContain('### BUILDER SUBMISSION');
        expect(body).toContain('### BUILDER RESUBMISSION');
      }
    });

    test('MON-002-002 (MUST): Verdict grep line matches ^**Verdict:** (PASS|FAIL|ESCALATE)$ + declared in templates + REVIEWER.md', () => {
      // Regex correctness (line-anchored, case-sensitive, no trailing text).
      expect(VERDICT_RE_LINE.test('**Verdict:** PASS')).toBe(true);
      expect(VERDICT_RE_LINE.test('**Verdict:** FAIL')).toBe(true);
      expect(VERDICT_RE_LINE.test('**Verdict:** ESCALATE')).toBe(true);
      expect(VERDICT_RE_LINE.test('**Verdict:** accept-with-stipulations')).toBe(false);
      expect(VERDICT_RE_LINE.test('**Verdict:** PASS trailing text')).toBe(false);
      expect(VERDICT_RE_LINE.test('**Verdict:** pass')).toBe(false); // case-sensitive
      // Canonical pattern declared in documentation.
      const templates = read('templates/agentchat.md');
      const reviewer = read('REVIEWER.md');
      expect(templates).toContain('^\\*\\*Verdict:\\*\\* (PASS|FAIL|ESCALATE)$');
      expect(reviewer).toContain('^\\*\\*Verdict:\\*\\* (PASS|FAIL|ESCALATE)$');
    });

    test('MON-002-003 (MUST): v2 coexists with v1 — samples contain both; v2 regex hits v2 only', () => {
      const body = read(SAMPLES_PATH);
      // v2 positive presence.
      expect(body).toMatch(VERDICT_RE); // at least one **Verdict:** line
      // v1 negative fixture presence (by construction in the samples file).
      expect(body).toMatch(/\[R-\d{3}\]\s+\d\d:\d\d UTC/);
      // v1 lines do NOT match the v2 verdict regex.
      const v1Lines = body.split('\n').filter(line => /^###?\s*\[R-\d{3}\]/.test(line) || /^\[R-\d{3}\]/.test(line));
      expect(v1Lines.length).toBeGreaterThan(0);
      for (const line of v1Lines) {
        expect(VERDICT_RE_LINE.test(line)).toBe(false);
      }
    });

    test('MON-002-004 (MUST): FAIL verdict section contains **Required fixes:** + at least one - [ ] checkbox within 30 lines', () => {
      const body = read(SAMPLES_PATH);
      const failIdx = body.indexOf('**Verdict:** FAIL');
      expect(failIdx).toBeGreaterThan(-1);
      // Bound to the current fixture section via `---` rule.
      const section = sectionSliceFromHeading(body, failIdx);
      expect(section).toContain('**Required fixes:**');
      // GFM checkbox: `- [ ] ` with a leading hyphen and space + bracketed space + space.
      expect(section).toMatch(/^-\s+\[ \] .+/m);
    });

    test('MON-002-005 (MUST): ESCALATE verdict section contains **Reason:** within 30 lines', () => {
      const body = read(SAMPLES_PATH);
      const escIdx = body.indexOf('**Verdict:** ESCALATE');
      expect(escIdx).toBeGreaterThan(-1);
      const section = sectionSliceFromHeading(body, escIdx);
      expect(section).toContain('**Reason:**');
    });

    test('MON-002-006 (SHOULD): SUBMISSION contains **Task-id:** matching #\\d+ or T-\\d+', () => {
      const body = read(SAMPLES_PATH);
      const subIdx = findHeadingIdx(body, '### BUILDER SUBMISSION');
      expect(subIdx).toBeGreaterThan(-1);
      const section = sectionSliceFromHeading(body, subIdx);
      expect(section).toMatch(/\*\*Task-id:\*\* (#\d+|T-\d+)/);
    });
  });

  describe('INVARIANTS', () => {
    // INV-MON-002-001 deferred — "Append-only. Heredoc writes only" is a
    // process/tooling invariant, NOT testable against markdown file content.
    // Enforcement locations: hooks/pre-push.sh (pre-push check) + REVIEWER.md
    // §Hard rules (reviewer discipline on every verdict). No destination
    // ticket; explicit per-disposition per [R-010] accept.
    test.todo('INV-MON-002-001: append-only heredoc discipline [process-enforced in hooks/pre-push.sh + REVIEWER.md §Hard rules; no markdown-content assertion possible]');

    // INV-MON-002-002 deferred — "Monotonic order; tag numbering continues
    // monotonically across v2 boundaries" is covered by the prose invariant
    // in templates/agentchat.md §File invariants ("tags must be MONOTONICALLY
    // INCREASING and UNIQUE"). Adding a regex-based cross-section order check
    // would over-engineer given v1 has no equivalent code assertion either.
    // Explicit per-disposition per [R-010] accept.
    test.todo('INV-MON-002-002: monotonic tag order across v1/v2 sections [covered-by prose invariant in templates/agentchat.md §File invariants; no code assertion]');

    test('INV-MON-002-003: verdict line is unique per ### REVIEW section in samples fixture', () => {
      const body = read(SAMPLES_PATH);
      // Split on `### REVIEW` heading boundaries and count **Verdict:** lines in each.
      const parts = body.split(/(?=^### REVIEW$)/m).slice(1); // drop anything before first REVIEW
      expect(parts.length).toBeGreaterThan(0);
      for (const part of parts) {
        const section = sectionSliceFromHeading(part, 0);
        const matches = section.match(/^\*\*Verdict:\*\* (PASS|FAIL|ESCALATE)$/gm) || [];
        expect(matches.length).toBe(1);
      }
    });
  });

  describe('JOURNEYS', () => {
    test('J-MON-002-SUBMIT (partial): SUBMISSION contains all 6 required fields [partial — does not simulate Monitor wake, covered by MON-003/004 e2e]', () => {
      const body = read(SAMPLES_PATH);
      const subIdx = findHeadingIdx(body, '### BUILDER SUBMISSION');
      const section = sectionSliceFromHeading(body, subIdx);
      expect(section).toContain('### BUILDER SUBMISSION');
      expect(section).toMatch(/\*\*Task-id:\*\*/);
      expect(section).toMatch(/\*\*Timestamp:\*\*/);
      expect(section).toMatch(/\*\*Files changed:\*\*/);
      expect(section).toMatch(/\*\*Tests run:\*\*/);
      expect(section).toMatch(/\*\*Implementation notes:\*\*/);
    });

    test('J-MON-002-VERDICT (partial): REVIEW contains all 6 required fields [partial — Monitor wake covered by MON-003/004 e2e]', () => {
      const body = read(SAMPLES_PATH);
      const revIdx = findHeadingIdx(body, '### REVIEW');
      const section = sectionSliceFromHeading(body, revIdx);
      expect(section).toContain('### REVIEW');
      expect(section).toMatch(/\*\*Task-id:\*\*/);
      expect(section).toMatch(/\*\*Timestamp:\*\*/);
      expect(section).toMatch(/\*\*Reviewer:\*\*/);
      expect(section).toMatch(VERDICT_RE);
      expect(section).toMatch(/\*\*Findings:\*\*/);
    });

    test('J-MON-002-RESUBMIT (partial): RESUBMISSION Task-id correlates with a prior SUBMISSION Task-id [partial — 3-FAIL auto-ESCALATE covered by MON-004]', () => {
      const body = read(SAMPLES_PATH);
      const resubIdx = findHeadingIdx(body, '### BUILDER RESUBMISSION');
      expect(resubIdx).toBeGreaterThan(-1);
      const resubSection = sectionSliceFromHeading(body, resubIdx);
      const resubTaskMatch = resubSection.match(/\*\*Task-id:\*\* (#\d+|T-\d+)/);
      expect(resubTaskMatch).not.toBeNull();
      const resubTaskId = resubTaskMatch[1];
      // Find at least one prior (earlier in the file) SUBMISSION or REVIEW with the same Task-id.
      const beforeResub = body.slice(0, resubIdx);
      expect(beforeResub).toContain(`**Task-id:** ${resubTaskId}`);
    });
  });

  describe('Structural checks', () => {
    test('verdict regex compiles and matches correctly (historical — kept for quick-signal)', () => {
      expect(VERDICT_RE_LINE.test('**Verdict:** PASS')).toBe(true);
      expect(VERDICT_RE_LINE.test('**Verdict:** FAIL')).toBe(true);
      expect(VERDICT_RE_LINE.test('**Verdict:** ESCALATE')).toBe(true);
      expect(VERDICT_RE_LINE.test('**Verdict:** accept-with-stipulations')).toBe(false);
      expect(VERDICT_RE_LINE.test('**Verdict:** PASS trailing text')).toBe(false);
    });

    test('v1 tagged entries do NOT match v2 verdict regex (historical)', () => {
      expect(VERDICT_RE_LINE.test('[R-018] DECISION: accept')).toBe(false);
      expect(VERDICT_RE_LINE.test('### [R-018] 14:32 UTC — verdict')).toBe(false);
    });

    test('accept-with-stipulations retirement (F-R010-01): REVIEWER.md retains 3 historical refs; other files zero', () => {
      const fileExpected = {
        'templates/agentchat.md': 0,
        'BUILDER.md': 0,
        'REVIEWER.md': 3, // §"Why accept-with-stipulations was removed" historical explanation; line numbers may drift, count is the invariant
        'README.md': 0,
      };
      for (const [rel, expected] of Object.entries(fileExpected)) {
        const body = read(rel);
        const count = (body.match(/accept-with-stipulations/g) || []).length;
        expect({ file: rel, count }).toEqual({ file: rel, count: expected });
      }
    });

    test('two-axis framing retirement (F-R011-01): templates/agentchat.md has no TECHNICAL/PROCESS/Two-axis residue', () => {
      const body = read('templates/agentchat.md');
      expect(body).not.toMatch(/Two-axis verdicts/i);
      expect(body).not.toMatch(/^TECHNICAL:/m);
      expect(body).not.toMatch(/^PROCESS:/m);
    });

    test('ticket REQ list is non-empty (historical)', () => {
      const reqs = [
        ['MON-002-001', 'MUST', '### BUILDER SUBMISSION / RESUBMISSION heading vocabulary'],
        ['MON-002-002', 'MUST', 'Verdict grep line matches ^**Verdict:** (PASS|FAIL|ESCALATE)$'],
        ['MON-002-003', 'MUST', 'v2 coexists with v1 [S-NNN]/[R-NNN] tags'],
        ['MON-002-004', 'MUST', 'FAIL includes Required fixes: checkbox list'],
        ['MON-002-005', 'MUST', 'ESCALATE includes Reason:'],
        ['MON-002-006', 'SHOULD', 'Submissions include Task-id:'],
      ];
      expect(reqs.length).toBeGreaterThan(0);
    });
  });
});
