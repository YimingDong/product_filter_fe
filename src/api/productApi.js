import apiClient from './config';

// 模拟数据 - 实际开发时需要替换为真实的API调用

// 制冷剂选项
const mockRefrigerantOptions = [
  { id: 1, name: 'R404A' },
  {id: 2, name: 'R22'},
  {id: 3, name: 'R407C'},
  {id: 4, name: 'R410A'},
  {id: 5, name: 'R507C'},
  {id: 6, name: 'R23'}
];

// 制冷类型选项
const mockRefrigerantSupplyTypeOptions = [
  { id: 1, name: '泵供液' },
  { id: 2, name: '直膨' },
];

const mockProducts = [
  { 
    id: 1, 
    name: '产品1', 
    evaporating_temp: -15.5, 
    repo_temp: -18.0, 
    required_cooling_cap: 120.5, 
    refrigerant: 'R404A', 
    refrigerant_supply_type: '泵供液', 
    fan_distance: 2.5 
  },
  { 
    id: 2, 
    name: '产品2', 
    evaporating_temp: -10.0, 
    repo_temp: -12.0, 
    required_cooling_cap: 200.0, 
    refrigerant: 'R404A', 
    refrigerant_supply_type: '泵供液', 
    fan_distance: 3.0 
  },
  { 
    id: 3, 
    name: '产品3', 
    evaporating_temp: -20.0, 
    repo_temp: -22.0, 
    required_cooling_cap: 150.0, 
    refrigerant: 'R404A', 
    refrigerant_supply_type: '泵供液', 
    fan_distance: 2.8 
  },
  { 
    id: 4, 
    name: '产品4', 
    evaporating_temp: -5.0, 
    repo_temp: -8.0, 
    required_cooling_cap: 180.0, 
    refrigerant: 'R404A', 
    refrigerant_supply_type: '泵供液', 
    fan_distance: 3.2 
  },
  { 
    id: 5, 
    name: '产品5', 
    evaporating_temp: -25.0, 
    repo_temp: -28.0, 
    required_cooling_cap: 250.0, 
    refrigerant: 'R404A', 
    refrigerant_supply_type: '泵供液', 
    fan_distance: 4.0 
  },
  { 
    id: 6, 
    name: '产品6', 
    evaporating_temp: -12.0, 
    repo_temp: -15.0, 
    required_cooling_cap: 100.0, 
    refrigerant: 'R404A', 
    refrigerant_supply_type: '泵供液', 
    fan_distance: 2.0 
  },
  { 
    id: 7, 
    name: '产品7', 
    evaporating_temp: -8.0, 
    repo_temp: -10.0, 
    required_cooling_cap: 220.0, 
    refrigerant: 'R404A', 
    refrigerant_supply_type: '泵供液', 
    fan_distance: 3.5 
  },
  { 
    id: 8, 
    name: '产品8', 
    evaporating_temp: -18.0, 
    repo_temp: -20.0, 
    required_cooling_cap: 175.0, 
    refrigerant: 'R404A', 
    refrigerant_supply_type: '泵供液', 
    fan_distance: 2.6 
  },
];

/**
 * 获取制冷剂选项列表
 */
export const getRefrigerantOptions = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockRefrigerantOptions;
};

/**
 * 获取制冷类型选项列表
 */
export const getRefrigerantSupplyTypeOptions = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockRefrigerantSupplyTypeOptions;
};

/**
 * 根据表单参数获取产品列表
 * @param {Object} params - 表单参数
 * @param {number} params.evaporating_temp - 蒸发温度（可正负）
 * @param {number} params.repo_temp - 库温（可正负）
 * @param {number} params.required_cooling_cap - 需求冷量（可正负）
 * @param {string} params.refrigerant - 制冷剂
 * @param {string} params.refrigerant_supply_type - 制冷类型
 * @param {number} params.fan_distance - 风扇片距（不可为负）
 */
export const getProductsByParams = async (params) => {
  const response = await apiClient.post('/products/cooler/filter', params);
  return response;
};

/**
 * 获取产品列表（管理员页面）
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.keyword - 搜索关键词
 * 实际接口调用示例：
 * export const getProductsList = async (params) => {
 *   const response = await apiClient.get('/products', { params });
 *   return response.data;
 * };
 */
export const getProductsList = async (params) => {
  // 模拟延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filtered = [...mockProducts];
  
  // 关键词搜索
  if (params.keyword) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(params.keyword.toLowerCase())
    );
  }
  
  // 分页
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  
  return {
    data: filtered.slice(start, end),
    total: filtered.length,
    page,
    pageSize,
  };
};

/**
 * 添加产品（管理员页面）
 * 实际接口调用示例：
 * export const addProduct = async (product) => {
 *   const response = await apiClient.post('/products', product);
 *   return response.data;
 * };
 */
export const addProduct = async (product) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newProduct = { ...product, id: mockProducts.length + 1 };
  mockProducts.push(newProduct);
  return newProduct;
};

/**
 * 更新产品（管理员页面）
 * 实际接口调用示例：
 * export const updateProduct = async (id, product) => {
 *   const response = await apiClient.put(`/products/${id}`, product);
 *   return response.data;
 * };
 */
export const updateProduct = async (id, product) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockProducts.findIndex(p => p.id === id);
  if (index !== -1) {
    mockProducts[index] = { ...mockProducts[index], ...product };
    return mockProducts[index];
  }
  throw new Error('产品不存在');
};

/**
 * 删除产品（管理员页面）
 * 实际接口调用示例：
 * export const deleteProduct = async (id) => {
 *   const response = await apiClient.delete(`/products/${id}`);
 *   return response.data;
 * };
 */
export const deleteProduct = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockProducts.findIndex(p => p.id === id);
  if (index !== -1) {
    mockProducts.splice(index, 1);
    return { success: true };
  }
  throw new Error('产品不存在');
};
