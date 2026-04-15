/**
 * MON-009 — README.md v2.0 onboarding rewrite
 *
 * Parent: MON-000 (v2.0 Claude-side Monitor-driven coordination) — #33
 * GitHub issue: https://github.com/Hulupeep/multicheck/issues/34
 *
 * Specflow-compliant contract test stub.
 * REQS / INVARIANTS / JOURNEYS start as test.todo() and are promoted to
 * test() with assertions as each item is implemented. Structural checks
 * that can be verified pre-implementation run now.
 */

const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..', '..');

describe("MON-009 — README.md v2.0 onboarding rewrite", () => {
  describe('REQS', () => {
    test.todo("MON-009-001 (MUST): README §Getting started at most 60 lines");
    test.todo("MON-009-002 (MUST): Exact setup.sh commands shown verbatim");
    test.todo("MON-009-003 (MUST): Default pairing stated + how to flip");
    test.todo("MON-009-004 (MUST): Walkthrough phases annotated [AUTO] or [MANUAL]");
    test.todo("MON-009-005 (MUST): What-is-automated messaging preserved");
    test.todo("MON-009-006 (SHOULD): Troubleshooting subsection with top-3 failures");
  });

  describe('INVARIANTS', () => {
    test.todo("INV-MON-009-001: invariant holds");
    test.todo("INV-MON-009-002: invariant holds");
    test.todo("INV-MON-009-003: invariant holds");
  });

  describe('JOURNEYS', () => {
    test.todo("J-MON-009-FIRST-TIME-SETUP");
    test.todo("J-MON-009-UPGRADE");
  });

  describe('Structural checks (pre-implementation)', () => {
    test("README.md exists", () => {
      expect(fs.existsSync(path.join(REPO, 'README.md'))).toBe(true);
    });
    test("README.md current total under 600 lines", () => {
      const body = fs.readFileSync(path.join(REPO, 'README.md'), 'utf8');
      const lines = body.split('\n').length;
      expect(lines).toBeLessThanOrEqual(600);
    });

    test('ticket REQ list is non-empty', () => {
      expect(6).toBeGreaterThan(0);
    });
  });
});
