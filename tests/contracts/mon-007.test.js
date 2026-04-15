/**
 * MON-007 — Anchor template updates (claude-md.md + agents-md.md)
 *
 * Parent: MON-000 (v2.0 Claude-side Monitor-driven coordination) — #33
 * GitHub issue: https://github.com/Hulupeep/multicheck/issues/31
 *
 * Specflow-compliant contract test stub.
 * REQS / INVARIANTS / JOURNEYS start as test.todo() and are promoted to
 * test() with assertions as each item is implemented. Structural checks
 * that can be verified pre-implementation run now.
 */

const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..', '..');

describe('MON-007 — Anchor template updates (claude-md.md + agents-md.md)', () => {
  describe('REQS', () => {
    test.todo('MON-007-001 (MUST): templates/claude-md.md Monitor section between markers');
    test.todo('MON-007-002 (MUST): templates/agents-md.md v2 submission format + awaiting-relay');
    test.todo('MON-007-003 (MUST): Both anchors reference multicheck/details.md pairing:');
    test.todo('MON-007-004 (MUST): Both anchors state Monitor never writes to agentchat.md');
    test.todo('MON-007-005 (MUST): v0.5.3 rules preserved verbatim (additive)');
    test.todo('MON-007-006 (SHOULD): Both anchors cross-reference MONITOR-INTEGRATION.md');
  });

  describe('INVARIANTS', () => {
    test.todo('INV-MON-007-001: invariant holds');
    test.todo('INV-MON-007-002: invariant holds');
    test.todo('INV-MON-007-003: invariant holds');
  });

  describe('JOURNEYS', () => {
    test.todo('J-MON-007-CLAUDE-ENTRY');
    test.todo('J-MON-007-CODEX-ENTRY');
  });

  describe('Structural checks (pre-implementation)', () => {
    test('both anchor templates exist', () => {
      expect(fs.existsSync(path.join(REPO, 'templates/claude-md.md'))).toBe(true);
      expect(fs.existsSync(path.join(REPO, 'templates/agents-md.md'))).toBe(true);
    });
    test('both anchors have multicheck:start / multicheck:end markers', () => {
      const claudeMd = fs.readFileSync(path.join(REPO, 'templates/claude-md.md'), 'utf8');
      const agentsMd = fs.readFileSync(path.join(REPO, 'templates/agents-md.md'), 'utf8');
      expect(claudeMd).toMatch(/<!-- multicheck:start -->/);
      expect(claudeMd).toMatch(/<!-- multicheck:end -->/);
      expect(agentsMd).toMatch(/<!-- multicheck:start -->/);
      expect(agentsMd).toMatch(/<!-- multicheck:end -->/);
    });

    test('ticket REQ list is non-empty', () => {
      const reqs = [
      ['MON-007-001', 'MUST', "templates/claude-md.md Monitor section between markers"],
      ['MON-007-002', 'MUST', "templates/agents-md.md v2 submission format + awaiting-relay"],
      ['MON-007-003', 'MUST', "Both anchors reference multicheck/details.md pairing:"],
      ['MON-007-004', 'MUST', "Both anchors state Monitor never writes to agentchat.md"],
      ['MON-007-005', 'MUST', "v0.5.3 rules preserved verbatim (additive)"],
      ['MON-007-006', 'SHOULD', "Both anchors cross-reference MONITOR-INTEGRATION.md"]
    ];
      expect(reqs.length).toBeGreaterThan(0);
    });
  });
});
