import React, { useState } from 'react';
import { Copy, Radio, Zap, Settings, Check, Code, Trash2 } from 'lucide-react';
import { BACKEND_URL, api } from '../api/client';

export default function ProjectCard({ project, onOpenTriggerAlert, onOpenEditTemplate, onDeleteSuccess, showToast }) {
  const [align, setAlign] = useState('top-left');
  const [copied, setCopied] = useState(false);

  const rawBaseUrl = project.obs_url || `${BACKEND_URL}/overlay/${project.uuid}`;
  const finalObsUrl = align === 'top-left' ? rawBaseUrl : `${rawBaseUrl}?align=${align}`;

  function handleCopy() {
    navigator.clipboard.writeText(finalObsUrl).then(() => {
      setCopied(true);
      showToast('📋 OBS Overlay URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleDelete() {
    if (!window.confirm(`Are you sure you want to delete project "${project.name}"?`)) return;
    try {
      await api.deleteProject(project.uuid);
      showToast('🗑️ Project deleted');
      onDeleteSuccess();
    } catch (err) {
      showToast('❌ Failed to delete project');
    }
  }

  return (
    <div className="glass-card fade-in" style={{
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Radio size={20} color="#818cf8" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#ffffff' }}>
                {project.name}
              </h3>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                background: 'rgba(168, 85, 247, 0.2)',
                color: '#c084fc',
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                {project.event_type || 'donation'}
              </span>
            </div>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: 'var(--text-muted)'
            }}>
              ID: #{project.id} | UUID: {project.uuid}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn-secondary"
            onClick={() => onOpenEditTemplate(project)}
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
          >
            <Code size={15} />
            <span>Edit Template</span>
          </button>

          <button
            className="btn-primary"
            onClick={() => onOpenTriggerAlert(project)}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <Zap size={15} />
            <span>Trigger Alert</span>
          </button>

          <button
            className="btn-danger"
            onClick={handleDelete}
            style={{ padding: '8px 10px' }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {project.description && (
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {project.description}
        </p>
      )}

      {/* OBS URL Section with Position Alignment Picker */}
      <div style={{
        background: 'rgba(13, 18, 29, 0.9)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={15} color="var(--text-muted)" />
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', uppercase: 'true' }}>
              Screen Positioning Preset
            </span>
          </div>

          <select
            value={align}
            onChange={(e) => setAlign(e.target.value)}
            style={{
              background: '#1e293b',
              color: '#ffffff',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '4px 10px',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="top-left">Top-Left (Default)</option>
            <option value="top-center">Top-Center</option>
            <option value="top-right">Top-Right</option>
            <option value="center">Center Screen</option>
            <option value="bottom-left">Bottom-Left</option>
            <option value="bottom-center">Bottom-Center</option>
            <option value="bottom-right">Bottom-Right</option>
          </select>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(0, 0, 0, 0.4)',
          padding: '10px 14px',
          borderRadius: '8px'
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            color: '#6ee7b7',
            wordBreak: 'break-all',
            flex: 1
          }}>
            {finalObsUrl}
          </span>

          <button
            className="btn-secondary"
            onClick={handleCopy}
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy URL'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
