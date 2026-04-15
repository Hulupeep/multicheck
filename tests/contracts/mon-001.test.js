/**
 * MON-001 — Pairing declaration in multicheck/details.md
 *
 * Parent: MON-000 (v2.0 Claude-side Monitor-driven coordination) — #33
 * GitHub issue: https://github.com/Hulupeep/multicheck/issues/25
 *
 * Specflow-compliant contract test stub.
 * REQS / INVARIANTS / JOURNEYS start as test.todo() and are promoted to
 * test() with assertions as each item is implemented. Structural checks
 * that can be verified pre-implementation run now.
 */

const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..', '..');

describe('MON-001 — Pairing declaration in multicheck/details.md', () => {
  describe('REQS', () => {
    test.todo('MON-001-001 (MUST): pairing: key with 3-value enum in details.md');
    test.todo('MON-001-002 (MUST): install-monitors.sh fails closed without pairing:');
    test.todo('MON-001-003 (MUST): templates/details.md placeholder block');
    test.todo('MON-001-004 (MUST): Phase 0 step 6 prompt');
    test.todo('MON-001-005 (SHOULD): pairing flip requires new [G-NNN]');
  });

  describe('INVARIANTS', () => {
    test.todo('INV-MON-001-001: invariant holds');
    test.todo('INV-MON-001-002: invariant holds');
    test.todo('INV-MON-001-003: invariant holds');
  });

  describe('JOURNEYS', () => {
    test.todo('J-MON-001-DECLARE');
    test.todo('J-MON-001-FLIP');
  });

  describe('Structural checks (pre-implementation)', () => {
    test('templates/details.md exists', () => {
      expect(fs.existsSync(path.join(REPO, 'templates/details.md'))).toBe(true);
    });

    test('ticket REQ list is non-empty', () => {
      const reqs = [
      ['MON-001-001', 'MUST', "pairing: key with 3-value enum in details.md"],
      ['MON-001-002', 'MUST', "install-monitors.sh fails closed without pairing:"],
      ['MON-001-003', 'MUST', "templates/details.md placeholder block"],
      ['MON-001-004', 'MUST', "Phase 0 step 6 prompt"],
      ['MON-001-005', 'SHOULD', "pairing flip requires new [G-NNN]"]
    ];
      expect(reqs.length).toBeGreaterThan(0);
    });
  });
});
