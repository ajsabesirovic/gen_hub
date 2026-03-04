import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import ChooseRole from "./pages/ChooseRole";
import Profile from "./pages/Profile";
import Tasks from "./pages/Tasks";
import TaskDetail from "./pages/TaskDetail";
import Assignments from "./pages/Assignments";
import Availability from "./pages/Availability";
import FindBabysitter from "./pages/FindBabysitter";
import BabysitterDetail from "./pages/BabysitterDetail";
import MyTasks from "./pages/MyTasks";
import MyReviews from "./pages/MyReviews";
import MyApplicationsInvites from "./pages/MyApplicationsInvites";
import TaskApplications from "./pages/TaskApplications";
import ParentDashboard from "./pages/ParentDashboard";
import BabysitterDashboard from "./pages/BabysitterDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserDetail from "./pages/admin/AdminUserDetail";
import AdminTasks from "./pages/admin/AdminTasks";
import "./App.css";
import {
  ProtectedRoute,
  BabysitterRoute,
  ParentRoute,
  AdminRoute,
} from "./components/ProtectedRoute";
import { AuthGuard, NonAdminGuard } from "./guards";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />

        <Route path="/verify-email" element={<VerifyEmailPage />} />

        <Route
          path="/choose-role"
          element={
            <AuthGuard>
              <ChooseRole />
            </AuthGuard>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <NonAdminGuard>
                <Profile />
              </NonAdminGuard>
            </ProtectedRoute>
          }
        />

                <Route
          path="/dashboard/babysitter"
          element={
            <BabysitterRoute>
              <BabysitterDashboard />
            </BabysitterRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <BabysitterRoute>
              <Tasks />
            </BabysitterRoute>
          }
        />
        <Route
          path="/tasks/:id"
          element={
            <ProtectedRoute>
              <TaskDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <BabysitterRoute>
              <MyTasks />
            </BabysitterRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <BabysitterRoute>
              <MyApplicationsInvites />
            </BabysitterRoute>
          }
        />
        <Route
          path="/reviews"
          element={
            <BabysitterRoute>
              <MyReviews />
            </BabysitterRoute>
          }
        />
        <Route
          path="/availability"
          element={
            <BabysitterRoute>
              <Availability />
            </BabysitterRoute>
          }
        />

                <Route
          path="/dashboard/parent"
          element={
            <ParentRoute>
              <ParentDashboard />
            </ParentRoute>
          }
        />
        <Route
          path="/babysitters"
          element={
            <ParentRoute>
              <FindBabysitter />
            </ParentRoute>
          }
        />
        <Route
          path="/babysitters/:id"
          element={
            <ParentRoute>
              <BabysitterDetail />
            </ParentRoute>
          }
        />
        <Route
          path="/task-applications"
          element={
            <ParentRoute>
              <TaskApplications />
            </ParentRoute>
          }
        />

                <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Assignments />
            </ProtectedRoute>
          }
        />

                <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <AdminRoute>
              <AdminCategories />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users/:id"
          element={
            <AdminRoute>
              <AdminUserDetail />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/tasks"
          element={
            <AdminRoute>
              <AdminTasks />
            </AdminRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
