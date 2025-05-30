import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssessmentById, submitAssessment } from '../services/api';

const AssessmentPage = () => {
    const { assessmentId } = useParams();
    const navigate = useNavigate();
    const [assessment, setAssessment] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        const fetchAssessment = async () => {
            try {
                const response = await getAssessmentById(assessmentId);
                setAssessment(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load assessment');
                setLoading(false);
            }
        };

        fetchAssessment();
    }, [assessmentId]);

    const handleInputChange = (questionText, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionText]: value
        }));

        setValidationErrors(prev => ({
            ...prev,
            [questionText]: false
        }));
    };

    const validateAssessment = () => {
        const questions = JSON.parse(assessment.questions);
        let newValidationErrors = {};

        questions.forEach(q => {
            if (!answers[q.question] || answers[q.question].trim() === '') {
                newValidationErrors[q.question] = true;
            }
        });

        setValidationErrors(newValidationErrors);
        return Object.keys(newValidationErrors).length === 0;
    };

    const calculateScore = () => {
        const questions = JSON.parse(assessment.questions);
        let score = 0;

        questions.forEach(q => {
            if (answers[q.question] === q.answer) {
                score += q.score || 0;
            }
        });

        return score;
    };

    const handleSubmit = async () => {
        if (!validateAssessment()) {
            alert('Please answer all questions before submitting.');
            return;
        }

        const submission = {
            assessmentId,
            answers,
            userId: localStorage.getItem('userId'),
            score: calculateScore(),
            resultId: crypto.randomUUID(),
            attemptDate: new Date().toISOString()
        };

        try {
            await submitAssessment(submission);
            alert('Assessment submitted successfully!');
            navigate('/assessments'); // Navigate back to assessments list
        } catch (err) {
            alert('Failed to submit assessment');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading assessment...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>{error}</p>
                <button onClick={() => navigate('/assessments')}>Back to Assessments</button>
            </div>
        );
    }

    if (!assessment) return null;

    const questions = JSON.parse(assessment.questions);

    return (
        <div className="assessment-page">
            <div className="container">
                <div className="assessment-header">
                    <button className="back-button" onClick={() => navigate('/assessments')}>
                        <i className="bi bi-arrow-left"></i>
                        Back to Assessments
                    </button>
                    <div className="assessment-info">
                        <h1>{assessment.title}</h1>
                        <div className="assessment-meta">
                            <span className="total-score">
                                <i className="bi bi-star-fill"></i>
                                Total Points: {assessment.maxScore}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="questions-container">
                    {questions.map((q, index) => (
                        <div key={index} className="question-card">
                            <div className="question-header">
                                <span className="question-number">Question {index + 1}</span>
                                <span className="question-points">{q.score} points</span>
                            </div>

                            <p className="question-text">{q.question}</p>

                            <div className="answer-section">
                                {q.options && Array.isArray(q.options) ? (
                                    <div className="options-list">
                                        {q.options.map((option, i) => (
                                            <label key={i} className="option-item">
                                                <input
                                                    type="radio"
                                                    name={`question-${index}`}
                                                    value={option}
                                                    checked={answers[q.question] === option}
                                                    onChange={(e) => handleInputChange(q.question, e.target.value)}
                                                />
                                                <span className="option-text">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        className={`answer-input ${validationErrors[q.question] ? 'error' : ''}`}
                                        value={answers[q.question] || ''}
                                        onChange={(e) => handleInputChange(q.question, e.target.value)}
                                        placeholder="Type your answer here..."
                                    />
                                )}

                                {validationErrors[q.question] && (
                                    <div className="error-message">Please answer this question</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="submission-section">
                    <button className="submit-button" onClick={handleSubmit}>
                        Submit Assessment
                    </button>
                </div>
            </div>

            <style jsx>{`
        .assessment-page {
          padding: 40px 0;
          background-color: #f8fafc;
          min-height: 100vh;
        }

        .assessment-header {
          margin-bottom: 30px;
        }

        .back-button {
          background: none;
          border: none;
          color: #64748b;
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
          cursor: pointer;
        }

        .assessment-info {
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 20px;
        }

        .assessment-info h1 {
          margin: 0 0 10px;
          color: #1e293b;
          font-size: 2rem;
        }

        .assessment-meta {
          color: #64748b;
        }

        .total-score {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 1.1rem;
        }

        .total-score i {
          color: #eab308;
        }

        .questions-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-bottom: 40px;
        }

        .question-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .question-number {
          font-weight: 600;
          color: #1e293b;
        }

        .question-points {
          background-color: #f1f5f9;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.9rem;
          color: #64748b;
        }

        .question-text {
          font-size: 1.1rem;
          color: #1e293b;
          margin-bottom: 20px;
        }

        .options-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .option-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .option-item:hover {
          background-color: #f8fafc;
        }

        .option-text {
          color: #1e293b;
        }

        .answer-input {
          width: 100%;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1rem;
          color: #1e293b;
        }

        .answer-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .error {
          border-color: #ef4444;
        }

        .error-message {
          color: #ef4444;
          font-size: 0.9rem;
          margin-top: 6px;
        }

        .submission-section {
          display: flex;
          justify-content: flex-end;
          padding-top: 20px;
          border-top: 2px solid #e2e8f0;
        }

        .submit-button {
          background-color: #2563eb;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .submit-button:hover {
          background-color: #1d4ed8;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-container {
          text-align: center;
          padding: 40px;
          color: #ef4444;
        }
      `}</style>
        </div>
    );
};

export default AssessmentPage; 