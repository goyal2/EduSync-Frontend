import React, { useEffect, useState } from 'react';
import { getAllAssessments, getAllCourses, submitAssessment } from '../services/api';
import { useNavigate } from 'react-router-dom';

const TakeAssessment = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    Promise.all([getAllCourses(), getAllAssessments()])
      .then(([coursesRes, assessmentsRes]) => {
        setCourses(coursesRes.data);
        setAssessments(assessmentsRes.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch data:', err);
        setError('Failed to load courses and assessments');
        setLoading(false);
      });
  }, []);

  // Get courses that have assessments
  const coursesWithAssessments = courses.filter(course =>
    assessments.some(assessment => assessment.courseId === course.courseId)
  );

  // Get assessments for a specific course
  const getCourseAssessments = (courseId) => {
    return assessments.filter(assessment => assessment.courseId === courseId);
  };

  const handleInputChange = (questionText, value) => {
    if (!selectedAssessment) return;

    setAnswers(prev => ({
      ...prev,
      [selectedAssessment.assessmentId]: {
        ...prev[selectedAssessment.assessmentId],
        [questionText]: value
      }
    }));
    setValidationErrors(prev => ({
      ...prev,
      [selectedAssessment.assessmentId]: {
        ...prev[selectedAssessment.assessmentId],
        [questionText]: false
      }
    }));
  };

  const validateAssessment = () => {
    if (!selectedAssessment) return false;

    try {
      const questions = JSON.parse(selectedAssessment.questions);
      const studentAnswers = answers[selectedAssessment.assessmentId] || {};
      let newValidationErrors = {};

      questions.forEach(q => {
        if (!studentAnswers[q.question] || studentAnswers[q.question].trim() === '') {
          newValidationErrors[q.question] = true;
        }
      });

      setValidationErrors(prev => ({
        ...prev,
        [selectedAssessment.assessmentId]: newValidationErrors
      }));

      return Object.keys(newValidationErrors).length === 0;
    } catch {
      return false;
    }
  };

  const calculateScore = () => {
    if (!selectedAssessment) return 0;

    try {
      const questions = JSON.parse(selectedAssessment.questions);
      const studentAnswers = answers[selectedAssessment.assessmentId] || {};
      let score = 0;

      questions.forEach(q => {
        if (studentAnswers[q.question] === q.answer) {
          score += q.score || 0;
        }
      });
      return score;
    } catch {
      return 0;
    }
  };

  const handleSubmit = async () => {
    if (!selectedAssessment || !validateAssessment()) {
      alert('Please answer all questions before submitting.');
      return;
    }

    try {
      const submission = {
        assessmentId: selectedAssessment.assessmentId,
        answers: answers[selectedAssessment.assessmentId],
        userId: localStorage.getItem('userId'),
        score: calculateScore(),
        resultId: crypto.randomUUID(),
        attemptDate: new Date().toISOString()
      };

      await submitAssessment(submission);
      setSubmitted(prev => ({ ...prev, [selectedAssessment.assessmentId]: true }));
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (err) {
      console.error('Submission error:', err);
      alert('Failed to submit assessment. Please try again.');
    }
  };

  const renderAssessment = () => {
    if (!selectedAssessment) return null;

    const questions = JSON.parse(selectedAssessment.questions);
    const assessmentErrors = validationErrors[selectedAssessment.assessmentId] || {};
    const isSubmitted = submitted[selectedAssessment.assessmentId];
    const score = isSubmitted ? calculateScore() : null;
    const totalScore = selectedAssessment.maxScore;
    const percentage = score !== null ? (score / totalScore) * 100 : null;

    return (
      <div className="row justify-content-center">
        <div className="col-12 col-md-8">
          {isSubmitted ? (
            <div className="card">
              <div className="card-body text-center">
                <div className="mb-4">
                  <div className="display-1 mb-3">
                    {percentage >= 70 ? (
                      <i className="bi bi-emoji-smile text-success"></i>
                    ) : percentage >= 40 ? (
                      <i className="bi bi-emoji-neutral text-warning"></i>
                    ) : (
                      <i className="bi bi-emoji-frown text-danger"></i>
                    )}
                  </div>
                  <h2 className="card-title mb-4">Assessment Complete!</h2>
                  <div className="progress mb-3" style={{ height: "25px" }}>
                    <div
                      className={`progress-bar ${percentage >= 70 ? 'bg-success' : percentage >= 40 ? 'bg-warning' : 'bg-danger'}`}
                      role="progressbar"
                      style={{ width: `${percentage}%` }}
                      aria-valuenow={percentage}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                  <h3 className="mb-4">Your Score: {score} / {totalScore}</h3>
                  <div className="d-grid gap-2 col-6 mx-auto">
                    <button
                      className="btn btn-primary"
                      onClick={() => setSelectedAssessment(null)}
                    >
                      Back to Assessments
                    </button>
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => navigate('/student-dashboard')}
                    >
                      Go to Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{selectedAssessment.title}</h5>
                <p className="text-muted mb-4">Total Score: {selectedAssessment.maxScore} points</p>

                {questions.map((q, index) => (
                  <div key={index} className="mb-4">
                    <label className="form-label">
                      <span className="fw-bold">Question {index + 1}:</span> {q.question}
                      <span className="text-muted ms-2">({q.score} points)</span>
                    </label>

                    <select
                      className={`form-select ${assessmentErrors[q.question] ? 'is-invalid' : ''}`}
                      value={answers[selectedAssessment.assessmentId]?.[q.question] || ''}
                      onChange={(e) => handleInputChange(q.question, e.target.value)}
                      disabled={isSubmitted}
                    >
                      <option value="">Select your answer</option>
                      {q.options.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>

                    {assessmentErrors[q.question] && (
                      <div className="invalid-feedback">Please select an answer</div>
                    )}
                  </div>
                ))}

                <div className="d-flex justify-content-between align-items-center mt-4">
                  {isSubmitted ? (
                    <span className="text-success">
                      <i className="bi bi-check-circle-fill me-2"></i>
                      Assessment completed
                    </span>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={handleSubmit}
                    >
                      Submit Assessment
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      {showSuccessToast && (
        <div
          className="position-fixed top-0 start-50 translate-middle-x mt-4 toast show"
          role="alert"
          style={{ zIndex: 1000 }}
        >
          <div className="toast-header bg-success text-white">
            <i className="bi bi-check-circle me-2"></i>
            <strong className="me-auto">Success</strong>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={() => setShowSuccessToast(false)}
            ></button>
          </div>
          <div className="toast-body">
            Assessment submitted successfully!
          </div>
        </div>
      )}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate('/student-dashboard')}
        >
          <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
        </button>
        <h2 className="text-center flex-grow-1">Available Assessments</h2>
        <div style={{ width: '140px' }}></div>
      </div>

      {selectedCourse ? (
        <div className="text-center">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <button
              className="btn btn-outline-primary"
              onClick={() => {
                setSelectedCourse(null);
                setSelectedAssessment(null);
              }}
            >
              <i className="bi bi-arrow-left me-2"></i>Back to Courses
            </button>
            <h3 className="mb-0 flex-grow-1 text-center">{selectedCourse.title}</h3>
            <div style={{ width: '140px' }}></div>
          </div>

          {selectedAssessment ? (
            <div>
              <button
                className="btn btn-link mb-3"
                onClick={() => setSelectedAssessment(null)}
              >
                <i className="bi bi-arrow-left"></i> Back to Assessments
              </button>
              {renderAssessment()}
            </div>
          ) : (
            <div className="row justify-content-center">
              {getCourseAssessments(selectedCourse.courseId).map(assessment => (
                <div key={assessment.assessmentId} className="col-12 col-md-8 mb-3">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h5 className="card-title mb-1">{assessment.title}</h5>
                          <p className="text-muted mb-0">
                            Total Score: {assessment.maxScore} points
                          </p>
                        </div>
                        {submitted[assessment.assessmentId] ? (
                          <span className="badge bg-success">Completed</span>
                        ) : (
                          <button
                            className="btn btn-primary"
                            onClick={() => setSelectedAssessment(assessment)}
                          >
                            Take Assessment
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="row justify-content-center">
          {coursesWithAssessments.map(course => (
            <div
              key={course.courseId}
              className="col-12 col-md-8 mb-3"
            >
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h3 className="h5 mb-2">{course.title}</h3>
                      <p className="text-muted mb-0">
                        {getCourseAssessments(course.courseId).length} Assessment{getCourseAssessments(course.courseId).length !== 1 ? 's' : ''} Available
                      </p>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => setSelectedCourse(course)}
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TakeAssessment;
