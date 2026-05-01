import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Sidebar from './components/Sidebar';
import { useAuth } from './context/AuthContext';

// Lazy load pages for better initial load performance
const CEODashboard = lazy(() => import('./pages/CEODashboard'));
const InternPortal = lazy(() => import('./pages/InternPortal'));
const Login = lazy(() => import('./pages/Login'));
const ClientPanel = lazy(() => import('./pages/ClientPanel'));
const ClientProfile = lazy(() => import('./pages/ClientProfile'));
const ResourceManager = lazy(() => import('./pages/ResourceManager'));
const RoleDetail = lazy(() => import('./pages/RoleDetail'));
const PerformanceGrid = lazy(() => import('./pages/PerformanceGrid'));
const PerformanceReport = lazy(() => import('./pages/PerformanceReport'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectWorkspace = lazy(() => import('./pages/ProjectWorkspace'));
const TeamDirectory = lazy(() => import('./pages/TeamDirectory'));

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
        <Suspense fallback={
          <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <Routes>
            <Route path="*" element={<Login />} />
          </Routes>
        </Suspense>
      ) : (
        <Layout role={user.role} onLogout={logout}>
          <Suspense fallback={
            <div className="flex items-center justify-center h-[60vh]">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <Routes>
              {user.role === 'ceo' ? (
                <>
                  <Route path="/dashboard" element={<CEODashboard />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/projects/:id" element={<ProjectWorkspace />} />
                  <Route path="/clients" element={<ClientPanel />} />
                  <Route path="/clients/:id" element={<ClientProfile />} />
                  <Route path="/team" element={<TeamDirectory />} />
                  <Route path="/resources" element={<ResourceManager />} />
                  <Route path="/resources/:id" element={<RoleDetail />} />
                  <Route path="/performance" element={<PerformanceGrid />} />
                  <Route path="/performance/:id" element={<PerformanceReport />} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </>
              ) : (
                <>
                  <Route path="/intern" element={<InternPortal />} />
                  <Route path="*" element={<Navigate to="/intern" />} />
                </>
              )}
            </Routes>
          </Suspense>
        </Layout>
      )}
    </Router>
  );
}

export default App;
