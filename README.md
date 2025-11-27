# 农优选 - 农产品电商前端

农优选是一个连接农户与消费者的农产品电商平台，提供新鲜、优质的农产品直供服务。

## 技术栈

- **框架**: [Nuxt.js 4](https://nuxt.com/) + [Vue 3](https://vuejs.org/)
- **语言**: [TypeScript](https://www.typescriptlang.org/)
- **UI 框架**: [Nuxt UI](https://ui.nuxt.com/) (基于 Tailwind CSS)
- **状态管理**: [Pinia](https://pinia.vuejs.org/)
- **HTTP 客户端**: [ofetch](https://github.com/unjs/ofetch)
- **认证**: JWT + HttpOnly Cookie

## 功能模块

### 用户端
- 🔐 用户注册/登录/退出
- 👤 个人资料管理
- 📍 收货地址管理
- 📦 订单查看与取消

### 商品
- 🛒 商品列表浏览（分类、排序、分页）
- 🔍 商品搜索
- 📄 商品详情查看

### 购物车
- ➕ 添加商品到购物车
- ✏️ 修改商品数量
- 🗑️ 删除商品
- 🧹 清空购物车

### 店铺
- 🏪 店铺列表浏览
- 📋 店铺详情及商品展示

### 商户端
- 📝 申请开店
- 🏬 店铺信息管理
- 📦 商品上下架管理
- 🚚 订单发货管理

### 管理员
- ✅ 店铺审核（批准/拒绝/暂停）

## 项目结构

```
app/
├── app.vue              # 根组件
├── error.vue            # 错误页面
├── assets/css/          # 全局样式
├── components/          # 公共组件
├── composables/         # 组合式函数
├── layouts/             # 布局组件
├── middleware/          # 路由中间件
├── pages/               # 页面组件
│   ├── auth/            # 认证页面
│   ├── products/        # 商品页面
│   ├── shops/           # 店铺页面
│   ├── user/            # 用户中心
│   ├── seller/          # 商户管理
│   └── admin/           # 管理后台
├── services/api/        # API 服务
├── stores/              # Pinia 状态管理
└── types/               # TypeScript 类型定义
```

## 快速开始

### 环境要求

- Node.js >= 18.x
- npm >= 9.x

### 安装依赖

```bash
npm install
```

### 开发环境

```bash
npm run dev
```

访问 http://localhost:3000

开发环境下，Nuxt 会自动将 `/api/v1/*` 请求代理到后端 `http://127.0.0.1:8080`。

### 生产构建

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 生产环境部署

### 方式一：Nginx 代理（推荐）

使用 Nginx 将前端和后端部署在同一域名下，通过路径区分：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/your/nuxt/.output/public;
        try_files $uri $uri/ /index.html;
    }

    # API 代理到后端
    location /api/v1/ {
        proxy_pass http://127.0.0.1:8080/api/v1/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cookie 透传
        proxy_set_header Cookie $http_cookie;
        proxy_pass_header Set-Cookie;
    }
}
```

这种方式无需额外配置，前端请求 `/api/v1/*` 会被 Nginx 代理到后端。

### 方式二：前后端分离部署

如果前后端使用不同域名部署，需要设置环境变量：

```bash
NUXT_PUBLIC_API_BASE_URL=https://api.your-domain.com npm run build
```

**注意**：这种方式需要后端正确配置 CORS：
- `Access-Control-Allow-Origin`: 前端域名（不能是 `*`）
- `Access-Control-Allow-Credentials: true`
- Cookie 需设置 `SameSite=None; Secure`（要求 HTTPS）

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `NUXT_PUBLIC_API_BASE_URL` | 后端 API 地址 | 空（使用相对路径） |

## 相关项目

- [agriecom-backend](https://github.com/A-Words/agriecom-backend) - 后端 Spring Boot 项目
