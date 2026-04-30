import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Sidebar from './components/Sidebar';
import CEODashboard from './pages/CEODashboard';
import InternPortal from './pages/InternPortal';
import Login from './pages/Login';
import ClientPanel from './pages/ClientPanel';
import ResourceManager from './pages/ResourceManager';
import PerformanceGrid from './pages/PerformanceGrid';
import Projects from './pages/Projects';
import { useAuth } from './context/AuthContext';

const Layout = ({ children, role, onLogout }) => (
  <div className="flex min-h-screen bg-[#050505]">
    <Sidebar role={role} onLogout={onLogout} />
    <main className="flex-1 pl-64 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-8 py-10">
        {children}
      </div>
    </main>
  </div>
);

function App() {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <Toaster theme="dark" position="top-right" toastOptions={{
        style: {
          background: '#0a0a0c',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          color: '#fff',
        }
      }} />
      {!user ? (
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      ) : (
        <Layout role={user.role} onLogout={logout}>
          <Routes>
            {user.role === 'ceo' ? (
              <>
                <Route path="/dashboard" element={<CEODashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/clients" element={<ClientPanel />} />
                <Route path="/resources" element={<ResourceManager />} />
                <Route path="/performance" element={<PerformanceGrid />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </>
            ) : (
              <>
                <Route path="/intern" element={<InternPortal />} />
                <Route path="*" element={<Navigate to="/intern" />} />
              </>
            )}
          </Routes>
        </Layout>
      )}
    </Router>
  );
}

export default App;
