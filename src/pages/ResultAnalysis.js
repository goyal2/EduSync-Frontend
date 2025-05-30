import React, { useEffect, useState } from 'react';
import { getAllResults, getUserById, getAllAssessments, getCoursesByInstructor } from '../services/api';
import { Card, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function ResultAnalysis() {
    const [results, setResults] = useState([]);
    const [students, setStudents] = useState({});
    const [assessments, setAssessments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedAssessment, setSelectedAssessment] = useState(null);
    const instructorId = localStorage.getItem('userId');
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchStudentDetails = async (userId) => {
        try {
            const response = await getUserById(userId);
            if (response && response.data) {
                return {
                    name: response.data.name || 'Unknown Student',
                    email: response.data.email
                };
            }
            return { name: 'Unknown Student' };
        } catch (err) {
            console.error(`Error fetching student ${userId}:`, err);
            return { name: 'Unknown Student' };
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');

            // Get instructor's courses first
            const coursesRes = await getCoursesByInstructor(instructorId);
            const instructorCourses = coursesRes.data;
            setCourses(instructorCourses);

            // Get all assessments and results
            const [resultsRes, assessmentsRes] = await Promise.all([
                getAllResults(),
                getAllAssessments()
            ]);

            // Filter assessments for instructor's courses
            const instructorAssessments = assessmentsRes.data.filter(assessment =>
                instructorCourses.some(course => course.courseId === assessment.courseId)
            );
            setAssessments(instructorAssessments);

            // Get all results for instructor's assessments
            const instructorResults = resultsRes.data.filter(result =>
                instructorAssessments.some(assessment => assessment.assessmentId === result.assessmentId)
            );
            setResults(instructorResults);

            // Fetch student details for all results using userId
            const uniqueUserIds = [...new Set(instructorResults.map(result => result.userId))];
            const studentDetailsMap = {};

            // Fetch student details one by one
            for (const userId of uniqueUserIds) {
                const studentData = await fetchStudentDetails(userId);
                studentDetailsMap[userId] = studentData;
            }

            setStudents(studentDetailsMap);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load results data');
        } finally {
            setLoading(false);
        }
    };

    const calculatePercentage = (score, maxScore) => {
        return ((score / maxScore) * 100).toFixed(1);
    };

    const getResultsByAssessment = (assessmentId) => {
        return results.filter(result => result.assessmentId === assessmentId);
    };

    const getCourseTitle = (courseId) => {
        const course = courses.find(c => c.courseId === courseId);
        return course ? course.title : 'Unknown Course';
    };

    const renderAssessmentResults = (assessment) => {
        const assessmentResults = getResultsByAssessment(assessment.assessmentId);

        return (
            <div className="mb-4">
                <div className="d-flex flex-column mb-3">
                    <h5>{assessment.title}</h5>
                    <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted">Course: {getCourseTitle(assessment.courseId)}</span>
                        <span className="badge bg-primary">Total Score: {assessment.maxScore}</span>
                    </div>
                </div>

                {assessmentResults.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead className="table-light">
                                <tr>
                                    <th>Student Name</th>
                                    <th>Score</th>
                                    <th>Percentage</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assessmentResults.map(result => {
                                    const student = students[result.userId];
                                    const percentage = calculatePercentage(result.score, assessment.maxScore);

                                    return (
                                        <tr key={result.resultId}>
                                            <td>
                                                {student?.name || 'Loading...'}
                                                {student?.email && <div className="small text-muted">{student.email}</div>}
                                            </td>
                                            <td>{result.score} / {assessment.maxScore}</td>
                                            <td>{percentage}%</td>
                                            <td>
                                                <span className={`badge ${percentage >= 70 ? 'bg-success' :
                                                    percentage >= 40 ? 'bg-warning' :
                                                        'bg-danger'
                                                    }`}>
                                                    {percentage >= 70 ? 'Passed' :
                                                        percentage >= 40 ? 'Average' :
                                                            'Failed'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-muted">No results available for this assessment</p>
                )}
            </div>
        );
    };

    if (loading) return (
        <div className="text-center mt-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading results...</p>
        </div>
    );

    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Assessment Results Analysis</h2>
                <button
                    className="btn btn-outline-primary"
                    onClick={() => navigate('/instructor-dashboard')}
                >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Dashboard
                </button>
            </div>

            {assessments.length === 0 ? (
                <div className="text-center py-5">
                    <i className="bi bi-clipboard-x display-4 text-muted mb-3 d-block"></i>
                    <p className="lead text-muted">No assessments available</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/instructor/assessment-upload')}
                    >
                        <i className="bi bi-plus-circle me-2"></i>
                        Create Assessment
                    </button>
                </div>
            ) : (
                <div className="row">
                    <div className="col-md-3 mb-4">
                        <div className="list-group">
                            {assessments.map(assessment => (
                                <button
                                    key={assessment.assessmentId}
                                    className={`list-group-item list-group-item-action ${selectedAssessment?.assessmentId === assessment.assessmentId ? 'active' : ''
                                        }`}
                                    onClick={() => setSelectedAssessment(assessment)}
                                >
                                    <div className="d-flex flex-column align-items-start">
                                        <div className="fw-bold">{assessment.title}</div>
                                        <small className="text-muted">{getCourseTitle(assessment.courseId)}</small>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="col-md-9">
                        {selectedAssessment ? (
                            <Card>
                                <Card.Body>
                                    {renderAssessmentResults(selectedAssessment)}
                                </Card.Body>
                            </Card>
                        ) : (
                            <div className="text-center py-5">
                                <p className="text-muted">Select an assessment to view results</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ResultAnalysis; 