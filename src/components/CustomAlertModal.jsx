import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Zap, X, Sparkles } from 'lucide-react';

export default function CustomAlertModal({ project, isOpen, onClose, showToast }) {
  const [name, setName] = useState('Alex Streamer');
  const [amount, setAmount] = useState('$50.00');
  const [message, setMessage] = useState('Keep up the awesome stream!');
  const [duration, setDuration] = useState(7000);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setDuration(project.duration || 7000);
    }
  }, [project]);

  if (!isOpen || !project) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      await api.triggerAlert(project.uuid, { name, amount, message }, Number(duration));
      showToast(`⚡ Donation alert authenticated & triggered to OBS Overlay (${project.name})!`);
      onClose();
    } catch (err) {
      showToast('❌ ' + (err.message || 'Failed to trigger donation alert'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1200,
      padding: '20px'
    }}>
      <div className="glass-card fade-in" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '32px',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={22} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff' }}>
              Trigger Donation Alert
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Project: <strong style={{ color: '#a7f3d0' }}>{project.name}</strong>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Donor Name (Required)</label>
            <input
              type="text"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Streamer"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Donation Amount (Required)</label>
            <input
              type="text"
              className="input-field"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. $50.00"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Donation Message (Required)</label>
            <textarea
              className="input-field"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Keep up the awesome stream!"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Display Duration (ms)</label>
            <input
              type="number"
              className="input-field"
              step="500"
              min="1000"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '12px', padding: '14px' }}
          >
            <Zap size={18} />
            <span>{loading ? 'Triggering...' : 'Broadcast Authenticated Alert'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
