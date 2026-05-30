# Fund-Next

多资产个人资产配置追踪系统，基于 Next.js 15 + Prisma + MySQL。

## 快速开始

### 1. 启动数据库

```bash
docker compose up -d mysql
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

### 3. 安装依赖 & 初始化数据库

```bash
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
```

### 4. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

## 测试账号

| 账号 | 密码 | 说明 |
|------|------|------|
| admin@test.com | admin123456 | 管理员 |
| user@test.com | user123456 | 普通用户 |

## Docker 命令

```bash
pnpm docker:up      # 启动 MySQL
pnpm docker:down    # 停止所有服务
pnpm docker:reset   # 重置数据库（清除数据）
pnpm docker:full    # 一键部署（MySQL + App 容器）
pnpm docker:logs    # 查看日志
```

## 开发命令

```bash
pnpm dev              # 开发服务器
pnpm build            # 生产构建
pnpm lint             # ESLint 检查
pnpm typecheck        # TypeScript 类型检查
pnpm test             # 运行测试
pnpm prisma:generate  # 重新生成 Prisma Client
pnpm prisma:migrate   # 创建并应用迁移
pnpm prisma:seed      # 写入测试数据
```
