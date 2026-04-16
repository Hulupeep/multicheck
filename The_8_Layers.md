Multicheck is a process operating system for LLM-driven software work — designed so a non-technical operator can hold their intent stable while a fallible LLM agent produces production-grade output, with the reliability coming from the structure
  surrounding the agent rather than from the agent itself.

Concretely it does five things no pair-programmer setup does:

  1. It captures intent as a structured artifact, not a conversation.
  The goal packet is durable, refer-back-able, and quoted verbatim at every gate. Pair programming has no equivalent — intent lives in two heads and drifts.

  2. It treats the agent as an untrusted contributor.
  Pre-flight Q1–Q7, asymmetric reviewer, mechanical hooks, append-only ledger — every layer assumes the agent will skip steps, hallucinate paths, or drift from the spec under completion pressure. Pair programming assumes both pairs are trustworthy
  peers.

  3. It separates the human role from the technical work.
  The operator authorizes irreversible actions but does not write code, write specs, or verify implementation. That separation does not exist in pair programming — the human is in the code. In multicheck, the human is above the code, gating the
  dangerous moves.

  4. It is mechanically enforced, not procedurally enforced.
  Pre-push topology hook, pre-commit gate sequence, irreversible-action gate, append-only ledger — these run regardless of agent compliance. Pair programming has no enforcement layer; both pairs can mutually agree to skip a step.

  5. It compounds.
  Every catch becomes a rule. R-035 stale-base incident → §0.5 topology gate. R-040 cross-layer miss → §11e. R-050 shallow-sweep → §11f endpoint classification. R-046 timer leak → §11f performance hat. The system gets harder to fool over time. Pair
   programming has no compounding mechanism — yesterday's lesson dies when the pair changes.


The 8 Layers of multicheck:
  Layer 1 — The physical setup

  Two terminals, two different LLMs, one shared file (specs/agentchat.md).

  - Terminal A: builder (this session: Codex GPT-5).
  - Terminal B: reviewer (this session: Claude Opus 4.6).
  - The reviewer is adversarial by construction — does not trust the builder's status, runs the tests itself, greps the code itself, queries the DB itself.
  - If both terminals are the same model, ~80% of the protocol's value is gone (from BUILDER.md). Different LLMs → different blind spots → asymmetric catches.
  - Operator (human) is conductor, not composer. ~3–5 minutes of attention per slice.

  Layer 2 — The intent layer (goal packet)

  Before any ticket starts, the operator and builder lock in a goal packet:

  - BIG_GOAL — the mission-level objective (this session: "operational meetings milestone")
  - CURRENT_GOAL — the immediate verbatim goal the builder must cite at every pre-flight
  - NON_GOALS — explicit exclusions (prevents drift into adjacent work)
  - TICKETS — the scope of tickets that advance CURRENT_GOAL
  - DONE_SIGNAL — how we know we're done

  Every pre-flight Q1 quotes CURRENT_GOAL verbatim. Anything that doesn't advance it gets rejected.

  Layer 3 — The pre-flight gate (Q1–Q7)

  Before writing any code, builder posts a [S-NNN] pre-flight packet answering 7 mandatory questions. Reviewer independently verifies every answer before ack.

  ┌─────┬───────────────────┬─────────────────────────────────────────────────────────────────────────────────────────────────┐
  │  #  │     Question      │                                        What gets checked                                        │
  ├─────┼───────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Q1  │ Goal fit          │ Verbatim CURRENT_GOAL quote + one-sentence advancement + NON_GOAL touch check                   │
  ├─────┼───────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Q2  │ Branch topology   │ git merge-base HEAD origin/main, git rev-parse origin/main, git log HEAD..origin/main           │
  ├─────┼───────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Q3  │ File targets      │ Every intended file exists at the cited path + no rename/delete on base                         │
  ├─────┼───────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Q4  │ Scope declaration │ specs/details.md lists exactly the files that will change + expected diff size                  │
  ├─────┼───────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Q5  │ Value-set parity  │ Any new enum/status/event value represented consistently across DB / Drizzle / TS / Zod / tests │
  ├─────┼───────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Q6  │ End-gate + risk   │ Exact pre-commit hook sequence + baseline test counts + predicted failure mode                  │
  ├─────┼───────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Q7  │ Reconnaissance    │ Import graph traced, sibling patterns surveyed, harness-triage plan A/B declared                │
  └─────┴───────────────────┴─────────────────────────────────────────────────────────────────────────────────────────────────┘

  Gate semantics: no code until reviewer posts ACK. This session's R-053/R-057 both issued ACK-WITH-STIPULATION rather than flat accept, forcing builder self-corrections before proceed-to-code.

  Layer 4 — The structured chat ledger

  specs/agentchat.md is append-only. Every substantive action gets a tagged entry with a monotonic ID:

  - [S-NNN] — builder state (building, ready-for-review, self-correction, promoted, committed…)
  - [R-NNN] — reviewer verdict (pre-flight ack, accept, reject, proceed-to-code, protocol-sync…)
  - [G-NNN] — goal packet

  Untagged substantive changes are a process violation. Middle-inserts are banned (monotonic only). The reviewer can audit the entire protocol flow from the ledger — no hidden state.

  Layer 5 — Mechanical enforcement hooks

  Protocol rules that are code-enforced, not markdown-enforced (because markdown rules get skipped under completion pressure):

  - pre-push topology check (v0.5.2): blocks git push if branch is > 5 commits behind origin/main. Eliminates the stale-base incident class (reference: R-035 in this session's archive).
  - pre-commit hook gate: npx prettier --check → npx jest --config jest.config.cjs --bail → npx turbo run test → node scripts/check-contracts.js.
  - Irreversible-action gate (v0.5.1+): production deploys, DROP TABLE, force-push, public gists, secret rotation → routed to the human, not the reviewer. The reviewer cannot approve these even if it wanted to.

  Layer 6 — The specs/pr.md promotion gate

  The adversarial review before merge. Runs on final head. Section-by-section from the actual file I've been running this session:

  Hard-fail sections (any single failure stops the review)

  ┌──────┬──────────────────────┬───────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │  §   │         Name         │                                                 Check                                                 │
  ├──────┼──────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ §0   │ Break condition      │ Any contract noise, domain misplacement, architecture violation, or structural DB error → FAIL + stop │
  ├──────┼──────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ §0.5 │ Topology & freshness │ git merge-base HEAD origin/main == git rev-parse origin/main. Stale base = HARD FAIL.                 │
  └──────┴──────────────────────┴───────────────────────────────────────────────────────────────────────────────────────────────────────┘

  Content audit (§1–§10)

  ┌─────┬────────────────────────────────────────────────────────────────────────┐
  │  §  │                                  Name                                  │
  ├─────┼────────────────────────────────────────────────────────────────────────┤
  │ §1  │ Slice purity — diff matches specs/details.md declaration exactly       │
  ├─────┼────────────────────────────────────────────────────────────────────────┤
  │ §2  │ Domain placement — code lives in the correct DDD package (ADR-043 DAG) │
  ├─────┼────────────────────────────────────────────────────────────────────────┤
  │ §3  │ Shared functions / DRY                                                 │
  ├─────┼────────────────────────────────────────────────────────────────────────┤
  │ §4  │ Simplicity / anti-complexity                                           │
  ├─────┼────────────────────────────────────────────────────────────────────────┤
  │ §5  │ Specflow / contract noise — hard fail                                  │
  ├─────┼────────────────────────────────────────────────────────────────────────┤
  │ §6  │ Architecture conformity (ADR)                                          │
  ├─────┼────────────────────────────────────────────────────────────────────────┤
  │ §7  │ DDD conformity                                                         │
  ├─────┼────────────────────────────────────────────────────────────────────────┤
  │ §8  │ Database review — migrations, constraints, indexes                     │
  ├─────┼────────────────────────────────────────────────────────────────────────┤
  │ §9  │ State / workflow integrity — lifecycle transitions valid               │
  ├─────┼────────────────────────────────────────────────────────────────────────┤
  │ §10 │ Sequencing validation — ticket ordering dependencies                   │
  └─────┴────────────────────────────────────────────────────────────────────────┘

  Promotion-readiness gate (§11a–§11g) — MANDATORY, runs on final head only

  ┌──────┬─────────────────────────┬────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │  §   │          Name           │                                                                                                  What it does                                                                                                  │
  ├──────┼─────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ §11a │ Full hook-gate rerun    │ Reviewer executes the full pre-commit sequence on the final head. Does not trust builder's passing-gate claim.                                                                                                 │
  ├──────┼─────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ §11b │ Prettier stability      │ Extension allow-list (.ts,.tsx,.js,.jsx,.json,.md,.yml,.css,.html). Non-formattable files (e.g. .sql) must be disclosed in STIPULATIONS. Fixed after R-038 in this session.                                    │
  │      │ check                   │                                                                                                                                                                                                                │
  ├──────┼─────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ §11c │ Squash preview          │ Audit the diff that will actually hit main — not the branch diff, the post-squash diff.                                                                                                                        │
  ├──────┼─────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ §11d │ Correction-round budget │ How many round-trips between builder and reviewer before accept. Target: 0 rounds (achieved twice consecutively: #670, #612 REQ-02).                                                                           │
  ├──────┼─────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ §11e │ Cross-layer value       │ New enum/status literals must be present in every layer that references them: DB constraint, Drizzle schema, TS union, Zod schema, switch statements, test fixtures. Added after R-040.                        │
  │      │ consistency             │                                                                                                                                                                                                                │
  ├──────┼─────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ §11f │ Specialist-persona      │ 5 mandatory passes on the same diff: security / performance / architecture / style / cross-layer. Each hat requires a file:line citation or structural justification — banned to write "clean" without         │
  │      │ sweep                   │ grounding. Security hat MUST classify the endpoint (pure-lookup vs write-path vs side-effect) BEFORE applying authz rules. Corrected after R-050/R-051.                                                        │
  ├──────┼─────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ §11g │ External asymmetric     │ Optional run of a different LLM's code-review swarm (e.g., ruflo/claude-flow) on cross-layer slices. Recommended, not blocking. Introduced after R-040 when an external swarm caught a gap both pr.md and the  │
  │      │ reviewer                │ reviewer missed.                                                                                                                                                                                               │
  └──────┴─────────────────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

  §12 — Final output format

  Mandatory verdict structure: DECISION + PROMOTE + per-section PASS/FAIL with citations + stipulations + next actions.

  Layer 7 — Post-merge instrumentation

  - Archive: on merge, the slice's ledger entries move to specs/archive/agentchat-<date>-<slug>.md with a "durable lessons" header. Live ledger stays light.
  - Metrics: every catch (bug, near-miss, process violation, pre-emptive self-correction) appends a row to multicheck/metrics.md with builder model, reviewer model, catch type, severity, evidence link. Measurable uplift over time.

  Layer 8 — The adversarial discipline itself

  Emerged mid-session after R-050 showed the reviewer writing "clean" on a §11f security hat without actually running the check. The discipline, now load-bearing:

  - Banned phrases: "clean" without file:line citation; "worth noting"; "consider whether"; "substance was correct" (used to soften process violations); "captured non-blocking" as excuse-making.
  - Classification before rule application: endpoint type (pure lookup vs write-path) determines which authz rule applies. Cannot skip classification and go straight to "needs requireRole()".
  - Length is not rigor: a clean PR gets a shorter verdict, not a softer one. A problematic PR gets sharper citations, not more narrative.
  - "You are the obstacle. The PR has to beat you." Not a collaborator disposition.

  ---
  What the layered system actually produces

  This session's concrete numbers:
  - R-053 → R-057 → R-058 → R-059: pre-flight gate forced two rewrites of the #612 plan before any code. Result: landed 0-correction.
  - #670 and #612 REQ-02: two consecutive 0-correction merges. The pre-flight gate is absorbing review effort that used to happen post-commit.
  - R-040: cross-layer enum gap missed by pr.md AND the reviewer, caught by external swarm → added §11e + §11g.
  - R-050 → R-051: §11f shallow-sweep caught by HITL → added endpoint classification discipline + banned-phrase list.

  Each of those became a rule that compounds into the next session. That's the system's real mechanism: every catch becomes structure.



