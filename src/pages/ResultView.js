import React, { useEffect, useState } from 'react';
import { getAllResults, getAllAssessments } from '../services/api';
import { useNavigate } from 'react-router-dom';

const ResultView = () => {
  const [results, setResults] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  // Format relative date
  const getRelativeDate = (date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const inputDate = new Date(date);
    const inputDateDay = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());

    if (inputDateDay.getTime() === today.getTime()) {
      return 'Today';
    } else if (inputDateDay.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      return inputDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  // Format relative time
  const getRelativeTime = (date) => {
    const now = new Date();
    const inputDate = new Date(date);
    const diffInMinutes = Math.floor((now - inputDate) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else {
      return inputDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  useEffect(() => {
    // Fetch both results and assessments
    Promise.all([getAllResults(), getAllAssessments()])
      .then(([resultRes, assessmentRes]) => {
        const studentResults = resultRes.data
          .filter(r => r.userId === userId)
          .sort((a, b) => new Date(b.attemptDate) - new Date(a.attemptDate)); // Sort by date descending
        setResults(studentResults);
        setAssessments(assessmentRes.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setLoading(false);
      });
  }, [userId]);

  // 🔄 Map assessmentId to title
  const getAssessmentTitle = (id) => {
    const found = assessments.find(a => a.assessmentId === id);
    return found ? found.title : 'Unknown Assessment';
  };

  const getAssessmentMaxScore = (id) => {
    const found = assessments.find(a => a.assessmentId === id);
    return found ? found.maxScore : 0;
  };

  const getScoreColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 70) return 'success';
    if (percentage >= 40) return 'warning';
    return 'danger';
  };

  const getScoreStatus = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 70) {
      return 'PASS';
    } else if (percentage >= 40) {
      return 'AVERAGE';
    }
    return 'FAIL';
  };

  // Group results by date
  const groupResultsByDate = (results) => {
    const groups = {};
    results.forEach(result => {
      const date = getRelativeDate(result.attemptDate);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(result);
    });
    return groups;
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading your results...</p>
          </div>
        </div>
      </div>
    );
  }

  const groupedResults = groupResultsByDate(results);

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate('/student-dashboard')}
        >
          <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
        </button>
        <h2 className="text-center flex-grow-1">Assessment Results</h2>
        <div style={{ width: '140px' }}></div>
      </div>

      {results.length === 0 ? (
        <div className="text-center mt-5">
          <div className="mb-4">
            <i className="bi bi-journal-x display-1 text-muted"></i>
          </div>
          <h3 className="text-muted mb-3">No Results Found</h3>
          <p className="text-muted mb-4">You haven't taken any assessments yet.</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/student/assessments')}
          >
            Take an Assessment
          </button>
        </div>
      ) : (
        <div className="row justify-content-center">
          <div className="col-12 col-md-8">
            {Object.entries(groupedResults).map(([date, dateResults]) => (
              <div key={date} className="mb-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="border-bottom flex-grow-1"></div>
                  <h5 className="text-muted mx-3 mb-0">
                    {date}
                  </h5>
                  <div className="border-bottom flex-grow-1"></div>
                </div>
                {dateResults.map((result) => {
                  const maxScore = getAssessmentMaxScore(result.assessmentId);
                  const scoreColor = getScoreColor(result.score, maxScore);
                  const status = getScoreStatus(result.score, maxScore);
                  const percentage = ((result.score / maxScore) * 100).toFixed(1);

                  return (
                    <div key={result.resultId} className="card border-0 shadow-sm mb-3">
                      <div className="card-body">
                        <div className="row align-items-center">
                          <div className="col">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h5 className="card-title mb-0">{getAssessmentTitle(result.assessmentId)}</h5>
                              <span className="text-muted small">
                                {getRelativeTime(result.attemptDate)}
                              </span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className={`badge bg-${scoreColor} px-3 py-2`}>
                                {status}
                              </span>
                              <span className={`text-${scoreColor} fw-bold`}>
                                {percentage}%
                              </span>
                            </div>
                            <div className="progress" style={{ height: '8px' }}>
                              <div
                                className={`progress-bar bg-${scoreColor}`}
                                role="progressbar"
                                style={{ width: `${percentage}%` }}
                                aria-valuenow={percentage}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              ></div>
                            </div>
                            <div className="mt-2">
                              <span className="text-muted">
                                Score: {result.score} / {maxScore}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultView;
