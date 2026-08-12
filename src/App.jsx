import React, { useState, useEffect } from 'react';
import { BACKEND_URL, api, executeRecaptcha, getStoredToken, getStoredUser, setStoredToken, setStoredUser } from './api/client';
import {
  Tv, Plus, Sparkles, Shield, ArrowLeft, Landmark,
  Copy, Check, Heart, ExternalLink, Edit3, Save, X,
  Eye, EyeOff,
} from 'lucide-react';
import ProjectCard from './components/ProjectCard';
import CreateProjectModal from './components/CreateProjectModal';
import EditTemplateModal from './components/EditTemplateModal';
import CustomAlertModal from './components/CustomAlertModal';
import Toast from './components/Toast';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing'); // 'landing' | 'streamer-login' | 'dashboard'

  // Auth state
  const [authMode, setAuthMode] = useState('login');
  const [authName, setAuthName] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  // Dashboard state
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // QRIS URL editing
  const [editingQRIS, setEditingQRIS] = useState(false);
  const [qrisInput, setQrisInput] = useState('');
  const [savingQRIS, setSavingQRIS] = useState(false);

  // Landing: navigate-to-donate input
  const [donateTarget, setDonateTarget] = useState('');

  // Webhook copy
  const [copiedWebhookUrl, setCopiedWebhookUrl] = useState(false);
  const [copiedWebhookKey, setCopiedWebhookKey] = useState(false);
  const [showWebhookKey, setShowWebhookKey] = useState(false);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [targetProjectForAlert, setTargetProjectForAlert] = useState(null);
  const [targetProjectForEdit, setTargetProjectForEdit] = useState(null);

  // Toast
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    const token = getStoredToken();
    const u = getStoredUser();
    if (token && u) {
      setUser(u);
      setQrisInput(u.qris_url || '');
      setView('dashboard');
      fetchProjects();
    }
  }, []);

  function showToast(msg) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
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
    setView('landing');
    showToast('👋 Logged out successfully');
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    
    try {
      const token = await executeRecaptcha(authMode);
      
      let res;
      if (authMode === 'register') {
        res = await api.register(authName, authUsername, authPassword, token);
        showToast('🎉 Account registered successfully!');
      } else {
        res = await api.login(authUsername, authPassword, token);
        showToast('✅ Logged in successfully!');
      }

      setStoredToken(res.access_token);
      setStoredUser(res.user);
      setUser(res.user);
      setQrisInput(res.user.qris_url || '');
      setAuthName('');
      setAuthUsername('');
      setAuthPassword('');
      setView('dashboard');
      fetchProjects();
    } catch (err) {
      showToast('❌ ' + (err.message || 'Authentication failed'));
    }
  }

  async function handleSaveQRIS() {
    if (!qrisInput.trim()) {
      showToast('⚠️ Masukkan URL QRIS yang valid');
      return;
    }
    setSavingQRIS(true);
    try {
      await api.updateProfile(qrisInput.trim());
      // Update local user cache
      const updatedUser = { ...user, qris_url: qrisInput.trim() };
      setStoredUser(updatedUser);
      setUser(updatedUser);
      setEditingQRIS(false);
      showToast('✅ QRIS URL berhasil disimpan!');
    } catch (err) {
      showToast('❌ ' + (err.message || 'Gagal menyimpan QRIS URL'));
    } finally {
      setSavingQRIS(false);
    }
  }

  function handleCopyWebhookUrl() {
    const url = `${BACKEND_URL}/api/v1/webhooks/donation`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedWebhookUrl(true);
      showToast('📋 Webhook URL copied!');
      setTimeout(() => setCopiedWebhookUrl(false), 2000);
    });
  }

  function handleCopyWebhookKey(key) {
    navigator.clipboard.writeText(key).then(() => {
      setCopiedWebhookKey(true);
      showToast('📋 Webhook Key copied!');
      setTimeout(() => setCopiedWebhookKey(false), 2000);
    });
  }

  function handleGoToDonate(e) {
    e.preventDefault();
    const slug = donateTarget.trim().toLowerCase();
    if (!slug) return;
    window.location.href = `/donate/${encodeURIComponent(slug)}`;
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 20px 60px' }}>

      {/* Header */}
      <header style={hdr.bar}>
        <div style={hdr.brand} onClick={() => view !== 'dashboard' && setView('landing')}>
          <Tv size={24} color="#10b981" />
          <h1 style={hdr.title}>SUPORTER</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {user ? (
            <>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Logged in as <strong style={{ color: '#fff' }}>@{user.username}</strong>
              </span>
              <button className="btn-secondary" onClick={handleLogout} style={{ padding: '8px 16px' }}>
                Logout
              </button>
            </>
          ) : (
            view !== 'landing' && (
              <button className="btn-secondary" onClick={() => setView('landing')}>
                <ArrowLeft size={16} /> Kembali
              </button>
            )
          )}
        </div>
      </header>

      {/* ── LANDING ── */}
      {view === 'landing' && (
        <main className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', marginTop: '40px' }}>
          <div style={{ textAlign: 'center', maxWidth: '600px' }}>
            <div style={badge}>
              <Sparkles size={14} />
              <span>Real-Time Streaming Donation Platform</span>
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '850', lineHeight: 1.2, color: '#fff', marginBottom: '14px' }}>
              Real-Time Donation Overlay &amp; Verification Webhook
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Streamers manage OBS overlays and alerts. Viewers donate instantly — no sign-up required.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', width: '100%', maxWidth: '820px' }}>
            {/* Streamer Card */}
            <div className="glass-card" style={card}>
              <div style={cardIcon('#6366f1', 0.15)}>
                <Tv size={24} color="#818cf8" />
              </div>
              <div>
                <h3 style={cardTitle}>Streamer Portal</h3>
                <p style={cardDesc}>Manage OBS overlay styles, templates, and retrieve webhook integration keys.</p>
              </div>
              <button
                className="btn-primary"
                style={{ marginTop: 'auto', background: 'linear-gradient(90deg, #6366f1, #4f46e5)' }}
                onClick={() => { setAuthMode('login'); setView('streamer-login'); }}
              >
                Enter Streamer Portal
              </button>
            </div>

            {/* Donate Card */}
            <div className="glass-card" style={{ ...card, border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <div style={cardIcon('#10b981', 0.15)}>
                <Heart size={24} color="#34d399" />
              </div>
              <div>
                <h3 style={cardTitle}>Donate to Streamer</h3>
                <p style={cardDesc}>Support your favourite streamer with QRIS. Input their username below.</p>
              </div>
              <form onSubmit={handleGoToDonate} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Masukkan username streamer…"
                  value={donateTarget}
                  onChange={(e) => setDonateTarget(e.target.value)}
                  required
                  style={{ fontSize: '0.9rem' }}
                />
                <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(90deg, #10b981, #059669)', justifyContent: 'center' }}>
                  <ExternalLink size={16} /> Buka Halaman Donasi
                </button>
              </form>
            </div>
          </div>
        </main>
      )}

      {/* ── STREAMER LOGIN ── */}
      {view === 'streamer-login' && (
        <main className="fade-in" style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '36px' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '850', color: '#fff', marginBottom: '6px' }}>
              {authMode === 'login' ? 'Streamer Sign In' : 'Create Streamer Account'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Configure overlay widgets, templates, and webhook triggers.
            </p>

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {authMode === 'register' && (
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input type="text" className="input-field" placeholder="e.g. John Doe" value={authName} onChange={(e) => setAuthName(e.target.value)} required />
                </div>
              )}
              <div className="input-group">
                <label className="input-label">Streamer Username</label>
                <input type="text" className="input-field" placeholder="username" value={authUsername} onChange={(e) => setAuthUsername(e.target.value)} required />
              </div>
              <div className="input-group">
                <label className="input-label">Password</label>
                <input type="password" className="input-field" placeholder="••••••••" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '14px', width: '100%', justifyContent: 'center' }}>
                {authMode === 'login' ? 'Sign In as Streamer' : 'Create Streamer Profile'}
              </button>
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem' }}>
              {authMode === 'login' ? (
                <span style={{ color: 'var(--text-muted)' }}>
                  Don't have an account?{' '}
                  <button className="btn-link" style={{ color: '#818cf8', fontWeight: '700' }} onClick={() => setAuthMode('register')}>Register here</button>
                </span>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>
                  Already have an account?{' '}
                  <button className="btn-link" style={{ color: '#818cf8', fontWeight: '700' }} onClick={() => setAuthMode('login')}>Sign in here</button>
                </span>
              )}
            </div>
          </div>
        </main>
      )}

      {/* ── STREAMER DASHBOARD ── */}
      {view === 'dashboard' && user && (
        <main className="fade-in">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Webhook URL Card */}
            <div className="glass-card" style={{ padding: '24px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={cardIcon('#f59e0b', 0.15)}>
                    <Shield size={20} color="#f59e0b" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#fff' }}>Payment Verification Webhook URL</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Callback endpoint for donation updates. Authenticated via headers.</p>
                  </div>
                </div>
                <button className="btn-secondary" onClick={handleCopyWebhookUrl} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  {copiedWebhookUrl ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                  <span>{copiedWebhookUrl ? 'Copied!' : 'Copy Webhook URL'}</span>
                </button>
              </div>
              <div style={{ marginTop: '12px', background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '8px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#fef08a', wordBreak: 'break-all' }}>
                  {`${BACKEND_URL}/api/v1/webhooks/donation`}
                </span>
              </div>

              {/* Webhook Key (Header Auth) */}
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: '750', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Header X-Suporter-Key</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: '#fff', letterSpacing: !showWebhookKey ? '0.15em' : 'normal' }}>
                        {showWebhookKey ? user.webhook_key : '••••••••••••••••••••••••••••••••'}
                      </span>
                      <button
                        onClick={() => setShowWebhookKey(!showWebhookKey)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                        title={showWebhookKey ? 'Hide Webhook Key' : 'Show Webhook Key'}
                      >
                        {showWebhookKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <button className="btn-secondary" onClick={() => handleCopyWebhookKey(user.webhook_key)} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    {copiedWebhookKey ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                    <span>{copiedWebhookKey ? 'Copied Key!' : 'Copy Key'}</span>
                  </button>
                </div>
                <div style={{ marginTop: '10px', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  ℹ️ Webhook calls must include the header <code style={{ color: '#fef08a', fontFamily: 'var(--font-mono)' }}>X-Suporter-Key</code> with this key and <code style={{ color: '#fef08a', fontFamily: 'var(--font-mono)' }}>X-Suporter-Signature</code> containing the HMAC-SHA256 signature.
                </div>
              </div>
            </div>

            {/* QRIS URL Settings Card */}
            <div className="glass-card" style={{ padding: '24px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={cardIcon('#10b981', 0.15)}>
                    <Landmark size={20} color="#34d399" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#fff' }}>QRIS Image URL</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Ditampilkan pada halaman donasi Anda di{' '}
                      <a href={`/donate/${user.username}`} target="_blank" rel="noreferrer" style={{ color: '#34d399', textDecoration: 'underline' }}>
                        /donate/{user.username}
                      </a>
                    </p>
                  </div>
                </div>
                {!editingQRIS ? (
                  <button className="btn-secondary" onClick={() => { setEditingQRIS(true); setQrisInput(user.qris_url || ''); }} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    <Edit3 size={14} /> Edit QRIS URL
                  </button>
                ) : (
                  <button className="btn-secondary" onClick={() => setEditingQRIS(false)} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                    <X size={14} /> Batal
                  </button>
                )}
              </div>

              {editingQRIS ? (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://i.imgur.com/your-qris.jpg"
                    value={qrisInput}
                    onChange={(e) => setQrisInput(e.target.value)}
                    style={{ flex: 1, minWidth: '240px' }}
                  />
                  <button
                    className="btn-primary"
                    onClick={handleSaveQRIS}
                    disabled={savingQRIS}
                    style={{ padding: '10px 20px', background: 'linear-gradient(90deg,#10b981,#059669)', whiteSpace: 'nowrap' }}
                  >
                    <Save size={14} />
                    <span>{savingQRIS ? 'Menyimpan…' : 'Simpan'}</span>
                  </button>
                </div>
              ) : (
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {user.qris_url ? (
                    <>
                      <img src={user.qris_url} alt="QRIS Preview" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} onError={(e) => { e.target.style.display = 'none'; }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#34d399', wordBreak: 'break-all' }}>{user.qris_url}</span>
                    </>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Belum ada URL QRIS. Klik "Edit QRIS URL" untuk menambahkan.
                    </span>
                  )}
                </div>
              )}

              {/* Donation page link */}
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Heart size={14} color="#34d399" />
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Bagikan link donasi kamu:{' '}
                  <a
                    href={`/donate/${user.username}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#34d399', fontWeight: '700', textDecoration: 'none' }}
                  >
                    {window.location.origin}/donate/{user.username}
                  </a>
                </span>
              </div>
            </div>

            {/* Projects Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff' }}>Overlay Layouts</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Add projects, overlay URLs, and templates.</p>
              </div>
              <button className="btn-primary" onClick={() => setIsCreateOpen(true)}>
                <Plus size={18} /><span>Create Project</span>
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="glass-card" style={{ padding: '50px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <Tv size={48} color="var(--text-muted)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff' }}>No Projects Created</h3>
                <button className="btn-primary" onClick={() => setIsCreateOpen(true)}>Create Project</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {projects.map((proj) => (
                  <ProjectCard
                    key={proj.id}
                    project={proj}
                    onOpenTriggerAlert={(p) => setTargetProjectForAlert(p)}
                    onOpenEditTemplate={(p) => setTargetProjectForEdit(p)}
                    onDeleteSuccess={fetchProjects}
                    showToast={showToast}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* Modals */}
      <CreateProjectModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={fetchProjects} showToast={showToast} />
      <EditTemplateModal project={targetProjectForEdit} isOpen={!!targetProjectForEdit} onClose={() => setTargetProjectForEdit(null)} onSuccess={fetchProjects} showToast={showToast} />
      <CustomAlertModal project={targetProjectForAlert} isOpen={!!targetProjectForAlert} onClose={() => setTargetProjectForAlert(null)} showToast={showToast} />
      <Toast message={toastMsg} />
    </div>
  );
}

// ── Shared style helpers ────────────────────────────────────────────────────
const hdr = {
  bar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 24px',
    background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px',
    marginBottom: '24px',
  },
  brand: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
  title: {
    fontSize: '1.25rem', fontWeight: '850',
    background: 'linear-gradient(90deg, #10b981, #3b82f6)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
};

const badge = {
  display: 'inline-flex', padding: '8px 16px', borderRadius: '30px',
  background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
  color: '#34d399', fontSize: '0.85rem', fontWeight: '700',
  marginBottom: '16px', gap: '6px', alignItems: 'center',
};

const card = {
  padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px',
  border: '1px solid rgba(99, 102, 241, 0.25)',
};
const cardTitle = { fontSize: '1.25rem', fontWeight: '800', color: '#fff', marginBottom: '6px' };
const cardDesc  = { fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 };

function cardIcon(color, alpha) {
  return {
    width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
    background: `rgba(${hexToRgb(color)}, ${alpha})`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}
