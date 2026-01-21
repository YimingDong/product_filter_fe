import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import UserFormPage from './pages/UserFormPage';
import AdminPage from './pages/AdminPage';
import './App.css';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 监听屏幕大小变化
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileMenuOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = () => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <Router>
      <div style={styles.app}>
        <nav style={styles.nav}>
          <div style={styles.navContainer} className="nav-container">
            <h1 style={styles.navTitle} className="nav-title">产品筛选系统</h1>
            
            {/* 桌面端导航 */}
            <div style={styles.navLinks} className="nav-links">
              <Link to="/" style={styles.navLink} className="nav-link" onClick={handleNavClick}>
                产品查询
              </Link>
              <Link to="/admin" style={styles.navLink} className="nav-link" onClick={handleNavClick}>
                管理员
              </Link>
            </div>

            {/* 移动端菜单按钮 */}
            {isMobile && (
              <button
                onClick={toggleMobileMenu}
                style={styles.mobileMenuButton}
                className="mobile-menu-button"
                aria-label="Toggle menu"
              >
                <span style={styles.hamburgerLine}></span>
                <span style={styles.hamburgerLine}></span>
                <span style={styles.hamburgerLine}></span>
              </button>
            )}
          </div>

          {/* 移动端下拉菜单 */}
          {isMobile && isMobileMenuOpen && (
            <div style={styles.mobileMenu} className="mobile-menu">
              <Link to="/" style={styles.mobileNavLink} className="mobile-nav-link" onClick={handleNavClick}>
                产品查询
              </Link>
              <Link to="/admin" style={styles.mobileNavLink} className="mobile-nav-link" onClick={handleNavClick}>
                管理员
              </Link>
            </div>
          )}
        </nav>

        <main style={styles.main} className="main-content">
          <Routes>
            <Route path="/" element={<UserFormPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>

        {/* <footer style={styles.footer} className="footer">
          <p style={styles.footerText} className="footer-text">&copy; 2026 产品筛选系统. All rights reserved.</p>
        </footer> */}
      </div>
    </Router>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  nav: {
    backgroundColor: '#001529',
    padding: '0 20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  navContainer: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '64px',
  },
  navTitle: {
    color: '#fff',
    fontSize: '20px',
    fontWeight: '600',
    margin: 0,
  },
  navLinks: {
    display: 'flex',
    gap: '30px',
  },
  navLink: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.3s',
  },
  mobileMenuButton: {
    display: 'none',
    flexDirection: 'column',
    justifyContent: 'space-around',
    width: '30px',
    height: '24px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    zIndex: 1001,
  },
  hamburgerLine: {
    width: '30px',
    height: '3px',
    background: '#fff',
    borderRadius: '3px',
    transition: 'all 0.3s linear',
  },
  mobileMenu: {
    display: 'none',
    backgroundColor: '#001529',
    padding: '20px',
  },
  mobileNavLink: {
    display: 'block',
    color: '#fff',
    textDecoration: 'none',
    fontSize: '16px',
    padding: '12px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'background-color 0.3s',
  },
  main: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    padding: '20px 0',
  },
  footer: {
    backgroundColor: '#001529',
    color: '#fff',
    textAlign: 'center',
    padding: '20px',
    marginTop: 'auto',
  },
  footerText: {
    margin: 0,
    fontSize: '14px',
  },
};

export default App;
