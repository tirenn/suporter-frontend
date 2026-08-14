import React, { useState, useEffect } from 'react';
import { BACKEND_URL, api, executeRecaptcha, getStoredToken, getStoredUser, setStoredToken, setStoredUser } from './api/client';
import {
  Tv, Plus, Sparkles, Shield, ArrowLeft, Landmark,
  Copy, Check, Heart, ExternalLink, Edit3, Save, X,
  Eye, EyeOff, AlertTriangle,
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
  const [copiedWebhookSecret, setCopiedWebhookSecret] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [zoomedQRIS, setZoomedQRIS] = useState(false);
  const [regeneratingKey, setRegeneratingKey] = useState(false);
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

      // Fetch fresh profile from backend on reload to ensure active status is always up-to-date
      api.getProfile()
        .then((freshUser) => {
          if (freshUser) {
            setUser(freshUser);
            setStoredUser(freshUser);
            setQrisInput(freshUser.qris_url || '');
          }
        })
        .catch((err) => {
          console.warn('Could not refresh profile from server:', err);
        });
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
    
    if (authMode === 'register') {
      if (authName.trim().length < 3) {
        showToast('⚠️ Nama lengkap harus minimal 3 karakter');
        return;
      }
      if (authUsername.trim().length < 3) {
        showToast('⚠️ Username harus minimal 3 karakter');
        return;
      }
      if (authPassword.length < 8) {
        showToast('⚠️ Password harus minimal 8 karakter');
        return;
      }
      if (!/[A-Z]/.test(authPassword)) {
        showToast('⚠️ Password harus mengandung minimal satu huruf kapital');
        return;
      }
      if (!/\d/.test(authPassword)) {
        showToast('⚠️ Password harus mengandung minimal satu angka (0-9)');
        return;
      }
      if (!/[!@#$%^&*(),.?":{}|<>_+\-=\[\]\\\/~`]/.test(authPassword)) {
        showToast('⚠️ Password harus mengandung minimal satu simbol/karakter khusus');
        return;
      }
    }
    
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

  function handleCopyWebhookSecret(secret) {
    navigator.clipboard.writeText(secret).then(() => {
      setCopiedWebhookSecret(true);
      showToast('📋 Webhook Secret copied!');
      setTimeout(() => setCopiedWebhookSecret(false), 2000);
    });
  }

  async function executeWebhookKeyRegen() {
    setShowRegenConfirm(false);
    setRegeneratingKey(true);
    try {
      const updatedUser = await api.regenerateWebhookKey();
      setStoredUser(updatedUser);
      setUser(updatedUser);
      showToast("✅ Webhook Key berhasil diperbarui!");
    } catch (err) {
      showToast("❌ " + (err.message || "Gagal memperbarui Webhook Key"));
    } finally {
      setRegeneratingKey(false);
    }
  }

  function handleGoToDonate(e) {
    e.preventDefault();
    const slug = donateTarget.trim().toLowerCase();
    if (!slug) return;
    window.location.href = `/suporter/${encodeURIComponent(slug)}`;
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 20px 60px' }}>

      {/* Header */}
      <header style={hdr.bar}>
        <div style={hdr.brand} onClick={() => view !== 'dashboard' && setView('landing')}>
          <img src="/logo.png" alt="Suporter Logo" style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
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
                <p style={cardDesc}>Support your favorite content creator with instant OBS donation alert triggers.</p>
              </div>
              <form onSubmit={handleGoToDonate} style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Streamer username..."
                  value={donateTarget}
                  onChange={(e) => setDonateTarget(e.target.value)}
                  style={{ flex: 1, padding: '10px 14px', fontSize: '0.9rem' }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '10px 16px', background: '#10b981' }}>
                  Go →
                </button>
              </form>
            </div>
          </div>
        </main>
      )}

      {/* ── STREAMER LOGIN ── */}
      {view === 'streamer-login' && (
        <main className="fade-in" style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '36px', textAlign: 'center' }}>
            <img src="/logo.png" alt="Suporter" style={{ width: '120px', height: '120px', objectFit: 'contain', marginBottom: '16px' }} />
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
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    className="input-field" 
                    placeholder="••••••••" 
                    value={authPassword} 
                    onChange={(e) => setAuthPassword(e.target.value)} 
                    required 
                    style={{ paddingRight: '46px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} color="var(--text-muted)" /> : <Eye size={18} color="var(--text-muted)" />}
                  </button>
                </div>
                {authMode === 'register' && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: '1.4' }}>
                    🔒 Min. 8 karakter, wajib kombinasi huruf kapital (A-Z), angka (0-9), & simbol (@#$%).
                  </p>
                )}
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '14px', width: '100%', justifyContent: 'center' }}>
                {authMode === 'login' ? 'Sign In as Streamer' : 'Create Streamer Profile'}
              </button>
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem' }}>
              {authMode === 'login' ? (
                <span style={{ color: 'var(--text-muted)' }}>
                  Don't have an account?{' '}
                  <button className="btn-link" style={{ color: '#818cf8', fontWeight: '700' }} onClick={() => { setAuthMode('register'); setShowPassword(false); }}>Register here</button>
                </span>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>
                  Already have an account?{' '}
                  <button className="btn-link" style={{ color: '#818cf8', fontWeight: '700' }} onClick={() => { setAuthMode('login'); setShowPassword(false); }}>Sign in here</button>
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
            {!user.is_active && (
              <div className="glass-card" style={{ padding: '16px 24px', border: '1px solid rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.08)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                <div>
                  <h5 style={{ fontWeight: '800', color: '#fca5a5', margin: 0, fontSize: '0.9rem' }}>Akun Belum Aktif</h5>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '4px 0 0' }}>
                    Silakan hubungi support/admin untuk mengaktifkan akun Anda agar dapat menerima donasi dari pemirsa.
                  </p>
                </div>
              </div>
            )}

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
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-secondary" onClick={() => handleCopyWebhookKey(user.webhook_key)} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                      {copiedWebhookKey ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                      <span>{copiedWebhookKey ? 'Copied Key!' : 'Copy Key'}</span>
                    </button>
                    <button 
                      className="btn-secondary" 
                      onClick={() => setShowRegenConfirm(true)}
                      disabled={regeneratingKey}
                      style={{ padding: '8px 16px', fontSize: '0.85rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#fca5a5' }}
                    >
                      <span>{regeneratingKey ? 'Regenerating...' : 'Regenerate Keys'}</span>
                    </button>
                  </div>
                </div>

                {/* Webhook Secret (HMAC Signing Secret) */}
                {user.webhook_secret && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <span style={{ fontSize: '0.78rem', fontWeight: '750', textTransform: 'uppercase', color: 'var(--text-muted)' }}>HMAC Webhook Secret</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: '#fca5a5', letterSpacing: !showWebhookSecret ? '0.15em' : 'normal' }}>
                            {showWebhookSecret ? user.webhook_secret : '••••••••••••••••••••••••••••••••'}
                          </span>
                          <button
                            onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                            title={showWebhookSecret ? 'Hide Webhook Secret' : 'Show Webhook Secret'}
                          >
                            {showWebhookSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                      <button className="btn-secondary" onClick={() => handleCopyWebhookSecret(user.webhook_secret)} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                        {copiedWebhookSecret ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                        <span>{copiedWebhookSecret ? 'Copied Secret!' : 'Copy Secret'}</span>
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '12px', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  ℹ️ Webhook calls require <code style={{ color: '#fef08a', fontFamily: 'var(--font-mono)' }}>X-Suporter-Key</code> and HMAC-SHA256 signature <code style={{ color: '#fef08a', fontFamily: 'var(--font-mono)' }}>X-Suporter-Signature</code> with timestamp.
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
                      <a href={`/suporter/${user.username}`} target="_blank" rel="noreferrer" style={{ color: '#34d399', textDecoration: 'underline' }}>
                        /suporter/{user.username}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {!user.qris_url ? (
                    <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px dashed rgba(239, 68, 68, 0.3)', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                      <span style={{ fontSize: '0.85rem', color: '#fca5a5' }}>
                        <strong>QRIS URL Kosong:</strong> Halaman donasi Anda tidak dapat menampilkan QRIS. Klik "Edit QRIS URL" untuk menambahkan.
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#34d399', wordBreak: 'break-all' }}>{user.qris_url}</span>
                      </div>
                      <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600' }}>QRIS Image Preview (click to zoom):</p>
                        <img 
                           src={user.qris_url} 
                           alt="QRIS Preview" 
                           style={{ width: '160px', height: '160px', objectFit: 'contain', borderRadius: '8px', background: '#fff', padding: '6px', cursor: 'zoom-in' }} 
                           onClick={() => setZoomedQRIS(true)}
                           onError={(e) => { e.target.style.display = 'none'; }} 
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Donation page link */}
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Heart size={14} color="#34d399" />
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Bagikan link donasi kamu:{' '}
                  <a
                    href={`/suporter/${user.username}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#34d399', fontWeight: '700', textDecoration: 'none' }}
                  >
                    {window.location.origin}/suporter/{user.username}
                  </a>
                </span>
              </div>
            </div>

            {/* Projects Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff' }}>OBS Overlay Widget</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {projects.length > 0
                    ? 'Browser Source aktif untuk overlay live streaming OBS Studio kamu.'
                    : 'Kamu belum memiliki OBS Overlay Widget. Buat project overlay kamu di bawah.'}
                </p>
              </div>

              {projects.length === 0 ? (
                <button className="btn-primary" onClick={() => setIsCreateOpen(true)}>
                  <Plus size={18} /><span>Buat Project Overlay</span>
                </button>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  color: '#34d399',
                  fontWeight: '700'
                }}>
                  <span>✅ 1 Overlay Aktif (Maks. 1 Project)</span>
                </div>
              )}
            </div>

            {projects.length === 0 ? (
              <div className="glass-card" style={{ padding: '50px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <Tv size={48} color="var(--text-muted)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff' }}>Belum Ada Project Overlay</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '400px' }}>
                  Buat project overlay untuk mendapatkan URL browser source yang siap dipasang langsung di OBS Studio.
                </p>
                <button className="btn-primary" onClick={() => setIsCreateOpen(true)}>
                  <Plus size={18} /><span>Buat Project Sekarang</span>
                </button>
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
      
      {/* QRIS Zoom Modal */}
      {zoomedQRIS && (
        <div 
          onClick={() => setZoomedQRIS(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, cursor: 'zoom-out'
          }}
        >
          <div 
            style={{ position: 'relative', background: '#fff', padding: '16px', borderRadius: '16px', maxWidth: '90%', maxHeight: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} 
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={user.qris_url} 
              alt="QRIS Enlarged" 
              style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '8px', background: '#fff' }} 
            />
            <p style={{ color: '#0f172a', fontSize: '0.85rem', fontWeight: '750', marginTop: '12px', textAlign: 'center' }}>
              QRIS @{user.username}
            </p>
            <button 
              onClick={() => setZoomedQRIS(false)}
              className="btn-secondary"
              style={{ marginTop: '12px', padding: '6px 14px', borderColor: '#cbd5e1', color: '#334155' }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Webhook Key Regenerate Confirmation Modal */}
      {showRegenConfirm && (
        <div 
          onClick={() => setShowRegenConfirm(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div 
            style={{ 
              background: '#1e293b', padding: '28px', borderRadius: '16px', 
              maxWidth: '440px', width: '90%', display: 'flex', flexDirection: 'column', gap: '16px',
              border: '1px solid rgba(239, 68, 68, 0.3)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#fca5a5' }}>
              <AlertTriangle size={24} />
              <h4 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>Regenerate Webhook Key?</h4>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
              Kunci webhook lama Anda akan <strong>segera tidak aktif</strong>. Seluruh integrasi eksternal (misalnya server payment gateway atau bank forwarder) tidak akan bisa mengirimkan update pembayaran donasi ke sistem Overlay live streaming Anda sampai Anda memperbaruinya dengan kunci baru.
            </p>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px', justifyContent: 'flex-end' }}>
              <button 
                className="btn-secondary" 
                onClick={() => setShowRegenConfirm(false)}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Batal
              </button>
              <button 
                className="btn-primary" 
                onClick={executeWebhookKeyRegen}
                style={{ padding: '8px 16px', fontSize: '0.85rem', background: 'linear-gradient(90deg, #ef4444, #dc2626)' }}
              >
                Ya, Regenerate
              </button>
            </div>
          </div>
        </div>
      )}

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
