import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";
import ProtectedRoute, { AdminRoute } from "./components/ProtectedRoute";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const CourseList = lazy(() => import("./pages/CourseList"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const ModuleView = lazy(() => import("./pages/ModuleView"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Community = lazy(() => import("./pages/Community"));
const CommunityPost = lazy(() => import("./pages/CommunityPost"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminWaitlist = lazy(() => import("./pages/admin/AdminWaitlist"));
const AdminCourses = lazy(() => import("./pages/admin/AdminCourses"));
const AdminCourseEdit = lazy(() => import("./pages/admin/AdminCourseEdit"));
const AdminModuleEdit = lazy(() => import("./pages/admin/AdminModuleEdit"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-cream dark:bg-gray-900 transition-colors">
        <Navbar />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route
              path="/community"
              element={
                <ProtectedRoute>
                  <Community />
                </ProtectedRoute>
              }
            />
            <Route
              path="/community/posts/:id"
              element={
                <ProtectedRoute>
                  <CommunityPost />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses"
              element={
                <ProtectedRoute>
                  <CourseList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:slug"
              element={
                <ProtectedRoute>
                  <CourseDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:slug/modules/:moduleId"
              element={
                <ProtectedRoute>
                  <ModuleView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/waitlist"
              element={
                <AdminRoute>
                  <AdminWaitlist />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/courses"
              element={
                <AdminRoute>
                  <AdminCourses />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/courses/:id"
              element={
                <AdminRoute>
                  <AdminCourseEdit />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/courses/:id/modules/:moduleId"
              element={
                <AdminRoute>
                  <AdminModuleEdit />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <AdminRoute>
                  <AdminAnalytics />
                </AdminRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}
