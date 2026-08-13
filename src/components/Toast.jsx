import React from 'react';

export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '32px',
      left: '50%',
      transform: 'translate(-50%, 0)',
      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      color: '#ffffff',
      padding: '14px 24px',
      borderRadius: 'var(--radius-md)',
      fontWeight: '700',
      fontSize: '0.92rem',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      animation: 'toastFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
    }}>
      <span>{message}</span>
    </div>
  );
}
