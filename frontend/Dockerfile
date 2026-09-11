# 前端 Dockerfile —— 多阶段构建，最终用 nginx 托管静态资源
# 目标平台：linux/amd64

# ============ Stage 1: 构建期 ============
FROM --platform=linux/amd64 node:20-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# 前端 baseURL 硬编码 /api，由 nginx 反代到后端容器，无需构建参数
RUN npm run build

# ============ Stage 2: 运行期 ============
FROM --platform=linux/amd64 nginx:alpine AS runner

# 用自定义 nginx 配置：静态托管 + /api 反代到后端容器
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 拷贝构建产物到 nginx 静态目录
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
