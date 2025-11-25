# AI Review System

一个基于 NestJS 的 AI 代码审查系统，支持 GitHub 和 GitLab。当开发者提交代码时，系统会自动使用 DeepSeek API 对代码进行 AI 分析，从代码复杂度、可行性和安全性等维度进行评估，并自动在 commit 上添加评论。

## 功能特性

- ✅ 支持 GitHub 和 GitLab 双平台
- ✅ 通过 Webhook 接收 push 事件
- ✅ 使用 DeepSeek API 进行代码分析
- ✅ 自动在 commit 上添加 AI 分析评论
- ✅ 分析维度：代码复杂度、可行性、安全性
- ✅ 完整的错误处理和日志记录

## 技术栈

- **框架**: NestJS
- **语言**: TypeScript
- **AI 服务**: DeepSeek API
- **包管理**: pnpm

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

复制 `.env.example` 文件并重命名为 `.env`，然后填写相应的配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置以下变量：

```env
# 服务配置
PORT=3000

# DeepSeek API 配置
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat

# GitHub 配置
GITHUB_TOKEN=your_github_personal_access_token_here
GITHUB_WEBHOOK_SECRET=your_github_webhook_secret_here

# GitLab 配置
GITLAB_TOKEN=your_gitlab_personal_access_token_here
GITLAB_WEBHOOK_TOKEN=your_gitlab_webhook_token_here
GITLAB_BASE_URL=https://gitlab.com/api/v4
```

### 运行服务

开发模式：

```bash
pnpm run start:dev
```

生产模式：

```bash
pnpm run build
pnpm run start:prod
```

## 配置说明

### DeepSeek API

1. 访问 [DeepSeek](https://www.deepseek.com/) 获取 API Key
2. 将 API Key 配置到 `DEEPSEEK_API_KEY` 环境变量中

### GitHub Webhook 配置

1. 进入你的 GitHub 仓库设置
2. 进入 Webhooks 页面
3. 点击 "Add webhook"
4. 配置以下信息：
   - **Payload URL**: `https://your-domain.com/webhook/github`
   - **Content type**: `application/json`
   - **Secret**: 设置一个密钥，并配置到 `GITHUB_WEBHOOK_SECRET`
   - **Events**: 选择 "Just the push event"
5. 创建 GitHub Personal Access Token（需要 `repo` 权限），配置到 `GITHUB_TOKEN`

### GitLab Webhook 配置

1. 进入你的 GitLab 项目设置
2. 进入 Webhooks 页面
3. 配置以下信息：
   - **URL**: `https://your-domain.com/webhook/gitlab`
   - **Secret token**: 设置一个令牌，并配置到 `GITLAB_WEBHOOK_TOKEN`
   - **Trigger**: 选择 "Push events"
4. 创建 GitLab Personal Access Token（需要 `api` 权限），配置到 `GITLAB_TOKEN`

## 项目结构

```
src/
├── main.ts                 # 应用入口
├── app.module.ts           # 根模块
├── config/                 # 配置模块
│   └── config.validation.ts
├── webhook/                # Webhook 模块
│   ├── github/            # GitHub Webhook
│   ├── gitlab/           # GitLab Webhook
│   └── webhook.service.ts  # 统一处理服务
├── ai/                     # AI 集成模块
│   ├── deepseek.service.ts
│   └── ai.module.ts
├── analysis/               # 代码分析模块
│   ├── analysis.service.ts
│   ├── prompt.template.ts
│   └── analysis.module.ts
├── comment/                # 评论模块
│   ├── github-comment.service.ts
│   ├── gitlab-comment.service.ts
│   ├── comment.service.ts
│   └── comment.module.ts
└── common/                 # 通用模块
    ├── filters/           # 异常过滤器
    └── interfaces/       # 类型定义
```

## API 端点

### GitHub Webhook

- **POST** `/webhook/github`
  - 接收 GitHub push 事件
  - 需要 `X-Hub-Signature-256` 头部进行签名验证

### GitLab Webhook

- **POST** `/webhook/gitlab`
  - 接收 GitLab Push Hook 事件
  - 需要 `X-Gitlab-Token` 头部进行 token 验证

## 工作流程

1. 开发者推送代码到 GitHub/GitLab
2. 平台发送 Webhook 请求到本服务
3. 服务验证 Webhook 签名/token
4. 解析 commit 信息和代码变更
5. 调用 DeepSeek API 进行代码分析
6. 将分析结果格式化为评论
7. 通过 GitHub/GitLab API 在 commit 上添加评论

## 开发

### 代码格式化

```bash
pnpm run format
```

### 代码检查

```bash
pnpm run lint
```

## 部署

### Docker 部署

#### 方式一：使用 Docker Compose（推荐）

1. **准备环境变量文件**

   复制 `.env.example` 为 `.env` 并填写配置：

   ```bash
   cp .env.example .env
   ```

   编辑 `.env` 文件，至少需要配置 `DEEPSEEK_API_KEY`（必需）。

2. **启动服务**

   ```bash
   docker-compose up -d
   ```

3. **查看日志**

   ```bash
   docker-compose logs -f
   ```

4. **停止服务**

   ```bash
   docker-compose down
   ```

#### 方式二：使用 Docker 命令

1. **构建镜像**

   ```bash
   docker build -t backend-aireview:latest .
   ```

2. **运行容器**

   ```bash
   docker run -d \
     --name backend-aireview \
     -p 3000:3000 \
     --env-file .env \
     --restart unless-stopped \
     backend-aireview:latest
   ```

3. **查看日志**

   ```bash
   docker logs -f backend-aireview
   ```

4. **停止容器**

   ```bash
   docker stop backend-aireview
   docker rm backend-aireview
   ```

#### Docker 镜像特点

- ✅ 使用多阶段构建，减小镜像体积
- ✅ 基于 Alpine Linux，镜像更小
- ✅ 使用非 root 用户运行，提高安全性
- ✅ 支持健康检查（需要应用提供健康检查端点）
- ✅ 自动重启策略

#### 环境变量说明

所有环境变量都可以通过以下方式配置：

1. **使用 `.env` 文件**（推荐）
   ```bash
   docker-compose up --env-file .env
   ```

2. **直接在命令行指定**
   ```bash
   docker run -e DEEPSEEK_API_KEY=your_key backend-aireview:latest
   ```

3. **在 docker-compose.yml 中配置**
   ```yaml
   environment:
     - DEEPSEEK_API_KEY=your_key
   ```

### 使用 PM2

```bash
pnpm run build
pm2 start dist/main.js --name ai-review
```

## 注意事项

1. 确保 Webhook URL 可以从公网访问（可以使用 ngrok 进行本地测试）
2. GitHub/GitLab Token 需要有足够的权限（repo/api 权限）
3. DeepSeek API 可能有调用频率限制，注意控制并发
4. 建议在生产环境中使用 HTTPS

## 许可证

ISC

# 参考文献

[github webhook](https://docs.github.com/en/webhooks/webhook-events-and-payloads)
