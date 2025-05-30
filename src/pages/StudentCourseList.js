// src/pages/StudentCourseList.js

import React, { useEffect, useState } from 'react';
import { getAllCourses, getUserById } from '../services/api';
import { Card, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function StudentCourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [instructors, setInstructors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getAllCourses();
        setCourses(response.data);

        // Fetch instructor names
        const uniqueInstructorIds = [...new Set(response.data.map(course => course.instructorId))];
        const instructorData = {};

        await Promise.all(
          uniqueInstructorIds.map(async (instructorId) => {
            try {
              const instructorResponse = await getUserById(instructorId);
              instructorData[instructorId] = instructorResponse.data.name;
            } catch (err) {
              console.error(`Error fetching instructor ${instructorId}:`, err);
              instructorData[instructorId] = 'Unknown Instructor';
            }
          })
        );

        setInstructors(instructorData);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCourseClick = (courseId) => {
    navigate(`/student/assessment/${courseId}`);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Available Courses</h2>
        <button
          className="btn btn-outline-primary"
          onClick={() => navigate('/student-dashboard')}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back to Dashboard
        </button>
      </div>

      {loading && (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="row">
        {courses.map(course => (
          <div key={course.courseId} className="col-md-6 mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <Card.Title className="mb-0">{course.title}</Card.Title>
                  <span className="badge bg-primary">{course.level}</span>
                </div>

                <Card.Text className="text-muted mb-4">{course.description}</Card.Text>

                <div className="border-top pt-3">
                  <h6 className="mb-3">Course Resources:</h6>
                  {course.mediaUrl ? (
                    <a
                      href={course.mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary d-flex align-items-center"
                      style={{ width: 'fit-content' }}
                    >
                      <i className="bi bi-link-45deg me-2"></i>
                      View Course Content
                    </a>
                  ) : (
                    <span className="text-muted">No resources available</span>
                  )}
                </div>

                <div className="mt-3 pt-3 border-top">
                  <small className="text-muted d-flex align-items-center">
                    <i className="bi bi-person me-2"></i>
                    Instructor: {instructors[course.instructorId] || 'Loading...'}
                  </small>
                </div>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>

      {courses.length === 0 && !loading && !error && (
        <div className="text-center py-5">
          <i className="bi bi-journal-x display-4 text-muted mb-3 d-block"></i>
          <p className="lead text-muted">No courses available at the moment.</p>
        </div>
      )}
    </div>
  );
}

export default StudentCourseList;
