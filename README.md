# myWebsite

一个基于 **Vue 3 + Vite** 构建的个人网站项目，包含首页展示以及 `Musics`、`Pictures`、`Movies`、`About` 等页面，适合作为个人主页、作品集展示站或审美向静态网站模板进行二次开发。

## 在线演示

- Demo: [https://mmaojun.com](https://mmaojun.com)

## 项目特性

- 基于 `Vue 3` 与 `Vite`，启动和构建速度快
- 使用 `Vue Router` 实现多页面切换
- 包含较强视觉表现的动效与过渡效果
- 首页含视频、轮播、浮动图片墙、文字展示等模块
- 页面内容集中在配置文件中，便于替换成自己的内容
- 适合部署到个人服务器、Vercel、Netlify 等平台

## 技术栈

- Vue 3
- Vite
- Vue Router
- GSAP
- Lenis
- Axios
- Three.js

## 页面说明

当前项目主要包含以下页面：

- `/`：首页
- `/musics`：音乐展示页
- `/pictures`：图片展示页
- `/movies`：电影展示页
- `/about`：关于页

## 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd myWebsite
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发环境

```bash
npm run dev
```

启动后默认可在本地开发地址访问，通常为：

```bash
http://localhost:5173
```

### 4. 打包生产环境

```bash
npm run build
```

## 项目结构

```text
myWebsite/
├─ public/                 # 静态资源
│  ├─ home/                # 首页资源
│  ├─ media-movies/        # 电影页图片资源
│  ├─ media-musics/        # 音乐页图片资源
│  └─ media-slow/          # 其他媒体资源
├─ src/
│  ├─ components/          # 页面组件与通用组件
│  │  └─ ui/               # UI 动效与展示组件
│  ├─ config/
│  │  └─ siteContent.js    # 站点核心内容配置
│  ├─ router/
│  │  └─ index.js          # 路由配置
│  ├─ App.vue              # 应用入口视图
│  └─ main.js              # 应用挂载入口
├─ index.html
├─ package.json
└─ vite.config.js
```

## 如何改成你自己的站点

如果你想把这个项目改成自己的个人主页，建议优先修改以下内容：

### 1. 修改站点文案与链接

核心内容大多集中在：

- `src/config/siteContent.js`

你可以在这里修改：

- 网站品牌名
- 顶部导航
- 页脚信息
- 社交链接
- 首页文案
- 音乐 / 电影 / 图片页面展示内容
- About 页面展示内容

### 2. 替换图片与视频资源

静态资源主要放在：

- `public/home`
- `public/media-movies`
- `public/media-musics`
- `public/media-slow`

你可以直接替换这些目录中的素材，并同步更新 `src/config/siteContent.js` 中的路径。

### 3. 修改路由页面

路由定义位于：

- `src/router/index.js`

如果你想新增页面或修改页面路径，可以在这里调整。

### 4. 修改页面组件

主要页面组件位于：

- `src/components/musics.vue`
- `src/components/movies.vue`
- `src/components/about.vue`
- `src/components/pictures.vue`
- `src/App.vue`

如果你希望更换布局、动画、交互方式，可以从这些文件开始修改。

## License

本项目默认仅作为学习、展示与二次开发参考使用。

如果你准备公开商用，建议根据自己的需求补充明确的开源许可证，例如 `MIT`。
