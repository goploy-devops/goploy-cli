# npm 发布指南

## 已完成的工作

✅ 项目已初始化 git 仓库并推送到 GitHub：
- 远程仓库：`git@github.com:goploy-devops/goploy-cli.git`
- 当前分支：main
- 初始提交：`feat: initial commit - goploy-cli project`

✅ 项目构建成功：
- 版本：0.1.0
- 包大小：30.5 kB (压缩), 158.9 kB (未压缩)
- 构建输出：dist/ 目录已生成

## 说明：您的账户已启用 2FA

您的 npm 账户已启用双因素认证，需要使用特殊方式登录。有两个解决方案：

## 方案 A：使用具有 Bypass 2FA 权限的粒度访问令牌（推荐）

这是最安全和最方便的方法。

### 步骤 1：生成粒度访问令牌

1. 访问 https://www.npmjs.com/settings/~/tokens
2. 点击 **"Generate New Token"** → **"Granular Access Token"**
3. 配置令牌权限：
   - **Read and Publish packages**: ✅ 启用
   - **Bypass 2FA**: ✅ **必须启用**
4. **Expiration**: 选择合适的过期时间（例如 90 天或永不过期）
5. 复制生成的令牌（类似 `npm_xxxxxxxxxxxx...`）

### 步骤 2：配置 npm 认证

在项目目录运行：

```bash
npm config set //registry.npmjs.org/:_authToken=YOUR_TOKEN_HERE
```

将 `YOUR_TOKEN_HERE` 替换为您复制的令牌。

例如：
```bash
npm config set //registry.npmjs.org/:_authToken=npm_K7x9mP2q5vL8nR4jX6wZ1A2b3C4d5E6f7G8h9I0j
```

### 步骤 3：验证配置

```bash
npm whoami
```

应该返回您的 npm 用户名。

### 步骤 4：发布到 npm

```bash
cd c:\Users\Administrator\Documents\docker-env\project\goploy-cli
npm publish
```

---

## 方案 B：使用 OTP（一次性密码）进行登录

如果您没有粒度访问令牌，也可以用 OTP 登录：

### 步骤 1：使用 OTP 登录

```bash
npm login --auth-type=web
```

这会打开一个浏览器窗口进行二次认证。

### 步骤 2：发布

```bash
npm publish --otp=YOUR_6_DIGIT_CODE
```

将 `YOUR_6_DIGIT_CODE` 替换为您的认证器应用显示的 6 位数字。

---

## 方案 C：临时禁用 2FA（最不安全，不推荐）

⚠️ **警告**：只在完全信任您的机器时使用

1. 访问 https://www.npmjs.com/settings/~/account
2. 临时禁用双因素认证
3. 运行 `npm login` 和 `npm publish`
4. 完成后立即重新启用 2FA

此命令会：
1. 运行 `npm run build` 构建项目
2. 创建 tar 包
3. 上传到 npm 官方仓库

发布成功后，您的包将在以下位置可用：
- https://www.npmjs.com/package/goploy-cli
- 安装命令：`npm install -g goploy-cli` 或 `npx goploy-cli`

## 常见问题排查

| 错误 | 原因 | 解决方案 |
|------|------|--------|
| `E403 Two-factor authentication required` | 账户启用了 2FA | 使用方案 A（粒度令牌 + Bypass 2FA）或方案 B（OTP） |
| `ENEEDAUTH` | 未登录 | 运行 `npm login` 或配置认证令牌 |
| `ENOENT` | 找不到 package.json | 确保在项目根目录运行 |
| `EINVALIDNAME` | 包名不符合规范 | 包名必须小写，可以包含 `-` 但不能以 `-` 开头 |

## 发布后的验证

```bash
# 检查包信息
npm view goploy-cli

# 查看版本历史
npm view goploy-cli versions

# 测试安装
npm install -g goploy-cli
goploy config check
```

## 更新版本

修改 package.json 中的版本号后：

```bash
npm publish  # 自动运行 prepublishOnly 脚本进行构建
```

遵循语义化版本控制：MAJOR.MINOR.PATCH (e.g., 0.1.1, 0.2.0, 1.0.0)
