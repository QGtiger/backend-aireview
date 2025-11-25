# 多阶段构建 Dockerfile
# 阶段 1: 构建阶段
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm run build

# 阶段 2: 生产阶段
FROM node:20-alpine AS production

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 只安装生产依赖
RUN pnpm install --prod --frozen-lockfile

# 从构建阶段复制编译后的文件
COPY --from=builder /app/dist ./dist

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nestjs -u 1001

# 更改文件所有者
RUN chown -R nestjs:nodejs /app
USER nestjs

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 启动应用
CMD ["node", "dist/main"]

