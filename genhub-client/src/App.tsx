import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ChooseRole from './pages/ChooseRole';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import Assignments from './pages/Assignments';
import Availability from './pages/Availability';
import SettingsPage from './pages/settings/SettingsPage';
import './App.css';
import { ProtectedRoute, AuthenticatedRoute } from './components/ProtectedRoute';
import { AuthGuard } from './guards';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        
        <Route 
          path="/login" 
          element={
              <Login />
          } 
        />
        <Route 
          path="/register" 
          element={
              <Register />
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
              <ForgotPassword />
          } 
        />
        <Route 
          path="/reset-password/:uid/:token" 
          element={
              <ResetPassword />
          } 
        />
        
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
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tasks" 
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/assignments" 
          element={
            <ProtectedRoute>
              <Assignments />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/availability" 
          element={
            <ProtectedRoute>
              <Availability />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <AuthenticatedRoute>
              <SettingsPage />
            </AuthenticatedRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
