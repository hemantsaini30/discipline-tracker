import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { TaskProvider } from './context/TaskContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Tasks from './pages/Tasks.jsx';
import TaskDetail from './pages/TaskDetail.jsx';
import Global from './pages/Global.jsx';
import Review from './pages/Review.jsx';
import Analytics from './pages/Analytics.jsx';
import TomorrowPlan from './pages/TomorrowPlan.jsx';

export default function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="tasks/:id" element={<TaskDetail />} />
            <Route path="global" element={<Global />} />
            <Route path="review" element={<Review />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="tomorrow" element={<TomorrowPlan />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </TaskProvider>
    </AuthProvider>
  );
}
