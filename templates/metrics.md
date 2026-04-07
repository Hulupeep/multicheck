# Catches from this multicheck session

Append-only catch log for this target project. Format spec and paste-able daily-ask prompts are in `multicheck/.framework/METRICS.md`.

## Catch types

`pre-emptive-self-correction` | `process-violation` | `technical-bug` | `goal-divergence` | `near-miss` | `wrong-file` | `test-gap` | `slice-impurity` | `bonus-structural-verification` | `recommendation-corrected` | `baseline-pre-existing-failure` | `heredoc-race-avoided` | `other`

Severity: `low` | `medium` | `high` | `critical`. Caught by: `builder` | `reviewer` | `operator`.

## Catches

| Date | Catch type | Severity | Caught by | Description | Evidence |
|---|---|---|---|---|---|

<!--
Append rows below the column headers using the heredoc pattern:

cat >> multicheck/metrics.md <<'METRICS_EOF'
| YYYY-MM-DD | <type> | <severity> | <by> | <description> | <evidence> |
METRICS_EOF

Append-only. Never edit or delete existing rows. The operator daily-ask
prompts in METRICS.md will produce rows in the right format.

When this file grows substantial, consider PRing the rows back upstream
to https://github.com/Hulupeep/multicheck/blob/main/metrics.md so other
operators can see what kinds of catches multicheck produces in real
projects.
-->
