# 一键构建 amd64 容器镜像脚本（Windows PowerShell）
# 前置：本机已安装 Docker Desktop 或 Docker Engine
# 用法：在项目根目录执行 .\build.ps1

$ErrorActionPreference = "Stop"

Write-Host "===== 构建 amd64 容器镜像 =====" -ForegroundColor Cyan
Write-Host "目标平台：linux/amd64"
Write-Host ""

# 确认 Docker 可用
$dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerCmd) {
    Write-Host "错误：未检测到 docker 命令" -ForegroundColor Red
    Write-Host "请先安装 Docker Desktop: https://www.docker.com/products/docker-desktop/"
    exit 1
}

# 构建后端镜像
Write-Host "[1/2] 构建后端镜像 aihomework3-backend:amd64 ..." -ForegroundColor Yellow
docker build --platform linux/amd64 -t aihomework3-backend:amd64 ./backend
if ($LASTEXITCODE -ne 0) {
    Write-Host "后端镜像构建失败" -ForegroundColor Red
    exit 1
}

# 构建前端镜像
Write-Host "[2/2] 构建前端镜像 aihomework3-frontend:amd64 ..." -ForegroundColor Yellow
docker build --platform linux/amd64 -t aihomework3-frontend:amd64 ./frontend
if ($LASTEXITCODE -ne 0) {
    Write-Host "前端镜像构建失败" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "===== 构建成功 =====" -ForegroundColor Green
Write-Host "镜像列表："
docker images | Select-String "aihomework3"
Write-Host ""
Write-Host "启动方式："
Write-Host "  开发模式（需配置 .env）：docker compose up -d"
Write-Host "  访问地址：http://localhost"
Write-Host ""
Write-Host "导出镜像（离线部署用）："
Write-Host "  docker save aihomework3-backend:amd64 -o backend.tar"
Write-Host "  docker save aihomework3-frontend:amd64 -o frontend.tar"
