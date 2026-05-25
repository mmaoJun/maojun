# MyWebsite

个人网站，基于 Vue 3 + Spring Boot，支持内容管理后台和阿里云 OSS 存储。

**在线演示：** [https://mmaojun.com](https://mmaojun.com)

## 技术栈

**前端**

- Vue 3 + Vite + Vue Router
- GSAP / Three.js / Lenis 平滑滚动
- Axios

**后端**

- Spring Boot 3.3 + MyBatis-Plus
- Spring Security + JWT 认证
- MySQL + 阿里云 OSS

## 项目结构

```
├── src/                       # Vue 前端
│   ├── components/            # 页面组件 & UI 组件
│   │   └── ui/                # 通用 UI 动效组件
│   ├── composables/           # 组合式函数
│   ├── router/                # 路由配置
│   └── utils/                 # API、Auth、OSS 代理
├── server/                    # Spring Boot 后端
│   └── src/main/java/com/maojun/admin/
│       ├── config/            # 安全、JWT、OSS 配置
│       ├── controller/        # REST 控制器
│       ├── service/           # 业务逻辑
│       └── entity/            # 实体类
├── deploy.sh                  # 一键部署脚本
├── Dockerfile                 # Docker 构建
└── .gitignore
```

## 页面路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 视频、轮播、浮动图片墙 |
| `/about` | 关于 | 个人介绍 |
| `/musics` | 音乐 | 音乐展示 |
| `/movies` | 电影 | 电影展示 |
| `/pictures` | 图片 | 图片展示 |
| `/login` | 登录 | 管理后台入口 |
| `/manage-images` | 图片管理 | OSS 图片上传/管理 |
| `/home-editor` | 首页编辑 | 首页内容配置 |
| `/movies-editor` | 电影编辑 | 电影页内容配置 |
| `/pictures-editor` | 图片编辑 | 图片页内容配置 |
| `/about-editor` | 关于编辑 | 关于页内容配置 |
| `/musics-editor` | 音乐编辑 | 音乐页内容配置 |

## 快速开始

### 前端

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # 生产构建 → dist/
```

Vite 已配置代理，`/api` 请求自动转发到后端 `localhost:8080`。

### 后端

**依赖：** JDK 17+、Maven 3、MySQL 8

```bash
cd server

# 1. 配置文件
cp src/main/resources/application.yml.example src/main/resources/application.yml
# 编辑 application.yml，填入数据库和 OSS 配置

# 2. 初始化数据库
mysql -u root -p < init.sql

# 3. 启动
mvn spring-boot:run     # 默认 http://localhost:8080
```

## 部署

### 传统部署

```bash
# 1. 构建后端并部署到服务器
./deploy.sh

# 2. 构建前端
npm run build
# 将 dist/ 上传到 Nginx 静态目录
```

### Docker

```bash
docker build -t mywebsite-backend .
docker run -d -p 8080:8080 \
  -e DB_PASSWORD=xxx \
  -e JWT_SECRET=xxx \
  -e ADMIN_PASSWORD=xxx \
  -e OSS_ACCESS_KEY_ID=xxx \
  -e OSS_ACCESS_KEY_SECRET=xxx \
  mywebsite-backend
```

### Systemd 服务

```bash
cp server/mywebsite-backend.service /etc/systemd/system/
mkdir -p /opt/mywebsite/backend
cp server/env.conf.example /opt/mywebsite/backend/env.conf
# 编辑 /opt/mywebsite/backend/env.conf 填入真实配置

systemctl daemon-reload
systemctl enable --now mywebsite-backend
```

## 环境变量

| 变量 | 说明 |
|------|------|
| `DB_PASSWORD` | 数据库密码 |
| `JWT_SECRET` | JWT 签名密钥 |
| `ADMIN_PASSWORD` | 管理员后台密码 |
| `OSS_ACCESS_KEY_ID` | 阿里云 OSS AccessKey ID |
| `OSS_ACCESS_KEY_SECRET` | 阿里云 OSS AccessKey Secret |

## 二次开发

核心配置文件：

- `src/config/siteContent.js` — 站点文案（品牌名、导航、页脚、各页面内容）
- `server/src/main/resources/application.yml` — 后端配置（数据库、OSS、JWT）

替换图片和视频资源直接通过管理后台上传到 OSS，无需手动管理 `public/` 目录。

## 许可证

MIT
