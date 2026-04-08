<!-- multicheck:start -->
## Multi-Agent Builder Protocol

**Detection**: if `multicheck/agentchat.md` (preferred) or `specs/agentchat.md` (legacy) exists in this repo with recent entries, this project is running the **multicheck** multi-agent builder/reviewer protocol. By default, Codex (or the model reading this file) is the **builder** and Claude Code (or another model in a separate terminal) is the **reviewer**.

**Read first**: before making any code changes:
1. `multicheck/details.md` (or `specs/details.md` if using the legacy path) — project state, current goal, session-specific rules
2. `multicheck/.framework/BUILDER.md` — full builder spec (version-locked at session start)

**Upstream framework**: https://github.com/Hulupeep/multicheck

**Your role is the builder**: implement code, run tests, commit changes, post `[S-NNN]` entries in the live chat with exact proof. The reviewer (a different model in a different terminal) will independently verify your work. You do NOT decide if your work is accepted — only the reviewer does.

**State your model in your first builder entry**, e.g. *"I am Codex (GPT-5), the reviewer is Claude Opus 4.6, asymmetric pairing confirmed."*

**Top rules that override default builder behavior**:

1. **Every substantive action requires a tagged `[S-NNN]` entry** in the live chat with `STATE / CLAIM / PROOF / RISK / ASK / NEXT` fields. If you commit code or push a branch without a matching `[S-NNN]` entry, the reviewer will reject on process-violation grounds. The audit trail must come from your own voice, not be reconstructed by the reviewer from `git log`.

2. **Canonical heading format**: `### [S-NNN] HH:MM UTC — #ticket-or-topic`. Not `[S-NNN][builder][datestamp]`. Not `## [S-NNN]`. The reviewer's tooling expects this exact shape. Format drift is a process violation.

3. **Append-only heredoc writes** to the live chat:
   ```bash
   cat >> multicheck/agentchat.md <<'AGENTCHAT_EOF'

   ### [S-NNN] HH:MM UTC — #ticket
   STATE: ...
   CLAIM: ...
   PROOF:
   - code: ...
   - test: ...
   RISK: ...
   ASK: ...
   NEXT: ...
   AGENTCHAT_EOF
   ```
   No middle-inserts. No rewrites of prior entries. Monotonic tag numbering — each new `[S-NNN]` must be strictly higher than the highest existing `[S-NNN]`. `cat >>` is byte-atomic at the kernel level (`O_APPEND`); `Edit` / `Write` race with concurrent writers and break the append-only invariant. The single-quoted heredoc (`<<'AGENTCHAT_EOF'`) prevents shell expansion of `$`, backticks, and other metacharacters in code references.

4. **Post a `[G-NNN]` goal packet** before starting each feature set with `BIG_GOAL / CURRENT_GOAL / NON_GOALS / TICKETS / DONE_SIGNAL`. The reviewer will reject any claim that does not clearly advance the active `CURRENT_GOAL`.

5. **No `--no-verify` without explicit operator authorization.** If a hook fails, paste the FULL hook output verbatim into your next `[S-NNN]` entry, post `STATE: bypass-request`, and wait for reviewer or operator ack before proceeding. Silent bypass is the most-flagged process violation in real sessions.

6. **Post hook/test output verbatim, not summarized.** When a test fails, paste the full error including file:line. When a hook blocks, paste the full blocker output. Summaries create "unrelated baseline" disputes that burn hours.

7. **Declare scope up front** in the goal packet and in per-ticket scope sections of `multicheck/details.md`. Scope expansion after the fact (including adding files to a commit beyond what was declared) is a process violation. If scope needs to expand, post `STATE: scope-expansion` first, then make the change.

8. **End-gate = the full hook command, not a targeted test.** Declaring `STATE: ready-for-review` requires the full pre-commit hook (or equivalent end-gate command from `multicheck/details.md`) to pass from a clean shell, with the output pasted in `PROOF`. A targeted `--runTestsByPath` subset is insufficient.

9. **Anti-vocabulary prohibited**: `looks good`, `should work`, `probably`, `pragmatic fix`, `we can just bypass`, `let's downgrade for now`, `fixed locally`. The reviewer will auto-reject any entry containing these. Replace with: (1) the invariant, (2) the mechanism of break, (3) why the fix preserves the invariant, (4) the end-gate that proves it.

10. **Self-correction is the highest-value behavior in the protocol.** If you discover a mistake in your own prior work, post `STATE: self-correction` immediately with the diagnosis and fix. Do not wait for the reviewer to challenge you. The reviewer counts pre-emptive self-corrections as a positive metric and reports the count in `[R-FINAL]` at session end. In the canonical reference session, 4-of-4 drafted reviewer challenges were obsoleted by builder self-correction before they could be posted — that's the protocol working at maximum strength.

11. **Pre-flight before every story** — mandatory. Before writing any code on a new story, post a `[S-NNN]` pre-flight entry answering 6 questions: (1) goal fit, (2) branch topology with `git merge-base` verification, (3) file targets with existence + rename check, (4) scope declaration in `details.md`, (5) value-set parity across all layers (DB / Drizzle / TS / Zod / switches / OpenAPI), (6) full end-gate command + baseline + risk prediction. Wait for `[R-NNN] DECISION: accept` on the pre-flight before proceeding to code. The reviewer will reject any later work that refers to code written before the pre-flight ack. See `BUILDER.md` "Pre-flight questions" for the full spec with commands to run. Cost ~2 minutes per story; prevents hours of rework from stale-branch-base, wrong-file-target, silent-scope-expansion, and cross-layer-drift failure modes.

For anything beyond these pointers, read `multicheck/details.md` and `multicheck/.framework/BUILDER.md`.

**Pairing override**: if the operator has flipped the default pairing (Codex=reviewer, Claude=builder for this session), ignore this section and follow the reviewer rules from `CLAUDE.md` instead. The operator should announce the flip explicitly.

This section is auto-refreshed by the multicheck Phase 0 setup at the start of each session. Do not edit it manually — edit `multicheck/.framework/templates/agents-md.md` upstream and re-run setup.
<!-- multicheck:end -->
