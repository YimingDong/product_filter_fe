import { useState, useEffect, useRef } from 'react';
import { getRefrigerantOptions, getRefrigerantSupplyTypeOptions, getSeriesOptions, getFinSpacingOptions, getProductsByParams } from '../api/productApi';
import './UserFormPage.css';
import logoHorizontal from '../images/logo_horizontal.png';
// 字段显示名称映射配置
const FIELD_LABELS = {
  id: 'ID',
  name: '产品名称',
  model: '型号',
  series: '产品系列',
  evaporating_temp: '蒸发温度',
  repo_temp: '库温',
  required_cooling_cap: '需求冷量',
  refrigerant: '制冷剂',
  refrigerant_supply_type: '制冷类型',
  fan_distance: '风扇片距',
  heat_exchange_area: '换热面积',
  tube_volumn: '管容积',
  air_flow_rate: '空气流量率',
  total_fan_power: '总风机功率',
  total_fan_current: '总风机电流',
  air_flow: '空气流量',
  defrost_power: '除霜功率',
  pipe_dia: '管径',
  noise: '噪音',
  weight: '重量',
  fin_spacing: '片距',
  // comment: '备注',
  cooling_capacity: '制冷量',
  working_status: '工况',
  // is_deleted: '是否删除',
};

// 字段单位映射配置
const FIELD_UNITS = {
  evaporating_temp: '℃',
  repo_temp: '℃',
  required_cooling_cap: 'kW',
  fan_distance: 'm',
  heat_exchange_area: 'm²',
  tube_volumn: 'm³',
  air_flow_rate: 'm³/s',
  total_fan_power: 'kW',
  total_fan_current: 'A',
  air_flow: 'm³/h',
  defrost_power: 'kW',
  pipe_dia: 'mm',
  noise: 'dB',
  weight: 'kg',
  cooling_capacity: 'kW'
};

// 表单验证规则
const VALIDATION_RULES = {
  evaporating_temp: {
    required: true,
    type: 'number',
    min: -50,
    max: 10,
    message: '蒸发温度请输入-50~10之间的数值'
  },
  repo_temp: {
    required: true,
    type: 'number',
    min: -40,
    max: 30,
    message: '库温请输入-40~30之间的数值'
  },
  required_cooling_cap: {
    required: true,
    type: 'number',
    min: 0.1,
    message: '需求冷量请输入大于0的数值'
  },
};

function UserFormPage() {
  const [formData, setFormData] = useState({
    evaporating_temp: '',
    repo_temp: '',
    required_cooling_cap: '',
    refrigerant: '',
    refrigerant_supply_type: '',
    series: '',
    fan_distance: '',
  });

  const [refrigerantOptions, setRefrigerantOptions] = useState([]);
  const [refrigerantSupplyTypeOptions, setRefrigerantSupplyTypeOptions] = useState([]);
  const [seriesOptions, setSeriesOptions] = useState([]);
  const [finSpacingOptions, setFinSpacingOptions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // 页面加载时获取选项数据
  useEffect(() => {
    loadOptions();
  }, []);

  // 加载下拉选项
  const loadOptions = async () => {
    try {
      setLoading(true);
      const [refrigerantData, refrigerantSupplyTypeData, seriesData, finSpacingData] = await Promise.all([
        getRefrigerantOptions(),
        getRefrigerantSupplyTypeOptions(),
        getSeriesOptions(),
        getFinSpacingOptions(),
      ]);
      setRefrigerantOptions(Array.isArray(refrigerantData) ? refrigerantData : []);
      setRefrigerantSupplyTypeOptions(Array.isArray(refrigerantSupplyTypeData) ? refrigerantSupplyTypeData : []);
      setSeriesOptions(Array.isArray(seriesData) ? seriesData : []);
      setFinSpacingOptions(Array.isArray(finSpacingData) ? finSpacingData : []);
    } catch (err) {
      setError('加载选项失败，请稍后重试');
      console.error('加载选项失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 表单输入变更
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // 清除该字段的错误提示
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
    setFormData(prev => ({
      ...prev,
      [name]: value.trim() === '' ? '' : value
    }));
  };

  // 表单验证逻辑
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // 遍历验证规则
    Object.entries(VALIDATION_RULES).forEach(([field, rule]) => {
      const value = formData[field];
      
      // 必填项验证
      if (rule.required && value === '') {
        errors[field] = `${FIELD_LABELS[field]}为必填项`;
        isValid = false;
        return;
      }

      if (value === '') return; // 非必填项为空时跳过

      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        errors[field] = `${FIELD_LABELS[field]}请输入有效的数字`;
        isValid = false;
      } else if (rule.min !== undefined && numValue < rule.min) {
        errors[field] = rule.message;
        isValid = false;
      } else if (rule.max !== undefined && numValue > rule.max) {
        errors[field] = rule.message;
        isValid = false;
      }
    });

    setFieldErrors(errors);
    return isValid;
  };

  // 提交处理
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitted(false);
    console.log(182)
    // 表单验证
    if (!validateForm()) {
      console.log("fail")
      return;
    }

    try {
      setLoading(true);
      // 处理选填字段：将空字符串转换为 null
      const submitData = {
        ...formData,
        // 选填字段为空时传 null
        refrigerant: formData.refrigerant === '' ? null : formData.refrigerant,
        refrigerant_supply_type: formData.refrigerant_supply_type === '' ? null : formData.refrigerant_supply_type,
        series: formData.series === '' ? null : formData.series,
        fan_distance: formData.fan_distance === '' ? null : formData.fan_distance,
      };
      const result = await getProductsByParams(submitData);
      
      // 统一处理API返回数据格式
      let productsData = [];
      if (result) {
        if (Array.isArray(result)) {
          productsData = result;
        } else if (result.items && Array.isArray(result.items)) {
          productsData = result.items;
        } else if (result.data) {
          productsData = Array.isArray(result.data) ? result.data : 
                        (result.data.items && Array.isArray(result.data.items)) ? result.data.items : 
                        [result.data].filter(Boolean);
        } else if (result.list && Array.isArray(result.list)) {
          productsData = result.list;
        }
      }
      
      // 过滤无效数据
      productsData = productsData.filter(item => item && (item.id || item.name));
      setProducts(productsData);
      setSubmitted(true);
    } catch (err) {
      console.error('获取产品列表失败:', err.response.data.message);
      setError(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  // 重置表单
  const handleReset = () => {
    setFormData({
      evaporating_temp: '',
      repo_temp: '',
      required_cooling_cap: '',
      refrigerant: '',
      refrigerant_supply_type: '',
      series: '',
      fan_distance: '',
    });
    setProducts([]);
    setSubmitted(false);
    setError(null);
    setFieldErrors({});
  };

  // 生成并下载产品卡片的 PDF
  const handleDownloadPdf = async (product) => {
    try {
      setLoading(true);
      console.log('开始生成 PDF，产品 ID:', product.id);
      
      // 创建一个临时的 div 元素用于生成 PDF
      const element = document.createElement('div');
      element.style.padding = '20px';
      element.style.backgroundColor = 'white';
      element.style.fontFamily = 'Arial, sans-serif';
      
      // 构建 HTML 内容
      const htmlContent = `
        <div style="margin-bottom: 20px;">
          <img src="${logoHorizontal}" alt="哲雪集团" style="height: 40px; object-fit: contain; display: block; margin-bottom: 15px;" />
          <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 10px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
            ${product.model || '产品详情'}
          </h1>
        </div>
        <div style="margin-top: 20px;">
          <h2 style="color: #3b82f6; font-size: 18px; margin-bottom: 15px;">制冷量：<span style="color: #1e40af; font-weight: bold;">${typeof product.cooling_capacity === 'number' ? product.cooling_capacity.toFixed(1) : product.cooling_capacity} kW</span></h2>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          ${Object.keys(product).map(key => {
            if (['id', 'name', 'is_deleted', 'comment', 'cooling_capacity', 'pdf_path'].includes(key)) return '';
            const label = FIELD_LABELS[key] || key;
            const value = product[key];
            const displayValue = value === null || value === undefined ? '未填写' : (typeof value === 'number' ? value.toFixed(1) : String(value));
            const unit = FIELD_UNITS[key] || '';
            return `
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 10px; font-weight: 600; color: #374151; width: 40%;">${label}</td>
                <td style="padding: 10px; color: #6b7280;">${displayValue}${unit}</td>
              </tr>
            `;
          }).join('')}
        </table>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; text-align: center;">
          <p>© 2025 制冷参数查询系统 | 高端制冷解决方案</p>
        </div>
      `;
      
      element.innerHTML = htmlContent;
      document.body.appendChild(element);
      
      // PDF 配置选项
      const opt = {
        margin: 10,
        filename: `${product.model || 'product'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      // 生成并下载 PDF
      await html2pdf().set(opt).from(element).save();
      
      // 清理临时元素
      document.body.removeChild(element);
      
      console.log('PDF 生成并下载成功');
    } catch (err) {
      console.error('生成 PDF 失败:', err);
      setError('生成 PDF 文件失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-inter bg-neutral-100 min-h-screen flex flex-col">
      {/* 页面头部 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="fa fa-snowflake-o text-primary text-2xl"></i>
            <h1 className="text-[clamp(1.25rem,2vw,1.75rem)] font-bold text-neutral-700">冷风机参数查询</h1>
          </div>
          <div className="text-neutral-400 text-sm hidden sm:block">
            <span className="flex items-center gap-1">
              <i className="fa fa-info-circle"></i>
              <span>精准查询 · 高效便捷</span>
            </span>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* 查询卡片 */}
        <div className="bg-white rounded-xl shadow-card card-transition scale-hover mb-8 p-6 md:p-8 max-w-3xl mx-auto">
          <h2 className="text-[clamp(1.1rem,1.8vw,1.5rem)] font-semibold text-neutral-700 mb-6 flex items-center">
            <i className="fa fa-search text-primary mr-2"></i>
            参数查询条件
          </h2>
          
          {/* 表单 */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 蒸发温度（必填） */}
            <div className="space-y-2">
              <label className="block text-neutral-600 font-medium">
                {FIELD_LABELS.evaporating_temp} 
                <span className="text-red-500">*</span>
                <span className="text-xs text-neutral-400 ml-1">（{FIELD_UNITS.evaporating_temp}）</span>
              </label>
              <input 
                type="number" 
                name="evaporating_temp"
                value={formData.evaporating_temp}
                onChange={handleInputChange}
                step="0.1"
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 placeholder:text-neutral-300"
                placeholder={`请输入${FIELD_LABELS.evaporating_temp}`}
                disabled={loading}
              />
              {fieldErrors.evaporating_temp && (
                <p className="text-red-500 text-xs h-5">{fieldErrors.evaporating_temp}</p>
              )}
            </div>

            {/* 库温（必填） */}
            <div className="space-y-2">
              <label className="block text-neutral-600 font-medium">
                {FIELD_LABELS.repo_temp} 
                <span className="text-red-500">*</span>
                <span className="text-xs text-neutral-400 ml-1">（{FIELD_UNITS.repo_temp}）</span>
              </label>
              <input 
                type="number" 
                name="repo_temp"
                value={formData.repo_temp}
                onChange={handleInputChange}
                step="0.1"
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 placeholder:text-neutral-300"
                placeholder={`请输入${FIELD_LABELS.repo_temp}`}
                disabled={loading}
              />
              {fieldErrors.repo_temp && (
                <p className="text-red-500 text-xs h-5">{fieldErrors.repo_temp}</p>
              )}
            </div>

            {/* 需求冷量（必填） */}
            <div className="space-y-2">
              <label className="block text-neutral-600 font-medium">
                {FIELD_LABELS.required_cooling_cap} 
                <span className="text-red-500">*</span>
                <span className="text-xs text-neutral-400 ml-1">（{FIELD_UNITS.required_cooling_cap}）</span>
              </label>
              <input 
                type="number" 
                name="required_cooling_cap"
                value={formData.required_cooling_cap}
                onChange={handleInputChange}
                step="0.1"
                min="0.1"
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 placeholder:text-neutral-300"
                placeholder={`请输入${FIELD_LABELS.required_cooling_cap}`}
                disabled={loading}
              />
              {fieldErrors.required_cooling_cap && (
                <p className="text-red-500 text-xs h-5">{fieldErrors.required_cooling_cap}</p>
              )}
            </div>

            {/* 更多筛选条件（可展开区域） */}
            {showMoreFilters && (
              <>
                {/* 制冷剂（选填） */}
                <div className="space-y-2">
                  <label className="block text-neutral-600 font-medium">
                    {FIELD_LABELS.refrigerant}
                    <span className="text-xs text-neutral-400 ml-1">（选填）</span>
                  </label>
                  <select 
                    name="refrigerant"
                    value={formData.refrigerant}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-neutral-600 bg-white"
                    disabled={loading}
                  >
                    <option value="">无特定制冷剂</option>
                    {refrigerantOptions.map((option) => (
                      <option key={option.id || option.name} value={option.name}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 制冷类型（选填） */}
                <div className="space-y-2">
                  <label className="block text-neutral-600 font-medium">
                    {FIELD_LABELS.refrigerant_supply_type}
                    <span className="text-xs text-neutral-400 ml-1">（选填）</span>
                  </label>
                  <select 
                    name="refrigerant_supply_type"
                    value={formData.refrigerant_supply_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-neutral-600 bg-white"
                    disabled={loading}
                    placeholder="请选择制冷类型"
                  >
                    <option value="">无特定制冷类型</option>
                    {refrigerantSupplyTypeOptions.map((option) => (
                      <option key={option.id || option.name} value={option.name}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 产品系列（选填） */}
                <div className="space-y-2">
                  <label className="block text-neutral-600 font-medium">
                    {FIELD_LABELS.series}
                    <span className="text-xs text-neutral-400 ml-1">（选填）</span>
                  </label>
                  <select 
                    name="series"
                    value={formData.series}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-neutral-600 bg-white"
                    disabled={loading}
                  >
                    <option value="">无特定产品系列</option>
                    {seriesOptions.map((option) => (
                      <option key={option.id || option.name} value={option.name}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 风扇片距（选填） */}
                <div className="space-y-2">
                  <label className="block text-neutral-600 font-medium">
                    {FIELD_LABELS.fan_distance}
                    <span className="text-xs text-neutral-400 ml-1">（{FIELD_UNITS.fan_distance}，选填）</span>
                  </label>
                  <select 
                    name="fan_distance"
                    value={formData.fan_distance}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 text-neutral-600 bg-white"
                    disabled={loading}
                  >
                    <option value="">无特定片距</option>
                    {finSpacingOptions.map((option) => (
                      <option key={option.id || option.name} value={option.name}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* 查看更多/收起筛选条件按钮 */}
            <div className="md:col-span-2 lg:col-span-3 flex justify-center">
              <button
                type="button"
                onClick={() => setShowMoreFilters(!showMoreFilters)}
                className="flex items-center gap-2 text-primary hover:text-secondary font-medium transition-colors duration-300"
              >
                <span>{showMoreFilters ? '收起筛选条件' : '查看更多筛选条件'}</span>
                <i className={`fa fa-chevron-${showMoreFilters ? 'up' : 'down'} transition-transform duration-300`}></i>
              </button>
            </div>

            {/* 提交按钮 */}
            <div className="md:col-span-2 lg:col-span-3 flex justify-center pt-4 gap-4">
              <button 
                type="submit" 
                disabled={loading}
                className="px-8 py-3 bg-primary hover:bg-secondary text-white rounded-lg font-medium transition-all duration-300 ease-in-out shadow-lg hover:shadow-hover flex items-center gap-2 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <i className="fa fa-search"></i>
                <span>{loading ? '查询中...' : '查询参数'}</span>
                {loading && <span className="fa fa-spinner fa-spin"></span>}
              </button>
              <button 
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="px-8 py-3 bg-white hover:bg-neutral-50 text-primary border border-primary rounded-lg font-medium transition-all duration-300 ease-in-out hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <i className="fa fa-refresh"></i>
                <span>重置</span>
              </button>
            </div>
          </form>

          {/* 全局错误提示 */}
          {error && (
            <div className="mt-4 p-3 bg-white/90 border border-red-200 rounded-lg text-red-500 text-center">
              <i className="fa fa-exclamation-circle mr-2"></i>
              {error}
            </div>
          )}
        </div>

        {/* 结果展示区域 */}
        {submitted && !loading && (
          <div className="bg-white rounded-xl shadow-card transition-all duration-500 ease-in-out hover:scale-[1.01] p-6 md:p-8 max-w-5xl mx-auto">
            <h2 className="text-[clamp(1.1rem,1.8vw,1.5rem)] font-semibold text-neutral-700 mb-6 flex items-center">
              <i className="fa fa-table text-primary mr-2"></i>
              查询结果 ({products.length} 条)
            </h2>
            
            {products.length === 0 ? (
              <div className="py-12 text-center text-neutral-400">
                <i className="fa fa-inbox text-4xl mb-3"></i>
                <p>没有找到符合条件的产品</p>
                <p className="text-sm mt-2 text-neutral-300">建议调整查询条件后重试</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, index) => (
                  <div 
                    key={product.id || `product-${index}`} 
                    className="border border-neutral-200 rounded-lg p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white"
                  >
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100">
                      <h3 className="text-lg font-semibold text-neutral-800">
                        {product.model || `未命名产品 ${index + 1}`}
                      </h3>
                      <button
                        onClick={() => handleDownloadPdf(product)}
                        className="flex items-center gap-1 text-primary hover:text-secondary text-sm font-medium transition-colors duration-300"
                        title="下载产品 PDF"
                      >
                        <i className="fa fa-download"></i>
                        <span>下载 PDF</span>
                      </button>
                    </div>
                    {/* 产品字段列表 */}
                    <div className="space-y-2 text-sm text-neutral-600">
                      {/* 首先显示制冷量 */}
                      {product.cooling_capacity !== undefined && (
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-neutral-700 font-bold whitespace-nowrap pr-2">
                            {FIELD_LABELS.cooling_capacity || '制冷量'}：
                          </span>
                          <span 
                            className="font-bold flex-1 text-right break-words"
                            style={{ color: 'rgb(128, 187, 255)' }}
                          >
                            {typeof product.cooling_capacity === 'number' 
                              ? product.cooling_capacity.toFixed(1) 
                              : String(product.cooling_capacity)}
                            {FIELD_UNITS.cooling_capacity || ''}
                          </span>
                        </div>
                      )}
                      
                      {/* 显示其他字段 */}
                      {Object.keys(product).map((key) => {
                        // 跳过id、name、is_deleted、comment字段，以及已单独显示的cooling_capacity
                        if (key === 'id' || key === 'name' || key === 'is_deleted' || key === 'comment' || key === 'cooling_capacity') return null;
                        
                        const value = product[key];
                        const label = FIELD_LABELS[key] || key;
                        const unit = FIELD_UNITS[key] || '';

                        // 备注信息（用于提示）
                        const hasComment = Boolean(product.comment);
                        const shouldShowCommentIcon =
                          hasComment && (key === 'total_fan_power' || key === 'total_fan_current');
                        const tooltipText = shouldShowCommentIcon ? String(product.comment) : '';
                        
                        // 空值处理
                        const displayValue = value === null || value === undefined 
                          ? '未填写' 
                          : (typeof value === 'number' ? value.toFixed(1) : String(value));
                        
                        return (
                          // 每一行使用左右布局：
                          // 左侧 key 不换行，右侧 value 允许换行并右对齐
                          <div 
                            key={`${product.id || index}-${key}`} 
                            className="flex justify-between items-start gap-2"
                          >
                            {/* 左侧字段名称：不换行 */}
                            <span className="text-neutral-700 font-medium whitespace-nowrap pr-2">
                              {label}
                              {shouldShowCommentIcon && (
                                <span
                                  className="inline-flex items-center justify-center ml-1 text-[10px] text-neutral-400 rounded-full w-3 h-3 cursor-help bg-neutral-200"
                                  title={tooltipText}
                                >
                                  !
                                </span>
                              )}
                              ：
                            </span>
                            {/* 右侧字段值：占满剩余空间，右对齐且可换行 */}
                            <span className="text-neutral-500 flex-1 text-right break-words">
                              {displayValue}{unit}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className="bg-neutral-700 text-neutral-300 py-6 mt-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p className="flex items-center justify-center gap-2">
            <span>© 2025 制冷参数查询系统 | 高端制冷解决方案</span>
            <img 
              src={logoHorizontal} 
              alt="哲雪集团" 
              className="h-6 object-contain"
            />
          </p>
        </div>
      </footer>
    </div>
  );
}

export default UserFormPage;