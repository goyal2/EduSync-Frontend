import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserById, getAllCourses, getAllResults, getAllAssessments } from '../services/api';

function StudentDashboard() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [student, setStudent] = useState(null);
  const [stats, setStats] = useState({
    enrolledCount: 0,
    completedAssessments: 0,
    averageScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      console.log('Starting data fetch with userId:', userId);

      if (!userId) {
        setError('User not logged in. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        // Get student details
        console.log('Fetching student details...');
        const studentResponse = await getUserById(userId);
        console.log('Student data:', studentResponse.data);
        setStudent(studentResponse.data);

        // Get all data in parallel
        console.log('Fetching courses, results, and assessments...');
        const [coursesResponse, resultsResponse, assessmentsResponse] = await Promise.all([
          getAllCourses(),
          getAllResults(),
          getAllAssessments()
        ]);

        console.log('Courses:', coursesResponse.data);
        console.log('Results:', resultsResponse.data);
        console.log('Assessments:', assessmentsResponse.data);

        // Filter results for current student
        const studentResults = resultsResponse.data.filter(result => result.userId === userId);
        console.log('Filtered student results:', studentResults);

        // Calculate stats
        const enrolledCourses = coursesResponse.data.length;
        const completedAssessments = studentResults.length;

        // Calculate average score
        let totalScore = 0;
        let totalMaxScore = 0;

        studentResults.forEach(result => {
          const assessment = assessmentsResponse.data.find(a => a.assessmentId === result.assessmentId);
          if (assessment) {
            totalScore += Number(result.score);
            totalMaxScore += Number(assessment.maxScore);
          }
        });

        const averageScore = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
        console.log('Calculated stats:', {
          enrolledCourses,
          completedAssessments,
          averageScore,
          totalScore,
          totalMaxScore
        });

        setStats({
          enrolledCount: enrolledCourses,
          completedAssessments: completedAssessments,
          averageScore: averageScore
        });
      } catch (error) {
        console.error('Error details:', {
          message: error.message,
          response: error.response,
          stack: error.stack
        });

        if (error.response?.status === 401) {
          setError('Session expired. Please log in again.');
          // Optionally redirect to login
          navigate('/login');
        } else {
          setError(`Failed to load dashboard data: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, navigate]);

  // If user is not logged in, redirect to login
  useEffect(() => {
    if (!userId) {
      navigate('/login');
    }
  }, [userId, navigate]);

  const menuItems = [
    {
      title: 'My Courses',
      description: 'Access your enrolled courses and learning materials',
      icon: '📚',
      path: '/student/courses',
      color: 'primary'
    },
    {
      title: 'Assessments',
      description: 'Take course assessments and track your progress',
      icon: '✍️',
      path: '/student/assessments',
      color: 'success'
    },
    {
      title: 'Results & Progress',
      description: 'View your assessment results and overall performance',
      icon: '📊',
      path: '/student/results',
      color: 'info'
    }
  ];

  if (!userId) {
    return null; // Will redirect due to useEffect
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="container py-5">
        {error && (
          <div className="alert alert-danger mb-4" role="alert">
            <div className="d-flex align-items-center">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <div>
                <strong>Error:</strong> {error}
                {error.includes('log in') && (
                  <button
                    className="btn btn-outline-danger btn-sm ms-3"
                    onClick={() => navigate('/login')}
                  >
                    Go to Login
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-body p-4">
            <div className="row align-items-center">
              <div className="col-auto">
                <div className="bg-primary bg-gradient text-white rounded-circle p-3" style={{ width: '64px', height: '64px' }}>
                  <i className="bi bi-person-circle fs-3"></i>
                </div>
              </div>
              <div className="col">
                <h1 className="mb-1 h3">Welcome back, {student?.name || 'Student'}</h1>
                <p className="text-muted mb-0">
                  <i className="bi bi-envelope me-2"></i>{student?.email || 'Loading...'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 rounded p-3 me-3">
                    <i className="bi bi-book text-primary fs-4"></i>
                  </div>
                  <div>
                    <h6 className="mb-1">Courses</h6>
                    <h4 className="mb-0">{stats.enrolledCount}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="bg-success bg-opacity-10 rounded p-3 me-3">
                    <i className="bi bi-check-circle text-success fs-4"></i>
                  </div>
                  <div>
                    <h6 className="mb-1">Completed Assessments</h6>
                    <h4 className="mb-0">{stats.completedAssessments}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="bg-info bg-opacity-10 rounded p-3 me-3">
                    <i className="bi bi-graph-up text-info fs-4"></i>
                  </div>
                  <div>
                    <h6 className="mb-1">Average Score</h6>
                    <h4 className="mb-0">{stats.averageScore}%</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Menu */}
        <div className="row g-4">
          {menuItems.map((item, index) => (
            <div key={index} className="col-md-4">
              <div
                className="card h-100 border-0 shadow-sm hover-shadow cursor-pointer"
                onClick={() => navigate(item.path)}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 .5rem 1rem rgba(0,0,0,.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 .125rem .25rem rgba(0,0,0,.075)';
                }}
              >
                <div className="card-body p-4">
                  <div className={`bg-${item.color} bg-opacity-10 rounded-circle p-3 mb-3`} style={{ width: 'fit-content' }}>
                    <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                  </div>
                  <h5 className="card-title mb-2">{item.title}</h5>
                  <p className="card-text text-muted">{item.description}</p>
                  <div className={`text-${item.color} mt-3`}>
                    <i className="bi bi-arrow-right"></i> Get Started
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
