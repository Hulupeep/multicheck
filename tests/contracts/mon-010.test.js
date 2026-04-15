/**
 * MON-010 — setup.sh single-command installer wrapper
 *
 * Parent: MON-000 (v2.0 Claude-side Monitor-driven coordination) — #33
 * GitHub issue: https://github.com/Hulupeep/multicheck/issues/35
 *
 * Specflow-compliant contract test stub.
 * REQS / INVARIANTS / JOURNEYS start as test.todo() and are promoted to
 * test() with assertions as each item is implemented. Structural checks
 * that can be verified pre-implementation run now.
 */

const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..', '..');

describe('MON-010 — setup.sh single-command installer wrapper', () => {
  describe('REQS', () => {
    test.todo('MON-010-001 (MUST): --role=builder runs Phase 0 + pairing + hooks + monitors(Claude-only)');
    test.todo('MON-010-002 (MUST): --role=reviewer same; idempotent pairing check');
    test.todo('MON-010-003 (MUST): refuse to run inside multicheck framework repo');
    test.todo('MON-010-004 (MUST): refuse to run outside git repo root');
    test.todo('MON-010-005 (MUST): one-line confirmation + summary line');
    test.todo('MON-010-006 (MUST): self-disable Monitor install when capability missing');
    test.todo('MON-010-007 (SHOULD): --dry-run flag');
    test.todo('MON-010-008 (SHOULD): --help flag');
  });

  describe('INVARIANTS', () => {
    test.todo('INV-MON-010-001: invariant holds');
    test.todo('INV-MON-010-002: invariant holds');
    test.todo('INV-MON-010-003: invariant holds');
    test.todo('INV-MON-010-004: invariant holds');
    test.todo('INV-MON-010-005: invariant holds');
  });

  describe('JOURNEYS', () => {
    test.todo('J-MON-010-BUILDER-SETUP');
    test.todo('J-MON-010-REVIEWER-SETUP');
    test.todo('J-MON-010-FLIPPED-PAIRING');
    test.todo('J-MON-010-GUARD-CWD');
  });

  describe('Structural checks (pre-implementation)', () => {
    test('install-hooks.sh exists (sibling)', () => {
      expect(fs.existsSync(path.join(REPO, 'install-hooks.sh'))).toBe(true);
    });

    test('ticket REQ list is non-empty', () => {
      const reqs = [
      ['MON-010-001', 'MUST', "--role=builder runs Phase 0 + pairing + hooks + monitors(Claude-only)"],
      ['MON-010-002', 'MUST', "--role=reviewer same; idempotent pairing check"],
      ['MON-010-003', 'MUST', "refuse to run inside multicheck framework repo"],
      ['MON-010-004', 'MUST', "refuse to run outside git repo root"],
      ['MON-010-005', 'MUST', "one-line confirmation + summary line"],
      ['MON-010-006', 'MUST', "self-disable Monitor install when capability missing"],
      ['MON-010-007', 'SHOULD', "--dry-run flag"],
      ['MON-010-008', 'SHOULD', "--help flag"]
    ];
      expect(reqs.length).toBeGreaterThan(0);
    });
  });
});
