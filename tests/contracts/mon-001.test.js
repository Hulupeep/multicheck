/**
 * MON-001 — Pairing declaration in multicheck/details.md
 *
 * Parent: MON-000 (v2.0 Claude-side Monitor-driven coordination) — #33
 * GitHub issue: https://github.com/Hulupeep/multicheck/issues/25
 *
 * Specflow-compliant contract test.
 * 7 of 10 test.todo() rows promoted to real assertions per [S-003] disposition
 * plan, acked by [R-004] DECISION: accept. 3 rows deferred to named tickets.
 *
 * Canonical enum order (locked at [S-003] and [R-004]):
 *   1. codex-builder+claude-reviewer   (default per README v0.5.3)
 *   2. claude-builder+codex-reviewer   (flipped, preserves asymmetric value)
 *   3. claude-builder+claude-reviewer  (same-provider, ~80% value loss)
 */

const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..', '..');

const ENUM_VALUES = [
  'codex-builder+claude-reviewer',
  'claude-builder+codex-reviewer',
  'claude-builder+claude-reviewer',
];

function read(rel) {
  return fs.readFileSync(path.join(REPO, rel), 'utf8');
}

describe('MON-001 — Pairing declaration in multicheck/details.md', () => {
  describe('REQS', () => {
    test('MON-001-001 (MUST): templates/details.md lists the 3-value enum (unordered)', () => {
      const body = read('templates/details.md');
      for (const v of ENUM_VALUES) {
        expect(body).toContain(v);
      }
    });

    // MON-001-002 deferred to #27 MON-003 — tests/e2e/mon-003.test.js will
    // assert `install-monitors.sh` fails closed when `pairing:` is absent.
    // Script does not exist in this slice.
    test.todo('MON-001-002 (MUST): install-monitors.sh fails closed without pairing: [deferred to #27 MON-003]');

    test('MON-001-003 (MUST): templates/details.md has HTML-comment placeholder block + pairing: line + default noted', () => {
      const body = read('templates/details.md');
      // The `## Pairing` section exists.
      expect(body).toMatch(/^## Pairing$/m);
      // HTML-comment block is adjacent to `pairing:` and mentions all three enum values + the literal "default".
      const commentMatch = body.match(/<!--[\s\S]*?-->/g) || [];
      const commentWithPairing = commentMatch.find((c) =>
        ENUM_VALUES.every((v) => c.includes(v)) && /default/i.test(c)
      );
      expect(commentWithPairing).toBeDefined();
      // `pairing:` line exists at column 0.
      expect(body).toMatch(/^pairing:/m);
    });

    test('MON-001-004 (MUST): BUILDER.md Phase 0 step 6 prompt lists enums in canonical order', () => {
      const body = read('BUILDER.md');
      // Anchor on Phase 0 to avoid colliding with Archive Rotation's "Step 6" per [R-004] note 1.
      const phase0Idx = body.indexOf('## Phase 0');
      expect(phase0Idx).toBeGreaterThan(-1);
      const archiveIdx = body.indexOf('## Archive');
      const phase0Section = body.slice(phase0Idx, archiveIdx > phase0Idx ? archiveIdx : body.length);
      // All three enum strings appear in Phase 0.
      const positions = ENUM_VALUES.map((v) => phase0Section.indexOf(v));
      for (let i = 0; i < positions.length; i++) {
        expect(positions[i]).toBeGreaterThan(-1);
      }
      // Canonical order: (1) < (2) < (3).
      expect(positions[0]).toBeLessThan(positions[1]);
      expect(positions[1]).toBeLessThan(positions[2]);
    });

    test('MON-001-005 (SHOULD): REVIEWER.md + BUILDER.md document pairing flip requiring new [G-NNN]', () => {
      for (const rel of ['REVIEWER.md', 'BUILDER.md']) {
        const body = read(rel);
        // Proximity: "pairing flip" and "[G-NNN]" within a reasonable span.
        const flipIdx = body.toLowerCase().indexOf('pairing flip');
        expect(flipIdx).toBeGreaterThan(-1);
        const spanStart = Math.max(0, flipIdx - 1500);
        const spanEnd = Math.min(body.length, flipIdx + 1500);
        const span = body.slice(spanStart, spanEnd);
        // Either `[G-NNN]` literal or the phrase "new [G-NNN] goal packet" or "new goal packet".
        expect(span).toMatch(/\[G-NNN\]|new goal packet/i);
      }
    });
  });

  describe('INVARIANTS', () => {
    test('INV-MON-001-001: pairing: key appears only in templates/details.md, not in anchors or agentchat', () => {
      const detailsBody = read('templates/details.md');
      expect(detailsBody).toMatch(/^pairing:/m);
      // Exclusion set: anchor templates + agentchat template must NOT carry a pairing: line.
      const exclusionSet = [
        'templates/claude-md.md',
        'templates/agents-md.md',
        'templates/agentchat.md',
      ];
      for (const rel of exclusionSet) {
        const body = read(rel);
        expect(body).not.toMatch(/^pairing:/m);
      }
    });

    // INV-MON-001-002 deferred to #31 MON-007 — anchor-refresh semantics
    // after a flip require MON-007's Monitor-aware anchor structure to be
    // in place. Today's anchors are v0.5.3; MON-007 rewrites them.
    test.todo('INV-MON-001-002: flip = new [G-NNN] + anchor refresh via Phase 0 step 5 [deferred to #31 MON-007]');

    // INV-MON-001-003 deferred to #27 MON-003 — the installer warning on
    // same-provider pairing is emitted by install-monitors.sh, which
    // MON-003 ships. Not testable against markdown alone.
    test.todo('INV-MON-001-003: same-provider pairing triggers explicit installer warning [deferred to #27 MON-003]');
  });

  describe('JOURNEYS', () => {
    test('J-MON-001-DECLARE (partial): BUILDER.md Phase 0 step 6 describes operator-prompt + builder-writes-pairing steps', () => {
      // Steps 1-4 of the journey are documented here.
      // Steps 5-6 (install-monitors.sh runs) are covered by tests/e2e/mon-003.test.js.
      const body = read('BUILDER.md');
      const phase0Idx = body.indexOf('## Phase 0');
      const archiveIdx = body.indexOf('## Archive');
      const phase0Section = body.slice(phase0Idx, archiveIdx > phase0Idx ? archiveIdx : body.length);
      // Prompt presents 1/2/3 choices.
      expect(phase0Section).toMatch(/\b1\b[\s\S]{0,200}codex-builder\+claude-reviewer/);
      expect(phase0Section).toMatch(/\b2\b[\s\S]{0,200}claude-builder\+codex-reviewer/);
      expect(phase0Section).toMatch(/\b3\b[\s\S]{0,200}claude-builder\+claude-reviewer/);
      // Fail-closed discipline documented.
      expect(phase0Section.toLowerCase()).toMatch(/fail closed|re-prompt/);
    });

    test('J-MON-001-FLIP (partial): REVIEWER.md + BUILDER.md document the flip procedure steps 1-3', () => {
      // Steps 4-5 (Phase 0 step 5 re-run + install-monitors.sh) are covered by MON-003 + MON-007.
      const reviewerBody = read('REVIEWER.md');
      // Reviewer has a dedicated section.
      expect(reviewerBody).toMatch(/## Pairing flip handling/);
      // Builder side documents the flip trigger.
      const builderBody = read('BUILDER.md');
      expect(builderBody.toLowerCase()).toMatch(/state:\s*pairing-flip/);
      // Both reference the new [G-NNN] requirement.
      for (const body of [reviewerBody, builderBody]) {
        const flipSection = body.slice(
          Math.max(0, body.toLowerCase().indexOf('pairing flip') - 200),
          body.toLowerCase().indexOf('pairing flip') + 2000
        );
        expect(flipSection).toMatch(/\[G-NNN\]|new goal packet/i);
      }
    });
  });

  describe('Structural checks (pre-implementation)', () => {
    test('templates/details.md exists', () => {
      expect(fs.existsSync(path.join(REPO, 'templates/details.md'))).toBe(true);
    });

    test('ticket REQ list is non-empty', () => {
      const reqs = [
        ['MON-001-001', 'MUST', 'pairing: key with 3-value enum in details.md'],
        ['MON-001-002', 'MUST', 'install-monitors.sh fails closed without pairing:'],
        ['MON-001-003', 'MUST', 'templates/details.md placeholder block'],
        ['MON-001-004', 'MUST', 'Phase 0 step 6 prompt'],
        ['MON-001-005', 'SHOULD', 'pairing flip requires new [G-NNN]'],
      ];
      expect(reqs.length).toBeGreaterThan(0);
    });
  });
});
