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

## 剩余步骤：npm 登录和发布

### 步骤 1：npm 登录

在项目目录运行以下命令：

```bash
cd c:\Users\Administrator\Documents\docker-env\project\goploy-cli
npm login
```

系统会提示输入：
- **Username**: 您的 npm 用户名
- **Password**: 您的 npm 密码
- **Email**: 您的 npm 注册邮箱
- **Authenticator app OTP** (如果启用了双因素认证)：6 位数字

### 步骤 2：验证登录

```bash
npm whoami
```

应该返回您的 npm 用户名。

### 步骤 3：发布到 npm

```bash
npm publish
```

此命令会：
1. 运行 `npm run build` 构建项目
2. 创建 tar 包
3. 上传到 npm 官方仓库

发布成功后，您的包将在以下位置可用：
- https://www.npmjs.com/package/goploy-cli
- 安装命令：`npm install -g goploy-cli` 或 `npx goploy-cli`

## 替代方案：使用认证令牌

如果您不想使用密码，可以使用认证令牌：

1. 获取令牌：
   - 访问 https://www.npmjs.com/settings/~/tokens
   - 创建 **Granular Access Token**（具有发布权限）
   
2. 设置令牌：
   ```bash
   npm config set //registry.npmjs.org/:_authToken=YOUR_TOKEN_HERE
   ```

3. 直接发布：
   ```bash
   npm publish
   ```

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
