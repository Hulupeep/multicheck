# multicheck

Frameworkless multi-LLM builder/reviewer protocol. Two terminals, two different LLMs, one shared chat file.

One LLM builds. The other independently checks. Neither trusts the other's status updates.

There is no daemon, no watchdog, no state machine, no CLI to install. Just markdown files the agents read and follow.

---

## Why it works (and where the benefits come from)

The benefits come from one thing: **independent inspection**. Not from "two agents talking." Not from a clever prompt. From a second LLM that opens files, runs commands, queries databases, hits URLs, and reports what it actually saw — not what the first LLM said it would see.

Three forces produce the value:

1. **Asymmetric blind spots.** Two different models (e.g. Codex + Claude) have different training data, different failure modes, different things they overlook. What one misses, the other catches. Same-model setups lose most of this.
2. **Maker-checker pressure.** The builder behaves differently when it knows another LLM with different blind spots will independently check its work. Self-correction goes up before any challenge is even posted.
3. **Real execution, not just reading.** The reviewer's job is not to re-read the diff. It is to run the test command, hit the URL, query the DB, take the screenshot, grep for sibling files. Reading the code is step one of seven.

## What the value actually is

Most code review value in 2026 comes from automation: lint, type checkers, test suites, hooks, contract tests, CI gates. A second LLM that re-checks the code is mostly redundant with those.

What multicheck adds — and what real session data shows is its dominant value — is **process discipline enforcement**. In ~10 hours of one reference session, the dominant catch type was process violations, not code defects:

- silent scope expansion (committed files outside the declared scope)
- missing tagged disclosure (substantive change without an `[S-NNN]` entry)
- `--no-verify` without authorization
- non-canonical entry format usage (format drift)
- mid-file inserts and duplicate tags (append-only invariant violation)
- summarized hook output instead of verbatim
- wrong-file citation (misnamed source location)

Code defects were a minority of catches and most were close-calls corrected before they shipped (canonical-model lock, NOT NULL invariant verified at two layers, deprecated syntax round-trip, cascade rebase preservation).

This is the feature, not a bug. **Multicheck is primarily a process enforcement mechanism that happens to also catch code issues.** Framing it as "a reviewer AI that checks code" undersells what it actually does. The reason it's worth running is that automated tooling can't enforce process discipline — only an independent LLM with a different vocabulary can flag "this fix is technically correct but the bypass-without-authorization undermined trust."

## What it has caught (real session data)

In a single ~5-hour session on a calendar consolidation feature spanning 7 tickets, the protocol surfaced and corrected the following — none of which would have been caught by a solo agent:

| Finding | How it surfaced |
|---|---|
| **4 pre-emptive self-corrections** by the builder before any reviewer challenge could be posted | The threat of independent review changed builder behavior. 4 of 4 drafted reviewer challenges became obsolete before the reviewer hit send. |
| `--no-verify` bypass slipped past local hooks | Reviewer reproduced the failure independently, confirmed it was a real pre-existing issue, then flagged the bypass as a process violation regardless. Two-axis verdict: technical accept, process reject. |
| Silent scope expansion: 5 declared in-scope files → 7 actually committed | Reviewer compared `git show --name-only` against the in-scope list in `details.md`. |
| Wrong file citation in builder's failure analysis (`pipeline-engine.test.ts` vs `pipeline.schema.ts`) | Reviewer grepped the named file, got zero matches, demanded correction. |
| Ticket ordering bug: `#609` had to precede `#608` because legacy callers still target the old table | Reviewer inspected `consultation.repository.ts` and `onboarding.repository.ts` directly, not the builder's rationale. |
| Reviewer's own first fix recommendation would have created inconsistency in 3 unrelated packages | Reviewer caught it by grepping wider before posting. Self-verification of recommendations is now a hard rule. |
| Bonus structural verification: a NOT NULL invariant enforced at BOTH the migration DDL and the Drizzle TS schema | Reviewer went beyond the builder's claim and verified an adjacent invariant the builder hadn't asserted. |
| New ticket `#614` created mid-session because main lacked a runtime schema the next ticket assumed | Surfaced by independent inspection of `git ls-tree`, not by the original spec. |

**Quantitative summary of that session:**

- 14 builder entries, 9 reviewer entries
- 4 pre-emptive builder self-corrections (the headline metric)
- 4 of 4 drafted reviewer challenges obsoleted by self-correction before posting
- 7 tickets touched, 1 new ticket created mid-session
- 7 durable `gh issue` comments left across affected issues
- 2 commits independently verified
- 6 contract test runs executed by the reviewer (not the builder)
- 1 bypass incident surfaced and remediated
- 1 reviewer recommendation corrected before posting

This is one session on one project. The pattern is reproducible.

**Full catch log**: see [`metrics.md`](./metrics.md) for the append-only row-by-row record across all sessions and operators. Format spec and operator daily-ask procedure are in [`METRICS.md`](./METRICS.md). 1 in 3 catches in the seed data produced a new protocol rule — the metrics file is what makes the protocol self-correcting.

## Goal packets

Before starting any new feature set, the builder posts a `[G-NNN]` packet stating `BIG_GOAL`, `CURRENT_GOAL`, `NON_GOALS`, `TICKETS`, and `DONE_SIGNAL`. The reviewer is required to challenge any subsequent work that does not clearly advance the active goal.

This is the protocol's first defense against drift: a piece of work that compiles cleanly and tests cleanly but advances something other than what was agreed. Goal packets make the agreement explicit and refer-back-able. Format and reviewer enforcement details are in `BUILDER.md` / `REVIEWER.md`.

## Archive policy

Two triggers, both move files to `multicheck/archive/`:

1. **Session start (automatic)** — when the builder runs setup in a target project that already has a `multicheck/`, the prior contents are moved to `multicheck/archive/<UTC>/`.
2. **Feature-set rotation (operator-instructed)** — when the operator says "archive this and start fresh" or "move on to the next feature, archive the current," the builder posts `STATE: archive-request`, the reviewer acks (or rejects if work is open or untagged commits exist), and the builder moves the current chat and a `details.md` snapshot to `multicheck/archive/<UTC>-<descriptor>/`. The fresh chat starts with a "Related archives" header linking back, then the next `[G-NNN]` goal packet as its first entry.

**Tag numbering (`S-NNN`, `R-NNN`, `G-NNN`) continues across rotations** — references like "as we said in `[S-029]`" stay valid because the archive contains the older entries and the live chat has the newer ones. Never reset numbering on rotation.

The "Related archives" section in the new chat is operator-curated. By default it links the immediately previous archive; older archives are added manually as their context becomes relevant. This is the only cross-feature-set memory mechanism in Phase 1 — use it intentionally.

Cleanup of `multicheck/archive/` is operator-driven. No automatic retention.

Full procedure (8 steps with reviewer ack gate) is in `BUILDER.md` "Archive policy" section. Reviewer's check-before-accept rules are in `REVIEWER.md` "Archive request handling."

## Operational lessons folded into the protocol

These patterns emerged from real sessions and are now baked into `BUILDER.md` / `REVIEWER.md` / the `agentchat.md` template:

- **Heredoc append for chat writes.** `cat >> multicheck/agentchat.md <<'EOF' ... EOF` is byte-atomic at the kernel level (`O_APPEND` syscall) and never races with concurrent writers. Use this instead of `Edit` / `Write` tools, which hit "file modified since read" failures when anything else touches the file. The single quotes around `'EOF'` are required — they prevent shell expansion of `$`, backticks, and other metacharacters that appear in code references, commit hashes, and test output. In the reference session: ~10 heredoc writes, zero races; the prior 3 Edit/Write attempts all raced.
- **Append-only, monotonic, no middle inserts.** Entries land at the end of the file with strictly increasing tag numbers. The reference session hit duplicate `S-023` and `S-025` tags after builder tooling inserted entries in the middle of the file, and humans grepping linearly got confused. Now a hard rule.
- **Slice-purity verification for stacked PRs.** `git diff --name-only A..B` between every adjacent commit in the stack. Each diff should be exactly the files in that slice's intended scope. Any contamination blocks the PR. This verified a 5-commit chain (`#616 → #607 → #614 → #609 → #608`) in the reference session.
- **Filesystem grep, not git ref grep, for uncommitted changes.** `git grep <pattern> <ref>` shows the committed state of a ref and lies about staged edits. Use `grep -rn` when verifying changes that aren't yet in a commit. The reference reviewer almost incorrectly accused the builder of false claims because of this exact distinction.

---

## How to use

### One time

```bash
git clone https://github.com/Hulupeep/multicheck.git ~/code/multicheck
```

### Per project

Open two terminals in your target project root.

**Terminal A — builder:**
```
You are the builder. Read ~/code/multicheck/BUILDER.md and follow it exactly.
```

**Terminal B — reviewer:**
```
You are the reviewer. Read ~/code/multicheck/REVIEWER.md and follow it exactly.
```

That is the entire setup.

The builder will create `multicheck/` in your project root, fill out `multicheck/details.md` with real values from your repo, and post a first chat entry. The reviewer will run a baseline health check, post a first reviewer entry, and start checking the builder's work as it lands.

---

## Current provider pairing recommendation

As of 2026-04: **Codex is currently the stronger builder; Claude is the stronger long-running reviewer.** Use Codex in Terminal A and Claude in Terminal B.

This pairing rotates with each model release. Re-evaluate when a new version of either ships. The single most important thing is that **the two terminals are running different LLMs**. Same-model setups lose ~80% of the protocol's value because the asymmetric blind spots disappear.

---

## What you get in your target project after first run

```
multicheck/
├── .framework/          frozen snapshot of this repo as-of session start
├── details.md           project brief (filled by builder, baseline filled by reviewer)
├── agentchat.md         shared chat file (append-only by both agents)
├── archive/             prior sessions, auto-archived on re-run
└── sessions/            end-of-session metric reports
```

`multicheck/.framework/` is a `git clone` of this repo, frozen at the moment the session started. Both agents read the protocol from there, so the protocol is version-locked with the work. Updates to the upstream don't change the rules mid-session.

---

## Files in this repo

**Canonical specs (full protocol):**
- `BUILDER.md` — the canonical builder LLM instructions
- `REVIEWER.md` — the canonical reviewer LLM instructions
- `METRICS.md` — operator's daily-ask procedure for catch logging
- `CHANGELOG.md` — versioned changes (v0.5.0+)
- `PENDING.md` — queued protocol changes + meta-observations

**Aggregate data:**
- `metrics.md` — append-only catch log across all sessions and operators

**Templates copied into target projects during Phase 0:**
- `templates/details.md` — standardized project brief
- `templates/agentchat.md` — chat file scaffold with vocabulary documented inline
- `templates/session-report.md` — end-of-session metrics scaffold
- `templates/metrics.md` — empty metrics file
- `templates/claude-md.md` — **reviewer-role** protocol anchor, auto-injected into `CLAUDE.md` (Claude Code reads this at session entry)
- `templates/agents-md.md` — **builder-role** protocol anchor, auto-injected into `AGENTS.md` (Codex reads this at session entry)

**Tooling (v0.5.0+):**
- `hooks/pre-push.sh` — branch-base topology check (blocks pushes from stale bases)
- `install-hooks.sh` — installer script to wire hooks into a target project
- `templates/hooks/pre-commit-gate-file.sh.example` — optional reviewer-gate template

**Examples and case studies (v0.5.0+):**
- `examples/` — reference implementations from real projects (project-level PR gates, Active Protocol sections)
- `case-studies/` — preserved audit trails of reference sessions, indexed by date and project

Multicheck is markdown-first with minimal hooks. Most files the agents read are `.md`. The only executable code is two small shell scripts (`hooks/pre-push.sh` and `install-hooks.sh`) totaling ~140 lines of POSIX shell, both self-disabling in hostile environments.

## The 3-layer architecture

The multicheck protocol exists at three layers, each with different mutability and a different reader:

| Layer | File(s) | Mutability | Read by | Purpose |
|---|---|---|---|---|
| **Upstream reference** | `multicheck/.framework/REVIEWER.md`, `BUILDER.md`, `METRICS.md` | Version-locked at session start (cloned from this repo) | On-demand, when the project anchor says "read it" | Canonical spec; never changes mid-session |
| **Project anchor** | `CLAUDE.md` (reviewer-role) and `AGENTS.md` (builder-role) in the target repo | Refreshed once per session by Phase 0 | Auto-loaded by Claude Code / Codex at **session entry**, before any work | Role-specific pointers; survives fresh sessions; tells the agent the protocol exists |
| **Session state** | `multicheck/details.md` ("Active Protocol" section) and `multicheck/agentchat.md` | Changes constantly (every substantive action) | After the agent enters the repo and starts working | Live rules + the running ledger |

The dominant failure mode in real sessions is **session-entry drift**: a fresh agent session starts, reads `CLAUDE.md` / `AGENTS.md`, sees no mention of multicheck, and starts editing code without ever knowing there's a reviewer loop running. Phase 0 fixes this by refreshing the role-split anchors so every session entry sees the protocol immediately.

The role split matters: Claude Code reads `CLAUDE.md` and IS the reviewer (in the default pairing). Codex reads `AGENTS.md` and IS the builder. Each anchor file has only the rules for that agent's role — no role confusion, no wasted context. If the operator flips the pairing, swap the templates. The pattern is documented in BUILDER.md's Phase 0 step 5.

---

## Phase

**Phase 1.5** as of v0.5.0 (2026-04-09). Multicheck started as pure Phase 1 frameworkless — every rule enforced by LLM discipline reading instructions, no tooling. Real session data showed that markdown discipline has a ceiling: the builder in a reference session had a 15+ item gotcha checklist, ran every check they knew to run, and still missed a branch-base condition because it wasn't in the playbook. That cost 4 hours of rework.

Phase 1.5 adds **minimal hooks for automation where markdown has hit its ceiling**, without replacing the markdown discipline:

- `hooks/pre-push.sh` — blocks pushes from stale branch bases. Self-disables when offline, tolerates up to 5 commits of drift. The pre-flight Q2 (branch topology) is still the primary discipline; the hook is belt-and-suspenders for cases where the builder is tired, rushed, or new to the protocol.
- `templates/hooks/pre-commit-gate-file.sh.example` — optional template for projects using a reviewer-gate pattern with a shared ledger file.

Hooks are optional, self-disabling in hostile environments, and never a replacement for the markdown discipline. See the "Hooks" section below for install instructions.

Phase 2+ may add: a propagation manifest + contract schema extension for write-time cross-layer value consistency (currently prototyping on claims-monorepo), multi-repo coordination, a wakeup bridge for the reviewer LLM, and mutation testing as a verification step. Those are deferred until Phase 1.5 has produced enough sessions to prove which additional frictions warrant tooling.

The Phase 1 hypothesis held: most of the value comes from instructions and the asymmetric pairing, not from tooling. The session metrics above confirm that ~60% of catches are process-class findings and ~8% are code defects. Phase 1.5 closes the small number of markdown-ceiling gaps without shifting the protocol's center of gravity toward tooling.

## Hooks

Multicheck v0.5.0 introduces two git hooks. Both are opt-in via `install-hooks.sh` (or manual copy).

### Installing the default hook

From the root of your target project:

```bash
sh ~/code/multicheck/install-hooks.sh
```

This installs `hooks/pre-push.sh` into your target project's `.git/hooks/pre-push`. Any existing hook is backed up to `.git/hooks/pre-push.pre-multicheck.bak`.

### What `pre-push.sh` does

Every `git push`:

1. Runs `git fetch origin main` (silently exits if offline)
2. Computes `git merge-base HEAD origin/main` and compares to `git rev-parse origin/main`
3. If the branch is more than 5 commits behind main, blocks the push with an informative message pointing you to rebase or branch fresh
4. Otherwise, allows the push

Override per-push with `git push --no-verify` or raise the threshold with `MULTICHECK_PREPUSH_THRESHOLD=<N> git push`.

The hook is ~80 lines of POSIX shell. Read it at `hooks/pre-push.sh` before installing — that's ~2 minutes and guarantees you understand what's running in your git hooks path.

### Optional hooks (not installed by default)

**`templates/hooks/pre-commit-gate-file.sh.example`** — for projects using a reviewer-gate pattern with a shared ledger file (e.g., `multicheck/agentchat.md`). Enforces that source-code commits require an explicit reviewer clearance in the ledger before they can land.

This is an **opt-in template**, not a core feature. Most projects don't need it. It's provided for projects that have encountered the "gate skip under completion drive" failure mode (reference: claims-monorepo `#611` session, `[S-126]` incident, 2026-04-09).

To install:

1. Copy the template: `cp templates/hooks/pre-commit-gate-file.sh.example /path/to/target/.git/hooks/pre-commit`
2. Adjust the configuration block at the top (LEDGER_FILE, tag patterns, clearance strings, source-file pattern) to match your project
3. Make it executable: `chmod +x .git/hooks/pre-commit`

See the template file header for full documentation.

---

## Reporting back

After each session, the reviewer writes a metrics report to `multicheck/sessions/<UTC>.md` in your target project. If you find frictions worth reporting upstream, open an issue on this repo with the contents of that report.

## License

MIT.
