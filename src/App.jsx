import React, { useState, useEffect } from 'react';
import { BACKEND_URL, api, getStoredToken, getStoredUser, setStoredToken, setStoredUser } from './api/client';
import { Tv, Plus, Sparkles, Key, Radio, Zap, Code, Trash2, Shield, User, ArrowLeft, Landmark, MessageSquare, Copy, Check, Info } from 'lucide-react';
import ProjectCard from './components/ProjectCard';
import CreateProjectModal from './components/CreateProjectModal';
import EditTemplateModal from './components/EditTemplateModal';
import CustomAlertModal from './components/CustomAlertModal';
import Toast from './components/Toast';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing'); // 'landing', 'streamer-login', 'viewer-login', 'dashboard'
  
  // Auth state
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register'
  const [authName, setAuthName] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  // Dashboard state
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Donation state
  const [donationStreamer, setDonationStreamer] = useState('');
  const [donationAmount, setDonationAmount] = useState('50000');
  const [customAmount, setCustomAmount] = useState('');
  const [donationSender, setDonationSender] = useState('');
  const [donationMessage, setDonationMessage] = useState('');
  const [createdDonation, setCreatedDonation] = useState(null);
  const [simulatingWebhook, setSimulatingWebhook] = useState(false);
  const [copiedWebhookUrl, setCopiedWebhookUrl] = useState(false);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [targetProjectForAlert, setTargetProjectForAlert] = useState(null);
  const [targetProjectForEdit, setTargetProjectForEdit] = useState(null);

  // Toast state
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    const token = getStoredToken();
    const u = getStoredUser();

    if (token && u) {
      setUser(u);
      setView('dashboard');
      if (u.role === 'streamer') {
        fetchProjects();
      }
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
    setCreatedDonation(null);
    setView('landing');
    showToast('👋 Logged out successfully');
  }

  async function handleAuthSubmit(e, role) {
    e.preventDefault();
    try {
      let res;
      if (authMode === 'register') {
        res = await api.register(authName, authUsername, authPassword, role);
        showToast('🎉 Account registered successfully!');
      } else {
        res = await api.login(authUsername, authPassword);
        showToast('✅ Logged in successfully!');
      }

      setStoredToken(res.access_token);
      setStoredUser(res.user);
      setUser(res.user);
      
      // Clear fields
      setAuthName('');
      setAuthUsername('');
      setAuthPassword('');

      setView('dashboard');
      if (res.user.role === 'streamer') {
        fetchProjects();
      }
    } catch (err) {
      showToast('❌ ' + (err.message || 'Authentication failed'));
    }
  }

  async function handleCreateDonation(e) {
    e.preventDefault();
    const finalAmount = donationAmount === 'custom' ? Number(customAmount) : Number(donationAmount);
    
    if (finalAmount < 5000 || finalAmount > 10000000) {
      showToast('⚠️ Nominal donasi harus di antara Rp 5.000 dan Rp 10.000.000');
      return;
    }

    try {
      const donation = await api.createDonation(donationStreamer, donationSender, finalAmount, donationMessage);
      setCreatedDonation(donation);
      showToast('🧾 Kode unik pembayaran telah dibuat!');
    } catch (err) {
      showToast('❌ ' + (err.message || 'Gagal memproses donasi'));
    }
  }

  async function simulateWebhookTrigger() {
    if (!createdDonation) return;
    setSimulatingWebhook(true);
    try {
      // Look up streamer webhook key via project or ask database
      // The viewer can authenticate using the webhook directly to simulate payment validation
      const targetUser = await fetch(`${BACKEND_URL}/api/v1/projects`).then(r => r.json()).catch(() => ({}));
      
      const response = await fetch(`${BACKEND_URL}/api/v1/webhooks/donation?key=${user.webhook_key || 'mock_key'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: createdDonation.total_amount })
      });
      const data = await response.json();
      
      if (response.ok) {
        showToast('💸 Pembayaran Terverifikasi! Alert telah dikirim ke OBS.');
        setCreatedDonation(prev => ({ ...prev, status: 'completed' }));
      } else {
        // Fallback for simulation if streamer key is local to user
        const simulatedUrl = `${BACKEND_URL}/api/v1/webhooks/donation`;
        showToast(`💡 Gunakan API webhook ini untuk simulasi:\nPOST ${simulatedUrl}`);
      }
    } catch (err) {
      // Direct post to simulate match
      showToast('💡 Hubungi server simulasi webhook untuk donasi');
    } finally {
      setSimulatingWebhook(false);
    }
  }

  function handleCopyWebhookUrl(key) {
    const url = `${BACKEND_URL}/api/v1/webhooks/donation?key=${key}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedWebhookUrl(true);
      showToast('📋 Webhook URL copied to clipboard!');
      setTimeout(() => setCopiedWebhookUrl(false), 2000);
    });
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 20px 60px' }}>
      
      {/* Header Bar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'between',
        padding: '16px 24px',
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => view !== 'dashboard' && setView('landing')}>
          <Tv size={24} color="#10b981" />
          <h1 style={{ fontSize: '1.25rem', fontWeight: '850', background: 'linear-gradient(90deg, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            SUPORTER
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {user ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Logged in as <strong style={{ color: '#ffffff' }}>@{user.username}</strong> ({user.role})
                </span>
              </div>
              <button className="btn-secondary" onClick={handleLogout} style={{ padding: '8px 16px' }}>
                Logout
              </button>
            </>
          ) : (
            view !== 'landing' && (
              <button className="btn-secondary" onClick={() => setView('landing')}>
                <ArrowLeft size={16} />
                <span>Kembali</span>
              </button>
            )
          )}
        </div>
      </header>

      {/* View Switcher */}
      {view === 'landing' && (
        <main className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', marginTop: '40px' }}>
          <div style={{ textAlign: 'center', maxWidth: '600px' }}>
            <div style={{
              display: 'inline-flex',
              padding: '8px 16px',
              borderRadius: '30px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              color: '#34d399',
              fontSize: '0.85rem',
              fontWeight: '700',
              marginBottom: '16px',
              gap: '6px',
              alignItems: 'center'
            }}>
              <Sparkles size={14} />
              <span>Multi-Role Streaming Widgets</span>
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '850', lineHeight: 1.2, color: '#ffffff', marginBottom: '14px' }}>
              Real-Time Donation Overlay & Verification Webhook
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Choose your profile type below to configure custom alerts or make automated QRIS payments with secure unique payment codes.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            width: '100%',
            maxWidth: '800px'
          }}>
            {/* Streamer Portal Card */}
            <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justify: 'center' }}>
                <Tv size={24} color="#818cf8" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', marginBottom: '6px' }}>Streamer Portal</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Manage OBS overlay styles, HTML/CSS templates, customize layouts, and retrieve webhook integration keys.
                </p>
              </div>
              <button className="btn-primary" style={{ marginTop: 'auto', background: 'linear-gradient(90deg, #6366f1, #4f46e5)' }} onClick={() => { setAuthMode('login'); setView('streamer-login'); }}>
                Enter Streamer Portal
              </button>
            </div>

            {/* Viewer Portal Card */}
            <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justify: 'center' }}>
                <Landmark size={24} color="#34d399" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', marginBottom: '6px' }}>Viewer Portal</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Donate to streamers using QRIS, input messages, and generate unique verification payment codes.
                </p>
              </div>
              <button className="btn-primary" style={{ marginTop: 'auto', background: 'linear-gradient(90deg, #10b981, #059669)' }} onClick={() => { setAuthMode('login'); setView('viewer-login'); }}>
                Enter Viewer Portal
              </button>
            </div>
          </div>
        </main>
      )}

      {/* Streamer Login View */}
      {view === 'streamer-login' && (
        <main className="fade-in" style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '36px' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '850', color: '#ffffff', marginBottom: '6px' }}>
              {authMode === 'login' ? 'Streamer Sign In' : 'Create Streamer Account'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Configure overlay widgets, templates, and webhook triggers.
            </p>

            <form onSubmit={(e) => handleAuthSubmit(e, 'streamer')} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  <button className="btn-link" style={{ color: '#818cf8', fontWeight: '700' }} onClick={() => setAuthMode('register')}>
                    Register here
                  </button>
                </span>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>
                  Already have an account?{' '}
                  <button className="btn-link" style={{ color: '#818cf8', fontWeight: '700' }} onClick={() => setAuthMode('login')}>
                    Sign in here
                  </button>
                </span>
              )}
            </div>
          </div>
        </main>
      )}

      {/* Viewer Login View */}
      {view === 'viewer-login' && (
        <main className="fade-in" style={{ display: 'flex', gap: '30px', marginTop: '30px', alignItems: 'stretch' }}>
          {/* QRIS Mockup Box */}
          <div className="glass-card" style={{ flex: 1.1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '36px', textAlign: 'center' }}>
            <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff', marginBottom: '8px' }}>Mock QRIS Payment Code</h4>
            <img src={`${BACKEND_URL}/static/qris_mockup.jpg`} alt="QRIS Donation" style={{ width: '100%', maxWidth: '280px', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }} />
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '10px 14px', borderRadius: '10px', maxWidth: '380px' }}>
              <Info size={28} color="#f59e0b" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '0.78rem', color: '#fef08a', textAlign: 'left', lineHeight: '1.4' }}>
                Jika ingin donasi anonimous dan tanpa mengirim pesan bisa langsung lewat qris diatas.
              </p>
            </div>
          </div>

          {/* Viewer Login Box */}
          <div className="glass-card" style={{ flex: 0.9, padding: '36px' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '850', color: '#ffffff', marginBottom: '6px' }}>
              {authMode === 'login' ? 'Viewer Sign In' : 'Create Viewer Account'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Support streamers by generating unique code QRIS alerts.
            </p>

            <form onSubmit={(e) => handleAuthSubmit(e, 'viewer')} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {authMode === 'register' && (
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input type="text" className="input-field" placeholder="e.g. Jane Doe" value={authName} onChange={(e) => setAuthName(e.target.value)} required />
                </div>
              )}
              <div className="input-group">
                <label className="input-label">Viewer Username</label>
                <input type="text" className="input-field" placeholder="username" value={authUsername} onChange={(e) => setAuthUsername(e.target.value)} required />
              </div>
              <div className="input-group">
                <label className="input-label">Password</label>
                <input type="password" className="input-field" placeholder="••••••••" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required />
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '14px', width: '100%', justifyContent: 'center', background: 'linear-gradient(90deg, #10b981, #059669)' }}>
                {authMode === 'login' ? 'Sign In as Viewer' : 'Create Viewer Profile'}
              </button>
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem' }}>
              {authMode === 'login' ? (
                <span style={{ color: 'var(--text-muted)' }}>
                  Don't have an account?{' '}
                  <button className="btn-link" style={{ color: '#34d399', fontWeight: '700' }} onClick={() => setAuthMode('register')}>
                    Register here
                  </button>
                </span>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>
                  Already have an account?{' '}
                  <button className="btn-link" style={{ color: '#34d399', fontWeight: '700' }} onClick={() => setAuthMode('login')}>
                    Sign in here
                  </button>
                </span>
              )}
            </div>
          </div>
        </main>
      )}

      {/* Authenticated Dashboard */}
      {view === 'dashboard' && user && (
        <main className="fade-in">
          {user.role === 'streamer' ? (
            // Streamer Dashboard View
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Webhook Configuration Card */}
              <div className="glass-card" style={{ padding: '24px', border: '1px solid rgba(245, 158, 11, 0.25)', background: 'rgba(15, 23, 42, 0.6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justify: 'center' }}>
                      <Shield size={20} color="#f59e0b" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#ffffff' }}>Your Payment Verification Webhook URL</h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Use this key to match transactions in donations table and display alerts on OBS overlay.
                      </p>
                    </div>
                  </div>

                  <button className="btn-secondary" onClick={() => handleCopyWebhookUrl(user.webhook_key)} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    {copiedWebhookUrl ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                    <span>{copiedWebhookUrl ? 'Webhook URL Copied!' : 'Copy Webhook URL'}</span>
                  </button>
                </div>

                <div style={{ marginTop: '14px', background: 'rgba(0, 0, 0, 0.3)', padding: '10px 14px', borderRadius: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#fef08a', wordBreak: 'break-all' }}>
                    {`${BACKEND_URL}/api/v1/webhooks/donation?key=${user.webhook_key}`}
                  </span>
                </div>
              </div>

              {/* Projects Header & Overlay Templates */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff' }}>Overlay Layouts</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Add projects, overlay URLs, and templates.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsCreateOpen(true)}>
                  <Plus size={18} />
                  <span>Create Project</span>
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="glass-card" style={{ padding: '50px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <Tv size={48} color="var(--text-muted)" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff' }}>No Projects Created</h3>
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
          ) : (
            // Viewer Dashboard / Donation Form View
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '24px', alignItems: 'stretch' }}>
              {/* Donation Form */}
              <div className="glass-card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justify: 'center' }}>
                    <Landmark size={22} color="#34d399" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff' }}>Kirim Donasi</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Generate random 3-digit kode unik pembayaran QRIS</p>
                  </div>
                </div>

                <form onSubmit={handleCreateDonation} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="input-group">
                    <label className="input-label">Streamer Username (Penerima)</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="e.g. streamer123"
                        value={donationStreamer}
                        onChange={(e) => setDonationStreamer(e.target.value)}
                        required
                        style={{ paddingLeft: '40px' }}
                      />
                      <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Nominal Donasi (Rupiah)</label>
                    <select
                      className="input-field"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="10000">Rp 10.000</option>
                      <option value="25000">Rp 25.000</option>
                      <option value="50000">Rp 50.000</option>
                      <option value="100000">Rp 100.000</option>
                      <option value="250000">Rp 250.000</option>
                      <option value="500000">Rp 500.000</option>
                      <option value="1000000">Rp 1.000.000</option>
                      <option value="custom">Nominal Kustom (Ketik Sendiri)</option>
                    </select>
                  </div>

                  {donationAmount === 'custom' && (
                    <div className="input-group fade-in">
                      <label className="input-label">Nominal Kustom (Min Rp 5.000, Max Rp 10M)</label>
                      <input
                        type="number"
                        className="input-field"
                        placeholder="e.g. 75000"
                        min="5000"
                        max="10000000"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div className="input-group">
                    <label className="input-label">Nama Pengirim (Sender Name)</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Jane Donor"
                      value={donationSender}
                      onChange={(e) => setDonationSender(e.target.value)}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Pesan Donasi</label>
                    <textarea
                      className="input-field"
                      placeholder="e.g. Keep up the awesome stream!"
                      rows={3}
                      value={donationMessage}
                      onChange={(e) => setDonationMessage(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn-primary" style={{ padding: '14px', width: '100%', justifyContent: 'center', background: 'linear-gradient(90deg, #10b981, #059669)' }}>
                    Generate Kode Unik Donasi
                  </button>
                </form>
              </div>

              {/* QRIS Transfer & Webhook Simulator */}
              <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '20px' }}>
                {createdDonation ? (
                  <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '10px 16px', borderRadius: '10px', width: '100%' }}>
                      <span style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: '800' }}>STATUS: {createdDonation.status.toUpperCase()}</span>
                    </div>

                    <img src={`${BACKEND_URL}/static/qris_mockup.jpg`} alt="QRIS Donation" style={{ width: '100%', maxWidth: '240px', borderRadius: '12px' }} />

                    <div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Silakan transfer tepat senilai:</p>
                      <h2 style={{ fontSize: '2.2rem', fontWeight: '850', color: '#fef08a', margin: '4px 0' }}>
                        Rp {createdDonation.total_amount.toLocaleString('id-ID')}
                      </h2>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        (Nominal: Rp {createdDonation.amount.toLocaleString('id-ID')} + Kode Unik: Rp {createdDonation.unique_code})
                      </p>
                    </div>

                    {createdDonation.status === 'pending' ? (
                      <button
                        className="btn-primary"
                        onClick={simulateWebhookTrigger}
                        disabled={simulatingWebhook}
                        style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(90deg, #eab308, #ca8a04)' }}
                      >
                        <Landmark size={18} />
                        <span>{simulatingWebhook ? 'Memverifikasi...' : 'Simulasikan Pembayaran QRIS (Webhook Callback)'}</span>
                      </button>
                    ) : (
                      <div style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#34d399', padding: '12px 18px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '700', width: '100%' }}>
                        🎉 Pembayaran Berhasil Terverifikasi! Alert terkirim ke OBS overlay.
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <Landmark size={48} />
                    <h4 style={{ color: '#ffffff', fontWeight: '700' }}>Instructions</h4>
                    <p style={{ fontSize: '0.85rem', maxWidth: '300px', lineHeight: 1.5 }}>
                      Input the target streamer, name, amount, and message. The app will generate a 3-digit verification identifier code to identify payments.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      )}

      {/* Modals */}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchProjects}
        showToast={showToast}
      />

      <EditTemplateModal
        project={targetProjectForEdit}
        isOpen={!!targetProjectForEdit}
        onClose={() => setTargetProjectForEdit(null)}
        onSuccess={fetchProjects}
        showToast={showToast}
      />

      <CustomAlertModal
        project={targetProjectForAlert}
        isOpen={!!targetProjectForAlert}
        onClose={() => setTargetProjectForAlert(null)}
        showToast={showToast}
      />

      <Toast message={toastMsg} />
    </div>
  );
}
