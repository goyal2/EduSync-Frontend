import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssessmentById, updateAssessment } from '../services/api';

function EditAssessment() {
    const { assessmentId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [assessment, setAssessment] = useState({
        title: '',
        courseId: '',
        maxScore: 0,
        questions: []
    });

    const [questionsList, setQuestionsList] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);

    useEffect(() => {
        const fetchAssessment = async () => {
            try {
                const response = await getAssessmentById(assessmentId);
                const assessmentData = response.data;
                setAssessment({
                    title: assessmentData.title,
                    courseId: assessmentData.courseId,
                    maxScore: assessmentData.maxScore
                });
                setQuestionsList(JSON.parse(assessmentData.questions));
                setLoading(false);
            } catch (err) {
                setError('Failed to load assessment');
                setLoading(false);
            }
        };

        fetchAssessment();
    }, [assessmentId]);

    const handleAssessmentChange = (e) => {
        const { name, value } = e.target;
        setAssessment(prev => ({ ...prev, [name]: value }));
    };

    const handleQuestionChange = (index, field, value, optionIndex = null) => {
        const updatedQuestions = [...questionsList];
        const question = { ...updatedQuestions[index] };

        if (field === 'options') {
            const options = [...question.options];
            options[optionIndex] = value;
            question.options = options;
        } else {
            question[field] = value;
        }

        updatedQuestions[index] = question;
        setQuestionsList(updatedQuestions);

        // Update total score
        const newTotalScore = updatedQuestions.reduce((sum, q) => sum + parseInt(q.score || 0), 0);
        setAssessment(prev => ({ ...prev, maxScore: newTotalScore }));
    };

    const handleDeleteQuestion = (index) => {
        const updatedQuestions = questionsList.filter((_, i) => i !== index);
        setQuestionsList(updatedQuestions);

        // Update total score
        const newTotalScore = updatedQuestions.reduce((sum, q) => sum + parseInt(q.score || 0), 0);
        setAssessment(prev => ({ ...prev, maxScore: newTotalScore }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (questionsList.length === 0) {
            setError('Please add at least one question');
            return;
        }

        try {
            const updatedAssessment = {
                ...assessment,
                assessmentId,
                questions: JSON.stringify(questionsList)
            };
            await updateAssessment(updatedAssessment);
            navigate('/instructor/assessments');
        } catch (err) {
            setError('Failed to update assessment');
        }
    };

    const addNewQuestion = () => {
        setQuestionsList([
            ...questionsList,
            {
                question: '',
                options: ['', '', '', ''],
                answer: '',
                score: 2
            }
        ]);
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    return (
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="form-label">Assessment Title</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg"
                                        name="title"
                                        value={assessment.title}
                                        onChange={handleAssessmentChange}
                                        required
                                    />
                                </div>

                                <div className="card bg-light mb-4">
                                    <div className="card-body text-center">
                                        <h5 className="card-title">Total Score</h5>
                                        <h2 className="display-4 mb-0">{assessment.maxScore}</h2>
                                    </div>
                                </div>

                                <h4 className="mb-4">Questions List</h4>

                                {questionsList.map((q, index) => (
                                    <div key={index} className="card mb-4">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <h5 className="mb-0">
                                                    Question {index + 1}
                                                    <span className="badge bg-secondary ms-2">{q.score} points</span>
                                                </h5>
                                                <div>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger btn-sm ms-2"
                                                        onClick={() => handleDeleteQuestion(index)}
                                                    >
                                                        <i className="bi bi-trash"></i> Delete
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={q.question}
                                                    onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                                                    placeholder="Enter question text"
                                                />
                                            </div>

                                            <div className="row mb-3">
                                                {q.options.map((option, optIndex) => (
                                                    <div key={optIndex} className="col-md-6 mb-2">
                                                        <div className="input-group">
                                                            <span className="input-group-text">
                                                                {option === q.answer && <i className="bi bi-check-circle-fill text-success"></i>}
                                                            </span>
                                                            <input
                                                                type="text"
                                                                className={`form-control ${option === q.answer ? 'border-success' : ''}`}
                                                                value={option}
                                                                onChange={(e) => handleQuestionChange(index, 'options', e.target.value, optIndex)}
                                                                placeholder={`Option ${optIndex + 1}`}
                                                            />
                                                            <button
                                                                type="button"
                                                                className={`btn ${option === q.answer ? 'btn-success' : 'btn-outline-secondary'}`}
                                                                onClick={() => handleQuestionChange(index, 'answer', option)}
                                                            >
                                                                Set Correct
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="row">
                                                <div className="col-md-4">
                                                    <div className="input-group">
                                                        <span className="input-group-text">Points</span>
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            value={q.score}
                                                            onChange={(e) => handleQuestionChange(index, 'score', e.target.value)}
                                                            min="1"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="d-grid gap-2 mb-4">
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary"
                                        onClick={addNewQuestion}
                                    >
                                        <i className="bi bi-plus-circle"></i> Add New Question
                                    </button>
                                </div>

                                <div className="d-flex justify-content-between">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => navigate('/instructor/assessments')}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={questionsList.length === 0}
                                    >
                                        Save Assessment
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

export default EditAssessment; 