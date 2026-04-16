# Goploy CLI Skill 安装指南

本文档说明如何让 AI Agent（如 Claude、Cursor 等）安装和使用 goploy-cli Skill。

## 📋 前置要求

- Node.js ≥ 18.0.0
- 有效的 Goploy 服务器地址和 API 密钥
- 支持 MCP (Model Context Protocol) 的 AI Agent 工具

## 方案 A：Claude Code （推荐）

### 步骤 1：安装全局 CLI

```bash
npm install -g goploy-cli
```

### 步骤 2：设置环境变量

```bash
# macOS/Linux
export GOPLOY_URL=https://goploy.example.com
export GOPLOY_API_KEY=your-api-key-here
export GOPLOY_NAMESPACE_ID=1

# Windows PowerShell
$env:GOPLOY_URL="https://goploy.example.com"
$env:GOPLOY_API_KEY="your-api-key-here"
$env:GOPLOY_NAMESPACE_ID="1"
```

### 步骤 3：添加 MCP 服务器到 Claude

运行以下命令添加 goploy-cli MCP 服务器：

```bash
claude mcp add goploy -- npx -y goploy-cli mcp
```

### 步骤 4：重启 Claude Code

重启 Claude Code 以激活 MCP 服务器。现在 Claude 就可以访问所有 goploy-cli 命令了。

---

## 方案 B：Cursor / VSCode 等编辑器

### 步骤 1：安装 goploy-cli

```bash
npm install -g goploy-cli
```

### 步骤 2：配置 MCP 服务器

在配置文件中添加 goploy-cli MCP 服务器。配置文件位置取决于你的工具：

**Cursor `cursor_settings.json`:**
```json
{
  "mcpServers": {
    "goploy": {
      "command": "npx",
      "args": ["-y", "goploy-cli", "mcp"],
      "env": {
        "GOPLOY_URL": "https://goploy.example.com",
        "GOPLOY_API_KEY": "your-api-key",
        "GOPLOY_NAMESPACE_ID": "1"
      }
    }
  }
}
```

**VSCode `settings.json`:**
```json
{
  "mcp": {
    "servers": {
      "goploy": {
        "command": "npx",
        "args": ["-y", "goploy-cli", "mcp"],
        "env": {
          "GOPLOY_URL": "https://goploy.example.com",
          "GOPLOY_API_KEY": "your-api-key",
          "GOPLOY_NAMESPACE_ID": "1"
        }
      }
    }
  }
}
```

### 步骤 3：重启编辑器

重启你的编辑器使配置生效。

---

## 方案 C：Docker 容器中使用

如果在 Docker 容器中运行 AI Agent，可以通过以下方式集成 goploy-cli：

### Dockerfile 示例

```dockerfile
FROM node:18-alpine

# 安装 goploy-cli
RUN npm install -g goploy-cli

# 设置环境变量
ENV GOPLOY_URL=https://goploy.example.com
ENV GOPLOY_API_KEY=your-api-key-here
ENV GOPLOY_NAMESPACE_ID=1

# 启动 MCP 服务器
CMD ["goploy-cli", "mcp"]
```

### Docker Compose 示例

```yaml
version: '3.8'

services:
  goploy-agent:
    image: node:18-alpine
    environment:
      GOPLOY_URL: https://goploy.example.com
      GOPLOY_API_KEY: your-api-key-here
      GOPLOY_NAMESPACE_ID: "1"
    command: |
      sh -c "npm install -g goploy-cli && goploy-cli mcp"
    ports:
      - "3000:3000"
```

---

## 方案 D：npm 包方式（项目级集成）

如果想在项目中作为依赖使用：

### 步骤 1：安装到项目

```bash
npm install --save goploy-cli
```

### 步骤 2：在 package.json 中配置 scripts

```json
{
  "scripts": {
    "goploy:list": "goploy ls",
    "goploy:mcp": "goploy mcp",
    "goploy:deploy": "goploy publish"
  }
}
```

### 步骤 3：在项目根目录创建 .env 文件

```bash
GOPLOY_URL=https://goploy.example.com
GOPLOY_API_KEY=your-api-key-here
GOPLOY_NAMESPACE_ID=1
```

### 步骤 4：在 MCP 配置中引用

```json
{
  "mcpServers": {
    "goploy": {
      "command": "npm",
      "args": ["run", "goploy:mcp"],
      "cwd": "/path/to/project"
    }
  }
}
```

---

## 验证安装

安装完成后，验证 Skill 是否正确加载：

### 在 Claude 中测试

发送以下请求给 Claude：

```
请列出所有可以部署的项目。
```

Claude 应该会调用 `list_projects` 工具并返回项目列表。

### 在命令行中测试

```bash
# 验证配置
goploy config check

# 列出项目
goploy ls

# 启动 MCP 服务器（测试）
goploy mcp
```

---

## 环境变量配置

| 变量 | 必需 | 说明 |
|------|------|------|
| `GOPLOY_URL` | ✅ 是 | Goploy 服务器 URL |
| `GOPLOY_API_KEY` | ✅ 是 | API 密钥 |
| `GOPLOY_NAMESPACE_ID` | ❌ 否 | 命名空间 ID（默认：1） |
| `GOPLOY_DEBUG` | ❌ 否 | 设为 1 启用调试 |
| `GOPLOY_INSECURE_SKIP_VERIFY` | ❌ 否 | 设为 1 跳过 HTTPS 验证 |

---

## 可用的 MCP 工具

安装后，AI Agent 可以使用以下工具：

| 工具 | 功能 |
|------|------|
| `list_projects` | 列出所有项目 |
| `resolve_project` | 查询项目（支持模糊匹配） |
| `publish` | 触发部署 |
| `get_publish_status` | 查询状态 |
| `wait_for_publish` | 等待完成 |
| `get_publish_trace` | 查看日志 |
| `rebuild` | 回滚版本 |
| `list_recent_deployments` | 查看历史 |
| `reset_project_state` | 重置项目 |

---

## 常见问题

### Q: 如何修改已安装的 Skill 配置？

```bash
# 编辑全局 npm 路径
npm config list -g | grep prefix

# 找到 goploy-cli 位置
which goploy-cli

# 直接修改环境变量
export GOPLOY_URL=new-url
export GOPLOY_API_KEY=new-key
```

### Q: 如何升级 goploy-cli Skill？

```bash
# 升级到最新版本
npm install -g goploy-cli@latest

# 或者更新到特定版本
npm install -g goploy-cli@0.2.0
```

### Q: 怎样卸载 Skill？

```bash
# 从 Claude 中移除
claude mcp remove goploy

# 卸载全局 CLI
npm uninstall -g goploy-cli
```

### Q: MCP 服务器无法连接，怎么办？

1. 验证环境变量是否正确设置
2. 检查网络连接和防火墙
3. 启用调试日志：`export GOPLOY_DEBUG=1`
4. 重启 AI Agent 工具

### Q: 如何在 CI/CD 中使用 Skill？

在 GitHub Actions 中使用示例：

```yaml
- name: Install goploy-cli
  run: npm install -g goploy-cli

- name: Set environment
  env:
    GOPLOY_URL: ${{ secrets.GOPLOY_URL }}
    GOPLOY_API_KEY: ${{ secrets.GOPLOY_API_KEY }}
  run: |
    goploy config check
    goploy ls

- name: Deploy with goploy
  run: goploy publish my-project --branch main --wait
```

---

## 安全建议

⚠️ **重要提示**：

1. **不要在代码中硬编码 API 密钥**，使用环境变量或密钥管理服务
2. **定期轮换 API 密钥**，保持最新版本
3. **最小化权限原则**，为 AI Agent 创建专用账户
4. **审计日志**，记录所有部署操作
5. **使用 `--wait` 参数**，确保部署完成再继续

---

## 支持和反馈

- 📚 [官方文档](https://github.com/goploy-devops/goploy-cli)
- 🐛 [报告问题](https://github.com/goploy-devops/goploy-cli/issues)
- 💬 [讨论建议](https://github.com/goploy-devops/goploy-cli/discussions)

---

## 相关链接

- [MCP 规范](https://modelcontextprotocol.io/)
- [Claude Tools 文档](https://claude.ai/docs)
- [Goploy 项目](https://github.com/zhenorzz/goploy)
- [npm 包](https://www.npmjs.com/package/goploy-cli)
