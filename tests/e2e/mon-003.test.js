/**
 * MON-003 — e2e tests for shell tooling.
 *
 * GitHub issue: https://github.com/Hulupeep/multicheck/issues/27
 *
 * These tests exercise the script against scratch repos and assert on
 * stdout/stderr + filesystem side-effects. Stubbed until MON-003 / MON-010
 * ship the shell scripts themselves.
 */

describe('MON-003 e2e — Claude-side Monitor config + install-monitors.sh', () => {
  describe('End-to-end behavior (shell script exercise)', () => {
    test.todo('MON-003-001 e2e: install-monitors.sh reads pairing: and installs on Claude side only');
    test.todo('MON-003-002 e2e: monitors/ ships 3 files: 2 shell scripts + monitors.json');
    test.todo('MON-003-003 e2e: self-disable cleanly when Monitor unavailable');
    test.todo('MON-003-004 e2e: idempotent; no duplicate watchers');
    test.todo('MON-003-005 e2e: never install Monitor on non-Claude terminal');
    test.todo('MON-003-006 e2e: one-line install confirmation per monitor');
    test.todo('MON-003-007 e2e: liveness check fires STATE: monitor-dead');
  });
});
