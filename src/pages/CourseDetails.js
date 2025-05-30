import React, { useEffect, useState } from 'react';
import { getCoursesByInstructor, deleteCourse } from '../services/api';
import { Card, Spinner, Alert, Mthodal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function InstructorCourseDetails() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, [userId]);

  const fetchCourses = async () => {
    try {
      const response = await getCoursesByInstructor(userId);
      setCourses(response.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (course) => {
    setSelectedCourse(course);
    setShowViewModal(true);
  };

  const handleEdit = (courseId) => {
    navigate(`/instructor/edit-course/${courseId}`);
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteCourse(courseId);
        setCourses(courses.filter(course => course.courseId !== courseId));
        alert('Course deleted successfully');
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete course');
      }
    }
  };

  const renderResourceLinks = (course) => {
    const mediaUrl = course.mediaUrl || '';
    const hasMediaUrl = mediaUrl && mediaUrl.trim() !== '';

    if (!hasMediaUrl) {
      return <span className="text-muted">No resources available</span>;
    }

    return (
      <div className="d-flex flex-column gap-2">
        <a
          href={mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline-primary d-flex align-items-center"
        >
          <i className="bi bi-link-45deg me-2"></i>
          View Course Link
        </a>
      </div>
    );
  };

  const ViewModal = () => {
    if (!selectedCourse) return null;

    return (
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedCourse.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <h6 className="text-muted mb-2">Level</h6>
            <p><span className="badge bg-primary">{selectedCourse.level}</span></p>
          </div>
          <div className="mb-4">
            <h6 className="text-muted mb-2">Description</h6>
            <p>{selectedCourse.description}</p>
          </div>
          <div>
            <h6 className="text-muted mb-2">Course Link</h6>
            {renderResourceLinks(selectedCourse)}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Your Uploaded Courses</h2>
        <button
          className="btn btn-outline-primary"
          onClick={() => navigate('/instructor-dashboard')}
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

                <Card.Text className="text-muted mb-4">
                  {course.description.length > 150
                    ? `${course.description.substring(0, 150)}...`
                    : course.description}
                </Card.Text>

                <div className="border-top pt-3">
                  <h6 className="mb-3">Course Link:</h6>
                  {renderResourceLinks(course)}
                </div>

                <div className="mt-3 pt-3 border-top">
                  <div className="d-flex gap-2 justify-content-end">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => handleView(course)}
                    >
                      <i className="bi bi-eye me-1"></i>
                      View
                    </button>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => handleEdit(course.courseId)}
                    >
                      <i className="bi bi-pencil me-1"></i>
                      Edit
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDelete(course.courseId)}
                    >
                      <i className="bi bi-trash me-1"></i>
                      Delete
                    </button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>

      <ViewModal />
    </div>
  );
}

export default InstructorCourseDetails;