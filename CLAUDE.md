# myWebsite — 个人作品集全栈项目

## 技术栈

**前端：** Vue 3 (Composition API, `<script setup>`) · Vite 8 · Vue Router 5 · GSAP 3.15 · Three.js · Lenis 平滑滚动
**后端：** Spring Boot 3.3.5 · Java 17 · MyBatis-Plus 3.5.7 · JWT (jjwt 0.12) · MySQL 8 · Aliyun OSS
**部署：** 生产环境 [mmaojun.com](https://mmaojun.com)，前端 `dist/` 静态托管，后端 systemd 服务

## 每次回到我都称呼我为maojun

## 项目结构

```
src/                          # 前端 (Vue 3)
  ├── config/default.js       # 所有页面内容的默认值
  ├── router/index.js         # 路由定义 + RouteCurtain 转场动画
  ├── utils/                  # api.js (axios 实例), auth.js (JWT), ossProxy.js
  ├── composables/            # useHomeContent.js, useFileUpload.js
  └── components/
      ├── ui/                 # 可复用动画组件
      ├── admin-*.vue         # 管理后台编辑器
      └── *.vue               # 页面组件 (about, movies, musics, pictures)
server/                       # 后端 (Spring Boot)
  ├── src/main/java/.../  controller / service / mapper / entity / dto / config
  └── src/main/resources/    application.yml (需复制 .example 模板)
```

## 常用命令

```bash
npm run dev          # 前端开发服务器 :5173
npm run build        # 生产构建 -> dist/
mvn spring-boot:run  # 后端 :8080 (在 server/ 目录下执行)
```

## 核心模式

### 前端

- **所有组件用 `<script setup>`**，不用 Options API
- **GSAP 已在 App.vue 注册 ScrollTrigger**，组件中直接 import gsap 使用，无需重复 registerPlugin
- **GSAP 生命周期：** onMounted 中构建动画 + 存储引用 → onBeforeUnmount 中 `kill()` 清理。参照 `src/components/ui/StoryScroll.vue` 的模式
- **内容策略：** `default.js` 是硬编码默认值，`useHomeContent.js` 从 `/api/home-content/public` 拉取覆盖。管理后台编辑后存到 `home_content` 表
- **CSS：** scoped 样式，自定义属性（`--bg`、`--fg`、`--nav-bg`），Google Fonts 按需 import
- **路由转场：** `router/index.js` 的 `beforeEach`/`afterEach` 用 `routeCurtainController.js`（发布订阅模式）控制过渡动效

### 后端

- **分层：** Controller → Service(接口+实现) → Mapper(MyBatis-Plus)，构造器注入
- **安全：** JWT 无状态认证，`SecurityConfig` 开放 `/api/auth/login`、`/api/home-content/public`、`/actuator/health`
- **统一响应：** 所有接口返回 `ApiResponse<T>` 包装
- **跨域：** 允许 localhost:5173 和 mmaojun.com

### 编码风格
- 纯 JavaScript，无 TypeScript
- 未配置 ESLint/Prettier — 保持现有代码风格一致即可
- 无测试文件 — 新功能暂不强制写测试

## Skills

本项目已安装的 Skills（`.claude/skills/`）：`gsap-core`、`gsap-scrolltrigger`、`gsap-timeline`、`gsap-plugins`、`gsap-utils`、`gsap-frameworks`、`gsap-react`、`gsap-performance`

