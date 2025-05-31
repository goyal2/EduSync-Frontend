import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'https://backendprojectwebapp-c4azccb4dbbchsdc.centralindia-01.azurewebsites.net',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important for CORS with credentials
});

// Add request interceptor to handle errors
api.interceptors.request.use(
  (config) => {
    // You can add any request preprocessing here
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response error:', error);
    return Promise.reject(error);
  }
);

// Register a new user
const registerUser = async (userData) => {
  try {
    return await api.post('/api/UserModels', userData);
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Login user
const loginUser = async (credentials) => {
  try {
    const response = await api.post('/api/UserModels/login', credentials);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Get user by ID
const getUserById = async (id) => {
  try {
    return await api.get(`/api/UserModels/${id}`);
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
};

// Upload course
const uploadCourse = async (courseData) => {
  try {

    const jsonData = {
      CourseId: courseData.courseId,
      Title: courseData.title,
      Description: courseData.description,
      InstructorId: courseData.instructorId,
      MediaUrl: courseData.mediaUrl || ''
    };

    const response = await api.post('/api/CourseModels', jsonData);
    return response;
  } catch (error) {
    console.error('Upload failed:', error.response?.data || error.message);
    throw error;
  }
};

// Update existing course
const updateCourse = async (courseData) => {
  try {

    const jsonData = {
      CourseId: courseData.courseId,
      Title: courseData.title,
      Description: courseData.description,
      InstructorId: courseData.instructorId,
      MediaUrl: courseData.mediaUrl || ''
    };

    const response = await api.put(`/api/CourseModels/${courseData.courseId}`, jsonData);
    return response;
  } catch (error) {
    console.error('Update failed:', error.response?.data || error.message);
    throw error;
  }
};

export const getCoursesByInstructor = (instructorId) => {
  console.log("Calling API with Instructor ID:", instructorId);
  return api.get(`api/CourseModels`, {
    params: { instructorId }
  });
};

export const createAssessment = (assessment) =>
  api.post(`api/AssessmentModels`, assessment);

export const getAllAssessments = () =>
  api.get(`api/AssessmentModels`);

export const getAssessmentById = (assessmentId) =>
  api.get(`api/AssessmentModels/${assessmentId}`);

export const deleteAssessment = (assessmentId) =>
  api.delete(`api/AssessmentModels/${assessmentId}`);

// Get all courses (for students)
export const getAllCourses = async () => {
  return await api.get('/api/CourseModels');
};

export const submitAssessment = (submission) => api.post('/api/ResultModels', submission);

export const getAllResults = () => {
  return api.get('/api/ResultModels');
};

export const deleteCourse = (courseId) => {
  return api.delete(`api/CourseModels/${courseId}`);
};

export const updateAssessment = async (assessment) => {
  try {
    const response = await api.put(`/api/AssessmentModels/${assessment.assessmentId}`, assessment);
    return response;
  } catch (error) {
    throw error;
  }
};

// Get enrolled courses for a student
export const getEnrolledCourses = (studentId) =>
  api.get(`/api/CourseModels/enrolled/${studentId}`);

// Get completed assessments for a student
export const getCompletedAssessments = (studentId) =>
  api.get(`/api/ResultModels/completed/${studentId}`);

// Get student's average score
export const getStudentAverageScore = (studentId) =>
  api.get(`/api/ResultModels/average/${studentId}`);

export {
  registerUser,
  loginUser,
  getUserById,
  uploadCourse,
  updateCourse
};

export default api;
