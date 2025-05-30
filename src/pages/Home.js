import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h1 style={styles.heading}>Welcome to <span style={styles.brand}>EduSync</span></h1>
        <p style={styles.subheading}>Your smart learning and assessment platform</p>
        <div style={styles.buttonGroup}>
          <Link to="/login" style={{ ...styles.button, ...styles.primary }}>Login</Link>
          <Link to="/register" style={{ ...styles.button, ...styles.secondary }}>Register</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    height: 'calc(100vh - 70px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: '0 1rem',
  },
  container: {
    textAlign: 'center',
    maxWidth: '600px',
    padding: '2rem',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
  },
  heading: {
    fontSize: '2.5rem',
    marginBottom: '0.5rem',
    color: '#2c3e50'
  },
  brand: {
    color: '#007bff'
  },
  subheading: {
    fontSize: '1.25rem',
    color: '#555',
    marginBottom: '2rem'
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginTop: '1rem'
  },
  button: {
    padding: '0.75rem 2rem',
    fontSize: '1rem',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: 600,
    transition: '0.3s ease'
  },
  primary: {
    backgroundColor: '#007bff',
    color: '#fff'
  },
  secondary: {
    backgroundColor: '#6c757d',
    color: '#fff'
  }
};

export default Home;
