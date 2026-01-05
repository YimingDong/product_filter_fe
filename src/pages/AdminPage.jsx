import { useState, useEffect } from 'react';
import { getProductsList, deleteProduct } from '../api/productApi';

function AdminPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // 筛选条件
  const [filters, setFilters] = useState({
    keyword: '',
  });

  // 分页状态
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });

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

  // 页面加载时获取产品列表
  useEffect(() => {
    loadProducts();
  }, [pagination.page, pagination.pageSize]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getProductsList({
        page: pagination.page,
        pageSize: pagination.pageSize,
        keyword: filters.keyword,
      });
      setProducts(result.data);
      setPagination(prev => ({
        ...prev,
        total: result.total,
      }));
    } catch (err) {
      setError('加载产品列表失败，请稍后重试');
      console.error('加载产品列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleSearch = () => {
    setPagination(prev => ({
      ...prev,
      page: 1,
    }));
    loadProducts();
  };

  const handleReset = () => {
    setFilters({
      keyword: '',
    });
    setPagination(prev => ({
      ...prev,
      page: 1,
    }));
    loadProducts();
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个产品吗？')) {
      return;
    }

    try {
      await deleteProduct(id);
      loadProducts();
    } catch (err) {
      setError('删除产品失败');
      console.error('删除产品失败:', err);
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  return (
    <div style={styles.container} className="admin-container">
      <div style={styles.header} className="admin-header">
        <h1 style={styles.headerTitle}>产品管理</h1>
        <p style={styles.headerDesc}>查看和管理产品数据</p>
      </div>

      <div style={styles.content} className="admin-content">
        {/* 筛选区域 */}
        <div style={styles.filterSection} className="filter-section">
          <div style={styles.filterRow} className="filter-row">
            <div style={styles.filterGroup} className="filter-group">
              <label htmlFor="keyword" style={styles.label} className="admin-label">
                搜索关键词
              </label>
              <input
                type="text"
                id="keyword"
                name="keyword"
                value={filters.keyword}
                onChange={handleFilterChange}
                placeholder="请输入产品名称"
                style={styles.input}
                className="responsive-input"
              />
            </div>
          </div>

          <div style={styles.filterButtons} className="filter-buttons">
            <button
              onClick={handleSearch}
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
        </div>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {/* 桌面端表格 */}
        <div style={styles.tableContainer} className="table-container">
          <table style={styles.table} className="desktop-table">
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.tableHeaderCell}>ID</th>
                <th style={styles.tableHeaderCell}>产品名称</th>
                <th style={styles.tableHeaderCell}>蒸发温度</th>
                <th style={styles.tableHeaderCell}>库温</th>
                <th style={styles.tableHeaderCell}>需求冷量</th>
                <th style={styles.tableHeaderCell}>制冷剂</th>
                <th style={styles.tableHeaderCell}>制冷类型</th>
                <th style={styles.tableHeaderCell}>风扇片距</th>
                <th style={styles.tableHeaderCell}>操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} style={styles.tableRow}>
                  <td style={styles.tableCell}>{product.id}</td>
                  <td style={styles.tableCell}>{product.name}</td>
                  <td style={styles.tableCell}>{product.evaporating_temp}℃</td>
                  <td style={styles.tableCell}>{product.repo_temp}℃</td>
                  <td style={styles.tableCell}>{product.required_cooling_cap}kW</td>
                  <td style={styles.tableCell}>{product.refrigerant}</td>
                  <td style={styles.tableCell}>{product.refrigerant_supply_type}</td>
                  <td style={styles.tableCell}>{product.fan_distance}m</td>
                  <td style={styles.tableCell}>
                    <button
                      onClick={() => handleDelete(product.id)}
                      style={{
                        ...styles.actionButton,
                        ...styles.deleteButton,
                      }}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 移动端卡片布局 */}
          <div style={styles.cardList} className="mobile-card-list">
            {products.map((product) => (
              <div key={product.id} style={styles.card} className="admin-card">
                <div style={styles.cardHeader} className="card-header">
                  <div style={styles.cardTitle}>{product.name}</div>
                  <div style={styles.cardId}>ID: {product.id}</div>
                </div>
                <div style={styles.cardRow}>
                  <span style={styles.cardLabel}>蒸发温度:</span>
                  <span style={styles.cardValue}>{product.evaporating_temp}℃</span>
                </div>
                <div style={styles.cardRow}>
                  <span style={styles.cardLabel}>库温:</span>
                  <span style={styles.cardValue}>{product.repo_temp}℃</span>
                </div>
                <div style={styles.cardRow}>
                  <span style={styles.cardLabel}>需求冷量:</span>
                  <span style={styles.cardValue}>{product.required_cooling_cap}kW</span>
                </div>
                <div style={styles.cardRow}>
                  <span style={styles.cardLabel}>制冷剂:</span>
                  <span style={styles.cardValue}>{product.refrigerant}</span>
                </div>
                <div style={styles.cardRow}>
                  <span style={styles.cardLabel}>制冷类型:</span>
                  <span style={styles.cardValue}>{product.refrigerant_supply_type}</span>
                </div>
                <div style={styles.cardRow}>
                  <span style={styles.cardLabel}>风扇片距:</span>
                  <span style={styles.cardValue}>{product.fan_distance}m</span>
                </div>
                <div style={styles.cardActions} className="card-actions">
                  <button
                    onClick={() => handleDelete(product.id)}
                    style={{
                      ...styles.actionButton,
                      ...styles.deleteButton,
                    }}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && !loading && (
            <div style={styles.empty}>暂无数据</div>
          )}
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div style={styles.pagination} className="pagination">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1 || loading}
              style={{
                ...styles.pageButton,
                ...(pagination.page === 1 || loading ? styles.pageButtonDisabled : {}),
              }}
              className="page-button"
            >
              上一页
            </button>
            <span style={styles.pageInfo} className="page-info">
              第 {pagination.page} / {totalPages} 页，共 {pagination.total} 条
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === totalPages || loading}
              style={{
                ...styles.pageButton,
                ...(pagination.page === totalPages || loading ? styles.pageButtonDisabled : {}),
              }}
              className="page-button"
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1400px',
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
  content: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    padding: '30px',
  },
  filterSection: {
    marginBottom: '30px',
    paddingBottom: '30px',
    borderBottom: '1px solid #e8e8e8',
  },
  filterRow: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  filterGroup: {
    flex: 1,
    minWidth: '200px',
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
  filterButtons: {
    display: 'flex',
    gap: '10px',
  },
  button: {
    padding: '10px 24px',
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
    marginBottom: '20px',
    padding: '12px',
    backgroundColor: '#fff2f0',
    border: '1px solid #ffccc7',
    borderRadius: '4px',
    color: '#ff4d4f',
    textAlign: 'center',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    backgroundColor: '#fafafa',
  },
  tableHeaderCell: {
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: '500',
    color: '#333',
    borderBottom: '2px solid #e8e8e8',
  },
  tableRow: {
    borderBottom: '1px solid #e8e8e8',
    transition: 'background-color 0.3s',
  },
  tableCell: {
    padding: '12px 16px',
    color: '#666',
  },
  // 移动端卡片布局
  cardList: {
    display: 'none',
  },
  card: {
    border: '1px solid #e8e8e8',
    borderRadius: '6px',
    padding: '16px',
    backgroundColor: '#fff',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e8e8e8',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#333',
  },
  cardId: {
    fontSize: '12px',
    color: '#999',
  },
  cardRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '14px',
  },
  cardLabel: {
    color: '#999',
    marginRight: '8px',
  },
  cardValue: {
    color: '#333',
    fontWeight: '500',
  },
  cardActions: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #e8e8e8',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: '6px 12px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  deleteButton: {
    backgroundColor: '#ff4d4f',
    color: '#fff',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    padding: '40px 0',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    marginTop: '30px',
  },
  pageButton: {
    padding: '8px 16px',
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  pageButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  pageInfo: {
    color: '#666',
    fontSize: '14px',
  },
};

export default AdminPage;
