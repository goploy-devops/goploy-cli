[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![npm version](https://img.shields.io/npm/v/goploy-cli.svg)](https://www.npmjs.com/package/goploy-cli)

[English](./README.md) | [中文](./README.zh.md)

# goploy-cli

[Goploy](https://github.com/zhenorzz/goploy) 官方 CLI 工具 — 让人类和 AI Agent 都能在终端中部署代码。支持项目列表、部署触发、状态查询、日志追踪、版本回滚等核心功能，提供 8+ 命令及 MCP 服务器集成。

已支持 Goploy ≥ 1.17.5

[安装](#安装与快速开始) · [为什么选择](#为什么选择-goploy-cli) · [功能](#功能) · [工作流程](#工作流程) · [技能安装](#技能安装) · [MCP 服务器](#mcp-服务器ai-agent-集成) · [进阶用法](#进阶用法) · [安全](#安全与风险提示使用前必读) · [贡献](#贡献)

## 为什么选择 goploy-cli？

- **为 Agent 原生设计** — 与 LLM 无缝集成，提供 MCP 服务器支持，22+ 个精选命令经过 AI 实测验证
- **一键部署** — 支持按项目名称或 ID 部署，灵活指定分支或提交号，无需手动登录 Web UI
- **实时监控** — 部署状态实时查询、日志追踪、进度轮询，快速发现部署问题
- **智能回滚** — 一条命令快速回滚到前一版本，支持部署历史查询
- **开源零门槛** — MIT 协议，`npm install` 即可使用，支持全球 npm 源
- **生产就绪** — 内置错误处理、超时控制、连接池管理，适合 CI/CD 自动化集成

## 功能

| 类别 | 能力 |
|------|------|
| 📦 项目管理 | 列表查询、按关键词筛选、支持项目名称和 ID 两种标识 |
| 🚀 部署操作 | 触发部署、指定分支/提交号、实时状态查询、日志追踪 |
| 📊 状态监控 | 单次快照查询、轮询等待完成、自定义超时控制 |
| 📜 历史管理 | 部署历史查询、版本回滚、前一版本快速恢复 |
| 🔒 多租户 | 支持命名空间隔离、多项目并行管理 |
| 🤖 AI 友好 | MCP 服务器集成、结构化 JSON 输出、命令链组合 |

## 工作流程

### 标准部署工作流

以下是使用 goploy-cli 部署的典型流程：

```
1. 查询项目
   └─ goploy ls [--keyword 关键词]
      返回：项目列表（ID、名称等）

2. 解析项目
   └─ 内部匹配用户输入到确切的项目
      （支持模糊匹配）

3. 确认部署
   └─ Agent/用户审核：项目名称、分支、提交号
      决定：继续或中止

4. 触发部署
   └─ goploy publish <project_id> [--branch] [--commit]
      返回：部署 token

5. 监控进度
   └─ goploy wait <token> [--timeout 600]
      轮询到：成功/失败/超时

6. 失败处理
   └─ goploy trace <token> --detail
      返回：错误日志和诊断信息

7. 部署后
   └─ 回滚：goploy rebuild <token>
      或查看历史：goploy history <project>
```

### 常见用例

#### 用例 1：快速部署（人类用户）

```bash
# 1. 列出项目，查找要部署的项目
$ goploy ls --keyword api

# 2. 部署并等待完成
$ goploy publish api-service --branch main --wait

# 3. 查看状态
$ goploy status <token>
```

#### 用例 2：部署管道（CI/CD）

```bash
# 1. 按 ID 查询项目（更快）
$ PROJECT_ID=$(goploy ls --format json | jq '.[0].id')

# 2. 部署特定提交，并等待完成
$ TOKEN=$(goploy publish $PROJECT_ID --commit $GIT_SHA --wait)

# 3. 验证成功
$ goploy status $TOKEN
```

#### 用例 3：AI Agent 部署

```bash
# 1. Agent 列出项目
> "列出所有匹配 'frontend' 的项目"
  
# 2. Agent 确认部署
> "部署 frontend-app 到 main 分支"
  确认？ [y/n]

# 3. Agent 触发并监控
> "正在发布... (轮询状态)"
  ✓ 部署成功
```

#### 用例 4：紧急回滚

```bash
# 1. 查看最近的部署
$ goploy history my-project --limit 5

# 2. 回滚到前一版本
$ goploy rebuild <previous_token>

# 3. 监控回滚
$ goploy wait <new_token>
```

#### 用例 5：处理卡住的部署

```bash
# 1. 如果项目卡在"部署中"状态，重置项目
$ goploy reset my-project

# 2. 检查是否重置成功
$ goploy status <project_id>

# 3. 重新尝试部署
$ goploy publish my-project --branch main
```

### 决策流程

```
开始
  │
  ├─ 你知道项目名称吗？
  │  ├─ 是 → goploy publish <name> --branch <branch>
  │  └─ 否 → goploy ls [--keyword 过滤]
  │
  ├─ 部署成功了吗？
  │  ├─ 是 → 完成！查看日志：goploy trace <token>
  │  ├─ 否 → goploy trace <token> --detail（查看错误）
  │  ├─ 超时 → goploy wait <token> --timeout 900（延长超时）
  │  └─ 卡住 → goploy reset <project>（强制重置）
  │
  ├─ 需要回滚吗？
  │  ├─ 是 → goploy history <project>（查看历史）
  │  │  └─ goploy rebuild <old_token>（执行回滚）
  │  └─ 否 → 完成
  │
  └─ 结束
```

## 安装与快速开始

### 环境要求

开始之前，请确保具备以下条件：

- Node.js ≥ 18.0.0（`npm`/`npx`）
- 有效的 Goploy 服务器和 API 密钥

### 快速开始（人类用户）

#### 安装

以下两种方式**任选其一**：

**方式一 — 从 npm 安装（推荐）：**

```bash
# 安装全局 CLI
npm install -g goploy-cli

# 验证安装
goploy config check
```

**方式二 — 使用 npx（无需安装）：**

```bash
# 直接运行，推荐用于 CI/CD
npx -y goploy-cli config check
npx -y goploy-cli ls
```

**方式三 — 从源码安装：**

```bash
git clone https://github.com/goploy-devops/goploy-cli
cd goploy-cli
npm install
npm run build
npm link
```

#### 配置与使用

```bash
# 1. 设置环境变量（仅需一次）
export GOPLOY_URL=https://goploy.example.com
export GOPLOY_API_KEY=your-api-key-here
export GOPLOY_NAMESPACE_ID=1  # 可选，默认为 1

# 2. 验证配置
goploy config check

# 3. 开始使用
goploy ls                              # 列出所有项目
goploy ls --keyword myapp              # 按关键词过滤
goploy publish my-project --branch main # 部署到 main 分支
```

### 快速开始（AI Agent）

> 以下步骤面向 AI Agent，部分步骤需要用户在浏览器或本地完成。

**第 1 步 — 安装**

```bash
# 安装全局 CLI
npm install -g goploy-cli

# 或使用 npx（推荐）
npx -y goploy-cli config check
```

**第 2 步 — 配置环境变量**

> 提示用户在其系统上设置以下环境变量（或在 .env 文件中），然后重新运行命令。

```bash
export GOPLOY_URL=https://goploy.example.com
export GOPLOY_API_KEY=your-api-key-here
export GOPLOY_NAMESPACE_ID=1
```

**第 3 步 — 验证连接**

```bash
goploy config check
```

**第 4 步 — 执行操作**

```bash
goploy ls --keyword my-app      # 查询项目
goploy publish 42 --branch main # 按 ID 和分支部署
goploy wait <token> --timeout 300  # 等待部署完成
```
## 技能安装

安装 goploy-cli Skill 后，AI 代理（Claude、Cursor 等）可通过 MCP（Model Context Protocol）使用所有部署功能。

### 快速安装

**用于 Claude Code：**

```bash
# 1. 全局安装 CLI
npm install -g goploy-cli

# 2. 设置环境变量
export GOPLOY_URL=https://goploy.example.com
export GOPLOY_API_KEY=your-api-key-here
export GOPLOY_NAMESPACE_ID=1

# 3. 向 Claude 添加 MCP 服务器
claude mcp add goploy -- npx -y goploy-cli mcp
```

**用于 Cursor / VSCode：**

添加到 MCP 配置文件：

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

### 安装后可用的 AI 工具

| 工具 | 功能 |
|------|------|
| `list_projects` | 列出所有项目 |
| `resolve_project` | 查询项目（模糊匹配） |
| `publish` | 触发部署 |
| `get_publish_status` | 查询状态 |
| `wait_for_publish` | 等待完成 |
| `get_publish_trace` | 查看日志 |
| `rebuild` | 回滚版本 |
| `list_recent_deployments` | 查看历史 |
| `reset_project_state` | 重置卡死项目 |

### 详细安装指南

了解 Docker、npm package 等更多安装方法，请参考 [SKILL_INSTALL.md](./SKILL_INSTALL.md)。

### 验证安装

测试 Skill 是否正确加载：

```bash
# 测试 CLI
goploy config check

# 测试 MCP 服务器
goploy mcp
```

在 Claude/Cursor 中发送请求测试：
> "列出所有可部署项目"
## 环境变量配置

| 变量 | 必需 | 说明 |
|------|------|------|
| `GOPLOY_URL` | 是 | Goploy 服务器 URL（如 `https://goploy.example.com`） |
| `GOPLOY_API_KEY` | 是 | API 密钥（在 Goploy UI → 用户 → API 密钥 生成） |
| `GOPLOY_NAMESPACE_ID` | 否 | 命名空间 ID（默认：`1`） |
| `GOPLOY_DEBUG` | 否 | 设置为 `1` 启用 HTTP 调试日志 |
| `GOPLOY_INSECURE_SKIP_VERIFY` | 否 | 设置为 `1` 跳过 HTTPS 证书验证 |

## 命令参考

### 1. 列表查询

```bash
# 列出所有项目
goploy ls

# 按关键词过滤（模糊匹配）
goploy ls --keyword myapp

# 查看最近部署历史
goploy history my-project --limit 10
```

### 2. 部署操作

```bash
# 按项目名和分支部署
goploy publish my-project --branch main

# 按项目 ID 和提交号部署
goploy publish 42 --commit abc123456

# 部署后立即等待完成（推荐）
goploy publish my-project --branch main --wait

# 指定超时时间（秒）
goploy publish my-project --wait --timeout 600
```

### 3. 状态查询

```bash
# 查询部署状态（快照）
goploy status <token>

# 轮询等待部署完成
goploy wait <token>

# 自定义超时
goploy wait <token> --timeout 300

# 查看详细日志
goploy trace <token> --detail
```

### 4. 版本管理

```bash
# 查看部署历史
goploy history my-project
goploy history my-project --limit 5

# 回滚到前一版本
goploy rebuild <token>

# 重置卡住的项目状态
goploy reset my-project
```

### 5. 配置管理

```bash
# 验证配置
goploy config check

# 查看所有可用命令
goploy --help
goploy <command> --help
```

## MCP 服务器（AI Agent 集成）

本包提供 Model Context Protocol (MCP) 服务器，支持与 Claude、Cursor 等 AI 工具无缝集成。

### Claude Code 集成

```bash
# 1. 设置环境变量
export GOPLOY_URL=https://goploy.example.com
export GOPLOY_API_KEY=xxx
export GOPLOY_NAMESPACE_ID=1

# 2. 添加 MCP 服务器
claude mcp add goploy -- npx -y goploy-cli mcp
```

### Cursor / 其他 MCP 客户端

在 MCP 配置文件中添加：

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

### 可用 MCP 工具

| 工具 | 说明 |
|------|------|
| `list_projects` | 列出所有可部署的项目（支持关键词过滤） |
| `resolve_project` | 按名称或 ID 查询项目（支持模糊匹配） |
| `publish` | 触发部署（返回 token，不等待完成） |
| `get_publish_status` | 获取部署状态快照 |
| `wait_for_publish` | 轮询等待部署完成 |
| `get_publish_trace` | 获取部署详细日志 |
| `rebuild` | 回滚到上一版本 |
| `list_recent_deployments` | 查看部署历史 |
| `reset_project_state` | 解锁卡住的项目 |

## 进阶用法

### 输出格式

```bash
# JSON 格式（默认，适合管道处理）
goploy ls --format json

# 表格格式（人类友好）
goploy ls --format table

# 简洁格式
goploy ls --format plain
```

### 错误处理与调试

```bash
# 启用调试日志
export GOPLOY_DEBUG=1
goploy ls

# 检查 HTTPS 证书（自签名证书）
export GOPLOY_INSECURE_SKIP_VERIFY=1
goploy config check

# 查看详细的 HTTP 请求/响应
goploy publish my-project --branch main --no-wait 2>&1 | tee deploy.log
```

### CI/CD 集成

```bash
# GitHub Actions 示例
- name: Deploy with goploy
  env:
    GOPLOY_URL: ${{ secrets.GOPLOY_URL }}
    GOPLOY_API_KEY: ${{ secrets.GOPLOY_API_KEY }}
    GOPLOY_NAMESPACE_ID: "1"
  run: |
    npx -y goploy-cli publish my-project --branch main --wait

# GitLab CI 示例
deploy:
  script:
    - npx -y goploy-cli publish my-project --branch main --wait
  environment:
    name: production
```

## 生成 API 密钥

1. 登录 Goploy Web UI
2. 进入用户设置
3. 点击"生成 API 密钥"
4. 复制密钥并设置为 `GOPLOY_API_KEY` 环境变量

或通过 API：

```bash
curl -X PUT https://goploy.example.com/user/generateApiKey \
  -H "Cookie: your-session-cookie"
```

## 安全与风险提示（使用前必读）

本工具可供 AI Agent 调用以自动化 Goploy 部署操作。请注意以下风险：

⚠️ **重大风险**：
- 模型幻觉可能导致执行错误的部署命令
- API 密钥泄露可能导致未授权的部署操作
- 错误的部署可能导致生产环境服务中断
- 日志可能包含敏感信息（代码、配置等）

🔒 **最佳实践**：
- 使用权限最小原则：创建仅用于部署的专用 Goploy 账户
- 定期轮换 API 密钥，记录所有使用情况
- 在 CI/CD 中使用 `--wait` 确保部署完成前阻塞流程
- 对重要部署启用 `trace` 日志以追踪问题
- 建议在预发布/测试环境验证后再部署到生产
- 不要将 `.env` 文件或密钥提交到版本控制系统
- 使用只读的 `ls` 和 `status` 命令进行验证，不要盲目执行 `publish`

## 开发

```bash
# 安装依赖
npm install

# 监视模式开发
npm run dev

# 测试
npm test

# 生产构建
npm run build
```

## 许可证

本项目基于 **MIT 许可证** 开源。

该软件运行时会调用 Goploy 的 API，使用这些 API 需要遵守相关服务条款。

## 贡献

欢迎社区贡献！如果你发现 bug 或有功能建议，请：

1. 提交 [Issue](https://github.com/goploy-devops/goploy-cli/issues)
2. 提交 [Pull Request](https://github.com/goploy-devops/goploy-cli/pulls)

对于较大的改动，建议先通过 Issue 与我们讨论。

## 相关链接

- [Goploy 项目](https://github.com/zhenorzz/goploy)
- [npm 包](https://www.npmjs.com/package/goploy-cli)
- [GitHub 仓库](https://github.com/goploy-devops/goploy-cli)
