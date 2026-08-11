import React, { useState } from 'react';
import { api } from '../api/client';
import { Zap, X, Bell } from 'lucide-react';

export default function AlertModal({ project, isOpen, onClose, showToast }) {
  const [name, setName] = useState('Alex');
  const [message, setMessage] = useState('Awesome stream! Keep it up!');
  const [type, setType] = useState('donation');
  const [duration, setDuration] = useState(5000);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !project) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      await api.triggerAlert(project.uuid, {
        name,
        message,
        type,
        duration: Number(duration)
      });

      showToast('⚡ Live alert triggered to OBS Overlay!');
      onClose();
    } catch (err) {
      showToast('❌ ' + (err.message || 'Failed to trigger alert'));
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
      zIndex: 1000,
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
            background: 'rgba(99, 102, 241, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bell size={22} color="#818cf8" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff' }}>
              Test Alert Simulator
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Target: <strong style={{ color: '#6ee7b7' }}>{project.name}</strong>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Sender Name</label>
            <input
              type="text"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Alert Message</label>
            <textarea
              className="input-field"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Alert Style Preset</label>
            <select
              className="input-field"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="donation">Donation / Superchat (Gold Accent)</option>
              <option value="sub">Subscriber (Purple Rose Accent)</option>
              <option value="follow">Follower (Cyan Accent)</option>
              <option value="default">Default Message (Indigo Accent)</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Display Duration (ms)</label>
            <input
              type="number"
              className="input-field"
              step="500"
              min="1000"
              max="20000"
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
            <span>{loading ? 'Sending Alert...' : 'Broadcast Alert to OBS Overlay'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
