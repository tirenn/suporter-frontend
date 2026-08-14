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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label className="input-label" style={{ margin: 0 }}>HTML Template String (Kosong = Default Cartoon)</label>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                onClick={() => {
                  setHtmlTemplate(`<div class="cartoon-alert-container">\n  <div class="cartoon-header">\n    <div class="cartoon-sparkle">💥</div>\n    <div class="cartoon-badge">Suporter datang!!!</div>\n    <div class="cartoon-sparkle">⚡</div>\n  </div>\n  <div class="cartoon-hero">\n    <span class="cartoon-name">{{name}}</span>\n    <span class="cartoon-action">mengirimkan</span>\n    <span class="cartoon-amount">Rp {{amount}}</span>\n  </div>\n  <div class="cartoon-message-bubble">\n    <p class="cartoon-message">{{message}}</p>\n  </div>\n</div>`);
                  setCssStyle(`@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700;800&family=Nunito:wght@700;800;900&display=swap');\n\n.cartoon-alert-container {\n  background: linear-gradient(135deg, #FFF066 0%, #FFB800 50%, #FF8A00 100%);\n  border: 4px solid #1E293B;\n  border-radius: 24px;\n  padding: 24px 28px;\n  max-width: 480px;\n  box-shadow: 6px 8px 0px #0F172A, 0 20px 40px rgba(0, 0, 0, 0.25);\n  font-family: 'Fredoka', 'Nunito', sans-serif;\n  text-align: center;\n  position: relative;\n  overflow: hidden;\n  animation: cartoonPopIn 0.55s cubic-bezier(0.175, 0.885, 0.32, 1.275);\n}\n\n.cartoon-header { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px; }\n.cartoon-sparkle { font-size: 1.4rem; animation: cartoonBounce 0.8s infinite alternate ease-in-out; }\n.cartoon-badge { background: #FF4757; color: #FFFFFF; border: 3px solid #1E293B; border-radius: 50px; padding: 4px 18px; font-size: 1rem; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; box-shadow: 3px 3px 0px #1E293B; transform: rotate(-1deg); }\n.cartoon-hero { font-size: 1.35rem; font-weight: 800; color: #1E293B; line-height: 1.35; margin-bottom: 14px; text-shadow: 1px 1px 0px rgba(255, 255, 255, 0.6); }\n.cartoon-name { color: #2E5BFF; font-weight: 900; text-decoration: underline wavy #FF4757; padding: 0 4px; }\n.cartoon-action { color: #1E293B; font-weight: 700; margin: 0 4px; }\n.cartoon-amount { color: #059669; background: #FFFFFF; border: 2.5px solid #1E293B; border-radius: 12px; padding: 2px 10px; font-weight: 900; display: inline-block; box-shadow: 2px 3px 0px #1E293B; margin-left: 4px; }\n.cartoon-message-bubble { background: #FFFFFF; border: 3.5px solid #1E293B; border-radius: 18px; padding: 12px 18px; box-shadow: 4px 4px 0px #1E293B; position: relative; margin-top: 6px; }\n.cartoon-message { font-family: 'Nunito', sans-serif; font-size: 1.05rem; font-weight: 800; color: #1E293B; line-height: 1.4; margin: 0; word-break: break-word; }\n@keyframes cartoonPopIn { 0% { transform: scale(0.4) rotate(-8deg); opacity: 0; } 70% { transform: scale(1.06) rotate(2deg); opacity: 1; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }\n@keyframes cartoonBounce { from { transform: translateY(0) scale(1); } to { transform: translateY(-5px) scale(1.15); } }`);
                }}
              >
                <Sparkles size={13} /> Load Cartoon Preset
              </button>
            </div>
            <textarea
              className="input-field"
              rows={6}
              placeholder="Biarkan kosong untuk menggunakan template bawaan Cartoon..."
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
              value={htmlTemplate}
              onChange={(e) => setHtmlTemplate(e.target.value)}
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
