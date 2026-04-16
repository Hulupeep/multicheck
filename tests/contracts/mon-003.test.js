/**
 * MON-003 — Claude-side Monitor documentation (prompt-pattern based)
 *
 * Parent: MON-000 (v2.0 Claude-side Monitor-driven coordination) — #33
 * GitHub issue: https://github.com/Hulupeep/multicheck/issues/27
 *
 * Disposition per [S-020] Q5 / [R-020] combined pre-flight acceptance:
 *   7 test.todo() promoted to test() (MON-003-001, -002, -007, INV-001, INV-002,
 *   J-INVOKE, J-DEAD) — all docs-presence assertions against BUILDER.md,
 *   REVIEWER.md, templates/agentchat.md.
 *   6 test.todo() deferred (MON-003-003/-004/-005/-006 WITHDRAWN under
 *   [S-017] reversal or [R-018] F-R018-03 narrow; INV-003 cross-ref to
 *   MON-001/007; J-UNAVAILABLE collapsed under narrow).
 *
 * Original issue body premised an installer + config-file system; premise
 * was reversed at [S-017] 13:58 UTC after operator-supplied docs at
 * https://code.claude.com/docs/en/tools-reference#monitor-tool revealed
 * Monitor is a built-in Claude Code runtime tool invoked via tool-call.
 * Scope narrowed at [R-018] F-R018-03 (operator 14:12 UTC) to Claude Code
 * runtime only (Bedrock/Vertex/Foundry/telemetry-disabled out of scope).
 */

const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..', '..');

function read(rel) {
  return fs.readFileSync(path.join(REPO, rel), 'utf-8');
}

describe('MON-003 — Claude-side Monitor documentation (prompt-pattern)', () => {
  describe('REQS', () => {
    test('MON-003-001 (MUST): BUILDER.md documents canonical builder-side Monitor prompt pattern', () => {
      const body = read('BUILDER.md');
      expect(body).toMatch(/^## Start Monitor at session entry \(MON-003\)$/m);
      expect(body).toContain('Use the monitor tool on this command:');
      expect(body).toContain('tail -F multicheck/agentchat.md');
      expect(body).toContain('grep -E --line-buffered');
      expect(body).toContain('\\*\\*Verdict:\\*\\* (PASS|FAIL|ESCALATE)');
      expect(body).toContain('[RH]-[0-9]+');
      expect(body).toContain('persistent: true');
      expect(body).toContain('description');
    });

    test('MON-003-002 (MUST): REVIEWER.md documents canonical reviewer-side Monitor prompt pattern', () => {
      const body = read('REVIEWER.md');
      expect(body).toMatch(/^## Start Monitor at session entry \(MON-003\)$/m);
      expect(body).toContain('Use the monitor tool on this command:');
      expect(body).toContain('tail -F multicheck/agentchat.md');
      expect(body).toContain('grep -E --line-buffered');
      expect(body).toContain('[SH]-[0-9]+');
      expect(body).toContain('BUILDER SUBMISSION');
      expect(body).toContain('BUILDER RESUBMISSION');
      expect(body).toContain('persistent: true');
    });

    // MON-003-003 DEFER: WITHDRAWN under [R-018] F-R018-03 narrow.
    // Original REQ asserted fallback-to-v1 when Monitor unavailable on
    // Bedrock/Vertex/Foundry/telemetry-disabled. Those runtimes are out of
    // scope under narrow; any unavailability is mid-session only and covered
    // by MON-003-007 + J-MON-003-DEAD (STATE: monitor-dead path).
    test.todo('MON-003-003 (MUST): [WITHDRAWN under [R-018] F-R018-03 narrow — fallback covered by MON-003-007 monitor-dead]');

    // MON-003-004 DEFER: WITHDRAWN at [S-017] reversal.
    // Original REQ asserted idempotent install. No installer under
    // prompt-pattern scope; each session invokes Monitor once per session.
    test.todo('MON-003-004 (MUST): [WITHDRAWN at [S-017] premise reversal — no installer under prompt-pattern scope]');

    // MON-003-005 DEFER: WITHDRAWN under [R-018] F-R018-03 narrow.
    // Original REQ asserted non-Claude-terminal gating. Each Claude session
    // invokes Monitor for itself under prompt-pattern; no installer-terminal
    // gating concept exists. Availability gating for Bedrock/Vertex/Foundry
    // dropped per operator 14:12 UTC narrow.
    test.todo('MON-003-005 (MUST): [WITHDRAWN under [R-018] F-R018-03 narrow — no installer-terminal gating under prompt-pattern]');

    // MON-003-006 DEFER: WITHDRAWN at [S-017] reversal.
    // Original REQ asserted one-line install confirmation. Monitor returns
    // its own confirmation ("Monitor started (task <id>, persistent...)") —
    // not multicheck's concern to shape.
    test.todo('MON-003-006 (SHOULD): [WITHDRAWN at [S-017] premise reversal — Monitor returns its own confirmation]');

    test('MON-003-007 (SHOULD): templates/agentchat.md STATE vocab includes monitor-dead; BUILDER.md + REVIEWER.md document reaction', () => {
      const template = read('templates/agentchat.md');
      expect(template).toMatch(/^\s+monitor-dead\s+—/m);
      expect(template).toContain('v1 manual');
      const builder = read('BUILDER.md');
      const reviewer = read('REVIEWER.md');
      expect(builder.toLowerCase()).toContain('monitor-dead');
      expect(reviewer.toLowerCase()).toContain('monitor-dead');
      expect(builder).toMatch(/v1 manual.{0,30}relay/i);
      expect(reviewer).toMatch(/v1 manual.{0,30}relay/i);
    });
  });

  describe('INVARIANTS', () => {
    test('INV-MON-003-001: Monitor invocation happens inside session runtime via tool-call (no installer references in MON-003 sections)', () => {
      for (const rel of ['BUILDER.md', 'REVIEWER.md']) {
        const body = read(rel);
        const idx = body.indexOf('## Start Monitor at session entry (MON-003)');
        expect(idx).toBeGreaterThan(-1);
        const after = body.slice(idx);
        const nextH2 = after.slice(3).search(/^## /m);
        const section = nextH2 === -1 ? after : after.slice(0, nextH2 + 3);
        expect(section).not.toMatch(/install-monitors\.sh/);
        expect(section).not.toMatch(/monitors\.json/);
        expect(section).not.toMatch(/~\/\.claude\/monitors/);
        expect(section).toContain('monitor tool');
      }
    });

    test('INV-MON-003-002: canonical Monitor command pipeline is read-only (tail + grep + pipes only; no redirection)', () => {
      const body = read('BUILDER.md');
      const marker = 'Use the monitor tool on this command:';
      const idx = body.indexOf(marker);
      expect(idx).toBeGreaterThan(-1);
      const snippet = body.slice(idx, idx + 400);
      expect(snippet).toContain('tail -F');
      expect(snippet).toContain('grep -E');
      expect(snippet).toContain('|');
      const fence = snippet.match(/```[\s\S]*?```/);
      expect(fence).not.toBeNull();
      const commandBlock = fence[0];
      expect(commandBlock).not.toMatch(/\s>\s/);
      expect(commandBlock).not.toMatch(/\s>>\s/);
      expect(commandBlock).not.toMatch(/\|\s*tee\b/);
    });

    // INV-MON-003-003 DEFER: cross-reference to MON-001 (pairing declaration)
    // + MON-007 (anchor template updates). Same-provider warning lives in
    // those docs, asserted in their tests. MON-003 only ensures its section
    // does not duplicate it (not a positive-assertion test).
    test.todo('INV-MON-003-003: [cross-reference DEFER — same-provider warning lives in MON-001/MON-007 docs, asserted in those tests]');
  });

  describe('JOURNEYS', () => {
    test('J-MON-003-INVOKE: BUILDER.md + REVIEWER.md both contain §Start Monitor section with prompt-pattern text per role', () => {
      // Per [R-020] non-blocking note: grep for prompt-pattern text ("Use the
      // monitor tool on this command:"), not schema-layer Monitor({...}).
      for (const rel of ['BUILDER.md', 'REVIEWER.md']) {
        const body = read(rel);
        expect(body).toMatch(/^## Start Monitor at session entry \(MON-003\)$/m);
        expect(body).toContain('Use the monitor tool on this command:');
      }
      const builderBody = read('BUILDER.md');
      const reviewerBody = read('REVIEWER.md');
      expect(builderBody).toContain('Verdict:');
      expect(reviewerBody).toContain('BUILDER SUBMISSION');
    });

    // J-MON-003-UNAVAILABLE DEFER: collapsed under [R-018] F-R018-03 narrow.
    // Original journey covered unsupported-runtime unavailability; those
    // runtimes are out of scope under narrow. Mid-session unavailability is
    // covered by J-MON-003-DEAD.
    test.todo('J-MON-003-UNAVAILABLE: [collapsed under [R-018] F-R018-03 narrow — any unavailability is mid-session J-DEAD]');

    test('J-MON-003-DEAD: STATE: monitor-dead documented in templates/agentchat.md; reaction documented in BUILDER.md + REVIEWER.md', () => {
      const template = read('templates/agentchat.md');
      expect(template).toMatch(/^\s+monitor-dead\s+—/m);
      for (const rel of ['BUILDER.md', 'REVIEWER.md']) {
        const body = read(rel);
        expect(body.toLowerCase()).toContain('monitor-dead');
        expect(body).toMatch(/v1 manual.{0,40}relay/i);
      }
    });
  });

  describe('Structural checks (pre-implementation)', () => {
    test('install-hooks.sh exists (sibling style reference — retained from original stub)', () => {
      expect(fs.existsSync(path.join(REPO, 'install-hooks.sh'))).toBe(true);
    });

    test('ticket REQ list is non-empty', () => {
      const reqs = [
        ['MON-003-001', 'MUST', 'BUILDER.md documents canonical builder-side Monitor prompt pattern'],
        ['MON-003-002', 'MUST', 'REVIEWER.md documents canonical reviewer-side Monitor prompt pattern'],
        ['MON-003-003', 'WITHDRAWN', 'fallback-to-v1 under narrow (covered by MON-003-007)'],
        ['MON-003-004', 'WITHDRAWN', 'idempotency N/A under prompt-pattern'],
        ['MON-003-005', 'WITHDRAWN', 'availability gating under narrow'],
        ['MON-003-006', 'WITHDRAWN', 'install confirmation N/A'],
        ['MON-003-007', 'SHOULD', 'monitor-dead STATE vocab + reaction documented'],
      ];
      expect(reqs.length).toBeGreaterThan(0);
    });
  });
});
