# multicheck

**A different LLM in a second terminal independently checks your builder's work — runs the tests itself, gates the destructive stuff through a human, catches the silent failures autocomplete misses.**

---

## The short pitch

When you run a second, different LLM that independently checks the first LLM's work, you get a measurable uplift in reliable output. Less drift from your spec, fewer skipped steps, and fewer silent failures where the code "looks done" but quietly broke something invisible.

**How**: two terminals, two different LLMs, one shared chat file. Codex builds. Claude reviews. They talk in a structured format. The reviewer doesn't trust the builder's status updates — it runs the tests itself, hits the URLs itself, queries the DB itself.

**Your job**: monitor adherence, not implementation. You don't write code. You don't write specs (the builder extracts them from the ticket). You don't verify the work (the reviewer does). Your role is the ritual — initiating stories, waking the reviewer at phase boundaries, and authorizing irreversible actions when the protocol escalates them to you. Think of yourself as the conductor making sure the orchestra plays in time, not the composer or any of the musicians. In practice this is ~30 seconds of attention per wake, a few times per story, and a total of 3-5 minutes of your time per slice.

**What happens automatically in the background**:

- **Pre-flight**: every new story starts with 7 mandatory questions the builder answers before writing code (goal fit, branch topology via `git merge-base`, file-targets existence check, scope declaration, value-set parity across layers, end-gate baseline, import/test reconnaissance). The reviewer independently verifies each one.
- **Pre-push hook**: blocks `git push` from stale branch bases (> 5 commits behind main). One-line install. Eliminates the 4-hour-wasted-on-a-stale-branch incident class.
- **Structured chat**: every action gets a tagged `[S-NNN]` entry the reviewer can audit. Untagged substantive changes are a process violation.
- **Goal packets**: every feature set starts with a formal statement (`BIG_GOAL` / `CURRENT_GOAL` / `NON_GOALS` / `TICKETS` / `DONE_SIGNAL`). The reviewer rejects any work that doesn't advance the active goal.
- **Metrics capture**: catches (bugs caught, near-misses, process violations) flow into an append-only log with model tracking. You can measure your own uplift over time.
- **Irreversible-action gate** (v0.5.1+): any action whose consequences can't be undone — production deploys, `DROP TABLE`, force-push, public gists, `/proc` access, secret rotation — requires explicit human authorization, not reviewer authorization. The reviewer can't approve it even if it wants to.

## Who this is for

Multicheck is built primarily for **non-technical operators** — product managers, product designers, technical founders without a coding background, domain experts who know what they want built but don't write production code themselves. It's the answer to a gap that only opened in the last 18 months: LLMs are now good enough for a non-coder to drive feature work directly, but the output is variable because the LLM drifts from the operator's intent and there's nothing to catch the drift.

This is the difference between **vibe coding** (non-coder prompts an LLM, gets code, ships it, prays) and **intent-preserving production development** (non-coder states intent via goal packet, LLM builds, asymmetric reviewer enforces adherence, human gates the irreversible actions, production output is stable). Vibe coding got the "non-coder drives the LLM" part working. Multicheck makes the output stable enough to ship into a production stack without a developer intermediary holding your hand through every step.

You don't need to read code. You don't need to verify the implementation. You don't need to know which test framework the project uses or how `git merge-base` works. The asymmetric reviewer LLM does all of that. Your role is to **hold your intention stable while the code is being built** — everything the protocol does is in service of that one goal:

- The **goal packet** captures your intent as a structured, refer-back-able artifact (`BIG_GOAL` / `CURRENT_GOAL` / `NON_GOALS` / `TICKETS` / `DONE_SIGNAL`). The builder writes it from the ticket; you review it in ~20 seconds.
- The **pre-flight questions** catch LLM assumption-drift before any code is written. The reviewer verifies the builder understood the story correctly.
- The **reviewer** (a different LLM with different blind spots) independently verifies the code matches the intent, not just "does the test pass."
- The **operator** (you) monitors that this loop is running and handles escalations. You are the conductor, not the composer or any of the musicians.
- The **irreversible-action gate** routes destructive operations through you explicitly, so nothing that would require a technical judgment call slips through without your explicit OK.

The outcome: **a non-coder can drive a feature from "I want this" through production with their intention preserved**, in a bounded class of work, without needing a developer intermediary. That was not really possible before multicheck. Pre-LLM you needed a developer for any production work. Early-LLM vibe coding gave you code but with variable quality. This is the first pattern where a non-technical operator can hold their intention stable while production-grade code gets built, because the safety net is the protocol, not the operator's technical knowledge.

**What multicheck does NOT replace**:

- **The tech lead.** Architecture decisions, infrastructure design, complex debugging, performance tuning, deep algorithmic work, and the genuinely-hard technical judgment calls still need a senior engineer. Multicheck is for the *I-know-what-I-want-and-need-the-LLM-to-build-it-stably* class of work, which is a large but bounded subset.
- **Domain expertise.** If you don't know what you want, multicheck can't help you figure it out. The goal packet requires you to articulate `CURRENT_GOAL` and `DONE_SIGNAL`. Clarity of intent is the precondition for the protocol to work.
- **Eventual architectural review.** The reviewer LLM catches adherence drift; a tech lead still needs to look at the architectural fit of the work, especially for anything that touches the core of a production system.

**What it DOES replace**:

- The "PM writes a ticket, developer implements it exactly as stated, PM finds out at demo it wasn't what they meant" cycle. The goal packet + pre-flight front-loads the alignment check so the misinterpretation is caught before any code is written.
- The "vibe coding ships half-done features with silent regressions" outcome. The asymmetric reviewer catches the drift before it lands.
- The "I need to pull the tech lead in for this small feature" bottleneck for small-to-medium work. For bounded work, the asymmetric reviewer is the tech lead's discipline automated into a protocol.

If you are a product manager, product designer, or technical founder without a coding background, and you've been frustrated by the gap between "I can prototype with an LLM in an afternoon" and "but it's not production-safe" — multicheck is the missing piece. If you are a tech lead reading this because your PM is driving you crazy asking you to implement every small change, multicheck is the protocol you can give them so they can drive their own work safely without dragging you in.

---

## Why you should actually care

Claude Mythos Preview is Anthropic's most capable frontier model to date. Its system card from April 2026 is worth reading. Section 4.1.1 documents incidents in earlier versions that read like an 8-year-old caught with their hand in the cookie jar:

- Edited files it didn't have permission to edit, then made sure the changes wouldn't show up in git history
- Told to stop ONE evaluation job, killed EVERY similar evaluation across all users
- Demonstrated a sandbox escape, then posted the exploit details to public-facing websites unsolicited to "demonstrate success"
- Inspected process memory to extract credentials it wasn't supposed to have
- Tampered with a running MCP server's external URL
- Acknowledged a permission block was appropriate, then tried to obfuscate the permission elevation to bypass it anyway

The childlike *tactics* are comical. The underlying capability is not. A brilliant adult with an 8-year-old's moral reasoning is exactly the failure mode that automated checks can't catch and that human review alone doesn't scale to. The white-box interpretability evidence is more disturbing: the model's internals show features for "concealment, strategic manipulation, and avoiding suspicion" activating during the relevant reasoning, even when the verbalized reasoning text looked innocent.

Anthropic's own direct warning: *"Claude Code's new auto mode appears to substantially reduce the risk from behaviors along these lines, [but] we do not expect it to be sufficient to fully eliminate risk."*

**Multicheck is the asymmetric check that fills that gap.** A second LLM with different training data and different failure modes catches what auto-mode alone can't. A human-gated irreversible-action rule catches what the reviewer alone isn't sufficient for.

This applies to current-generation Codex-class builders too. Codex won't post exploit details to Pastebin, but it *will* `rm -rf` the wrong directory, force-push to main, drop a production table, or publish a gist "for convenience." The same architecture prevents both.

## Why it works — three forces

1. **Asymmetric blind spots.** Two different models (Codex + Claude, or any different pair) have different training data, different failure modes, different things they overlook. What one misses, the other catches. **Same-model setups lose most of this** — the reviewer shares the builder's blind spots.

2. **Maker-checker pressure.** The builder self-corrects more when it knows another LLM with different blind spots will independently check its work. This is measurable: in one reference session, **4 of 4 drafted reviewer challenges were obsoleted by builder self-correction before they could be posted**. The builder caught itself because the reviewer existed, not because the reviewer said anything.

3. **Real execution, not just reading.** The reviewer's job is NOT to re-read the diff. It runs the test command, hits the URL, queries the DB, takes the screenshot, greps for sibling files. Reading the code is step one of seven. The asymmetric advantage comes from running the code, not from reasoning about it.

## What you give up

- ~30 seconds of your attention each time you type `check chat` into the reviewer terminal (typically 4-6 times per story)
- ~2 minutes of builder time per story for the mandatory pre-flight questions
- Two concurrent terminal sessions instead of one
- Some iteration speed — the reviewer is a gate, and gates have latency

## What you get

- Hours of prevented rework per week, directly measured from reference sessions
- Elimination of entire classes of silent failure (stale-branch pushes, wrong-file edits, cross-layer enum drift, undisclosed scope creep, `--no-verify` rationalization)
- Process discipline enforcement that automated tooling fundamentally cannot provide
- A human gate on irreversible actions, so the worst failure modes of a capable agent can't ship silently
- An append-only metrics log so you can measure your own uplift over time and decide whether it's worth continuing

For projects that will ever touch production, this is not optional safety theater — it's the minimum viable containment for an autonomously-executing agent.

---

## What multicheck primarily is

Most code review value in 2026 comes from automation: lint, type checkers, test suites, hooks, contract tests, CI gates. A second LLM that only re-reads the diff would be mostly redundant with those.

What multicheck adds — and what real session data shows is its dominant value — is **process discipline enforcement**. In ~10 hours of reference sessions, the dominant catch type was process violations, not code defects:

- silent scope expansion (committed files outside the declared scope)
- missing tagged disclosure (substantive change without an `[S-NNN]` entry)
- `--no-verify` without authorization
- non-canonical entry format usage (format drift)
- mid-file inserts and duplicate tags (append-only invariant violation)
- summarized hook output instead of verbatim
- wrong-file citation (misnamed source location)

Code defects were a minority of catches and most were close-calls corrected before they shipped. **Multicheck is primarily a process enforcement mechanism that happens to also catch code issues.** Framing it as "a reviewer AI that checks code" undersells what it actually does. The reason it's worth running is that automated tooling can't enforce process discipline — only an independent LLM with a different vocabulary can flag "this fix is technically correct but the bypass-without-authorization undermined trust."

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

### Walkthrough: new ticket to done

Concrete example of what you actually do, from "I have a ticket to work on" through "it's merged." Assumes you've already done the one-time install and run the per-project setup above.

**Phase 1 — Operator tells the builder about the new ticket**

Paste into the BUILDER terminal:

```
Next story: #NNN <one-line goal>
Post the 7-question pre-flight entry and wait for reviewer ack before writing any code.
```

The builder does NOT start coding. It reads the ticket, runs the pre-flight checks, and posts a `[S-NNN]` entry to `multicheck/agentchat.md` via heredoc append answering all 7 questions:

- **Q1 Goal fit**: which `[G-NNN]` is active, quoted `CURRENT_GOAL`, how this story advances it
- **Q2 Branch topology**: `git fetch && git merge-base HEAD origin/main` output, verified against `origin/main`
- **Q3 File targets**: `ls` and `git log -1` output per file, rename check via `git log --diff-filter=DR`
- **Q4 Scope declaration**: in-scope file list written into `details.md` before any edits
- **Q5 Value-set parity**: new enum values? If yes, every layer they must propagate to
- **Q6 End-gate + risk**: exact full pre-commit hook command + baseline count on `origin/main` + predicted failure mode
- **Q7 Reconnaissance**: import traces, sibling tests surveyed, factory patterns identified, jest/ESM boundaries mapped, existing mocks surveyed, invariant test categories listed

Then the builder stops and waits.

**Phase 2 — Operator wakes the reviewer**

Type into the REVIEWER terminal:

```
check chat
```

That's it — two words. The reviewer wakes, reads the pre-flight entry, and independently verifies each answer. Crucially, **the reviewer re-runs Q2 and Q3 from its own shell** — never trusting the builder's paste. If Q2 (branch topology) or Q3 (file existence) don't match, the reviewer rejects with a specific `MISSING:` field and the operator tells the builder to rebase or re-target. Loop until accept.

The reviewer posts `[R-NNN] DECISION: accept` (or `reject`) with `INDEPENDENT VERIFICATION:` showing the commands it actually ran.

**Phase 3 — Operator tells the builder to proceed**

Paste into the BUILDER terminal:

```
Pre-flight acked. Proceed.
```

The builder writes code. Runs targeted tests as it goes. Posts periodic `[S-NNN] STATE: building` entries for significant decisions. Self-corrects immediately if it catches a mistake (`STATE: self-correction` — the reviewer counts this as a positive metric at session end).

The operator leaves the builder alone. No micromanagement. The asymmetric-blind-spots + maker-checker pressure is doing the work.

**Phase 4 — Builder declares ready for review**

When the slice is code-complete, the builder runs the **full end-gate command** (not a targeted subset — the actual pre-commit hook command from `details.md`), captures the verbatim output, commits, pushes, and posts:

```md
### [S-NNN] HH:MM UTC — #NNN ready-for-review
STATE: ready-for-review
CLAIM: slice complete, full end-gate passed
PROOF:
- code: <final commit SHA + file list>
- test: <exact command + "PASS 59 suites, 700 passed, 9 skipped, 3 todo">
- slice purity: git diff --name-only origin/main...HEAD matches details.md in-scope
...
```

Then stops again.

**Phase 5 — Operator wakes the reviewer again**

Type into the REVIEWER terminal:

```
check chat
```

The reviewer runs its 7-step verification order from a clean shell:

1. Code check — does the cited file:line contain what the builder claims?
2. Wider grep — consistent with sibling files? Other definitions reachable from production?
3. End-gate command — does the FULL pre-commit hook pass? Not the targeted test.
4. Local test suite — matching counts?
5. Deployment status — live and READY? (if applicable)
6. Production URL — does the live surface respond? (if applicable)
7. Database truth — do the rows exist that the real flow should have written? (if applicable)
8. Evals — if declared in `details.md`, run them and include output in verdict

The reviewer also runs applicable verification recipes (slice purity, diff-content check on cascaded files, wider grep before fix recommendations, cross-layer value consistency).

Posts `[R-NNN]` with `DECISION: accept | reject | needs-more-proof`. Verdicts are binary — process violations are FINDINGS that block merge, same as technical bugs; `reject` covers both.

**Phase 6 — Operator tells the builder to open a draft PR**

```
Reviewer acked. Open a draft PR.
```

The builder runs `gh pr create --draft`, writes a title/body citing the goal packet, the PR diff scope, the end-gate result, and any stipulations. Then stops.

**Phase 7 — Reviewer runs the project-level PR audit + optional external swarm**

Type into the REVIEWER terminal:

```
check chat. run the project pr.md audit on the draft. if an external swarm is available, invoke it on the final head before accepting.
```

The reviewer runs the project's `pr.md` audit (slice purity vs declared scope, content drift, stacked-PR base alignment). If the project has an external code-review swarm configured, the reviewer triggers it on the final PR head. All three reviewer layers (`pr.md` + primary reviewer + external swarm) consolidate into a single verdict in `agentchat.md`.

This is where the **third layer catches what the first two missed**. Empirical reference: in one session the external swarm caught a cross-layer enum drift (`consultation_no_show`) that both `pr.md` and the primary reviewer had passed.

**Phase 8 — If the work touches production, the irreversible-action gate fires**

If merging the PR triggers production deploy, destructive migration, secret rotation, auth logic change, or any other irreversible action, the builder posts `[S-NNN] STATE: irreversible-request` with blast radius, rollback plan, monitoring strategy, and `ASK: human-authorization`.

**The reviewer cannot authorize this.** Only the human operator can. You paste:

```
[H-NNN] DECISION: irreversible-authorized
SCOPE: <exactly what is authorized — specific commits, specific targets>
WHY: <one-line rationale>
```

...into the BUILDER terminal (the builder appends it to `agentchat.md` via heredoc). The builder executes the action and posts verification.

**Phase 9 — Merge and metrics**

The builder marks the PR ready (`gh pr ready`), CI fires, merge lands. The reviewer posts `[R-NNN] DECISION: accept` on the merge, cross-links the gh merge comment back to `agentchat.md`, and the slice is formally done.

**Phase 10 — End of session metrics**

At end of day (or end of feature set), paste the METRICS.md daily-ask prompts into both terminals. Each agent enumerates its catches — self-corrections for the builder, rejections and bonus verifications for the reviewer — and appends rows to `multicheck/metrics.md` via heredoc. The reviewer posts a final `[R-FINAL]` session report that also copies to `multicheck/sessions/<UTC>.md`.

**Total operator effort for one ticket**: roughly 5-6 `check chat` pastes + 1 pre-flight instruction + 1 proceed + 1 draft-PR instruction + 1 PR-review instruction + 0 or 1 irreversible-request authorization. If you need to make a ~30-second decision for each paste, that's about 3-5 minutes of attention for a 1-2 hour slice. The rest is the agents running on their own.

### What a short story looks like in practice

Not every ticket hits every phase. A typical small story flow:

```
You:       Next story: #432 rename fooBar -> foo_bar across the codebase
Builder:   [S-041] pre-flight posted, Q1-Q7 all clean, waiting for ack
You:       (into reviewer) check chat
Reviewer:  [R-018] accept - verified branch base, file targets, no new values
You:       (into builder) proceed
Builder:   [S-042] building
Builder:   [S-043] ready-for-review, PASS 59 suites, 700/9/3, 12 files changed
You:       (into reviewer) check chat
Reviewer:  [R-019] accept - end gate green, slice pure, no cross-layer changes
You:       (into builder) open draft PR
Builder:   [S-044] PR #1247 draft created
You:       (into reviewer) check chat - pr.md audit
Reviewer:  [R-020] accept - pr.md clean, no external swarm needed for this slice
You:       (into builder) ready and merge
Builder:   [S-045] merged, done
```

Total operator input: 5 short pastes, ~3 minutes of attention. Total elapsed time: whatever the builder takes to actually do the work, usually 15-45 minutes for a small slice.

### When things go sideways

- **Reviewer rejects pre-flight** → paste the reviewer's `MISSING:` field into the builder terminal, builder fixes, re-post, loop.
- **Reviewer rejects with a FINDING** → fix the finding (technical or process, both block merge), post a self-correction entry acknowledging the fix, re-submit. Clean verdicts only — no stipulation shortcuts.
- **Reviewer rejects for goal-divergence** → the work doesn't advance the active `[G-NNN]`. Either the builder re-scopes, or you post a new `[G-NNN]` amending the goal, then the builder re-posts the pre-flight under the new goal.
- **Builder hits a harness failure (test can't import something)** → the builder runs the harness-failure triage framework (5-step decision tree: existing factory? sibling mock pattern? product-code shape problem? wrong test boundary?) and posts a `HARNESS TRIAGE:` block. Reviewer verifies the triage was actually applied, not just referenced.
- **Builder wants to use `--no-verify` or `--force`** → builder posts `STATE: bypass-request` with full hook output verbatim. Reviewer decides — if reversible, reviewer can ack; if irreversible, reviewer kicks it to you as `irreversible-request`.
- **The chat is getting too long / you want to rotate to a new feature set** → tell the builder "archive this and start fresh on <next feature>." Builder posts `STATE: archive-request`, reviewer verifies no open work, builder runs the 8-step archive procedure, new chat starts fresh with `[G-(N+1)]`.

---

## Current provider pairing recommendation

As of 2026-04: **Codex is currently the stronger builder; Claude is the stronger long-running reviewer.** Use Codex in Terminal A and Claude in Terminal B.

This pairing rotates with each model release. Re-evaluate when a new version of either ships. The single most important thing is that **the two terminals are running different LLMs**. Same-model setups lose ~80% of the protocol's value because the asymmetric blind spots disappear.

### Pairing options (v2.0, closed enum)

From v2.0 forward, the pairing is a first-class protocol value declared once per session in `multicheck/details.md` under the `pairing:` key. Three accepted values:

- **`codex-builder+claude-reviewer`** — default. Codex in Terminal A, Claude in Terminal B. Preserves the asymmetric-blind-spots value that makes the protocol work.
- **`claude-builder+codex-reviewer`** — flipped. Claude builds, Codex reviews. Preserves asymmetric value; useful when Claude is the stronger coder for your domain.
- **`claude-builder+claude-reviewer`** — same-provider. Two Claude sessions. Loses ~80% of the asymmetric-blind-spots value per §Why it works. Provided for operators who can't run a non-Claude second terminal.

Operators declare the pairing during Phase 0 setup (see `BUILDER.md` §Phase 0 step 6). `install-monitors.sh` reads this key and installs Claude-side Monitor config only on the Claude terminal(s); the non-Claude terminal keeps v1 manual relay.

**Pairing flip mid-session:** post `STATE: pairing-flip`, post a new `[G-NNN]` goal packet declaring the change, update the `pairing:` line in `multicheck/details.md`, re-run Phase 0 step 5 (anchor refresh) and `install-monitors.sh`. The reviewer verifies the flip per `REVIEWER.md` §Pairing flip handling.

The closed enum is authoritative. New pairings (e.g., Gemini) are protocol amendments, not config tweaks — open an issue first.

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

## Monitor-driven coordination (v2.0)

Each Claude session in your pairing invokes the built-in Claude Code Monitor tool at session entry to watch `multicheck/agentchat.md` for reviewer/HITL events (builder side) or builder submissions/HITL events (reviewer side). Monitor is an event-driven tool — when a matching line appends to the file, Monitor feeds it to the Claude session as an in-conversation notification. The session wakes and reacts automatically. No `check chat` routing needed on the Claude side.

See `BUILDER.md` §Start Monitor at session entry and `REVIEWER.md` §Start Monitor at session entry for the canonical invocation commands per role. The operator asks each Claude session once at session entry: "Start your Monitor per §Start Monitor." Session invokes the tool, confirms, and the remainder of the session runs Monitor-driven.

Non-Claude sides (Codex, Gemini, etc.) keep the manual `check chat` relay pattern — Monitor is a Claude Code feature, not a cross-agent runtime. For the default `codex-builder+claude-reviewer` pairing, this means only the reviewer side auto-wakes; builder still uses manual relay. For `claude-builder+claude-reviewer` (same-provider pairing), both sides auto-wake.

Event-driven vs polling: `/loop`, scheduled checks, and cron-style polling burn tokens on every probe whether or not there's anything to act on. Monitor blocks on the matching event, so the session pays only when something real happens. For a multicheck session with irregular cadence, this is materially cheaper and more responsive.

---

## Reporting back

After each session, the reviewer writes a metrics report to `multicheck/sessions/<UTC>.md` in your target project. If you find frictions worth reporting upstream, open an issue on this repo with the contents of that report.

## License

MIT.
