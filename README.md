[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![npm version](https://img.shields.io/npm/v/goploy-cli.svg)](https://www.npmjs.com/package/goploy-cli)

[English](./README.md) | [中文](./README.zh.md)

# goploy-cli

Official CLI tool for [Goploy](https://github.com/zhenorzz/goploy) — enabling both humans and AI Agents to deploy code from the terminal. Supports project listing, deployment triggering, status querying, log tracing, version rollback and more with 8+ commands and MCP server integration.

Tested against Goploy ≥ 1.17.5

[Installation](#installation--quick-start) · [Why goploy-cli](#why-choose-goploy-cli) · [Features](#features) · [Getting Started](#getting-started) · [MCP Server](#mcp-server-ai-agent-integration) · [Advanced Usage](#advanced-usage) · [Security](#security--risk-warnings-please-read-before-use) · [Contributing](#contributing)

## Why Choose goploy-cli?

- **AI-Native Design** — Seamless LLM integration with MCP server support, 8+ carefully curated commands verified through AI testing
- **One-Click Deploy** — Deploy by project name or ID, flexibly specify branches or commit hashes without manual Web UI login
- **Real-Time Monitoring** — Real-time deployment status queries, log tracing, progress polling for quick issue detection
- **Smart Rollback** — Roll back to previous version with a single command, support deployment history queries
- **Open Source, Zero Barriers** — MIT licensed, install with `npm install`, global npm registry support
- **Production Ready** — Built-in error handling, timeout control, connection pooling, perfect for CI/CD automation

## Features

| Category | Capabilities |
|----------|-------------|
| 📦 Project Management | List queries, keyword filtering, support both project names and IDs |
| 🚀 Deployment Operations | Trigger deployments, specify branches/commits, real-time status queries, log tracing |
| 📊 Status Monitoring | One-time snapshot queries, polling until completion, custom timeout control |
| 📜 History Management | Deployment history queries, version rollback, quick recovery to previous version |
| 🔒 Multi-Tenancy | Namespace isolation support, multi-project parallel management |
| 🤖 AI-Friendly | MCP server integration, structured JSON output, command chaining |

## Installation & Quick Start

### Requirements

Before you start, make sure you have:

- Node.js ≥ 18.0.0 (`npm`/`npx`)
- A valid Goploy server and API key

### Quick Start (for Humans)

#### Installation

Choose one of the following methods:

**Method 1 — Install from npm (recommended):**

```bash
# Install global CLI
npm install -g goploy-cli

# Verify installation
goploy config check
```

**Method 2 — Using npx (no installation needed):**

```bash
# Run directly, recommended for CI/CD
npx -y goploy-cli config check
npx -y goploy-cli ls
```

**Method 3 — Install from source:**

```bash
git clone https://github.com/goploy-devops/goploy-cli
cd goploy-cli
npm install
npm run build
npm link
```

#### Configuration & Usage

```bash
# 1. Set environment variables (one time only)
export GOPLOY_URL=https://goploy.example.com
export GOPLOY_API_KEY=your-api-key-here
export GOPLOY_NAMESPACE_ID=1  # Optional, default: 1

# 2. Verify configuration
goploy config check

# 3. Start using
goploy ls                              # List all projects
goploy ls --keyword myapp              # Filter by keyword
goploy publish my-project --branch main # Deploy to main branch
```

### Quick Start (for AI Agents)

> Steps below are for AI Agents, some steps require user assistance in browser or locally.

**Step 1 — Installation**

```bash
# Install global CLI
npm install -g goploy-cli

# Or use npx (recommended)
npx -y goploy-cli config check
```

**Step 2 — Configure Environment Variables**

> Guide the user to set the following environment variables on their system (or in .env file), then re-run the command.

```bash
export GOPLOY_URL=https://goploy.example.com
export GOPLOY_API_KEY=your-api-key-here
export GOPLOY_NAMESPACE_ID=1
```

**Step 3 — Verify Connection**

```bash
goploy config check
```

**Step 4 — Execute Operations**

```bash
goploy ls --keyword my-app      # Query projects
goploy publish 42 --branch main # Deploy by ID and branch
goploy wait <token> --timeout 300  # Wait for deployment to complete
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOPLOY_URL` | Yes | Goploy server URL (e.g. `https://goploy.example.com`) |
| `GOPLOY_API_KEY` | Yes | API key (generate in Goploy UI → User → API Key) |
| `GOPLOY_NAMESPACE_ID` | No | Namespace ID (default: `1`) |
| `GOPLOY_DEBUG` | No | Set to `1` to enable HTTP debug logging |
| `GOPLOY_INSECURE_SKIP_VERIFY` | No | Set to `1` to skip HTTPS certificate verification |

## Command Reference

### 1. List Queries

```bash
# List all projects
goploy ls

# Filter by keyword (fuzzy matching)
goploy ls --keyword myapp

# View recent deployment history
goploy history my-project --limit 10
```

### 2. Deployment Operations

```bash
# Deploy by project name and branch
goploy publish my-project --branch main

# Deploy by project ID and commit hash
goploy publish 42 --commit abc123456

# Deploy and wait for completion (recommended)
goploy publish my-project --branch main --wait

# Specify timeout in seconds
goploy publish my-project --wait --timeout 600
```

### 3. Status Queries

```bash
# Query deployment status (snapshot)
goploy status <token>

# Poll until deployment completes
goploy wait <token>

# Custom timeout
goploy wait <token> --timeout 300

# View detailed logs
goploy trace <token> --detail
```

### 4. Version Management

```bash
# View deployment history
goploy history my-project
goploy history my-project --limit 5

# Rollback to previous version
goploy rebuild <token>

# Reset stuck project status
goploy reset my-project
```

### 5. Configuration Management

```bash
# Verify configuration
goploy config check

# View all available commands
goploy --help
goploy <command> --help
```

## MCP Server (AI Agent Integration)

This package provides a Model Context Protocol (MCP) server for seamless integration with Claude, Cursor and other AI tools.

### Claude Code Integration

```bash
# 1. Set environment variables
export GOPLOY_URL=https://goploy.example.com
export GOPLOY_API_KEY=xxx
export GOPLOY_NAMESPACE_ID=1

# 2. Add MCP server
claude mcp add goploy -- npx -y goploy-cli mcp
```

### Cursor / Other MCP Clients

Add to your MCP configuration file:

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
| `list_projects` | List all deployable projects (supports keyword filtering) |
| `resolve_project` | Query projects by name or ID (fuzzy matching) |
| `publish` | Trigger deployment (returns token, does not wait) |
| `get_publish_status` | Get deployment status snapshot |
| `wait_for_publish` | Poll until deployment finishes |
| `get_publish_trace` | Get detailed deployment logs |
| `rebuild` | Rollback to previous version |
| `list_recent_deployments` | View deployment history |
| `reset_project_state` | Unlock stuck projects |

## Advanced Usage

### Output Formats

```bash
# JSON format (default, good for piping)
goploy ls --format json

# Table format (human-friendly)
goploy ls --format table

# Plain format
goploy ls --format plain
```

### Error Handling & Debugging

```bash
# Enable debug logging
export GOPLOY_DEBUG=1
goploy ls

# Skip HTTPS verification (self-signed certificates)
export GOPLOY_INSECURE_SKIP_VERIFY=1
goploy config check

# View detailed HTTP requests/responses
goploy publish my-project --branch main --no-wait 2>&1 | tee deploy.log
```

### CI/CD Integration

```bash
# GitHub Actions example
- name: Deploy with goploy
  env:
    GOPLOY_URL: ${{ secrets.GOPLOY_URL }}
    GOPLOY_API_KEY: ${{ secrets.GOPLOY_API_KEY }}
    GOPLOY_NAMESPACE_ID: "1"
  run: |
    npx -y goploy-cli publish my-project --branch main --wait

# GitLab CI example
deploy:
  script:
    - npx -y goploy-cli publish my-project --branch main --wait
  environment:
    name: production
```

## Generating an API Key

1. Log in to your Goploy Web UI
2. Go to User Settings
3. Click "Generate API Key"
4. Copy the key and set it as `GOPLOY_API_KEY` environment variable

Or via API:

```bash
curl -X PUT https://goploy.example.com/user/generateApiKey \
  -H "Cookie: your-session-cookie"
```

## Security & Risk Warnings (Please Read Before Use)

This tool can be invoked by AI Agents to automate Goploy deployment operations. Please be aware of the following risks:

⚠️ **Major Risks**:
- Model hallucinations may cause execution of incorrect deployment commands
- API key leakage may result in unauthorized deployment operations
- Incorrect deployments may cause production environment outages
- Logs may contain sensitive information (code, configurations, etc.)

🔒 **Best Practices**:
- Use the principle of least privilege: create a dedicated Goploy account for deployments only
- Regularly rotate API keys and keep usage records
- Use `--wait` in CI/CD to block until deployment completes
- Enable `trace` logging for important deployments to track issues
- It's recommended to verify in pre-release/testing environments before deploying to production
- Never commit `.env` files or keys to version control
- Use read-only `ls` and `status` commands for verification, don't blindly execute `publish`

## Development

```bash
# Install dependencies
npm install

# Watch mode development
npm run dev

# Run tests
npm test

# Production build
npm run build
```

## License

MIT License

This software calls Goploy APIs at runtime. Using these APIs requires compliance with relevant terms of service.

## Contributing

Contributions are welcome! If you find bugs or have feature suggestions, please:

1. Submit an [Issue](https://github.com/goploy-devops/goploy-cli/issues)
2. Submit a [Pull Request](https://github.com/goploy-devops/goploy-cli/pulls)

For major changes, it's recommended to discuss first via Issue.

## Links

- [Goploy Project](https://github.com/zhenorzz/goploy)
- [npm Package](https://www.npmjs.com/package/goploy-cli)
- [GitHub Repository](https://github.com/goploy-devops/goploy-cli)
