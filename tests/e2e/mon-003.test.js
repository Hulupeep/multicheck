/**
 * MON-003 — e2e tests for Claude-side Monitor documentation.
 *
 * GitHub issue: https://github.com/Hulupeep/multicheck/issues/27
 *
 * Disposition per [S-020] Q5 / [R-020] combined pre-flight acceptance:
 * ALL 7 e2e test.todos DEFERRED.
 *
 * Rationale: after the [S-017] premise reversal + [R-018] F-R018-03 narrow,
 * MON-003 ships documentation only — no installer shell script, no watcher
 * scripts, no JSON config. There is nothing to execute in a scratch repo.
 * The Monitor tool invocation happens agent-runtime-side (inside a Claude
 * Code session) and is not exercisable from a Node/jest test process.
 *
 * Validation of Monitor behavior happens live-in-session at the operator
 * level (per [S-019]/[S-020] Monitor live-test proof-of-concept data:
 * tasks bb64t6ltg + bmuuacnzx fired on [H-008] / [R-018] / [R-019] / [S-019]
 * / [S-020] during the dogfood session itself). No automatable e2e surface.
 *
 * Contract-level docs-presence assertions (the actual MON-003 deliverables)
 * live in tests/contracts/mon-003.test.js; see that file for the 7 promoted
 * test() assertions + 6 deferrals.
 */

describe('MON-003 e2e — Claude-side Monitor documentation', () => {
  describe('End-to-end behavior', () => {
    // All 7 REQ e2e tests are deferred. The original stub assumed the
    // MON-003 deliverable was an install-monitors.sh shell script that could
    // be exercised against a scratch repo. Under the post-[S-017] prompt-pattern
    // scope, no such script ships — all MON-003 deliverables are documentation
    // verified at the contract layer in tests/contracts/mon-003.test.js.

    test.todo('MON-003-001 e2e: [DEFER — no installer under prompt-pattern scope; covered by contract tests/contracts/mon-003.test.js]');
    test.todo('MON-003-002 e2e: [DEFER — no installer; same rationale]');
    test.todo('MON-003-003 e2e: [DEFER — WITHDRAWN under [R-018] F-R018-03 narrow; no unavailability scenario on supported platform]');
    test.todo('MON-003-004 e2e: [DEFER — WITHDRAWN at [S-017]; no installer to test for idempotency]');
    test.todo('MON-003-005 e2e: [DEFER — WITHDRAWN under narrow; no installer-terminal gating]');
    test.todo('MON-003-006 e2e: [DEFER — WITHDRAWN at [S-017]; Monitor returns its own confirmation, not multicheck-shaped]');
    test.todo('MON-003-007 e2e: [DEFER — monitor-dead detection happens inside Claude session runtime, not exercisable from jest process]');
  });
});
