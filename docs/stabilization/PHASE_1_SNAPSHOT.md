# Phase 1 Snapshot - Repository Stabilization

Date: 2026-02-21
Branch: codex/stabilization-master

## Baseline Change Metrics

- `git status --short` class counts:
  - `D`: 37806
  - `M`: 3
  - `??`: 13
- `git diff --stat` summary:
  - `37809 files changed, 88 insertions(+), 3400095 deletions(-)`

## High-Risk Signals

1. A monorepo-to-top-level restructure appears in progress (legacy `apps/*` paths deleted while new `backend/`, `frontend/`, `ml-service/` trees exist).
2. Large volumes of deleted tracked files include historical docs and dependencies from old paths.
3. Current branch state is not suitable for direct release.

## Immediate Guardrails

1. Do not run destructive git operations (`reset --hard`, mass checkout) until deletion intent is reconciled.
2. Perform cleanup in explicit, scoped batches with verification after each batch.
3. Keep architecture and deployment docs aligned with final path layout.

## Decision Gates for Phase 2

Before/while normalizing structure, classify each deletion batch:

1. `apps/*` deletions:
   - Keep deleted if migration to top-level services is intentional.
   - Restore selectively if any runtime path still depends on old layout.
2. Legacy docs at repository root:
   - Move to archive if still needed.
   - Keep deleted if superseded by `docs_archive/` and refreshed `README`.
3. Root-level legacy frontend/backend files:
   - Keep deleted if replaced by `frontend/*` and `backend/*`.
   - Restore only if referenced by active builds/deploy scripts.

## Execution Record

- Created/switch branch: `codex/stabilization-master`.
- Captured baseline metrics for tracking stabilization progress.
