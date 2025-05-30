import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { uploadCourse, updateCourse, getCoursesByInstructor } from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';

function CourseUpload() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'Beginner',
    mediaUrl: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const instructorId = localStorage.getItem('userId');
  const isEditMode = !!courseId;

  useEffect(() => {
    if (isEditMode) {
      const fetchCourseDetails = async () => {
        try {
          const response = await getCoursesByInstructor(instructorId);
          const course = response.data.find(c => c.courseId === courseId);
          if (course) {
            setFormData({
              title: course.title,
              description: course.description,
              level: course.level,
              mediaUrl: course.mediaUrl || ''
            });
          } else {
            setError('Course not found');
          }
        } catch (err) {
          console.error('Error fetching course:', err);
          setError('Failed to load course details');
        }
      };
      fetchCourseDetails();
    }
  }, [courseId, instructorId, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.mediaUrl && !isValidUrl(formData.mediaUrl)) {
      setError('Please enter a valid URL.');
      return;
    }

    setUploading(true);

    try {
      const courseData = {
        courseId: isEditMode ? courseId : uuidv4(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        level: formData.level,
        mediaUrl: formData.mediaUrl.trim() || '',
        instructorId
      };

      const response = isEditMode
        ? await updateCourse(courseData)
        : await uploadCourse(courseData);

      setMessage(isEditMode ? 'Course updated successfully!' : 'Course created successfully!');

      setTimeout(() => {
        navigate('/instructor/course-details');
      }, 2000);
    } catch (err) {
      console.error(isEditMode ? 'Update error:' : 'Creation error:', err);
      const errorMessage = err.response?.data || err.message;
      setError(`Failed to ${isEditMode ? 'update' : 'create'} course: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="card-title">{isEditMode ? 'Edit Course' : 'Create New Course'}</h2>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => navigate('/instructor/course-details')}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Dashboard
                </button>
              </div>

              {message && <div className="alert alert-success">{message}</div>}
              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Course Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    placeholder="Enter course name"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Course Description *</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="4"
                    placeholder="Enter course description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="level" className="form-label">Course Level</label>
                  <select
                    className="form-select"
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="mediaUrl" className="form-label">Course Content URL</label>
                  <input
                    type="url"
                    className="form-control"
                    id="mediaUrl"
                    name="mediaUrl"
                    placeholder="Enter course URL (e.g., YouTube video, website, drive link)"
                    value={formData.mediaUrl}
                    onChange={handleInputChange}
                    required
                  />
                  <div className="form-text text-muted">
                    Provide a URL to your course content (e.g., YouTube video, Google Drive, or any other hosting platform)
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {isEditMode ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>{isEditMode ? 'Update Course' : 'Create Course'}</>
                    )}
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

export default CourseUpload;

