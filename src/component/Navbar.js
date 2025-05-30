import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>
        <span style={styles.brandAccent}>Edu</span>
        <span style={styles.brandBase}>Sync</span>
      </Link>

      <div style={styles.links}>
        {!userId ? (
          <>
            {/* <Link to="/login" style={styles.loginBtn}>Login</Link> */}
          </>
        ) : (
          <>
            {role === 'Student' && (
              <Link to="/student-dashboard" style={styles.link}>Dashboard</Link>
            )}
            {role === 'Instructor' && (
              <Link to="/instructor-dashboard" style={styles.link}>Dashboard</Link>
            )}
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: '#111827',
    padding: '12px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #1f2937'
  },
  brand: {
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '2px'
  },
  brandAccent: {
    color: '#10b981',
    fontSize: '24px',
    fontWeight: 'bold'
  },
  brandBase: {
    color: '#e5e7eb',
    fontSize: '24px',
    fontWeight: 'bold'
  },
  links: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center'
  },
  link: {
    color: '#d1d5db',
    textDecoration: 'none',
    fontSize: '15px',
    padding: '6px 12px',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
    border: '1px solid transparent',
    ':hover': {
      border: '1px solid #374151'
    }
  },
  loginBtn: {
    background: '#059669',
    color: '#ffffff',
    padding: '8px 20px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500',
    border: 'none'
  },
  logoutBtn: {
    background: '#1f2937',
    color: '#d1d5db',
    border: '1px solid #374151',
    padding: '8px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '15px',
    transition: 'all 0.2s ease',
    ':hover': {
      background: '#374151'
    }
  }
};

export default Navbar;
