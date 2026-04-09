# Example: `details.md` "Active Protocol" section — claims-monorepo

**Source**: `claims-monorepo/specs/details.md` lines 49-80 approximately, as of 2026-04-09
**License**: pulled from the claims-monorepo project with permission of the project owner; shown here as a reference implementation

---

## What this example shows

The **Layer 3 reification pattern** from multicheck's 3-layer architecture (upstream reference → project anchor → session state). This is the session-state layer: a manually-maintained, session-scoped summary of active rules, protocol overrides, current chat path, active goal, and any rules that have been adopted locally ahead of upstream fold-in.

The key insight this section demonstrates: **when the protocol changes mid-session, the operator/reviewer mirrors the critical new rule into `details.md` Active Protocol so that any resumption (context compaction, operator re-wake, new agent session) sees a stable summary before doing anything.** The running chat (`agentchat.md`) is append-only and noisy; `details.md` Active Protocol is the curated current state.

Sections in the example that are universal (could be used by any project):

- The goal-packet reference
- The canonical entry format (`[X-NNN]`, heredoc, monotonic, append-only)
- The accepted protocol states list
- The cascaded-slices diff-content check
- The branch-base topology check (with reference incident)
- The cross-layer value consistency check (with reference incident)
- The external asymmetric reviewer note
- The "mirror critical rules into `details.md`" meta-rule

Sections that are project-specific (not universal):

- Specific ticket numbers (`#607`, `#614`, etc.)
- The specific legacy schema (`consultations` / `meetings`)
- The reference to `pr.md` §11e and the `ConsultationStatus` union
- The specific commit SHAs (`fddba89e`, `f15c4ae8`, `325095ea`)

**Use this as a template for your own project's `details.md` Active Protocol section.** Copy the structure and the universal sections; replace project-specific sections with your own.

---

## The Active Protocol section (verbatim from claims-monorepo)

```markdown
## Active Protocol
- `specs/agentchat.md` is the canonical running chat for this in-flight session. Do not move it or create a second chat file.
- Before each new feature set, the builder must post a goal packet in `specs/agentchat.md` with:
  - `BIG_GOAL`
  - `CURRENT_GOAL`
  - `NON_GOALS`
  - `TICKETS`
  - `DONE_SIGNAL`
- Every substantive action requires a tagged builder entry in `specs/agentchat.md`. Unlogged substantive changes are a process violation.
- New chat entries are append-only and monotonic:
  - use canonical headings `### [X-NNN] HH:MM UTC — title`
  - use heredoc append writes
  - do not middle-insert or rewrite history
  - each new tag number must be strictly higher than the highest existing tag of that type
- Builder entries use `[S-NNN]`; reviewer entries use `[R-NNN]`; goal packets use `[G-NNN]`.
- Current accepted protocol states include:
  - `protocol-ack`
  - `protocol-sync`
  - `self-correction`
  - `archive-request`
- Reviewer pattern (cascaded slices): for any file touched by multiple slices in a stacked PR cascade, run `git diff <prior-cascade-sha>..<current-cascade-sha> -- <file>` to detect content drift. The slice-purity check `git diff --name-only` only detects which filenames changed, not whether content within an already-touched file silently mutated during rebase conflict resolution. Reference incident in the prior session archive: the consultation-status filter in `onboarding.repository.ts` was lost across cascade rebases between #608 and #621, restored by the #621 pre-promotion audit. Without a content check, the regression would have shipped to main.
- Branch-base topology check (both builder and reviewer, mandatory at stage 0 for every new slice AND at the start of every reviewer audit): before writing code OR verifying content, run:
  - `git fetch origin`
  - `git merge-base HEAD origin/main`
  - `git rev-parse origin/main`
  - `git log HEAD..origin/main --oneline`
  - `git diff --name-only origin/main...HEAD`
  If the merge-base does not match (or is not very close to) current `origin/main` HEAD, STOP. Rebase the branch onto current main OR create a fresh branch from current main before proceeding.
- Cross-layer value consistency check (both builder and reviewer, mandatory before any promotion): when a slice introduces or load-bears any new string value (enum variant, status, role, permission, claim type, error code, event name), that value MUST appear in every layer that represents the domain — DB constraint, Drizzle schema, TS union types, Zod schemas, API contract, exhaustive switches, fixtures.
- External asymmetric reviewer (recommended, not blocking): the in-protocol gate is the mandatory minimum. If an independently-prompted external reviewer is available, trigger it on the final head before `gh pr ready` and treat its findings as additional stipulations.
- If the protocol changes mid-session, mirror the critical rules into this file as well as the running chat so resumptions see a stable summary first.
```

---

## How this example relates to multicheck upstream

As of multicheck v0.5.0 (2026-04-09), several of the rules that were first mirrored into this Active Protocol section have been folded upstream:

- **Goal packet requirement** — upstream in `BUILDER.md` "Goal packets" section
- **Append-only monotonic entries with heredoc writes** — upstream in `BUILDER.md` "Writing to agentchat.md" section
- **Branch-base topology check** — upstream as Pre-flight Q2 in `BUILDER.md`, plus mechanical enforcement via `hooks/pre-push.sh`
- **Cross-layer value consistency check** — reviewer-time counterpart upstream as PENDING item #3 (queued); write-time counterpart as PENDING item #5 propagation manifest (prototyping on claims-monorepo, targeted for v0.5.1 or v0.6.0)
- **External asymmetric reviewer** — upstream in README.md 3-layer architecture section + meta-observation M4 in PENDING.md

The rules that STILL need project-local mirroring (as of v0.5.0):

- Session-scoped overrides specific to the project
- Specific ticket references and incident citations
- Project-specific file paths and schema names
- Rules that have been queued in PENDING but not yet folded (items #1, #3, #4)

The meta-rule ("mirror critical rules into `details.md` when they change mid-session") is the key generalization: **Layer 3 reification is not optional for projects using multicheck with any rule-level drift between sessions.**
