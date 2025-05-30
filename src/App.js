// import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard.js';
import Navbar from './component/Navbar';
import CourseUpload from './pages/CourseUpload.js';
import CourseDetails from './pages/CourseDetails';
import CourseCard from './component/CourseCard';
import AssessmentDetails from './pages/AssessmentDetails.js';
import InstructorAssessmentUpload from './pages/AssessmentUpload.js';
import StudentCourseList from './pages/StudentCourseList';
import TakeAssessment from './pages/TakeAssessment';
import ResultView from './pages/ResultView';
import ResultAnalysis from './pages/ResultAnalysis';
import EditAssessment from './pages/EditAssessment';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path='/instructor-dashboard' element={<InstructorDashboard />} />
        <Route path="/instructor/upload" element={<CourseUpload />} />
        <Route path="/instructor/course-details" element={<CourseDetails />} />
        <Route path='/coursecard' element={<CourseCard />} />
        <Route path='/instructor/assessment-upload' element={<InstructorAssessmentUpload />} />
        <Route path="/instructor/assessments" element={<AssessmentDetails />} />
        <Route path="/instructor/result-analysis" element={<ResultAnalysis />} />
        <Route path="/student/courses" element={<StudentCourseList />} />
        <Route path="/student/assessments" element={<TakeAssessment />} />
        <Route path="/student/results" element={<ResultView />} />
        <Route path="/instructor/edit-course/:courseId" element={<CourseUpload />} />
        <Route path="/instructor/edit-assessment/:assessmentId" element={<EditAssessment />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
