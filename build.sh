#!/bin/bash
# 一键构建 amd64 容器镜像脚本（Linux/macOS）
# 前置：本机已安装 Docker Engine
# 用法：在项目根目录执行 bash build.sh

set -e

echo "===== 构建 amd64 容器镜像 ====="
echo "目标平台：linux/amd64"
echo ""

# 确认 Docker 可用
if ! command -v docker &> /dev/null; then
    echo "错误：未检测到 docker 命令"
    echo "请先安装 Docker Engine: https://docs.docker.com/engine/install/"
    exit 1
fi

# 构建后端镜像
echo "[1/2] 构建后端镜像 aihomework3-backend:amd64 ..."
docker build --platform linux/amd64 -t aihomework3-backend:amd64 ./backend

# 构建前端镜像
echo "[2/2] 构建前端镜像 aihomework3-frontend:amd64 ..."
docker build --platform linux/amd64 -t aihomework3-frontend:amd64 ./frontend

echo ""
echo "===== 构建成功 ====="
echo "镜像列表："
docker images | grep aihomework3
echo ""
echo "启动方式："
echo "  开发模式（需配置 .env）：docker compose up -d"
echo "  访问地址：http://localhost"
echo ""
echo "导出镜像（离线部署用）："
echo "  docker save aihomework3-backend:amd64 -o backend.tar"
echo "  docker save aihomework3-frontend:amd64 -o frontend.tar"
