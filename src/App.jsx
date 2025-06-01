
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import NotFoundPage from '@/pages/NotFoundPage';
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminCoursesPage from '@/pages/admin/AdminCoursesPage';
import AdminCourseForm from '@/pages/admin/AdminCourseForm'; // Actual form
import AdminStudentsPage from '@/pages/admin/AdminStudentsPage';
import StudentLayout from '@/pages/student/StudentLayout';
import StudentDashboardPage from '@/pages/student/StudentDashboardPage';
import StudentCoursesPage from '@/pages/student/StudentCoursesPage';
import StudentProfilePage from '@/pages/student/StudentProfilePage';

// Placeholder Admin Pages
const AdminAnalyticsPage = () => <div className="p-4"><h1>Admin Analytics (BETA)</h1><p>Charts and data visualizations will appear here.</p></div>;
const AdminFeedbackPage = () => <div className="p-4"><h1>Admin Feedback (BETA)</h1><p>Student ratings and feedback will be displayed here.</p></div>;
const AdminAiToolsPage = () => <div className="p-4"><h1>Admin AI Tools (BETA)</h1><p>AI-powered course tag suggestions and popularity insights.</p></div>;
const AdminSettingsPage = () => <div className="p-4"><h1>Admin Settings</h1><p>General application settings and configurations.</p></div>;


// Placeholder Student Pages
const StudentCourseDetailPage = () => <div className="p-4"><h1>Course Detail Page</h1><p>Course content, lessons, progress tracking. This page will show details for enrolled courses.</p></div>;
const StudentAchievementsPage = () => <div className="p-4"><h1>Student Achievements (BETA)</h1><p>Badges, learning streaks, and summaries.</p></div>;
const StudentQnaPage = () => <div className="p-4"><h1>In-Lesson Q&A (BETA)</h1><p>Ask questions during video playback.</p></div>;
const StudentOfflinePage = () => <div className="p-4"><h1>Offline Mode (BETA)</h1><p>Download course materials.</p></div>;
const StudentSettingsPage = () => <div className="p-4"><h1>Student Settings</h1><p>Password change, preferences.</p></div>;
// StudentEnrollPage is now handled within StudentCoursesPage logic / AlertDialog

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              
              <Route path="admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="courses" element={<AdminCoursesPage />} />
                <Route path="courses/new" element={<AdminCourseForm />} />
                <Route path="courses/edit/:courseId" element={<AdminCourseForm />} />
                <Route path="students" element={<AdminStudentsPage />} />
                <Route path="analytics" element={<AdminAnalyticsPage />} />
                <Route path="feedback" element={<AdminFeedbackPage />} />
                <Route path="ai-tools" element={<AdminAiToolsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>

              <Route path="student" element={<ProtectedRoute allowedRoles={['student']}><StudentLayout /></ProtectedRoute>}>
                <Route index element={<StudentDashboardPage />} />
                <Route path="courses" element={<StudentCoursesPage />} />
                <Route path="courses/:courseId" element={<StudentCourseDetailPage />} />
                {/* Removed enroll route as it's handled by modal now */}
                <Route path="achievements" element={<StudentAchievementsPage />} />
                <Route path="qna" element={<StudentQnaPage />} />
                <Route path="offline" element={<StudentOfflinePage />} />
                <Route path="profile" element={<StudentProfilePage />} />
                <Route path="settings" element={<StudentSettingsPage />} />
              </Route>
              
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
