# Docker 部署指南

本文档详细说明如何使用 Docker 部署 AI Review System。

## 前置要求

- Docker 20.10 或更高版本
- Docker Compose 2.0 或更高版本（如果使用 docker-compose）

## 快速开始

### 1. 准备环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，至少需要配置以下必需的环境变量：

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### 2. 使用 Docker Compose 部署（推荐）

```bash
# 构建并启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 3. 使用 Docker 命令部署

```bash
# 构建镜像
docker build -t backend-aireview:latest .

# 运行容器
docker run -d \
  --name backend-aireview \
  -p 3000:3000 \
  --env-file .env \
  --restart unless-stopped \
  backend-aireview:latest

# 查看日志
docker logs -f backend-aireview

# 停止并删除容器
docker stop backend-aireview
docker rm backend-aireview
```

## 环境变量配置

### 必需的环境变量

- `DEEPSEEK_API_KEY`: DeepSeek API 密钥（必需）

### 可选的环境变量

- `PORT`: 服务端口（默认: 3000）
- `NODE_ENV`: 运行环境（默认: production）
- `DEEPSEEK_BASE_URL`: DeepSeek API 基础 URL（默认: https://api.deepseek.com）
- `DEEPSEEK_MODEL`: DeepSeek 模型名称（默认: deepseek-chat）
- `GITHUB_TOKEN`: GitHub Personal Access Token
- `GITHUB_WEBHOOK_SECRET`: GitHub Webhook 密钥
- `GITLAB_TOKEN`: GitLab Personal Access Token
- `GITLAB_WEBHOOK_TOKEN`: GitLab Webhook Token
- `GITLAB_BASE_URL`: GitLab API 基础 URL（默认: https://gitlab.com/api/v4）

## Docker 镜像说明

### 镜像特点

- **多阶段构建**: 减小最终镜像体积
- **Alpine Linux**: 基于轻量级 Alpine 镜像
- **非 root 用户**: 使用 nestjs 用户运行，提高安全性
- **生产优化**: 只安装生产依赖

### 镜像结构

```
阶段 1 (builder):
  - 安装所有依赖（包括开发依赖）
  - 编译 TypeScript 代码
  - 生成 dist 目录

阶段 2 (production):
  - 只安装生产依赖
  - 复制编译后的文件
  - 使用非 root 用户运行
```

## 常用命令

### Docker Compose

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose stop

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f

# 查看服务状态
docker-compose ps

# 进入容器
docker-compose exec backend-aireview sh

# 重新构建并启动
docker-compose up -d --build

# 停止并删除容器、网络
docker-compose down

# 停止并删除容器、网络、卷
docker-compose down -v
```

### Docker 命令

```bash
# 构建镜像
docker build -t backend-aireview:latest .

# 运行容器
docker run -d --name backend-aireview -p 3000:3000 --env-file .env backend-aireview:latest

# 查看运行中的容器
docker ps

# 查看容器日志
docker logs -f backend-aireview

# 进入容器
docker exec -it backend-aireview sh

# 停止容器
docker stop backend-aireview

# 启动已停止的容器
docker start backend-aireview

# 删除容器
docker rm backend-aireview

# 删除镜像
docker rmi backend-aireview:latest

# 查看镜像大小
docker images backend-aireview
```

## 端口映射

默认情况下，应用运行在容器内的 3000 端口。你可以通过以下方式修改：

### Docker Compose

在 `docker-compose.yml` 中修改：

```yaml
ports:
  - '8080:3000' # 将容器的 3000 端口映射到主机的 8080 端口
```

### Docker 命令

```bash
docker run -p 8080:3000 backend-aireview:latest
```

## 数据持久化

当前应用是无状态的，不需要数据持久化。如果需要添加日志持久化，可以在 `docker-compose.yml` 中添加卷：

```yaml
volumes:
  - ./logs:/app/logs
```

## 网络配置

### 网络配置说明

在 `docker-compose.yml` 中的网络配置：

```yaml
networks:
  aireview-network:
    driver: bridge
```

**含义解释：**

- `networks:`: 定义 Docker Compose 使用的网络
- `aireview-network`: 网络名称，用于标识这个网络
- `driver: bridge`: 网络驱动类型，`bridge` 是默认的桥接网络
  - **Bridge 网络**：容器之间可以通过服务名或容器名进行通信
  - 同一网络内的容器可以互相访问，但不会暴露到主机网络
  - 适合同一 Docker Compose 文件中的多个服务通信

### 两个容器之间通信

#### 方法 1: 使用 Docker Compose（推荐）

在同一个 `docker-compose.yml` 文件中定义多个服务，它们会自动加入同一个网络：

```yaml
version: '3.8'

services:
  backend-aireview:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: backend-aireview
    networks:
      - aireview-network
    # ... 其他配置

  # 第二个服务示例：数据库
  postgres:
    image: postgres:15-alpine
    container_name: postgres-db
    environment:
      POSTGRES_DB: aireview
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    networks:
      - aireview-network
    # ... 其他配置

  # 第三个服务示例：Redis
  redis:
    image: redis:7-alpine
    container_name: redis-cache
    networks:
      - aireview-network
    # ... 其他配置

networks:
  aireview-network:
    driver: bridge
```

**通信方式：**

在同一网络中的容器可以通过以下方式通信：

1. **使用服务名**（推荐）：

   ```javascript
   // 在 backend-aireview 中访问 postgres
   const dbUrl = 'postgresql://postgres:password@postgres:5432/aireview';

   // 在 backend-aireview 中访问 redis
   const redisUrl = 'redis://redis:6379';
   ```

2. **使用容器名**：
   ```javascript
   // 使用容器名也可以
   const dbUrl = 'postgresql://postgres:password@postgres-db:5432/aireview';
   ```

**重要提示：**

- 使用**服务名**（如 `postgres`、`redis`）作为主机名，而不是 `localhost`
- 端口使用容器内部的端口，不需要映射到主机
- 服务名会自动解析为容器 IP 地址

#### 方法 2: 使用 Docker 命令手动创建网络

```bash
# 1. 创建网络
docker network create my-network

# 2. 运行第一个容器并加入网络
docker run -d \
  --name container1 \
  --network my-network \
  your-image:latest

# 3. 运行第二个容器并加入同一网络
docker run -d \
  --name container2 \
  --network my-network \
  your-image:latest

# 4. 容器之间可以通过容器名通信
# 在 container1 中访问 container2：
# http://container2:port
```

#### 方法 3: 使用外部网络

如果容器不在同一个 `docker-compose.yml` 中，可以使用外部网络：

**步骤 1：创建外部网络**

```bash
docker network create shared-network
```

**步骤 2：在第一个 docker-compose.yml 中使用外部网络**

```yaml
services:
  service1:
    # ... 配置
    networks:
      - shared-network

networks:
  shared-network:
    external: true
    name: shared-network
```

**步骤 3：在第二个 docker-compose.yml 中使用相同的外部网络**

```yaml
services:
  service2:
    # ... 配置
    networks:
      - shared-network

networks:
  shared-network:
    external: true
    name: shared-network
```

### 实际示例：后端服务连接数据库

假设你有一个后端服务和一个 PostgreSQL 数据库：

```yaml
version: '3.8'

services:
  backend-aireview:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: backend-aireview
    environment:
      # 使用服务名 'postgres' 作为数据库主机
      DATABASE_URL: postgresql://postgres:password@postgres:5432/aireview
    networks:
      - aireview-network
    depends_on:
      - postgres # 确保 postgres 先启动

  postgres:
    image: postgres:15-alpine
    container_name: postgres-db
    environment:
      POSTGRES_DB: aireview
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    networks:
      - aireview-network
    volumes:
      - postgres-data:/var/lib/postgresql/data

networks:
  aireview-network:
    driver: bridge

volumes:
  postgres-data:
```

在代码中，使用环境变量中的 `DATABASE_URL`，它会自动解析 `postgres` 服务名为正确的容器 IP。

### 验证容器网络连接

```bash
# 查看网络信息
docker network inspect aireview-network

# 在容器中测试连接（例如测试是否能连接到 postgres）
docker exec backend-aireview ping postgres

# 查看容器网络配置
docker inspect backend-aireview | grep -A 20 Networks
```

### 常见问题

**Q: 为什么容器之间无法通信？**

- 检查是否在同一个网络中
- 确认使用服务名而不是 `localhost`
- 检查防火墙设置

**Q: 如何让容器访问主机服务？**

- 使用 `host.docker.internal`（Docker Desktop）或 `172.17.0.1`（Linux）
- 例如：`http://host.docker.internal:8080`

**Q: 如何让主机访问容器？**

- 使用 `ports` 映射端口到主机

## 故障排查

### 实时查看容器日志

#### Docker Compose 方式

```bash
# 实时查看所有服务的日志（跟随模式）
docker-compose logs -f

# 实时查看指定服务的日志
docker-compose logs -f backend-aireview

# 查看最近 100 行日志并实时跟随
docker-compose logs -f --tail=100 backend-aireview

# 查看指定时间之后的日志
docker-compose logs -f --since 10m backend-aireview
```

#### Docker 命令方式

```bash
# 实时查看容器日志（跟随模式，类似 tail -f）
docker logs -f backend-aireview

# 查看最近 100 行日志并实时跟随
docker logs -f --tail=100 backend-aireview

# 查看指定时间之后的日志（例如：10分钟前到现在）
docker logs -f --since 10m backend-aireview

# 查看指定时间段的日志
docker logs --since "2024-01-01T00:00:00" --until "2024-01-01T12:00:00" backend-aireview

# 查看所有日志（不跟随）
docker logs backend-aireview

# 查看最后 50 行日志（不跟随）
docker logs --tail=50 backend-aireview
```

#### 常用参数说明

- `-f` 或 `--follow`: 实时跟踪日志输出（类似 `tail -f`）
- `--tail=N`: 只显示最后 N 行日志
- `--since`: 显示指定时间之后的日志（例如：`10m`, `1h`, `2024-01-01T00:00:00`）
- `--until`: 显示指定时间之前的日志
- `-t` 或 `--timestamps`: 显示时间戳

#### 示例

```bash
# 实时查看并显示时间戳
docker logs -f -t backend-aireview

# 查看最近 200 行日志，带时间戳，并实时跟随
docker logs -f -t --tail=200 backend-aireview

# 查看最近 1 小时的日志
docker logs --since 1h backend-aireview
```

### 进入容器调试

```bash
# Docker Compose
docker-compose exec backend-aireview sh

# Docker
docker exec -it backend-aireview sh
```

### 检查环境变量

```bash
# Docker Compose
docker-compose exec backend-aireview env

# Docker
docker exec backend-aireview env
```

### 检查端口是否正常监听

```bash
# 在容器内
docker exec backend-aireview netstat -tlnp

# 或使用 ss
docker exec backend-aireview ss -tlnp
```

### 重新构建镜像

如果代码有更新，需要重新构建：

```bash
# Docker Compose
docker-compose up -d --build

# Docker
docker build -t backend-aireview:latest .
docker stop backend-aireview
docker rm backend-aireview
docker run -d --name backend-aireview -p 3000:3000 --env-file .env backend-aireview:latest
```

## 生产环境建议

1. **使用 HTTPS**: 在生产环境中，建议使用反向代理（如 Nginx）提供 HTTPS
2. **资源限制**: 为容器设置资源限制
3. **日志管理**: 配置日志轮转和集中日志管理
4. **监控**: 添加应用监控和告警
5. **备份**: 定期备份配置文件和环境变量

### 资源限制示例

在 `docker-compose.yml` 中添加：

```yaml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 512M
    reservations:
      cpus: '0.5'
      memory: 256M
```

## 更新应用

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建镜像
docker-compose build

# 3. 重启服务
docker-compose up -d

# 或者使用一条命令
docker-compose up -d --build
```

## 安全建议

1. **不要将 `.env` 文件提交到 Git**
2. **使用 Docker secrets** 管理敏感信息（生产环境）
3. **定期更新基础镜像**
4. **使用非 root 用户运行**（已在 Dockerfile 中配置）
5. **限制容器网络访问**

## 参考资源

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [NestJS 部署文档](https://docs.nestjs.com/)
