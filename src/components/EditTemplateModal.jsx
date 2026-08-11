import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Code, X, Sparkles } from 'lucide-react';

export default function EditTemplateModal({ project, isOpen, onClose, onSuccess, showToast }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [htmlTemplate, setHtmlTemplate] = useState('');
  const [cssStyle, setCssStyle] = useState('');
  const [duration, setDuration] = useState(7000);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && project) {
      setName(project.name || '');
      setDescription(project.description || '');
      setHtmlTemplate(project.html_template || '');
      setCssStyle(project.css_style || '');
      setDuration(project.duration || 7000);
    }
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const updateData = {
      name,
      description,
      html_template: htmlTemplate,
      css_style: cssStyle,
      duration: Number(duration)
    };

    try {
      await api.updateProject(project.uuid, updateData);
      showToast('✅ Donation Overlay Template updated successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      showToast('❌ ' + (err.message || 'Failed to update template'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '20px'
    }}>
      <div className="glass-card fade-in" style={{
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflowY: 'auto',
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
          <X size={22} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Code size={24} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff' }}>
              Edit Donation Overlay Template
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Project UUID: <strong style={{ color: '#6ee7b7', fontFamily: 'var(--font-mono)' }}>{project.uuid}</strong>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Project Name</label>
              <input
                type="text"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Event Type (Fixed)</label>
              <input
                type="text"
                className="input-field"
                value="donation"
                disabled
                style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', fontWeight: '700' }}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Description</label>
            <input
              type="text"
              className="input-field"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Project description..."
            />
          </div>

          <div className="input-group">
            <label className="input-label">Required Template Placeholders</label>
            <div style={{
              background: 'rgba(13, 18, 29, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '0.85rem',
              color: '#34d399',
              fontFamily: 'var(--font-mono)'
            }}>
              {"{{name}}"} (Donor Name), {"{{amount}}"} (Donation Amount), {"{{message}}"} (Donation Message)
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">HTML Template String</label>
            <textarea
              className="input-field"
              rows={6}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
              value={htmlTemplate}
              onChange={(e) => setHtmlTemplate(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">CSS Styling</label>
            <textarea
              className="input-field"
              rows={6}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
              value={cssStyle}
              onChange={(e) => setCssStyle(e.target.value)}
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
            disabled={saving}
            style={{ width: '100%', justifyContent: 'center', marginTop: '16px', padding: '14px' }}
          >
            <Sparkles size={18} />
            <span>{saving ? 'Saving Changes...' : 'Save Donation Template'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
