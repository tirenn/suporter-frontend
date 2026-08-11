import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import ProjectCard from './components/ProjectCard';
import CreateProjectModal from './components/CreateProjectModal';
import AlertModal from './components/AlertModal';
import Toast from './components/Toast';
import { api, getStoredToken, getStoredUser, setStoredToken, setStoredUser } from './api/client';
import { Tv, Plus, Sparkles } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [targetProjectForAlert, setTargetProjectForAlert] = useState(null);

  // Toast state
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    const token = getStoredToken();
    const u = getStoredUser();

    if (token && u) {
      setUser(u);
      fetchProjects();
    }
  }, []);

  function showToast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  }

  async function fetchProjects() {
    setLoadingProjects(true);
    try {
      const data = await api.getProjects();
      setProjects(data.projects || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  }

  function handleLogout() {
    setStoredToken(null);
    setStoredUser(null);
    setUser(null);
    setProjects([]);
    showToast('👋 Logged out successfully');
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px 60px' }}>
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content Area */}
      {!user ? (
        <main className="glass-card fade-in" style={{
          padding: '60px 40px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          marginTop: '20px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 40px rgba(99, 102, 241, 0.3)'
          }}>
            <Sparkles size={40} color="#818cf8" />
          </div>

          <div style={{ maxWidth: '600px' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '800', lineHeight: 1.2, marginBottom: '12px' }}>
              Real-Time Stream Overlays for OBS Studio
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Create streaming projects, generate custom OBS Studio Overlay URLs with flexible screen positioning, and broadcast live alerts powered by Golang & SSE.
            </p>
          </div>

          <button className="btn-primary" onClick={() => setIsAuthOpen(true)} style={{ padding: '16px 32px', fontSize: '1.05rem' }}>
            <span>Get Started & Sign In</span>
          </button>
        </main>
      ) : (
        <main style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff' }}>
                Your Stream Projects
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Select positioning presets and copy OBS Browser Source links
              </p>
            </div>

            <button className="btn-primary" onClick={() => setIsCreateOpen(true)}>
              <Plus size={18} />
              <span>Create Project</span>
            </button>
          </div>

          {loadingProjects ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="glass-card fade-in" style={{
              padding: '50px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}>
              <Tv size={48} color="var(--text-muted)" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff' }}>No Projects Created Yet</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '400px' }}>
                Create your first stream project to get a unique OBS Overlay Browser Source URL.
              </p>
              <button className="btn-primary" onClick={() => setIsCreateOpen(true)}>
                <Plus size={18} />
                <span>Create Your First Project</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
              {projects.map((proj) => (
                <ProjectCard
                  key={proj.id}
                  project={proj}
                  onOpenAlert={(p) => setTargetProjectForAlert(p)}
                  showToast={showToast}
                />
              ))}
            </div>
          )}
        </main>
      )}

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(u) => {
          setUser(u);
          fetchProjects();
        }}
        showToast={showToast}
      />

      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchProjects}
        showToast={showToast}
      />

      <AlertModal
        project={targetProjectForAlert}
        isOpen={!!targetProjectForAlert}
        onClose={() => setTargetProjectForAlert(null)}
        showToast={showToast}
      />

      <Toast message={toastMsg} />
    </div>
  );
}
