import React, { useState, useEffect } from 'react';
import { createAssessment, getCoursesByInstructor } from '../services/api';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

function AssessmentUpload() {
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState({
    title: '',
    courseId: '',
    maxScore: 0
  });

  const [courses, setCourses] = useState([]);
  const [questionsList, setQuestionsList] = useState([]);
  const [questionForm, setQuestionForm] = useState({
    question: '',
    options: ['', '', '', ''],
    answer: '',
    score: 0
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await getCoursesByInstructor(userId);
        setCourses(response.data);
      } catch (err) {
        setError('Failed to load courses. Please try again.');
      }
    }
    if (userId) fetchCourses();
  }, [userId]);

  const handleAssessmentChange = (e) => {
    const { name, value } = e.target;
    setAssessment(prev => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (e, index) => {
    const { name, value } = e.target;

    if (name === 'options') {
      const updatedOptions = [...questionForm.options];
      updatedOptions[index] = value;
      setQuestionForm(prev => ({ ...prev, options: updatedOptions }));
    } else {
      setQuestionForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const addQuestion = () => {
    if (!questionForm.question || !questionForm.answer || !questionForm.score || !questionForm.options.every(opt => opt)) {
      setError('Please fill all fields including question, options, answer and score');
      return;
    }

    const newQuestion = {
      ...questionForm,
      score: parseInt(questionForm.score)
    };

    setQuestionsList(prev => [...prev, newQuestion]);

    // Update total score
    const newTotalScore = questionsList.reduce((sum, q) => sum + q.score, 0) + newQuestion.score;
    setAssessment(prev => ({ ...prev, maxScore: newTotalScore }));

    // Reset form and clear error
    setQuestionForm({
      question: '',
      options: ['', '', '', ''],
      answer: '',
      score: 0
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!assessment.courseId) {
      setError('Please select a course');
      return;
    }

    if (questionsList.length === 0) {
      setError('Please add at least one question');
      return;
    }

    const newAssessment = {
      assessmentId: uuidv4(),
      ...assessment,
      questions: JSON.stringify(questionsList)
    };

    try {
      await createAssessment(newAssessment);
      setMessage('Assessment created successfully!');
      // Redirect to assessment details after 2 seconds
      setTimeout(() => {
        navigate('/instructor/assessments');
      }, 2000);
    } catch (err) {
      setError('Failed to create assessment. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/instructor-dashboard');
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="card-title">Create Assessment</h2>
                <button
                  className="btn btn-outline-secondary"
                  onClick={handleCancel}
                >
                  Back to Dashboard
                </button>
              </div>

              {message && <div className="alert alert-success">{message}</div>}
              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Select Course *</label>
                  <select
                    className="form-select"
                    name="courseId"
                    value={assessment.courseId}
                    onChange={handleAssessmentChange}
                    required
                  >
                    <option value="">Choose a course</option>
                    {courses.map(course => (
                      <option key={course.courseId} value={course.courseId}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Assessment Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    value={assessment.title}
                    onChange={handleAssessmentChange}
                    placeholder="Enter assessment title"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Total Score: {assessment.maxScore}</label>
                </div>

                <hr />
                <h4 className="mt-4">Add Question</h4>

                <div className="mb-3">
                  <label className="form-label">Question Text *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="question"
                    value={questionForm.question}
                    onChange={handleQuestionChange}
                    placeholder="Enter your question"
                  />
                </div>

                {questionForm.options.map((opt, idx) => (
                  <div className="mb-3" key={idx}>
                    <label className="form-label">Option {idx + 1} *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="options"
                      value={opt}
                      onChange={(e) => handleQuestionChange(e, idx)}
                      placeholder={`Enter option ${idx + 1}`}
                    />
                  </div>
                ))}

                <div className="mb-3">
                  <label className="form-label">Correct Answer *</label>
                  <select
                    className="form-select"
                    name="answer"
                    value={questionForm.answer}
                    onChange={handleQuestionChange}
                  >
                    <option value="">Select correct answer</option>
                    {questionForm.options.map((opt, idx) => (
                      opt && <option key={idx} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Question Score *</label>
                  <input
                    type="number"
                    className="form-control"
                    name="score"
                    min="1"
                    value={questionForm.score}
                    onChange={handleQuestionChange}
                    placeholder="Enter score for this question"
                  />
                </div>

                <button
                  type="button"
                  className="btn btn-primary mb-4"
                  onClick={addQuestion}
                >
                  Add Question
                </button>

                {questionsList.length > 0 && (
                  <div className="mb-4">
                    <h5>Added Questions</h5>
                    <div className="list-group">
                      {questionsList.map((q, i) => (
                        <div key={i} className="list-group-item">
                          <h6>Question {i + 1} ({q.score} points)</h6>
                          <p>{q.question}</p>
                          <div>
                            <strong>Options:</strong>
                            <ul className="list-unstyled">
                              {q.options.map((opt, idx) => (
                                <li key={idx} className={opt === q.answer ? 'text-success' : ''}>
                                  {idx + 1}. {opt} {opt === q.answer && '✓'}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="d-flex gap-2 justify-content-end">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={questionsList.length === 0}
                  >
                    Create Assessment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssessmentUpload;
