/**
 * MON-003 — Claude-side Monitor config + install-monitors.sh
 *
 * Parent: MON-000 (v2.0 Claude-side Monitor-driven coordination) — #33
 * GitHub issue: https://github.com/Hulupeep/multicheck/issues/27
 *
 * Specflow-compliant contract test stub.
 * REQS / INVARIANTS / JOURNEYS start as test.todo() and are promoted to
 * test() with assertions as each item is implemented. Structural checks
 * that can be verified pre-implementation run now.
 */

const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..', '..');

describe('MON-003 — Claude-side Monitor config + install-monitors.sh', () => {
  describe('REQS', () => {
    test.todo('MON-003-001 (MUST): install-monitors.sh reads pairing: and installs on Claude side only');
    test.todo('MON-003-002 (MUST): monitors/ ships 3 files: 2 shell scripts + monitors.json');
    test.todo('MON-003-003 (MUST): self-disable cleanly when Monitor unavailable');
    test.todo('MON-003-004 (MUST): idempotent; no duplicate watchers');
    test.todo('MON-003-005 (MUST): never install Monitor on non-Claude terminal');
    test.todo('MON-003-006 (SHOULD): one-line install confirmation per monitor');
    test.todo('MON-003-007 (SHOULD): liveness check fires STATE: monitor-dead');
  });

  describe('INVARIANTS', () => {
    test.todo('INV-MON-003-001: invariant holds');
    test.todo('INV-MON-003-002: invariant holds');
    test.todo('INV-MON-003-003: invariant holds');
  });

  describe('JOURNEYS', () => {
    test.todo('J-MON-003-INSTALL');
    test.todo('J-MON-003-SELFDISABLE');
    test.todo('J-MON-003-LIVENESS');
  });

  describe('Structural checks (pre-implementation)', () => {
    test('install-hooks.sh exists (sibling style reference)', () => {
      expect(fs.existsSync(path.join(REPO, 'install-hooks.sh'))).toBe(true);
    });

    test('ticket REQ list is non-empty', () => {
      const reqs = [
      ['MON-003-001', 'MUST', "install-monitors.sh reads pairing: and installs on Claude side only"],
      ['MON-003-002', 'MUST', "monitors/ ships 3 files: 2 shell scripts + monitors.json"],
      ['MON-003-003', 'MUST', "self-disable cleanly when Monitor unavailable"],
      ['MON-003-004', 'MUST', "idempotent; no duplicate watchers"],
      ['MON-003-005', 'MUST', "never install Monitor on non-Claude terminal"],
      ['MON-003-006', 'SHOULD', "one-line install confirmation per monitor"],
      ['MON-003-007', 'SHOULD', "liveness check fires STATE: monitor-dead"]
    ];
      expect(reqs.length).toBeGreaterThan(0);
    });
  });
});
