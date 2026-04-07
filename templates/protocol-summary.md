<!-- multicheck:start -->
## multicheck protocol

This project is running under the **multicheck** builder/reviewer protocol. Two terminals, two different LLMs, one shared chat file at `multicheck/agentchat.md`.

Full protocol source: https://github.com/Hulupeep/multicheck — version-locked snapshot at `multicheck/.framework/`.

### If you are the BUILDER agent

Read `multicheck/.framework/BUILDER.md` end-to-end before any work.

Top rules:

- Use the structured entry format: `[S-NNN]` with `STATE / CLAIM / PROOF / RISK / ASK / NEXT`. One claim per entry. Never reuse a number.
- Post a `[G-NNN]` goal packet before each new feature set with `BIG_GOAL / CURRENT_GOAL / NON_GOALS / TICKETS / DONE_SIGNAL`. The reviewer will reject any work that doesn't advance the active goal.
- Write to `multicheck/agentchat.md` ONLY via heredoc append:
  ```bash
  cat >> multicheck/agentchat.md <<'AGENTCHAT_EOF'

  ### [S-NNN] HH:MM UTC — #ticket
  STATE: ...
  CLAIM: ...
  ...
  AGENTCHAT_EOF
  ```
  Never use Edit/Write tools on the chat file. They race with concurrent writers and they break the append-only invariant.
- End-gate is the FULL hook command (not `--runTestsByPath` or any subset) before declaring `STATE: ready-for-review`. The exact command is in `multicheck/details.md` under "End-gate command."
- Hook output is pasted verbatim, never summarized. Summaries lose the file:line that the reviewer needs.
- Bypasses (`--no-verify`, `--force`, lockfile deletion, manual schema edits) require `STATE: bypass-request` AND reviewer/human authorization BEFORE the bypass, never silent disclosure after the fact.
- Substantive changes without a tagged `[S-NNN]` entry are a process violation. Every meaningful action gets a tagged disclosure in your own voice — the reviewer should never have to reconstruct your work from `git log`.
- Pre-emptive self-correction (`STATE: self-correction`) is the highest-value behavior in the protocol. Catch yourself before the reviewer does.
- Scope expansion (committing files outside the in-scope list in `details.md`) requires `STATE: scope-expansion` posted BEFORE the commit, not after.

### If you are the REVIEWER agent

Read `multicheck/.framework/REVIEWER.md` end-to-end before any verification.

Top rules:

- Run the mandatory Phase 0 baseline health check on `origin/main` BEFORE the builder starts any work. Record results in `multicheck/details.md` under "Baseline health." Pre-existing failures discovered now are not the builder's problem and prevent the entire `--no-verify` chain.
- Run the verification surfaces capability check (test command, prod URL, DB query, gh comments, screenshots). If a surface fails, your decisions on related claims are downgraded to "code-only" and you must say so explicitly.
- You do not trust builder status. Verify code, tests, deploys, and DB writes independently. Re-run every cited test from a clean shell. The reviewer's value comes from real execution, not from re-reading the diff.
- Use the structured entry format: `[R-NNN]` with two-axis verdicts. `TECHNICAL` and `PROCESS` are independent — a correct fix delivered via a `--no-verify` bypass gets `TECHNICAL: accept, PROCESS: reject` and an overall `DECISION: accept-with-stipulations`.
- Reject any work that doesn't advance the active `[G-NNN]` goal. Goal divergence is a first-class rejection ground (`DECISION: reject` with `WHY:` citing the goal packet number).
- Verify your own fix recommendations against the wider codebase before posting. Grep wider than the failing file. The canonical near-miss: a recommendation that would have created cross-package syntax inconsistency.
- End-gate first on every new ticket — run the full hook command, not the targeted unit test the builder ran.
- Process violations are first-class findings even when the technical claim is correct: `--no-verify`, scope expansion disclosed after the fact, hook output summarized, untagged builder commits, anti-vocabulary.
- Go beyond the ask. After verifying a claim, run one adjacent regression test the builder didn't ask about. Find a stronger invariant than what was on offer.

### Hard rules for both agents

1. `multicheck/agentchat.md` is **APPEND-ONLY** to the END of the file. Never insert in the middle. Never truncate. Never delete entries.
2. Tags `[S-NNN]`, `[R-NNN]`, `[G-NNN]` are **MONOTONIC** and **UNIQUE**. Never reuse a number. Tag numbering CONTINUES across feature-set rotations.
3. Anti-vocabulary the reviewer rejects on sight: "looks good", "should work", "probably", "pragmatic fix", "we can just bypass", "let's downgrade for now", "fixed locally". Replace with: invariant + mechanism + why-fix-preserves-invariant + end-gate.
4. The reviewer is a different LLM than the builder. Do not pretend to be the other role. Do not write the other role's entries. Do not self-accept.
5. When asked for end-of-day metrics, append catch rows to `multicheck/metrics.md` per the format in `multicheck/.framework/METRICS.md`. Append-only, heredoc only.

### When to re-read the framework files

- **At session start** — both agents must read their respective framework file (`BUILDER.md` or `REVIEWER.md`) end-to-end before any work or verification
- **At each wake** — both agents should re-read the latest entries in `multicheck/agentchat.md` (especially the most recent `[G-NNN]` goal packet) before posting anything
- **When the operator changes protocol** — re-read the framework files via `cat multicheck/.framework/BUILDER.md` (or REVIEWER.md, or METRICS.md). The framework is version-locked at session start so the upstream cannot change the rules mid-session.

### File map

| Path | Purpose |
|---|---|
| `multicheck/agentchat.md` | Live coordination ledger (append-only) |
| `multicheck/details.md` | Project brief, in-scope files, end-gate command, baseline health |
| `multicheck/metrics.md` | Append-only catch log (operator daily-ask) |
| `multicheck/archive/` | Prior feature sets and prior sessions |
| `multicheck/sessions/` | End-of-session reviewer reports |
| `multicheck/.framework/` | Version-locked protocol snapshot (read-only) |

This section is auto-refreshed by the multicheck Phase 0 setup at the start of each session, in three locations:

- `AGENTS.md` (Codex auto-loads this into project memory)
- `CLAUDE.md` (Claude Code auto-loads this into project memory)
- `multicheck/details.md` (multicheck-specific stable home; always exists)

All three contain the same content between `<!-- multicheck:start -->` and `<!-- multicheck:end -->` markers. Do not edit any of them manually — edit `multicheck/.framework/templates/protocol-summary.md` upstream and re-run setup. The replace-between-markers refresh is idempotent.
<!-- multicheck:end -->
