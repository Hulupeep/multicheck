# examples/

Reference implementations pulled from real projects using multicheck. Each file is project-owned — shown here to demonstrate patterns, not as protocol.

## Files

- **`pr-gate-claims-monorepo.md`** — a project-level PR promotion gate from `claims-monorepo` showing how Layer 2 (project-owned rules) can layer on top of multicheck's upstream. Has a header explaining which sections are universal and which are project-specific. 673 lines (headers + 563-line source).

- **`details-md-active-protocol.md`** — the "Active Protocol" section from `claims-monorepo/specs/details.md`, demonstrating Layer 3 reification (session-state summary of active rules, protocol overrides, current chat path). The meta-rule "mirror critical rules into `details.md` when they change mid-session" is the key generalization.

## When to use these

Read the examples if you are:

- Setting up multicheck on a new project and want to see how Layer 2 (`pr.md`) and Layer 3 (`details.md` Active Protocol) fit in practice
- Designing your own project-level PR promotion gate and want a reference structure
- Operating a mid-session protocol change and wondering where to mirror it so future sessions see the rule
- Writing a case study of your own multicheck session and want to see how another project documented the same thing

## When NOT to use these

Do NOT copy these files verbatim into your project. They're project-specific in places (ticket numbers, schema names, commit SHAs, reviewer entry tags) and will confuse readers if used as-is. Copy the structure, adapt the content.

## Related

- `../BUILDER.md` and `../REVIEWER.md` — the canonical upstream rules that these examples extend
- `../case-studies/` — full audit trails of the sessions these examples came from
