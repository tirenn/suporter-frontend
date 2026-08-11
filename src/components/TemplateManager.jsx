import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Code, Plus, Trash2, Edit3, X, Sparkles, Zap, Check } from 'lucide-react';

export default function TemplateManager({ project, isOpen, onClose, onOpenTriggerCustom, showToast }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [name, setName] = useState('');
  const [eventType, setEventType] = useState('donation');
  const [htmlTemplate, setHtmlTemplate] = useState('');
  const [cssStyle, setCssStyle] = useState('');
  const [fieldsStr, setFieldsStr] = useState('name, amount, description');
  const [duration, setDuration] = useState(5000);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && project) {
      loadTemplates();
    }
  }, [isOpen, project]);

  async function loadTemplates() {
    setLoading(true);
    try {
      const data = await api.getTemplates(project.uuid);
      setTemplates(data.templates || []);
    } catch (err) {
      showToast('❌ Failed to load templates');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setIsEditing(false);
    setSelectedTemplateId(null);
    setName('');
    setEventType('donation');
    setHtmlTemplate('<div class="my-alert">\n  <h2>💰 {{name}} donated {{amount}}</h2>\n  <p>{{description}}</p>\n</div>');
    setCssStyle('.my-alert { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 12px; }');
    setFieldsStr('name, amount, description');
    setDuration(5000);
  }

  function handleEdit(t) {
    setIsEditing(true);
    setSelectedTemplateId(t.id);
    setName(t.name);
    setEventType(t.event_type);
    setHtmlTemplate(t.html_template);
    setCssStyle(t.css_style || '');
    setDuration(t.duration || 5000);

    let parsedFields = [];
    try {
      parsedFields = JSON.parse(t.fields || '[]');
    } catch (e) {
      parsedFields = [];
    }
    setFieldsStr(parsedFields.join(', '));
  }

  async function handleDelete(tId) {
    if (!window.confirm('Are you sure you want to delete this overlay template?')) return;
    try {
      await api.deleteTemplate(project.uuid, tId);
      showToast('🗑️ Template deleted');
      loadTemplates();
    } catch (err) {
      showToast('❌ Delete failed');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const fieldsArr = fieldsStr
      .split(',')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    const payload = {
      name,
      event_type: eventType,
      html_template: htmlTemplate,
      css_style: cssStyle,
      fields: fieldsArr,
      duration: Number(duration)
    };

    try {
      if (selectedTemplateId) {
        await api.updateTemplate(project.uuid, selectedTemplateId, payload);
        showToast('✅ Template updated successfully!');
      } else {
        await api.createTemplate(project.uuid, payload);
        showToast('🚀 Custom template created!');
      }
      resetForm();
      loadTemplates();
    } catch (err) {
      showToast('❌ ' + (err.message || 'Failed to save template'));
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen || !project) return null;

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
        maxWidth: '900px',
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
            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Code size={24} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff' }}>
              Custom Overlay Templates
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Project: <strong style={{ color: '#818cf8' }}>{project.name}</strong>
            </p>
          </div>
        </div>

        {/* Existing Templates Grid */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff' }}>
              Configured Overlay Templates ({templates.length})
            </h3>
            <button className="btn-secondary" onClick={resetForm} style={{ fontSize: '0.82rem' }}>
              <Plus size={14} />
              <span>Create New Template</span>
            </button>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading templates...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
              {templates.map(t => {
                let parsedFields = [];
                try { parsedFields = JSON.parse(t.fields || '[]'); } catch (e) {}

                return (
                  <div key={t.id} style={{
                    background: 'rgba(13, 18, 29, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.98rem', color: '#a7f3d0' }}>
                        {t.name}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        background: 'rgba(168, 85, 247, 0.2)',
                        color: '#c084fc',
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        {t.event_type}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Variables: {parsedFields.map(f => `{{${f}}}`).join(', ') || 'None'}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <button
                        className="btn-primary"
                        onClick={() => onOpenTriggerCustom(project, t)}
                        style={{ padding: '6px 12px', fontSize: '0.78rem', flex: 1 }}
                      >
                        <Zap size={13} />
                        <span>Trigger Alert</span>
                      </button>
                      <button className="btn-secondary" onClick={() => handleEdit(t)} style={{ padding: '6px 10px' }}>
                        <Edit3 size={13} />
                      </button>
                      <button className="btn-danger" onClick={() => handleDelete(t.id)} style={{ padding: '6px 10px' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Template Form */}
        <form onSubmit={handleSubmit} style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>
            {isEditing ? '✏️ Edit Overlay Template' : '➕ Create New Overlay Template'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Template Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. New Donation Alert"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Event Type Enum</label>
              <select
                className="input-field"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              >
                <option value="donation">Donation (donation)</option>
                <option value="subscriber">Subscriber (subscriber)</option>
                <option value="follower">Follower (follower)</option>
                <option value="cheer">Cheer / Bits (cheer)</option>
                <option value="custom">Custom Event (custom)</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Dynamic Variables (comma separated)</label>
            <input
              type="text"
              className="input-field"
              placeholder="name, amount, description"
              value={fieldsStr}
              onChange={(e) => setFieldsStr(e.target.value)}
            />
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Variables can be referenced in your HTML template e.g. <code>{"{{name}}"}</code>, <code>{"{{amount}}"}</code>, <code>{"{{description}}"}</code>
            </span>
          </div>

          <div className="input-group">
            <label className="input-label">HTML Template String</label>
            <textarea
              className="input-field"
              rows={4}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
              placeholder="<div class='my-alert'><h1>{{name}} donated {{amount}}</h1><p>{{description}}</p></div>"
              value={htmlTemplate}
              onChange={(e) => setHtmlTemplate(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">CSS Styling (Optional)</label>
            <textarea
              className="input-field"
              rows={3}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
              placeholder=".my-alert { background: gold; color: black; padding: 20px; border-radius: 12px; }"
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

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <Sparkles size={16} />
              <span>{saving ? 'Saving...' : (isEditing ? 'Update Template' : 'Save New Template')}</span>
            </button>
            {isEditing && (
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
