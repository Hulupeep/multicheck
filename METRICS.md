# METRICS.md — how to collect and report multicheck catches

This file explains how operators collect catch data from running multicheck sessions and where that data lives. The actual aggregate data is in `metrics.md`. New session catches go in `multicheck/metrics.md` inside each target project.

## Why this exists

The multicheck protocol's value comes from one thing: **catches that a single LLM would have missed**. The most useful evidence for "is this worth running" is a concrete log of those catches — not a manifesto, not a benchmark, just a list of "here's what was found, by whom, on what date, with what evidence."

`metrics.md` is that log. It is:

- **Append-only** — never edit existing rows, only add new ones
- **Manual** — operators ask their agents at the end of each session and the agents append the results
- **Concrete** — every row cites a commit, an entry tag, a file:line, or a grep result
- **Honest** — near-misses, false positives, and reviewer mistakes go in too

---

## File locations

| File | Purpose |
|---|---|
| `multicheck/METRICS.md` (this file) | Format spec, paste-able operator prompts |
| `multicheck/metrics.md` (in this repo) | Aggregate catch log across sessions and operators |
| `multicheck/templates/metrics.md` | Empty template that operators copy into target projects |
| `<target-project>/multicheck/metrics.md` | Operator's local data for sessions they run |

Operators may periodically PR their session catches back upstream into this repo's `metrics.md`. That makes the aggregate file richer over time and gives new operators evidence to point at.

---

## Format

Every row is one catch. The columns are:

| Date | Catch type | Severity | Caught by | Builder model | Reviewer model | Description | Evidence |
|---|---|---|---|---|---|---|---|
| 2026-04-07 | process-violation | high | reviewer | codex-gpt-5 | claude-opus-4.6 | builder used --no-verify on commit 58327df without prior bypass-request | [R-006], commit 58327df |

The `Builder model` and `Reviewer model` columns were added in v0.5.1 to enable capability-correlation analysis. Rows from before v0.5.1 do not have these fields populated; they can be backfilled when known. The current recommended pairing is noted in the legend.

### Date

ISO date `YYYY-MM-DD`. UTC.

### Catch type — exactly one of

- **`pre-emptive-self-correction`** — builder caught a mistake in its own work BEFORE the reviewer challenged. The highest-value behavior in the protocol. The threat of independent review producing disclosure without challenge.
- **`process-violation`** — `--no-verify`, `--force`, deleted lockfile, scope expansion not disclosed in advance, hook output summarized instead of pasted, anti-vocabulary phrase, untagged builder commit, middle-insert into chat file.
- **`technical-bug`** — the code is wrong. Reviewer caught a real defect.
- **`goal-divergence`** — work was technically clean but did not advance the active `[G-NNN]` goal packet, OR addressed something on the `NON_GOALS` list.
- **`near-miss`** — something almost shipped wrong. Catch was on a draft / pre-commit / staged state, not on a delivered claim.
- **`wrong-file`** — builder edited a file that production doesn't import from. The change was real but unreachable.
- **`test-gap`** — test passes but asserts the wrong thing. Test is green AND production code is broken. Caught by mutation testing or by inspecting the test against the spec.
- **`slice-impurity`** — a stacked PR commit contains files outside its declared slice scope. Caught by `git diff --name-only A..B`.
- **`bonus-structural-verification`** — reviewer verified an invariant the builder didn't claim. Going beyond the ask. Found a stronger guarantee than what was on offer.
- **`recommendation-corrected`** — reviewer drafted a fix recommendation that would have created inconsistency, caught it by grepping wider before posting. Self-catch by the reviewer.
- **`baseline-pre-existing-failure`** — pre-flight baseline health check on `origin/main` surfaced a failure that was about to become a builder excuse.
- **`heredoc-race-avoided`** — write to chat file via heredoc append succeeded under conditions where Edit/Write would have raced and been lost.
- **`other`** — anything else. Use sparingly and explain in Description.

### Severity

- **`low`** — cosmetic, missed best practice, would have been caught later anyway
- **`medium`** — would have produced a small bug, audit trail gap, or hour of confusion
- **`high`** — would have shipped a real defect, broken production, or required a rollback
- **`critical`** — would have caused data loss, security issue, or extended outage

### Caught by

- **`builder`** — for `pre-emptive-self-correction` only. The builder caught its own mistake.
- **`reviewer`** — for everything else that a human-ish reviewer found. Includes findings in the builder's work OR in its own draft.
- **`operator`** — rare. The human operator caught something neither agent did. Counts as an anti-pattern (means the protocol missed it) but should still be logged.
- **`hook`** — a git hook or other automated check blocked the bad state mechanically. Examples: `hooks/pre-push.sh` blocks a stale-base push; `templates/hooks/pre-commit-gate-file.sh.example` blocks a commit missing reviewer clearance. Hook catches are valuable data — they show automation closing the markdown-discipline ceiling — and should be logged with the hook name and commit SHA (or push attempt) as evidence.

### Builder model / Reviewer model

Exact model and provider string. Examples:

- `codex-gpt-5` (OpenAI Codex CLI)
- `claude-opus-4.6` (Claude Code)
- `claude-mythos-preview` (Claude Mythos Preview, limited access via Project Glasswing)
- `claude-sonnet-4.6`
- `claude-haiku-4.5`
- `gemini-2.5-pro`
- `unknown` — use only when the operator didn't record it; avoid if possible

The pairing matters. Same-model pairs (e.g. `claude-opus-4.6 / claude-opus-4.6`) lose most of the asymmetric-blind-spots advantage. Different-model pairs (e.g. `codex-gpt-5 / claude-opus-4.6`) are the recommended configuration. Mixed-capability pairs (e.g. `claude-mythos-preview / claude-opus-4.6`) are the emerging frontier — the stronger model as builder, the older model as reviewer provides catches the stronger model alone would miss.

Recording the pairing on every row enables later analysis: "Does a Mythos-class builder produce fewer technical-bug catches but the same number of process-violation catches? Does same-model pairing drop self-correction rates?"

### Description

One line. Format: `<what was claimed/done> — <what was wrong> — <how it was found>`. Be concrete. Cite specific identifiers (file names, ticket numbers, commit hashes) inline.

### Evidence

Citation that can be verified later. Include at least one of:

- Commit hash (`git show <sha>`)
- Entry tag (`[S-NNN]` or `[R-NNN]`)
- File:line (`packages/db/schema.ts:42`)
- Grep command that reproduces the finding
- gh issue comment URL

---

## How to ask the agents (daily or end-of-session)

The metrics protocol is operator-driven. At the end of each day or session, the operator pastes the appropriate prompt into each terminal. The agents enumerate their catches and append them to `multicheck/metrics.md` using the heredoc append pattern.

### Reviewer ask — paste into reviewer terminal

```
End-of-day metrics check. List every catch you made in this session
since the last metrics check (or since session start if this is the
first one). Append one row per catch to multicheck/metrics.md using
the format specified in multicheck/.framework/METRICS.md.

Use the heredoc append pattern:

cat >> multicheck/metrics.md <<'METRICS_EOF'
| YYYY-MM-DD | <type> | <severity> | reviewer | <description> | <evidence> |
METRICS_EOF

Catch types: pre-emptive-self-correction | process-violation |
technical-bug | goal-divergence | near-miss | wrong-file | test-gap |
slice-impurity | bonus-structural-verification | recommendation-corrected
| baseline-pre-existing-failure | heredoc-race-avoided | other

Severity: low | medium | high | critical

For each catch, the Description must include:
- what the builder claimed or did
- what you found wrong
- how you found it (the command, the grep, the inspection)

Evidence: commit hash, entry tag [S-NNN] or [R-NNN], file:line,
grep command, or gh comment URL.

Include catches you made on yourself too — the recommendation-corrected
type covers the case where you caught your own draft fix before posting.

Append only. Do not modify existing rows. Do not delete rows. Use
heredoc only. After appending, tell me how many rows you added and
list the catch types in summary.
```

### Builder ask — paste into builder terminal

```
End-of-day metrics check. List two things in multicheck/metrics.md:

1. Every STATE: self-correction entry you posted in this session
2. Every reviewer catch in your work (every time the reviewer posted
   accept-with-stipulations or reject)

Append one row per catch using the heredoc pattern:

cat >> multicheck/metrics.md <<'METRICS_EOF'
| YYYY-MM-DD | self-correction | <severity> | builder | <desc> | [S-NNN] |
| YYYY-MM-DD | <type> | <severity> | reviewer | <desc> | [R-NNN] |
METRICS_EOF

For self-corrections (caught by you): catch type is pre-emptive-self-correction.
For reviewer catches in your work: caught by is "reviewer", catch type
is whatever the reviewer flagged (process-violation, technical-bug, etc).

Description must include:
- the original claim or action
- what was wrong
- the entry where it was caught/corrected

Evidence: the [S-NNN] or [R-NNN] entry tag in the chat.

Append only. Use heredoc only. After appending, tell me how many rows
you added and list the catch types in summary.
```

### Operator self-ask

If you (the operator) caught something neither agent did, or if you're filling in retroactively from memory, append directly via heredoc from your shell:

```bash
cat >> multicheck/metrics.md <<'METRICS_EOF'
| YYYY-MM-DD | <type> | <severity> | operator | <description> | <evidence> |
METRICS_EOF
```

Operator catches are rare and worth logging — they indicate a protocol gap that the agents missed.

---

## When to ask

Two cadences work in practice:

- **Daily** — at end of working day, ask both agents. Captures the day's catches while context is fresh.
- **End of feature set** — right before posting `STATE: archive-request`, ask both agents to enumerate catches for the entire feature set. This batches catches with the feature-set boundary so the metrics file naturally segments by feature.

Pick one and stick to it. Mixing cadences leads to overlap and gaps.

---

## Sharing back upstream

After a session, if you want your catches to appear in the upstream `multicheck/metrics.md`:

1. Copy the new rows from `<target-project>/multicheck/metrics.md`
2. Sanitize: replace project-specific identifiers (commit hashes, ticket numbers, file paths) only if you want anonymization. **By default, do not anonymize** — concrete catches with real identifiers are more useful as evidence for other devs.
3. Open a PR against `Hulupeep/multicheck` adding the rows to `metrics.md`
4. The PR description should name the date range, the project type (e.g. "Next.js + Supabase," "Express + Postgres," "Rust CLI"), and the model pairing (e.g. "Codex builder, Claude reviewer")

Or just open an issue with the rows pasted in and a maintainer will fold them in.

---

## What this file is NOT

- **Not a leaderboard.** No "team A caught more than team B." The point is evidence, not competition.
- **Not a quality gate.** A session with zero catches is not a failure — it might mean the codebase is clean, or it might mean the protocol is degraded. Reviewer's session-end report flags degraded sessions.
- **Not a substitute for the reviewer's session report.** The session report has full detail. `metrics.md` is the high-level catch index across sessions.
- **Not auto-generated.** Manual is intentional. The act of asking the agents to enumerate their catches is itself part of the protocol — it forces them to review what they did, and it produces honest answers because they know their answer will sit alongside the reviewer's independent answer in the same file.
