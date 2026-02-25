import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Pages
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import MemberDashboard from './pages/MemberDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import CheckCommission from './pages/CheckCommission';

// Layout
import Layout from './components/Layout';

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role: string }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== role) return <Navigate to="/" />;
  return children;
};

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/check-commission" element={<CheckCommission />} />
          
          <Route path="/member/*" element={
            <ProtectedRoute role="member">
              <MemberDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/*" element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </Layout>
    </Router>
  );
}
