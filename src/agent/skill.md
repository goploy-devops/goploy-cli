# Goploy Deployment Skill

You have access to the Goploy deployment system via MCP tools. Use these tools to deploy code, check status, and manage deployments.

## Available Tools

| Tool | Purpose |
|------|---------|
| `list_projects` | List all deployable projects (optionally filter by keyword) |
| `resolve_project` | Resolve a project name/ID to exact match (handles fuzzy matching) |
| `publish` | Trigger a deployment (returns a token, does NOT wait) |
| `get_publish_status` | Get one-time status snapshot for a deployment token |
| `wait_for_publish` | Poll until deployment finishes (success/fail/timeout) |
| `get_publish_trace` | Get detailed trace log for a deployment |
| `rebuild` | Rollback to a previous deployment |
| `list_recent_deployments` | View deployment history for a project |
| `reset_project_state` | Unlock a project stuck in "deploying" state |

## Standard Deployment Workflow

When a user asks to deploy/publish a project, follow this sequence:

1. **Resolve** the project: `resolve_project(query)` 
   - If multiple matches, show candidates and ask user to pick
   - If no match, run `list_projects` and suggest closest names
2. **Confirm** with user before deploying (show project name, branch)
3. **Publish**: `publish(project_id, branch?, commit?)`
4. **Wait**: `wait_for_publish(token)` — monitor until done
5. **On failure**: `get_publish_trace(token, include_detail=true)` to diagnose
6. **Report** result in one sentence

## Important Rules

- **Never** call `publish` twice for the same project in one session unless the user explicitly asks
- **Always** confirm with the user before triggering `publish`
- When deployment fails, automatically fetch trace details and summarize the error
- If a project is stuck in "deploying" state, suggest `reset_project_state`
- For rollback, use the token from `list_recent_deployments` and call `rebuild`

## Error Handling

| Error | Action |
|-------|--------|
| `AuthError` | Ask user to check GOPLOY_API_KEY and namespace permissions |
| `NotFoundError` | Run `list_projects` to help user find the correct project |
| `BusinessError` | Show the error message from the server |
| `NetworkError` | Ask user to check GOPLOY_URL and network connectivity |

## Examples

**User**: "发布 far-boo"
1. `resolve_project("far-boo")` → `{id: 42, name: "far-boo", branch: "main"}`
2. Confirm: "Deploy far-boo (branch: main)?"
3. `publish(42)` → `{token: "abc123"}`
4. `wait_for_publish("abc123")` → `{finalState: "success"}`
5. "far-boo deployed successfully."

**User**: "回滚 far-boo"
1. `resolve_project("far-boo")` → `{id: 42, ...}`
2. `list_recent_deployments(42, limit=5)` → show recent tokens
3. Ask which deployment to rollback to
4. `rebuild(token)` → rollback
