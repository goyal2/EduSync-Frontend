import React, { useEffect, useState } from 'react';
import { getAllAssessments, getCoursesByInstructor, deleteAssessment } from '../services/api';
import { useNavigate } from 'react-router-dom';

function AssessmentDetails() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assessmentRes, courseRes] = await Promise.all([
          getAllAssessments(),
          getCoursesByInstructor(userId),
        ]);

        // Filter assessments to only show those related to instructor's courses
        const instructorCourseIds = courseRes.data.map(course => course.courseId);
        const filteredAssessments = assessmentRes.data.filter(assessment =>
          instructorCourseIds.includes(assessment.courseId)
        );

        // Only keep courses that have assessments
        const coursesWithAssessments = courseRes.data.filter(course =>
          filteredAssessments.some(assessment => assessment.courseId === course.courseId)
        );

        setCourses(coursesWithAssessments);
        setAssessments(filteredAssessments);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load assessments.');
      } finally {
        setLoading(false);
      }
    };
    userId && fetchData();
  }, [userId]);

  const handleDeleteAssessment = async (assessmentId) => {
    if (window.confirm('Are you sure you want to delete this assessment?')) {
      try {
        await deleteAssessment(assessmentId);
        setAssessments(prev => prev.filter(a => a.assessmentId !== assessmentId));
        alert('Assessment deleted successfully');
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete assessment');
      }
    }
  };

  const parseQuestions = (questionsJson) => {
    try {
      return JSON.parse(questionsJson);
    } catch (err) {
      console.error('Parse error:', err);
      return [];
    }
  };

  const AssessmentModal = ({ assessment, onClose }) => {
    const questions = parseQuestions(assessment.questions);
    const course = courses.find(c => c.courseId === assessment.courseId);

    return (
      <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">{assessment.title}</h5>
              <button className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="card mb-3 bg-light">
                <div className="card-body">
                  <p><i className="bi bi-book me-2"></i>Course: {course?.title}</p>
                  <p><i className="bi bi-star me-2"></i>Total Score: {assessment.maxScore} points</p>
                </div>
              </div>
              <h6><i className="bi bi-question-circle me-2"></i>Questions:</h6>
              {questions.map((q, i) => (
                <div key={i} className="card mb-3">
                  <div className="card-header d-flex justify-content-between">
                    <span>Question {i + 1}</span>
                    <span className="badge bg-primary">{q.score} points</span>
                  </div>
                  <div className="card-body">
                    <p>{q.question}</p>
                    <ul className="list-group">
                      {q.options.map((opt, j) => (
                        <li key={j}
                          className={`list-group-item ${opt === q.answer ? 'list-group-item-success' : ''} 
                          d-flex justify-content-between`}>
                          {opt}
                          {opt === q.answer && (
                            <span className="badge bg-success">
                              <i className="bi bi-check me-1"></i>Correct
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAssessmentsList = (courseAssessments) => (
    <div className="card">
      <div className="card-body">
        <table className="table table-hover">
          <thead className="bg-light">
            <tr>
              <th>Title</th>
              <th>Questions</th>
              <th>Score</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courseAssessments.map(assessment => (
              <tr key={assessment.assessmentId}>
                <td>{assessment.title}</td>
                <td>{parseQuestions(assessment.questions).length}</td>
                <td>{assessment.maxScore}</td>
                <td>
                  <div className="btn-group">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setSelectedAssessment(assessment)}
                    >
                      <i className="bi bi-eye me-1"></i>View
                    </button>
                    <button
                      className="btn btn-sm btn-outline-warning"
                      onClick={() => navigate(`/instructor/edit-assessment/${assessment.assessmentId}`)}
                    >
                      <i className="bi bi-pencil me-1"></i>Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteAssessment(assessment.assessmentId)}
                    >
                      <i className="bi bi-trash me-1"></i>Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const filteredAssessments = assessments.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const assessmentsByCourse = courses
    .map(course => ({
      ...course,
      assessments: filteredAssessments.filter(a => a.courseId === course.courseId)
    }))
    .filter(course => course.assessments.length > 0); // Only show courses with assessments

  if (loading) return <div className="text-center"><div className="spinner-border"></div></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Assessment Details</h2>
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={() => navigate('/instructor-dashboard')}>
            <i className="bi bi-arrow-left me-1"></i>Back to Dashboard
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/instructor/assessment-upload')}>
            <i className="bi bi-plus me-1"></i>Create Assessment
          </button>
        </div>
      </div>

      {assessments.length > 0 && (
        <input
          type="text"
          className="form-control mb-4"
          placeholder="Search assessments..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      )}

      {assessments.length === 0 ? (
        <div className="text-center">
          <p className="text-muted">No assessments yet</p>
          <button className="btn btn-primary" onClick={() => navigate('/instructor/assessment-upload')}>
            Create First Assessment
          </button>
        </div>
      ) : selectedCourse ? (
        <>
          <button className="btn btn-link mb-3" onClick={() => setSelectedCourse(null)}>
            <i className="bi bi-arrow-left"></i> Back to Courses
          </button>
          {renderAssessmentsList(selectedCourse.assessments)}
        </>
      ) : (
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {assessmentsByCourse.map(course => (
            <div key={course.courseId} className="col">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{course.title}</h5>
                  <p className="card-text">{course.assessments.length} Assessment{course.assessments.length !== 1 ? 's' : ''}</p>
                  <button
                    className="btn btn-outline-primary w-100"
                    onClick={() => setSelectedCourse(course)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAssessment && (
        <AssessmentModal
          assessment={selectedAssessment}
          onClose={() => setSelectedAssessment(null)}
        />
      )}
    </div>
  );
}

export default AssessmentDetails;
