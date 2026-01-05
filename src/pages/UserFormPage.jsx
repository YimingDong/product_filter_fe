import { useState, useEffect } from 'react';
import { getRefrigerantOptions, getRefrigerantSupplyTypeOptions, getProductsByParams } from '../api/productApi';

// 字段显示名称映射配置
// 如果需要修改显示名称，请在此处修改对应的值
const FIELD_LABELS = {
  id: 'ID',
  name: '产品名称',
  model: '型号',
  series: '系列',
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
  comment: '备注',
  is_deleted: '是否删除',
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
  fin_spacing: 'mm',
};

function UserFormPage() {
  const [formData, setFormData] = useState({
    evaporating_temp: '',
    repo_temp: '',
    required_cooling_cap: '',
    refrigerant: '',
    refrigerant_supply_type: '',
    fan_distance: '',
  });

  const [refrigerantOptions, setRefrigerantOptions] = useState([]);
  const [refrigerantSupplyTypeOptions, setRefrigerantSupplyTypeOptions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 监听屏幕大小变化
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // 页面加载时获取选项数据
  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      setLoading(true);
      const [refrigerantData, refrigerantSupplyTypeData] = await Promise.all([
        getRefrigerantOptions(),
        getRefrigerantSupplyTypeOptions(),
      ]);
      setRefrigerantOptions(refrigerantData);
      setRefrigerantSupplyTypeOptions(refrigerantSupplyTypeData);
    } catch (err) {
      setError('加载选项失败，请稍后重试');
      console.error('加载选项失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitted(false);

    // 验证风扇片距不能为负数
    if (formData.fan_distance !== '' && parseFloat(formData.fan_distance) < 0) {
      setError('风扇片距不能为负数');
      return;
    }

    try {
      setLoading(true);
      const result = await getProductsByParams(formData);
      console.log('API返回数据:', result);
      
      // 处理API返回的数据
      let productsData = [];
      if (Array.isArray(result)) {
        productsData = result;
      } else if (result && result.items && Array.isArray(result.items)) {
        productsData = result.items;
      } else if (result && result.data) {
        if (Array.isArray(result.data)) {
          productsData = result.data;
        } else if (result.data.items && Array.isArray(result.data.items)) {
          productsData = result.data.items;
        } else {
          productsData = [result.data];
        }
      } else if (result && Array.isArray(result.list)) {
        productsData = result.list;
      }
      
      console.log('处理后的产品数据:', productsData);
      setProducts(productsData);
      setSubmitted(true);
    } catch (err) {
      console.error('获取产品列表失败:', err);
      setError('获取产品列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit();
  };

  const handleReset = () => {
    setFormData({
      evaporating_temp: '',
      repo_temp: '',
      required_cooling_cap: '',
      refrigerant: '',
      refrigerant_supply_type: '',
      fan_distance: '',
    });
    setProducts([]);
    setSubmitted(false);
    setError(null);
  };

  return (
    <div style={styles.container} className="user-form-container">
      <div style={styles.header} className="user-form-header">
        <h1 style={styles.headerTitle}>产品查询</h1>
        <p style={styles.headerDesc}>填写下方表单查询符合条件的产品</p>
      </div>

      <div style={styles.formContainer} className="user-form-container">
        <form onSubmit={handleFormSubmit} style={styles.form} className="user-form">
          <div style={styles.formGroup} className="user-form-group">
            <label htmlFor="evaporating_temp" style={styles.label} className="user-label">
              蒸发温度 (℃)
            </label>
            <input
              type="number"
              id="evaporating_temp"
              name="evaporating_temp"
              value={formData.evaporating_temp}
              onChange={handleInputChange}
              step="0.1"
              placeholder="请输入蒸发温度"
              style={styles.input}
              className="responsive-input"
            />
          </div>

          <div style={styles.formGroup} className="user-form-group">
            <label htmlFor="repo_temp" style={styles.label} className="user-label">
              库温 (℃)
            </label>
            <input
              type="number"
              id="repo_temp"
              name="repo_temp"
              value={formData.repo_temp}
              onChange={handleInputChange}
              step="0.1"
              placeholder="请输入库温"
              style={styles.input}
              className="responsive-input"
            />
          </div>

          <div style={styles.formGroup} className="user-form-group">
            <label htmlFor="required_cooling_cap" style={styles.label} className="user-label">
              需求冷量 (kW)
            </label>
            <input
              type="number"
              id="required_cooling_cap"
              name="required_cooling_cap"
              value={formData.required_cooling_cap}
              onChange={handleInputChange}
              step="0.1"
              placeholder="请输入需求冷量"
              style={styles.input}
              className="responsive-input"
            />
          </div>

          <div style={styles.formGroup} className="user-form-group">
            <label htmlFor="refrigerant" style={styles.label} className="user-label">
              制冷剂
            </label>
            <select
              id="refrigerant"
              name="refrigerant"
              value={formData.refrigerant}
              onChange={handleInputChange}
              style={styles.select}
              className="responsive-select"
            >
              <option value="">请选择制冷剂</option>
              {refrigerantOptions.map((option) => (
                <option key={option.id} value={option.name}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup} className="user-form-group">
            <label htmlFor="refrigerant_supply_type" style={styles.label} className="user-label">
              制冷类型
            </label>
            <select
              id="refrigerant_supply_type"
              name="refrigerant_supply_type"
              value={formData.refrigerant_supply_type}
              onChange={handleInputChange}
              style={styles.select}
              className="responsive-select"
            >
              <option value="">请选择制冷类型</option>
              {refrigerantSupplyTypeOptions.map((option) => (
                <option key={option.id} value={option.name}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup} className="user-form-group">
            <label htmlFor="fan_distance" style={styles.label} className="user-label">
              风扇片距 (m)
            </label>
            <input
              type="number"
              id="fan_distance"
              name="fan_distance"
              value={formData.fan_distance}
              onChange={handleInputChange}
              step="0.1"
              min="0"
              placeholder="请输入风扇片距"
              style={styles.input}
              className="responsive-input"
            />
          </div>

          <div style={styles.buttonGroup} className="button-group">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                ...styles.button,
                ...styles.primaryButton,
                ...(loading ? styles.buttonDisabled : {}),
              }}
              className="responsive-button"
            >
              {loading ? '查询中...' : '查询'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              style={{
                ...styles.button,
                ...styles.secondaryButton,
                ...(loading ? styles.buttonDisabled : {}),
              }}
              className="responsive-button"
            >
              重置
            </button>
          </div>
        </form>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {submitted && !loading && (
          <div style={styles.resultContainer} className="user-result-container">
            <h3 style={styles.resultTitle} className="user-result-title">
              查询结果 ({products.length} 条)
            </h3>
            {products.length === 0 ? (
              <div style={styles.empty}>没有找到符合条件的产品</div>
            ) : (
              <div style={styles.productList} className="product-grid">
                {products.map((product, index) => (
                  <div key={product.id || index} style={styles.productCard} className="user-product-card">
                    <div style={styles.productName} className="user-product-name">{product.name || `产品 ${product.id || index}`}</div>
                    <div style={styles.productInfo} className="user-product-info">
                      {Object.keys(product).map((key) => {
                        // 跳过id和name字段，只显示参数字段
                        if (key === 'id' || key === 'name') return null;
                        
                        const value = product[key];
                        const label = FIELD_LABELS[key] || key;
                        const unit = FIELD_UNITS[key] || '';
                        
                        // 将所有值转换为字符串
                        const displayValue = value === null || value === undefined ? '' : String(value);
                        
                        return (
                          <span key={`${product.id || index}-${key}`}>
                            {label}: {displayValue}{unit}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  headerTitle: {
    fontSize: '32px',
  },
  headerDesc: {
    fontSize: '16px',
    color: '#666',
  },
  formContainer: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  form: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: '#333',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '30px',
  },
  button: {
    flex: 1,
    padding: '12px 24px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  primaryButton: {
    backgroundColor: '#1890ff',
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    color: '#1890ff',
    border: '1px solid #1890ff',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  error: {
    marginTop: '20px',
    padding: '12px',
    backgroundColor: '#fff2f0',
    border: '1px solid #ffccc7',
    borderRadius: '4px',
    color: '#ff4d4f',
    textAlign: 'center',
  },
  resultContainer: {
    marginTop: '30px',
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  resultTitle: {
    marginBottom: '20px',
    color: '#333',
    fontSize: '20px',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    padding: '40px 0',
  },
  productList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  productCard: {
    border: '1px solid #e8e8e8',
    borderRadius: '4px',
    padding: '16px',
    transition: 'all 0.3s',
  },
  productName: {
    fontSize: '16px',
    fontWeight: '500',
    marginBottom: '12px',
    color: '#333',
  },
  productInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '13px',
    color: '#666',
  },
};

export default UserFormPage;
