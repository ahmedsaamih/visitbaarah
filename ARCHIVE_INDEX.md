# Archive Index

This project contains archived handover/support materials under `archive/`.

## Structure

- `archive/docs/`
  - `IMPLEMENTATION_PLAN.md`
  - `PROJECT_HANDOFF.md`
  - `TASK.md`
  - `SERENE_ADMIN_GUIDE.md`
  - `AGENTS.md`
  - `CLAUDE.md`

- `archive/scripts/`
  - `scripts_make_admin_doc.py`

- `archive/db-maintenance/`
  - `cleanup-test-user-data.mjs`
  - `DB_CLEANUP_INSTRUCTIONS.md`

## Notes

- Runtime app code remains in `app/`, `components/`, `db/`, `lib/`, and config files in root.
- DB cleanup script only targets guest transactional test data by design.
