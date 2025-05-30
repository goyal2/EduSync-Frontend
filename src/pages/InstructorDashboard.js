import React, { useEffect, useState } from 'react';
import { getUserById } from '../services/api';
import { useNavigate } from 'react-router-dom';

function InstructorDashboard() {
  const [instructor, setInstructor] = useState(null);
  const [error, setError] = useState('');
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        const res = await getUserById(userId);
        if (res.data.role !== 'Instructor') {
          setError('Unauthorized: Not an instructor.');
        } else {
          setInstructor(res.data);
        }
      } catch (err) {
        setError('Failed to load instructor.');
      }
    };

    if (userId) fetchInstructor();
    else setError('User ID not found in localStorage');
  }, [userId]);

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.welcomeBox}>
            <h1 style={styles.welcome}>Welcome back, {instructor?.name}</h1>
            <div style={styles.instructorInfo}>
              <p style={styles.infoItem}>
                <span style={styles.infoLabel}>Role:</span>
                <span style={styles.infoValue}>{instructor?.role}</span>
              </p>
              <p style={styles.infoItem}>
                <span style={styles.infoLabel}>Email:</span>
                <span style={styles.infoValue}>{instructor?.email}</span>
              </p>
            </div>
          </div>
        </div>

        <div style={styles.buttonContainer}>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Course Management</h2>
            <div style={styles.buttonGroup}>
              <button style={{ ...styles.button, ...styles.primaryButton }} onClick={() => navigate('/instructor/upload')}>
                <span style={styles.buttonIcon}>📚</span>
                <div style={styles.buttonContent}>
                  <span style={styles.buttonTitle}>Upload Course</span>
                  <span style={styles.buttonDescription}>Create and publish new courses</span>
                </div>
              </button>
              <button style={{ ...styles.button, ...styles.secondaryButton }} onClick={() => navigate('/instructor/course-details')}>
                <span style={styles.buttonIcon}>📋</span>
                <div style={styles.buttonContent}>
                  <span style={styles.buttonTitle}>Course Details</span>
                  <span style={styles.buttonDescription}>View and manage your courses</span>
                </div>
              </button>
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Assessment Tools</h2>
            <div style={styles.buttonGroup}>
              <button style={{ ...styles.button, ...styles.primaryButton }} onClick={() => navigate('/instructor/assessment-upload')}>
                <span style={styles.buttonIcon}>📝</span>
                <div style={styles.buttonContent}>
                  <span style={styles.buttonTitle}>Upload Assessment</span>
                  <span style={styles.buttonDescription}>Create new assessments</span>
                </div>
              </button>
              <button style={{ ...styles.button, ...styles.secondaryButton }} onClick={() => navigate('/instructor/assessments')}>
                <span style={styles.buttonIcon}>📊</span>
                <div style={styles.buttonContent}>
                  <span style={styles.buttonTitle}>Assessment Details</span>
                  <span style={styles.buttonDescription}>Review existing assessments</span>
                </div>
              </button>
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Analytics</h2>
            <div style={styles.buttonGroup}>
              <button style={{ ...styles.button, ...styles.primaryButton }} onClick={() => navigate('/instructor/result-analysis')}>
                <span style={styles.buttonIcon}>📈</span>
                <div style={styles.buttonContent}>
                  <span style={styles.buttonTitle}>Result Analysis</span>
                  <span style={styles.buttonDescription}>View student performance metrics</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    padding: '40px 20px'
  },
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    overflow: 'hidden'
  },
  header: {
    background: 'linear-gradient(135deg, #0369a1 0%, #0c4a6e 100%)',
    padding: '40px',
    color: '#fff'
  },
  welcomeBox: {
    maxWidth: '600px'
  },
  welcome: {
    fontSize: '32px',
    fontWeight: '600',
    margin: '0 0 8px 0',
    color: '#fff'
  },
  subtitle: {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.9)',
    margin: 0
  },
  buttonContainer: {
    padding: '40px'
  },
  section: {
    marginBottom: '40px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#0c4a6e',
    marginBottom: '16px'
  },
  buttonGroup: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px'
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    padding: '24px',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    width: '100%'
  },
  primaryButton: {
    backgroundColor: '#0284c7',
    color: '#fff',
    ':hover': {
      backgroundColor: '#0369a1',
      transform: 'translateY(-2px)'
    }
  },
  secondaryButton: {
    backgroundColor: '#f1f5f9',
    color: '#0c4a6e',
    ':hover': {
      backgroundColor: '#e2e8f0',
      transform: 'translateY(-2px)'
    }
  },
  buttonIcon: {
    fontSize: '24px',
    marginRight: '16px'
  },
  buttonContent: {
    display: 'flex',
    flexDirection: 'column'
  },
  buttonTitle: {
    fontSize: '16px',
    fontWeight: '500',
    marginBottom: '4px'
  },
  buttonDescription: {
    fontSize: '14px',
    opacity: 0.8
  },
  error: {
    padding: '16px',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    borderRadius: '8px',
    textAlign: 'center',
    margin: '20px'
  },
  instructorInfo: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    backdropFilter: 'blur(8px)'
  },
  infoItem: {
    margin: '4px 0',
    fontSize: '14px',
    color: '#fff',
    display: 'flex',
    alignItems: 'center'
  },
  infoLabel: {
    fontWeight: '500',
    marginRight: '8px',
    opacity: '0.9',
    minWidth: '50px'
  },
  infoValue: {
    opacity: '0.95'
  }
};

export default InstructorDashboard;

