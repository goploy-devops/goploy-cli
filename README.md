# goploy-cli

CLI & MCP server for the [Goploy](https://github.com/zhenorzz/goploy) deployment system.

Tested against Goploy ≥ 1.17.5

## Installation

```bash
# Global CLI
npm i -g goploy-cli
goploy config check

# npx (recommended for MCP)
npx -y goploy-cli config check

# From source
git clone https://github.com/goploy-devops/goploy-cli
cd goploy-cli && npm i && npm run build && npm link
```

## Configuration

Set environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `GOPLOY_URL` | Yes | Goploy server URL (e.g. `https://goploy.example.com`) |
| `GOPLOY_API_KEY` | Yes | API key (generate in Goploy UI → User → API Key) |
| `GOPLOY_NAMESPACE_ID` | No | Namespace ID (default: `1`) |
| `GOPLOY_DEBUG` | No | Set to `1` for debug HTTP logging |
| `GOPLOY_INSECURE_SKIP_VERIFY` | No | Set to `1` for self-signed certs |

```bash
export GOPLOY_URL=https://goploy.example.com
export GOPLOY_API_KEY=your-api-key-here
export GOPLOY_NAMESPACE_ID=1
```

## CLI Usage

```bash
# List projects
goploy ls
goploy ls --keyword myapp

# Deploy
goploy publish my-project --branch main --wait
goploy publish 42 --commit abc123

# Check status
goploy status <token>
goploy wait <token> --timeout 300

# View trace
goploy trace <token> --detail

# Rollback
goploy rebuild <token>

# History
goploy history my-project --limit 10

# Reset stuck project
goploy reset my-project

# Verify config
goploy config check
```

## MCP Server (for AI Agents)

### Claude Code

```bash
export GOPLOY_URL=https://goploy.example.com
export GOPLOY_API_KEY=xxx
export GOPLOY_NAMESPACE_ID=1

claude mcp add goploy -- npx -y goploy-cli mcp
```

### Cursor / Other MCP Clients

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "goploy": {
      "command": "npx",
      "args": ["-y", "goploy-cli", "mcp"],
      "env": {
        "GOPLOY_URL": "https://goploy.example.com",
        "GOPLOY_API_KEY": "your-key",
        "GOPLOY_NAMESPACE_ID": "1"
      }
    }
  }
}
```

### Available MCP Tools

| Tool | Description |
|------|-------------|
| `list_projects` | List deployable projects (optional keyword filter) |
| `resolve_project` | Resolve project by name or ID (fuzzy match) |
| `publish` | Trigger deployment (returns token) |
| `get_publish_status` | Get deployment status snapshot |
| `wait_for_publish` | Poll until deployment finishes |
| `get_publish_trace` | Get deployment trace logs |
| `rebuild` | Rollback to previous deployment |
| `list_recent_deployments` | View deployment history |
| `reset_project_state` | Unlock stuck project |

## Generating an API Key

1. Log in to your Goploy web UI
2. Go to User settings
3. Click "Generate API Key"
4. Copy the key and set it as `GOPLOY_API_KEY`

Or via API:
```bash
curl -X PUT https://goploy.example.com/user/generateApiKey \
  -H "Cookie: your-session-cookie"
```

## Development

```bash
npm install
npm run dev        # watch mode
npm test           # run tests
npm run build      # production build
```

## License

MIT
