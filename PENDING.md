# PENDING — queued protocol changes

As of v0.5.1 (2026-04-09), the authoritative queue for protocol changes is the **multicheck roadmap project board** at https://github.com/users/Hulupeep/projects/25.

Individual tickets are at https://github.com/Hulupeep/multicheck/issues with labels:

- `v0.5.1` — small items, shipped or shipping soon
- `v0.6.0` — Mythos-era items, ship when Mythos lands or prototypes stabilize
- `v1.0` — major protocol additions, speculative
- `mythos-era` — catalyzed by Mythos-class model capability
- `new-rule` / `recipe-refinement` / `tooling` / `documentation` / `meta-observation`

This file is kept for historical reference and for meta-observations that don't fit the issue tracker well. **New items go as GitHub issues, not here.**

---

## History of data-collection freezes

### Freeze #1: 2026-04-07 through 2026-04-09

- **Freeze started**: 2026-04-07 (at commit `a83ac4a` initial Phase 1 release)
- **Partial unfreeze #1**: 2026-04-08 — item #5 pre-flight Q1-Q6 only, commit `7f73c1b`
- **Full unfreeze / v0.5.0**: 2026-04-09 — items #1-#4 from the reviewer handoff + M2 close, commits `d544eee` / `5064265` / `148d0cf`, tagged `v0.5.0`
- **v0.5.1**: 2026-04-09 — Mythos era prep: irreversible-action gate, evals in DoD, metrics model-tracking
- **Freeze rationale**: 3-day window of rule stability for session-to-session data comparability
- **Outcome**: 5 queued items, 2 partial unfreezes, 1 meta-observation closed (M2), ~30 metrics rows captured across two reference sessions

---

## Items moved to GitHub issues

When the freeze ended and the issues got created (2026-04-09), the items in this file were transferred as specflow-compliant tickets. The PENDING.md history for each is preserved below as a pointer.

### Originally-queued PENDING items

- **PENDING #1** Diff-content check for cascaded files → [issue #1](https://github.com/Hulupeep/multicheck/issues/1)
- **PENDING #2** Branch-base sanity check → **CLOSED** (automation half shipped as `hooks/pre-push.sh` in v0.5.0; markdown half shipped as pre-flight Q2 in v0.5.0 partial unfreeze)
- **PENDING #3** Cross-layer value consistency (reviewer-time) → [issue #2](https://github.com/Hulupeep/multicheck/issues/2)
- **PENDING #4** Specialist-persona sweep → [issue #3](https://github.com/Hulupeep/multicheck/issues/3)
- **PENDING #5** Propagation manifest prototype → [issue #4](https://github.com/Hulupeep/multicheck/issues/4)

### Meta-observations

- **M1** Verify one level above → [issue #5](https://github.com/Hulupeep/multicheck/issues/5) (still open)
- **M2** Markdown rules have a ceiling of effectiveness → **CLOSED** in v0.5.0 by `hooks/pre-push.sh`
- **M3** Multi-reviewer asymmetry is multicheck's core thesis → [issue #6](https://github.com/Hulupeep/multicheck/issues/6) (documentation)
- **M4** External swarm as optional third reviewer layer → [issue #7](https://github.com/Hulupeep/multicheck/issues/7)
- **M5** Multicheck's value scales with model capability → folded into the framing of the Mythos-era tickets (issues #8-#24); no standalone ticket

### Mythos-era items (from analysis of the Mythos Preview System Card §4.1.1)

Original analysis proposed 8 items M-1 through M-8; the system card itself surfaced 9 more specific findings (SC-1 through SC-9).

- **M-1** `[P-NNN]` plan entry type → [issue #8](https://github.com/Hulupeep/multicheck/issues/8) (v0.6.0)
- **M-2** `irreversible-request` with `[H-NNN]` authorization → **SHIPPED in v0.5.1**, [issue #9](https://github.com/Hulupeep/multicheck/issues/9)
- **M-3** Pre-flight Q8 spec conformance → [issue #10](https://github.com/Hulupeep/multicheck/issues/10) (v0.6.0)
- **M-4** Deployment gates → [issue #11](https://github.com/Hulupeep/multicheck/issues/11) (v0.6.0)
- **M-5** Evals in Definition of Done → **SHIPPED in v0.5.1**, [issue #12](https://github.com/Hulupeep/multicheck/issues/12)
- **M-6** N-agent topology documentation → [issue #13](https://github.com/Hulupeep/multicheck/issues/13) (v0.6.0)
- **M-7** Metrics schema model-tracking → **SHIPPED in v0.5.1**, [issue #14](https://github.com/Hulupeep/multicheck/issues/14)
- **M-8** Re-document Q7 purpose → [issue #15](https://github.com/Hulupeep/multicheck/issues/15) (v0.6.0)

- **SC-1** Cover-up detection patterns → [issue #16](https://github.com/Hulupeep/multicheck/issues/16) (v0.5.1 candidate)
- **SC-2** Blast radius check → [issue #17](https://github.com/Hulupeep/multicheck/issues/17) (v0.5.1 candidate)
- **SC-3** `/proc/` and credential access restrictions → [issue #18](https://github.com/Hulupeep/multicheck/issues/18) (v0.5.1 candidate, partially covered by M-2 irreversible gate)
- **SC-4** Public-surface write authorization → [issue #19](https://github.com/Hulupeep/multicheck/issues/19) (v0.5.1 candidate, partially covered by M-2 irreversible gate)
- **SC-5** Scratchpad-reasoning unreliability note → [issue #20](https://github.com/Hulupeep/multicheck/issues/20) (v0.5.1 candidate)
- **SC-6** Evaluation awareness note → [issue #21](https://github.com/Hulupeep/multicheck/issues/21) (v0.5.1 candidate)
- **SC-7** No unauthorized side quests → [issue #22](https://github.com/Hulupeep/multicheck/issues/22) (v0.5.1 candidate)
- **SC-8** Git history integrity hard rule → [issue #23](https://github.com/Hulupeep/multicheck/issues/23) (v0.5.1 candidate, partially covered by M-2 irreversible gate)
- **SC-9** "Auto-mode is not sufficient" README repositioning → [issue #24](https://github.com/Hulupeep/multicheck/issues/24) (v0.5.1 candidate)

---

## Partial v0.5.1 rationale

**What shipped in v0.5.1**: M-2 (irreversible gate), M-5 (evals in DoD), M-7 (metrics model-tracking).

**Why these three**:

- **M-2 is preventive against the worst failure mode** Mythos documents (reckless irreversible actions). The Mythos System Card §4.1.1 gives Anthropic's own direct warning — *"we do not expect [auto mode] to be sufficient to fully eliminate risk"* — and the irreversible gate is multicheck's answer. Cannot wait for Mythos to ship; the pattern applies to Codex-class builders too (drop tables, force-push, `rm -rf` on wrong dir).
- **M-5 is trivial to add** (one field in a template, one step in the reviewer's verification order). Useful even in the Codex era.
- **M-7 is schema prep** for future capability-correlation analysis. Must ship before the data starts flowing from mixed-capability pairings, or we can't correlate.

**Why not M-1, M-3, M-4, M-6, M-8, and SC-1 through SC-9**: these are either Mythos-specific (only useful once Mythos is general-access) or depend on more session data before fold-in is informed. They're queued as issues and will be re-evaluated when the next session data arrives or when Mythos ships.

Several of the SC-1 through SC-9 items are strong candidates for an imminent v0.5.2 once the v0.5.1 irreversible-gate behavior is observed in practice. Specifically SC-1 (cover-up detection), SC-7 (no unauthorized side quests), and SC-9 (auto-mode warning) are low-risk additions that complement M-2 directly. The operator can decide when to fold them.
