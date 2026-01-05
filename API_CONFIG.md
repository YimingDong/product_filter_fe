# 后端接口配置说明

## 配置位置

### 1. 环境变量配置（推荐）
**文件位置**：项目根目录下的 `.env` 文件

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

这是最简单和推荐的方式。只需修改 `.env` 文件中的 `VITE_API_BASE_URL` 为你的后端API地址即可。

### 2. API配置文件
**文件位置**：`src/api/config.js`

```javascript
// 后端接口基础URL配置
// 在这里修改你的后端API地址
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
```

在这个文件中，你可以配置：
- `API_BASE_URL`：后端API的基础URL（优先使用环境变量）
- `timeout`：请求超时时间（默认10秒）
- 请求拦截器：添加认证信息等
- 响应拦截器：统一错误处理

### 3. API接口调用文件
**文件位置**：`src/api/productApi.js`

这个文件包含了所有与后端交互的接口方法。每个方法都预留了真实API调用的注释示例。

#### 示例：将模拟数据替换为真实API调用

**模拟数据代码（当前）**：
```javascript
export const getOptions = async () => {
  // 模拟延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockOptions;
};
```

**替换为真实API调用**：
```javascript
export const getOptions = async () => {
  const response = await apiClient.get('/options');
  return response.data;
};
```

## 接口列表

### 1. 获取单选选项
- **方法**：`getOptions()`
- **路径**：`/options`
- **方法类型**：GET
- **说明**：获取产品分类选项列表

### 2. 根据参数查询产品
- **方法**：`getProductsByParams(params)`
- **路径**：`/products/search`
- **方法类型**：POST
- **参数**：
  - `minPrice`：最低价格（可选）
  - `maxPrice`：最高价格（可选）
  - `category`：产品分类（可选）

### 3. 获取产品列表（管理员）
- **方法**：`getProductsList(params)`
- **路径**：`/products`
- **方法类型**：GET
- **参数**：
  - `page`：页码（默认1）
  - `pageSize`：每页数量（默认10）
  - `keyword`：搜索关键词（可选）
  - `category`：产品分类（可选）
- **返回**：
  - `data`：产品列表
  - `total`：总数量
  - `page`：当前页码
  - `pageSize`：每页数量

### 4. 添加产品（管理员）
- **方法**：`addProduct(product)`
- **路径**：`/products`
- **方法类型**：POST
- **参数**：产品对象

### 5. 更新产品（管理员）
- **方法**：`updateProduct(id, product)`
- **路径**：`/products/:id`
- **方法类型**：PUT
- **参数**：
  - `id`：产品ID
  - `product`：产品对象

### 6. 删除产品（管理员）
- **方法**：`deleteProduct(id)`
- **路径**：`/products/:id`
- **方法类型**：DELETE
- **参数**：产品ID

## 配置步骤

### 步骤1：修改环境变量
1. 打开项目根目录下的 `.env` 文件
2. 修改 `VITE_API_BASE_URL` 为你的后端API地址
3. 保存文件

### 步骤2：重启开发服务器
如果开发服务器正在运行，需要重启以使环境变量生效：
```bash
# 停止服务器（Ctrl+C）
# 重新启动
npm run dev
```

### 步骤3：替换API调用（可选）
如果后端接口已准备好，按照上述示例将 `src/api/productApi.js` 中的模拟数据代码替换为真实的API调用。

## 注意事项

1. **环境变量必须以 `VITE_` 开头**：Vite要求客户端可访问的环境变量必须以 `VITE_` 开头。

2. **修改环境变量后需要重启**：修改 `.env` 文件后，需要重启开发服务器才能生效。

3. **不要提交 `.env` 文件**：`.env` 文件已添加到 `.gitignore`，不会被提交到版本控制。

4. **生产环境配置**：在生产环境部署时，可以在服务器上设置环境变量或创建 `.env.production` 文件。

5. **API基础URL**：确保 `VITE_API_BASE_URL` 包含完整的API路径（包括 `/api` 后缀）。

## 示例配置

### 开发环境
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### 测试环境
```env
VITE_API_BASE_URL=http://test-api.your-domain.com/api
```

### 生产环境
```env
VITE_API_BASE_URL=https://api.your-domain.com/api
```

## 调试技巧

### 1. 查看API请求
打开浏览器开发者工具（F12），切换到 Network 标签页，可以查看所有的API请求详情。

### 2. 查看环境变量
在浏览器控制台输入：
```javascript
console.log(import.meta.env.VITE_API_BASE_URL);
```

### 3. 修改请求拦截器
在 `src/api/config.js` 的请求拦截器中，可以添加日志来调试请求：
```javascript
apiClient.interceptors.request.use(
  (config) => {
    console.log('API请求:', config);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```
