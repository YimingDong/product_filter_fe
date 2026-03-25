import { useState, useEffect } from 'react';
import { getRefrigerantOptions, getRefrigerantSupplyTypeOptions, getSeriesOptions, getProductsByParams, getProductPdfBlob } from '../api/productApi';
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
  fan_distance: {
    type: 'number',
    min: 0,
    message: '风扇片距不能为负数'
  }
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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');

  // 页面加载时获取选项数据
  useEffect(() => {
    loadOptions();
  }, []);

  // 加载下拉选项
  const loadOptions = async () => {
    try {
      setLoading(true);
      const [refrigerantData, refrigerantSupplyTypeData, seriesData] = await Promise.all([
        getRefrigerantOptions(),
        getRefrigerantSupplyTypeOptions(),
        getSeriesOptions(),
      ]);
      setRefrigerantOptions(Array.isArray(refrigerantData) ? refrigerantData : []);
      setRefrigerantSupplyTypeOptions(Array.isArray(refrigerantSupplyTypeData) ? refrigerantSupplyTypeData : []);
      setSeriesOptions(Array.isArray(seriesData) ? seriesData : []);
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

    // 表单验证
    if (!validateForm()) {
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

  // 打开 PDF 查看
  const handleViewPdf = async (product) => {
    try {
      setLoading(true);
      console.log('开始获取 PDF，产品 ID:', product.id);
      
      // 调用真实 API 获取 PDF 字节流
      const pdfBlob = await getProductPdfBlob(product.id);
      console.log('PDF Blob 获取成功:', pdfBlob);
      console.log('Blob 类型:', pdfBlob.type);
      console.log('Blob 大小:', pdfBlob.size, 'bytes');
      
      // API 返回的已经是 Blob，直接使用
      const pdfObjectUrl = URL.createObjectURL(pdfBlob);
      console.log('创建的 PDF URL:', pdfObjectUrl);
      
      setPdfUrl(pdfObjectUrl);
      setSelectedProduct(product);
      setShowPdfModal(true);
    } catch (err) {
      console.error('获取 PDF 链接失败:', err);
      setError('获取 PDF 文件失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 关闭 PDF 弹窗
  const handleClosePdfModal = () => {
    setShowPdfModal(false);
    setSelectedProduct(null);
    // 释放 Blob URL 以节省内存
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl('');
  };

  // 下载 PDF 文件
  const handleDownloadPdf = () => {
    if (pdfUrl) {
      // 创建临时链接触发下载
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = selectedProduct?.model ? `${selectedProduct.model}.pdf` : 'product.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
                  <input 
                    type="number" 
                    name="fan_distance"
                    value={formData.fan_distance}
                    onChange={handleInputChange}
                    step="0.1"
                    min="0"
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 placeholder:text-neutral-300"
                    placeholder={`请输入${FIELD_LABELS.fan_distance}`}
                    disabled={loading}
                  />
                  {fieldErrors.fan_distance && (
                    <p className="text-red-500 text-xs h-5">{fieldErrors.fan_distance}</p>
                  )}
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
                        onClick={() => handleViewPdf(product)}
                        className="flex items-center gap-1 text-primary hover:text-secondary text-sm font-medium transition-colors duration-300"
                        title="查看产品 PDF"
                      >
                        <i className="fa fa-file-pdf-o"></i>
                        <span>查看 PDF</span>
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

      {/* PDF 查看弹窗 */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 遮罩层 */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClosePdfModal}
          ></div>
          
          {/* 弹窗内容 */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] mx-4 flex flex-col">
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-800">
                {selectedProduct?.model || '产品详情'} - PDF 预览
              </h3>
              <button
                onClick={handleClosePdfModal}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <i className="fa fa-times text-xl"></i>
              </button>
            </div>
            
            {/* PDF 预览区域 */}
            <div className="flex-1 overflow-hidden bg-neutral-100 p-4">
              {pdfUrl ? (
                <div className="w-full h-full bg-white rounded-lg shadow-inner overflow-auto">
                  {/* 使用 embed 标签预览 PDF，兼容性更好 */}
                  <embed
                    src={pdfUrl}
                    type="application/pdf"
                    className="w-full h-full"
                    style={{ minHeight: '100%', minWidth: '100%' }}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <i className="fa fa-spinner fa-spin text-4xl text-primary mb-4"></i>
                    <p className="text-neutral-600">正在加载 PDF...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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