# 项目打包说明

## 项目概述
这是一个基于React + Vite的产品筛选系统，包含两个主要页面：
- **产品查询页面**：用户填写表单（支持小数、单选）查询产品
- **管理员页面**：查看和管理产品数据，支持筛选和分页功能

## 环境要求
- Node.js 20.x 或更高版本
- npm 或 yarn 或 pnpm

## 安装依赖

### 使用npm
```bash
npm install
```

### 使用yarn
```bash
yarn install
```

### 使用pnpm
```bash
pnpm install
```

## 配置后端接口

### 1. 复制环境变量配置文件
```bash
cp .env.example .env
```

### 2. 修改.env文件
在项目根目录下找到`.env`文件，修改`VITE_API_BASE_URL`为你的后端API地址：

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### 3. API配置文件位置
后端接口配置文件位于：`src/api/config.js`

在该文件中，你可以修改以下配置：
- `API_BASE_URL`：后端API的基础URL
- `timeout`：请求超时时间
- 请求拦截器和响应拦截器

### 4. API接口调用文件
所有API接口调用方法位于：`src/api/productApi.js`

该文件包含了所有与后端交互的接口方法，每个方法都预留了真实API调用的注释示例。当后端接口准备好后，只需将模拟数据代码替换为真实的API调用即可。

## 开发模式

### 启动开发服务器
```bash
npm run dev
```

开发服务器将在 `http://localhost:5173` 启动

### 开发模式特点
- 支持热模块替换（HMR）
- 实时代码更新
- 详细的错误提示
- 源码映射，便于调试

## 生产打包

### 构建生产版本
```bash
npm run build
```

构建完成后，会在项目根目录下生成`dist`文件夹，包含所有优化后的静态文件。

### 构建输出说明
- `dist/index.html`：入口HTML文件
- `dist/assets/`：打包后的JS、CSS等静态资源
- 文件名包含哈希值，便于缓存控制

### 构建优化
Vite会自动进行以下优化：
- 代码压缩和混淆
- Tree Shaking（移除未使用的代码）
- 代码分割（Code Splitting）
- 资源优化（图片、字体等）

## 预览生产构建

### 本地预览打包后的应用
```bash
npm run preview
```

这将在本地启动一个静态文件服务器，预览生产构建的结果。

## 部署

### 部署到静态服务器
将`dist`文件夹中的所有文件部署到你的Web服务器（如Nginx、Apache等）。

### Nginx配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 如果需要配置API代理
    location /api {
        proxy_pass http://your-backend-server:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 部署到CDN
1. 将`dist`文件夹上传到CDN
2. 配置CDN缓存策略
3. 更新域名解析

### 部署到云服务
- **Vercel**：直接导入项目，自动部署
- **Netlify**：拖放`dist`文件夹或连接Git仓库
- **GitHub Pages**：配置`vite.config.js`的`base`选项

## 环境变量

### 开发环境变量
在`.env.development`文件中配置开发环境变量：
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### 生产环境变量
在`.env.production`文件中配置生产环境变量：
```env
VITE_API_BASE_URL=https://api.your-domain.com
```

### 环境变量命名规则
Vite要求环境变量以`VITE_`开头才能在客户端代码中访问。

## 常见问题

### 1. 打包后页面空白
- 检查`vite.config.js`中的`base`配置
- 确保服务器配置了正确的路由重定向
- 检查控制台是否有资源加载错误

### 2. API请求失败
- 确认`.env`文件中的`VITE_API_BASE_URL`配置正确
- 检查后端服务是否正常运行
- 查看浏览器控制台的网络请求详情

### 3. 样式丢失
- 确保CSS文件正确导入
- 检查构建后的资源路径是否正确
- 清除浏览器缓存后重试

### 4. 路由在刷新后404
- 配置服务器支持SPA路由
- 使用`try_files $uri $uri/ /index.html;`（Nginx）
- 或配置`historyApiFallback`（开发服务器）

## 性能优化建议

### 1. 代码分割
Vite已自动配置代码分割，无需额外配置。

### 2. 图片优化
- 使用WebP格式
- 压缩图片大小
- 使用懒加载

### 3. 缓存策略
- 利用浏览器缓存
- 配置CDN缓存
- 使用Service Worker

### 4. 减少包体积
- 移除未使用的依赖
- 使用Tree Shaking
- 按需引入第三方库

## 项目结构

```
product_filter_fe/
├── src/
│   ├── api/              # API接口层
│   │   ├── config.js     # API配置文件（后端接口地址配置）
│   │   └── productApi.js # 产品相关API接口
│   ├── pages/            # 页面组件
│   │   ├── UserFormPage.jsx   # 用户表单页面
│   │   └── AdminPage.jsx      # 管理员页面
│   ├── components/      # 公共组件
│   ├── utils/            # 工具函数
│   ├── App.jsx           # 主应用组件
│   ├── main.jsx          # 应用入口
│   └── index.css         # 全局样式
├── public/               # 静态资源
├── dist/                 # 打包输出目录（构建后生成）
├── .env                  # 环境变量配置
├── .env.example          # 环境变量示例
├── package.json          # 项目依赖配置
└── vite.config.js        # Vite配置文件
```

## 技术栈
- **React 18**：前端框架
- **Vite 7**：构建工具
- **React Router**：路由管理
- **Axios**：HTTP客户端
- **JavaScript ES6+**：编程语言

## 开发建议

### 1. 代码规范
- 使用ESLint进行代码检查
- 遵循React最佳实践
- 保持组件单一职责

### 2. 性能监控
- 使用React DevTools分析性能
- 监控API响应时间
- 优化渲染性能

### 3. 测试
- 编写单元测试
- 进行集成测试
- 使用E2E测试

## 联系方式
如有问题，请联系开发团队。
