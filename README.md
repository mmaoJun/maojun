# 🌐 mmaojun.com — 个人作品集全栈项目

> 一个融合了动画、交互与内容管理的个人网站，记录我所热爱的音乐、电影与图像。

**在线演示：** [https://mmaojun.com](https://mmaojun.com)

---

## 🎬 网站演示

<video src="public/2026-06-04%2009-14-06.mp4" controls autoplay muted loop width="100%"></video>

> 如果视频无法加载，请访问 [https://mmaojun.com](https://mmaojun.com) 在线体验。

---

## ✨ 关于本站

这是一个**全栈个人作品集网站**，始于对前端动效与交互设计的热爱。网站汇集了我喜欢的音乐、电影和摄影作品，同时提供了一套完整的后台管理系统，支持在线编辑和内容发布。

### 主要功能

- 🏠 **首页** — 视频背景、动态轮播、浮动图片墙，营造沉浸式的第一印象
- 👤 **关于页** — 个人经历与技能展示，支持滚动驱动的 SVG 路径动画
- 🎵 **音乐页** — 音乐收藏与展示
- 🎬 **电影页** — 电影作品展示
- 🖼️ **图片页** — 摄影/图片画廊
- 🔐 **管理后台** — 全功能 CMS，支持首页、关于、音乐、电影、图片等各页面内容的在线编辑
- ☁️ **OSS 存储** — 图片与视频资源托管于阿里云 OSS，支持预签名 URL 上传

### 设计亮点

- **GSAP 动画系统** — 滚动驱动动画、页面转场过渡、文字交换效果
- **Three.js 3D 场景** — 首页 3D 背景渲染
- **Lenis 平滑滚动** — 丝滑的原生滚动体验
- **Route Curtain 转场** — 自定义页面切换动效，发布订阅模式驱动
- **响应式布局** — 适配桌面与移动端

---

## 🎨 设计声明

> **本网站的 UI 设计和图片素材均借鉴自互联网上他人的优秀设计作品。**
>
> 网站的部分界面布局、动效创意和视觉风格参考了 Dribbble、Behance、Awwwards 等设计社区的杰出作品。站内使用的图片素材（包括首页轮播图、各页面展示图等）来源于网络搜集，其版权归原作者所有。
>
> 本项目为**个人学习与非商业用途**，旨在探索现代前端动效与全栈开发的实践。如果您是某张图片或某处设计的原作者，且不希望其出现在本站中，请联系我进行处理。

---

## 🛠️ 技术栈

### 前端

| 技术 | 说明 |
|------|------|
| Vue 3 | Composition API + `<script setup>` |
| Vite 8 | 构建工具与开发服务器 |
| Vue Router 5 | 客户端路由 + 过渡动画 |
| GSAP 3.15 | 滚动驱动动画、ScrollTrigger、Pinning |
| Three.js | 3D 场景与 WebGL 渲染 |
| Lenis | 平滑滚动库 |
| Axios | HTTP 客户端 |

### 后端

| 技术 | 说明 |
|------|------|
| Spring Boot 3.3.5 | Java 后端框架 |
| MyBatis-Plus 3.5.7 | ORM 与数据库操作 |
| Spring Security + JWT | 无状态认证与鉴权 |
| MySQL 8 | 关系型数据库 |
| 阿里云 OSS | 对象存储（图片/视频） |

---

## 📁 项目结构

```
myWebsite/
├── src/                          # Vue 3 前端
│   ├── config/default.js         # 页面内容默认值
│   ├── router/index.js           # 路由定义 + RouteCurtain 转场
│   ├── utils/                    # api.js, auth.js, ossProxy.js
│   ├── composables/              # useHomeContent.js, useFileUpload.js
│   └── components/
│       ├── ui/                   # 通用动画组件 (StoryScroll, FluidMenu 等)
│       ├── admin-*.vue           # 管理后台编辑器
│       └── *.vue                 # 页面组件 (about, movies, musics, pictures)
├── server/                       # Spring Boot 后端
│   └── src/main/java/com/maojun/admin/
│       ├── config/               # SecurityConfig, JWT, OSS 配置
│       ├── controller/           # REST 控制器
│       ├── service/              # 业务逻辑 (接口 + 实现)
│       ├── mapper/               # MyBatis-Plus Mapper
│       ├── entity/               # 实体类
│       └── dto/                  # 数据传输对象
├── public/                       # 静态资源
├── deploy.sh                     # 一键部署脚本
├── Dockerfile                    # Docker 构建
└── .gitignore
```

---

## 🗺️ 页面路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 视频背景、轮播、浮动图片墙、3D 场景 |
| `/about` | 关于 | 个人介绍 + SVG 路径动画 |
| `/musics` | 音乐 | 音乐收藏展示 |
| `/movies` | 电影 | 电影作品展示 |
| `/pictures` | 图片 | 图片画廊 |
| `/login` | 登录 | 管理后台入口 |
| `/manage-images` | 图片管理 | OSS 图片上传与管理 |
| `/home-editor` | 首页编辑 | 首页内容在线配置 |
| `/movies-editor` | 电影编辑 | 电影页内容配置 |
| `/pictures-editor` | 图片编辑 | 图片页内容配置 |
| `/about-editor` | 关于编辑 | 关于页内容配置 |
| `/musics-editor` | 音乐编辑 | 音乐页内容配置 |

---

## 🚀 快速开始

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

---

## 📦 部署

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

---

## 🔧 环境变量

| 变量 | 说明 |
|------|------|
| `DB_PASSWORD` | 数据库密码 |
| `JWT_SECRET` | JWT 签名密钥 |
| `ADMIN_PASSWORD` | 管理员后台密码 |
| `OSS_ACCESS_KEY_ID` | 阿里云 OSS AccessKey ID |
| `OSS_ACCESS_KEY_SECRET` | 阿里云 OSS AccessKey Secret |

---

## 🔨 二次开发

### 核心配置文件

- **`src/config/default.js`** — 站点文案默认值（品牌名、导航、页脚、各页面内容）
- **`server/src/main/resources/application.yml`** — 后端配置（数据库、OSS、JWT）

### 编码约定

- 纯 JavaScript，无 TypeScript
- 所有组件使用 `<script setup>` Composition API
- GSAP 动画在 `onMounted` 中构建，`onBeforeUnmount` 中 `kill()` 清理
- Scoped CSS，自定义属性（`--bg`、`--fg`、`--nav-bg`）
- 保持现有代码风格一致

---

## 📄 许可证

MIT License — 详见 [LICENSE](LICENSE) 文件。

---

<p align="center">Made with ❤️ by maoJun</p>
