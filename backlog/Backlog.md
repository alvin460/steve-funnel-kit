# Backlog

Task files live in `backlog/tasks/` as markdown with YAML frontmatter.

## Task format

```markdown
---
id: repo-name-123
title: Short description
status: todo | doing | done
priority: low | medium | high | critical
branch: 123-short-description
issue: 123
assignee:
created: 2026-03-06
---

Details, acceptance criteria, notes.
```

## Statuses

| Status | Meaning |
|--------|---------|
| `todo` | Not started |
| `doing` | In progress (branch/worktree exists) |
| `done` | Merged and closed |

## Workflow

1. Task created via `bt create <repo> "title"` from the orchestrator
2. `bt start <task-id>` creates the branch + worktree
3. Work happens in the worktree
4. `bt complete <task-id>` closes the issue

## Worktrees

When a task is started, a worktree is created at:

```
repo/worktrees/<branch-name>/
```

This keeps parallel work isolated from the main checkout.
