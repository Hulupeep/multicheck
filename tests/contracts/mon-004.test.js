/**
 * MON-004 — Claude-as-Builder reaction protocol
 *
 * Parent: MON-000 (v2.0 Claude-side Monitor-driven coordination) — #33
 * GitHub issue: https://github.com/Hulupeep/multicheck/issues/28
 *
 * Disposition per [S-026] / [R-027] combined pre-flight acceptance:
 *   11 test.todo() promoted to test() (MON-004-001/-002/-003/-004/-005/-006 +
 *   INV-001/-002 + J-PASS/J-FAIL-RESUBMIT/J-AUTO-ESCALATE) — docs-presence
 *   assertions against BUILDER.md, templates/details.md, templates/agentchat.md.
 *   3 test.todo() deferred (MON-004-007 covered by BUILDER.md §Harness-failure
 *   triage framework; INV-003 negative-covered-by MON-004-001; J-HUMAN-ESCALATE
 *   covered-by MON-004-004).
 *
 * Scope per [H-010] + issue #28 body (c) framing + F-R023-02 authorization:
 * Claude-Builder-side reaction protocol; non-Claude-side manual relay is
 * MON-006 scope; M2/hook-gate/ticket-auth-trail are MON-005 scope.
 */

const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..', '..');

function read(rel) {
  return fs.readFileSync(path.join(REPO, rel), 'utf-8');
}

describe('MON-004 — Claude-as-Builder reaction protocol', () => {
  describe('REQS', () => {
    test('MON-004-001 (MUST): BUILDER.md describes PASS reaction (commit if needed + STATE: verdict-accepted + stop)', () => {
      const body = read('BUILDER.md');
      expect(body).toMatch(/^## Claude-as-Builder Monitor reactions \(MON-004\)$/m);
      expect(body).toMatch(/^### PASS verdict$/m);
      expect(body).toContain('verdict-accepted');
      expect(body.toLowerCase()).toContain('commit');
      // Builder does NOT self-issue PASS (INV-003 negative, covered here positively)
      expect(body).toMatch(/never self-issue PASS|never writes its own .{0,50}Verdict:.{0,5}PASS/i);
    });

    test('MON-004-002 (MUST): BUILDER.md describes FAIL reaction (read Required fixes → apply → RESUBMISSION + increment counter)', () => {
      const body = read('BUILDER.md');
      expect(body).toMatch(/^### FAIL verdict$/m);
      expect(body).toContain('Required fixes:');
      expect(body).toContain('BUILDER RESUBMISSION');
      expect(body.toLowerCase()).toContain('fail_counters');
      expect(body.toLowerCase()).toMatch(/increment.{0,40}(by 1|counter)/);
    });

    test('MON-004-003 (MUST): BUILDER.md describes 3-FAIL auto-ESCALATE with claude-builder-auto + max-fail-cycles-reached + notify-send/bell fallback', () => {
      const body = read('BUILDER.md');
      expect(body).toMatch(/^### 3-FAIL auto-ESCALATE$/m);
      expect(body).toContain('claude-builder-auto');
      expect(body).toContain('max-fail-cycles-reached');
      // Canonical fallback: terminal bell. OS-specific upgrades documented.
      expect(body).toMatch(/notify-send|terminal bell|printf.{0,5}\\a/);
      // Cap at 3.
      expect(body).toMatch(/(capped at 3|cap.{0,5}3|3rd.{0,5}FAIL|3 (FAIL|consecutive))/i);
    });

    test('MON-004-004 (MUST): BUILDER.md describes reviewer-written ESCALATE reaction (STATE: awaiting-human + stop + wait for [H-NNN])', () => {
      const body = read('BUILDER.md');
      expect(body).toMatch(/^### ESCALATE verdict \(reviewer-written\)$/m);
      expect(body).toContain('awaiting-human');
      expect(body).toContain('[H-NNN]');
    });

    test('MON-004-005 (MUST): fail_counter resets per new Task-id (per-task not global); schema documented in templates/details.md', () => {
      const template = read('templates/details.md');
      expect(template).toMatch(/^fail_counters:$/m);
      expect(template).toContain('Task-id');
      expect(template).toMatch(/per-Task-id|counter resets|new Task-id/i);
      // Also documented in BUILDER.md reaction section.
      const builder = read('BUILDER.md');
      expect(builder).toMatch(/FAIL counter reset|per-task, not global|counter for that new task-id starts at 0/i);
    });

    test('MON-004-006 (MUST): BUILDER.md documents irreversible-action-gate (v0.5.1) preservation on PASS', () => {
      const body = read('BUILDER.md');
      // Section exists describing PASS + irreversible-gate interaction.
      expect(body).toMatch(/PASS \+ irreversible gate|PASS does NOT authorize|irreversible-action gate/i);
      expect(body).toContain('STATE: irreversible-request');
      expect(body).toMatch(/Reviewer accept is insufficient|only a human|\[H-NNN\].{0,40}(authorization|authorize)/i);
    });

    // MON-004-007 DEFER: covered by existing BUILDER.md §Harness-failure triage
    // framework (lines ~344+). HARNESS TRIAGE: block pattern already ships; the
    // MON-004 reaction section cross-references it implicitly via §FAIL verdict
    // guidance. No new assertion shape needed beyond what §Harness-failure
    // triage already covers.
    test.todo('MON-004-007 (SHOULD): [DEFER — covered-by BUILDER.md §Harness-failure triage framework]');
  });

  describe('INVARIANTS', () => {
    test('INV-MON-004-001: fail_counters key lives in templates/details.md (not agentchat.md; survives session restart)', () => {
      const template = read('templates/details.md');
      expect(template).toMatch(/^fail_counters:$/m);
      // Rationale: details.md is mutable; agentchat.md is append-only.
      expect(template).toMatch(/details.md.{0,200}(append-only|session-mutable|mutable|not agentchat)/s);
      // Not present in templates/agentchat.md (agentchat is append-only, counter is mutable).
      const agent = read('templates/agentchat.md');
      expect(agent).not.toMatch(/^fail_counters:/m);
    });

    test('INV-MON-004-002: auto-ESCALATE format identical to reviewer-ESCALATE except **Reviewer:** field (claude-builder-auto marker)', () => {
      const body = read('BUILDER.md');
      // Auto-ESCALATE example in BUILDER.md reaction section includes
      // **Reviewer:** claude-builder-auto explicitly.
      expect(body).toContain('**Reviewer:** claude-builder-auto');
      // Other fields (Verdict, Reason, Findings) match the generic v2 REVIEW format.
      expect(body).toContain('**Verdict:** ESCALATE');
      expect(body).toContain('**Reason:** max-fail-cycles-reached');
    });

    // INV-MON-004-003 DEFER: "Builder never approves its own work. PASS is
    // only acted on; it is never self-issued." Covered positively by
    // MON-004-001 test which asserts "never self-issue PASS" / "never
    // writes its own Verdict: PASS." Negative invariant is structurally
    // inherited from the positive REQ assertion; no separate test
    // strengthens coverage.
    test.todo('INV-MON-004-003: [DEFER — negative invariant covered-by MON-004-001 positive assertion]');
  });

  describe('JOURNEYS', () => {
    test('J-MON-004-PASS: BUILDER.md documents PASS journey (monitor wake → commit if needed → STATE: verdict-accepted → stop)', () => {
      const body = read('BUILDER.md');
      const idx = body.indexOf('### PASS verdict');
      expect(idx).toBeGreaterThan(-1);
      // Extract a bounded slice (up to next `### ` section header or 2000 chars)
      const after = body.slice(idx);
      const nextH3 = after.slice(3).search(/^### /m);
      const section = nextH3 === -1 ? after.slice(0, 2000) : after.slice(0, nextH3 + 3);
      // Journey steps present.
      expect(section).toMatch(/commit/i);
      expect(section).toContain('verdict-accepted');
      expect(section).toMatch(/stop|wait/i);
    });

    test('J-MON-004-FAIL-RESUBMIT: BUILDER.md documents FAIL→resubmit journey with counter increment', () => {
      const body = read('BUILDER.md');
      const idx = body.indexOf('### FAIL verdict');
      expect(idx).toBeGreaterThan(-1);
      const after = body.slice(idx);
      const nextH3 = after.slice(3).search(/^### /m);
      const section = nextH3 === -1 ? after.slice(0, 2000) : after.slice(0, nextH3 + 3);
      expect(section).toMatch(/Required fixes/i);
      expect(section).toMatch(/apply/i);
      expect(section).toContain('BUILDER RESUBMISSION');
      expect(section).toMatch(/fail_counters|increment.{0,40}counter/i);
    });

    test('J-MON-004-AUTO-ESCALATE: BUILDER.md documents 3rd-FAIL journey with auto-write + notify-send/bell', () => {
      const body = read('BUILDER.md');
      // Use end-of-line anchor to find the MON-004 §3-FAIL auto-ESCALATE
      // section specifically, not the MON-002 forward-reference at the earlier
      // "### 3-FAIL auto-ESCALATE rule (MON-004)" heading.
      const re = /^### 3-FAIL auto-ESCALATE$/m;
      const match = re.exec(body);
      expect(match).not.toBeNull();
      const idx = match.index;
      // Use a fixed larger slice because this section contains a code-fenced
      // nested `### REVIEW` heading which would confuse a naive next-`### `
      // search. 3000 chars covers the full section + some margin without
      // bleeding into §fail_counters schema materially.
      const section = body.slice(idx, idx + 3000);
      expect(section).toContain('claude-builder-auto');
      expect(section).toContain('max-fail-cycles-reached');
      expect(section).toMatch(/notify-send|terminal bell|printf.{0,5}\\a/);
      expect(section).toContain('awaiting-human');
    });

    // J-MON-004-HUMAN-ESCALATE DEFER: Covered-by MON-004-004. The human-escalate
    // journey is identical in assertion shape to the reviewer-written-ESCALATE
    // reaction test: both assert the awaiting-human state + [H-NNN] wait.
    test.todo('J-MON-004-HUMAN-ESCALATE: [DEFER — covered-by MON-004-004 positive assertion]');
  });

  describe('Structural checks (pre-implementation)', () => {
    test('BUILDER.md exists', () => {
      expect(fs.existsSync(path.join(REPO, 'BUILDER.md'))).toBe(true);
    });

    test('ticket REQ list is non-empty', () => {
      const reqs = [
        ['MON-004-001', 'MUST', 'PASS → commit + STATE: verdict-accepted + stop'],
        ['MON-004-002', 'MUST', 'FAIL → read fixes, apply, resubmit, increment fail_counter'],
        ['MON-004-003', 'MUST', '3-FAIL cap → auto-write **Verdict:** ESCALATE + notify-send'],
        ['MON-004-004', 'MUST', 'ESCALATE (reviewer-written) → STATE: awaiting-human + stop'],
        ['MON-004-005', 'MUST', 'fail_counter resets per new Task-id'],
        ['MON-004-006', 'MUST', 'PASS never bypasses irreversible-action gate (v0.5.1)'],
        ['MON-004-007', 'SHOULD', 'FAIL on test-boundary stub → HARNESS TRIAGE: block'],
      ];
      expect(reqs.length).toBeGreaterThan(0);
    });
  });
});
