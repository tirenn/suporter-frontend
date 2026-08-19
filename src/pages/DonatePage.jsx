import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BACKEND_URL, executeRecaptcha, api } from '../api/client';
import { trackEvent } from '../utils/analytics';
import {
  Tv, Heart, User, MessageSquare, Landmark, AlertTriangle,
  CheckCircle, Loader, ArrowLeft, RefreshCw, Clock,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Amount options — multiples of Rp 5.000, sensible list
// ---------------------------------------------------------------------------
const AMOUNT_OPTIONS = [
  5_000, 10_000, 15_000, 20_000, 25_000, 30_000, 35_000, 40_000, 45_000,
  50_000, 75_000, 100_000, 150_000, 200_000, 250_000, 500_000, 1_000_000,
];

function formatRupiah(n) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

// ---------------------------------------------------------------------------
// Main DonatePage
// ---------------------------------------------------------------------------
export default function DonatePage({ streamerUsername }) {
  // Streamer info
  const [streamer, setStreamer] = useState(null);
  const [loadingStreamer, setLoadingStreamer] = useState(true);
  const [streamerError, setStreamerError] = useState('');

  // Form fields
  const [senderName, setSenderName] = useState('');
  const [amount, setAmount] = useState(5_000);
  const [message, setMessage] = useState('');

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [donation, setDonation] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [rateLimited, setRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);

  // ---------------------------------------------------------------------------
  // Load streamer profile on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    async function load() {
      try {
        const profile = await api.getStreamerProfile(streamerUsername);
        setStreamer(profile);
      } catch (err) {
        setStreamerError(err.message || 'Streamer tidak ditemukan');
      } finally {
        setLoadingStreamer(false);
      }
    }
    load();
  }, [streamerUsername]);

  // Countdown timer when rate-limited
  useEffect(() => {
    if (!rateLimited || retryAfter <= 0) return;
    const id = setInterval(() => {
      setRetryAfter((s) => {
        if (s <= 1) { clearInterval(id); setRateLimited(false); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [rateLimited, retryAfter]);

  // ---------------------------------------------------------------------------
  // ---------------------------------------------------------------------------
  // Submit donation
  // ---------------------------------------------------------------------------
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);

    try {
      const token = await executeRecaptcha('donate');

      const result = await api.createDonation(
        streamerUsername,
        senderName,
        amount,
        message,
        token,
      );
      setDonation(result);
      trackEvent('create_donation', {
        streamer: streamerUsername,
        amount: Number(amount),
        currency: 'IDR',
      });
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('too many') || msg.includes('429') || msg.includes('tunggu')) {
        setRateLimited(true);
        setRetryAfter(120);
        setSubmitError('');
      } else {
        setSubmitError(msg || 'Gagal memproses donasi. Coba lagi.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleDonateAgain() {
    setDonation(null);
    setSenderName('');
    setAmount(5_000);
    setMessage('');
    setSubmitError('');
  }

  // ---------------------------------------------------------------------------
  // LOADING STATE
  // ---------------------------------------------------------------------------
  if (loadingStreamer) {
    return (
      <div style={styles.page}>
        <div style={styles.centered}>
          <Loader size={40} color="#10b981" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--text-muted)', marginTop: '12px' }}>Memuat profil streamer…</p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // STREAMER NOT FOUND
  // ---------------------------------------------------------------------------
  if (streamerError) {
    return (
      <div style={styles.page}>
        <div style={styles.centered}>
          <AlertTriangle size={48} color="#f59e0b" />
          <h2 style={{ color: '#fff', marginTop: '12px' }}>Streamer Tidak Ditemukan</h2>
          <p style={{ color: 'var(--text-muted)' }}>@{streamerUsername} belum terdaftar di Suporter.</p>
          <button className="btn-secondary" style={{ marginTop: '20px' }} onClick={() => window.location.href = '/'}>
            <ArrowLeft size={16} /> Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // SUCCESS STATE
  // ---------------------------------------------------------------------------
  if (donation) {
    return (
      <div style={styles.page}>
        <header style={styles.header}>
          <div style={styles.logo}>
            <Tv size={22} color="#10b981" />
            <span style={styles.logoText}>SUPORTER</span>
          </div>
        </header>

        <main className="fade-in" style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
          <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '40px', textAlign: 'center' }}>
            <CheckCircle size={56} color="#10b981" style={{ marginBottom: '16px' }} />
            <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px' }}>
              Kode Donasi Dibuat! 🎉
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
              Transfer <strong style={{ color: '#fef08a' }}>tepat</strong> sebesar nominal di bawah agar bisa diverifikasi otomatis.
            </p>

            <div style={styles.amountBox}>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Transfer tepat senilai:</p>
              <h1 style={{ fontSize: '2.4rem', fontWeight: '850', color: '#fef08a', margin: '4px 0' }}>
                {formatRupiah(donation.total_amount)}
              </h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                (Nominal {formatRupiah(donation.amount)} + Kode Unik Rp {donation.unique_code})
              </p>
            </div>

            {streamer?.qris_url ? (
              <img
                src={streamer.qris_url}
                alt={`QRIS ${streamer.name}`}
                style={styles.qrisImg}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <img
                src={`${BACKEND_URL}/static/qris_mockup.jpg`}
                alt="QRIS Donation"
                style={styles.qrisImg}
              />
            )}

            <div style={styles.statusBadge}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#34d399' }}>
                STATUS: {donation.status.toUpperCase()}
              </span>
            </div>

            <button
              className="btn-primary"
              onClick={handleDonateAgain}
              style={{ width: '100%', justifyContent: 'center', marginTop: '20px' }}
            >
              <RefreshCw size={16} /> Donasi Lagi
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RATE LIMITED STATE
  // ---------------------------------------------------------------------------
  if (rateLimited) {
    return (
      <div style={styles.page}>
        <header style={styles.header}>
          <div style={styles.logo}>
            <Tv size={22} color="#10b981" />
            <span style={styles.logoText}>SUPORTER</span>
          </div>
        </header>
        <main style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '40px', textAlign: 'center' }}>
            <Clock size={48} color="#f59e0b" style={{ marginBottom: '16px' }} />
            <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '800' }}>Terlalu Cepat!</h2>
            <p style={{ color: 'var(--text-secondary)', margin: '12px 0 24px', fontSize: '0.9rem' }}>
              Kamu bisa donasi lagi dalam:
            </p>
            <div style={{ fontSize: '3rem', fontWeight: '850', color: '#fef08a', letterSpacing: '2px' }}>
              {Math.floor(retryAfter / 60)}:{String(retryAfter % 60).padStart(2, '0')}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '12px' }}>
              Batas 1 donasi per 2 menit per perangkat.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // DONATION FORM
  // ---------------------------------------------------------------------------
  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div onClick={() => window.location.href = '/'} style={{ ...styles.logo, cursor: 'pointer' }}>
          <Tv size={22} color="#10b981" />
          <span style={styles.logoText}>SUPORTER</span>
        </div>
        <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.82rem' }} onClick={() => window.location.href = '/'}>
          <ArrowLeft size={14} /> Beranda
        </button>
      </header>

      {/* Streamer Banner */}
      <div className="fade-in" style={styles.streamerBanner}>
        <div style={styles.streamerAvatar}>
          <Tv size={28} color="#818cf8" />
        </div>
        <div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Donasi untuk</p>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '850', color: '#fff' }}>{streamer.name}</h2>
          <p style={{ fontSize: '0.82rem', color: '#818cf8' }}>@{streamer.username}</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="fade-in" style={styles.grid}>
        {/* QRIS Panel */}
        <div className="glass-card" style={styles.qrisPanel}>
          <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#fff', marginBottom: '16px' }}>
            Scan QRIS untuk Bayar
          </h4>
          {streamer.qris_url ? (
            <img
              src={streamer.qris_url}
              alt={`QRIS ${streamer.name}`}
              style={styles.qrisImgLg}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : (
            <img
              src={`${BACKEND_URL}/static/qris_mockup.jpg`}
              alt="QRIS Donation"
              style={styles.qrisImgLg}
            />
          )}
          {/* Fallback if image fails */}
          <div style={{ display: 'none', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
            <AlertTriangle size={32} color="#f59e0b" />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>
              Gambar QRIS belum tersedia. Hubungi streamer.
            </p>
          </div>
          <div style={styles.infoBox}>
            <p style={{ fontSize: '0.78rem', color: '#fef08a', lineHeight: 1.5 }}>
              💡 Jika donasi langsung tanpa membuat kode unik atau nominal donasi tidak sesuai, pesan Anda tidak akan muncul di live streaming.
            </p>
          </div>
        </div>

        {/* Donation Form */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <div style={styles.formHeader}>
            <div style={styles.formIcon}>
              <Heart size={20} color="#34d399" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fff' }}>Kirim Donasi</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Tidak perlu akun — langsung donasi!</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Sender Display Name */}
            <div className="input-group">
              <label className="input-label">Nama Tampil di Alert OBS</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Jane Donor"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                required
              />
            </div>

            {/* Amount Dropdown — multiples of Rp 5.000 */}
            <div className="input-group">
              <label className="input-label">Nominal Donasi</label>
              <select
                className="input-field"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                style={{ cursor: 'pointer' }}
              >
                {AMOUNT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{formatRupiah(opt)}</option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div className="input-group">
              <label className="input-label">Pesan <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opsional)</span></label>
              <div style={{ position: 'relative' }}>
                <textarea
                  className="input-field"
                  placeholder="e.g. Keep up the awesome stream! 🔥"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ paddingLeft: '40px', resize: 'none' }}
                />
                <MessageSquare size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '13px', top: '14px' }} />
              </div>
            </div>

            {/* Error */}
            {submitError && (
              <div style={styles.errorBox}>
                <AlertTriangle size={16} color="#f87171" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.83rem', color: '#fca5a5' }}>{submitError}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{
                padding: '14px',
                width: '100%',
                justifyContent: 'center',
                background: 'linear-gradient(90deg, #10b981, #059669)',
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? (
                <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Memproses…</>
              ) : (
                <><Landmark size={16} /> Generate Kode Unik Donasi</>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = {
  page: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '20px 20px 60px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 22px',
    background: 'rgba(15, 23, 42, 0.4)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    marginBottom: '24px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoText: {
    fontSize: '1.15rem',
    fontWeight: '850',
    background: 'linear-gradient(90deg, #10b981, #3b82f6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  streamerBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px 28px',
    background: 'rgba(99, 102, 241, 0.08)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: '16px',
    marginBottom: '24px',
  },
  streamerAvatar: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    background: 'rgba(99, 102, 241, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.1fr',
    gap: '24px',
    alignItems: 'start',
  },
  qrisPanel: {
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '16px',
  },
  qrisImgLg: {
    width: '100%',
    maxWidth: '280px',
    borderRadius: '16px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  qrisImg: {
    width: '100%',
    maxWidth: '200px',
    borderRadius: '12px',
    margin: '12px auto',
    display: 'block',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
  },
  infoBox: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
    background: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.25)',
    padding: '10px 14px',
    borderRadius: '10px',
    width: '100%',
    textAlign: 'left',
  },
  formHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  formIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: 'rgba(16, 185, 129, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  amountBox: {
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '12px',
    padding: '16px',
    margin: '8px 0 16px',
  },
  statusBadge: {
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    borderRadius: '8px',
    padding: '8px 16px',
    display: 'inline-block',
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    textAlign: 'center',
    gap: '8px',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: '10px',
    padding: '10px 14px',
  },
};
