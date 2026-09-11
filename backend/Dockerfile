# 后端 Dockerfile —— 多阶段构建，最终镜像不含 dev 依赖与源码
# 目标平台：linux/amd64

# ============ Stage 1: 构建期 ============
FROM --platform=linux/amd64 node:20-bookworm-slim AS builder

WORKDIR /app

# 先拷贝依赖清单，利用 Docker 层缓存
COPY package.json package-lock.json* ./
COPY prisma ./prisma

# 安装全部依赖（含 devDependencies，用于 tsc 编译）
RUN npm install

# 拷贝源码并编译
COPY tsconfig.json ./
COPY nest-cli.json ./
COPY src ./src

RUN npx prisma generate
RUN npm run build

# 精简生产依赖
RUN npm install --omit=dev

# ============ Stage 2: 运行期 ============
FROM --platform=linux/amd64 node:20-bookworm-slim AS runner

WORKDIR /app

# 安全：非 root 用户运行
RUN groupadd -r app && useradd -r -g app -d /app -s /sbin/nologin app

# 仅拷贝运行所需文件
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

# 数据库存放目录（挂载卷用）
RUN mkdir -p /app/data && chown -R app:app /app

ENV NODE_ENV=production
ENV PORT=8787
# 默认指向 /app/data/dev.db，配合 volume 持久化
ENV DATABASE_URL=file:/app/data/dev.db

USER app
EXPOSE 8787

# 启动：先 push schema 再启动服务（首次启动自动建表）
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/main.js"]
