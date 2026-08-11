import React from 'react';
import { Tv, BookOpen, LogOut, User, PlusCircle } from 'lucide-react';
import { BACKEND_URL } from '../api/client';

export default function Navbar({ user, onLogout, onOpenCreate, onOpenAuth }) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 32px',
      marginBottom: '32px'
    }} className="glass-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
        }}>
          <Tv size={24} color="#ffffff" />
        </div>
        <div>
          <h1 style={{
            fontSize: '1.4rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #ffffff, #cbd5e1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em'
          }}>
            Suporter
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Real-Time OBS Stream Overlay Platform
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <a
          href={`${BACKEND_URL}/swagger/index.html`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
          title="Open Swagger API Documentation"
        >
          <BookOpen size={16} />
          <span>API Specs</span>
        </a>

        {user ? (
          <>
            <button className="btn-primary" onClick={onOpenCreate}>
              <PlusCircle size={18} />
              <span>New Project</span>
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--card-border)'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User size={16} color="#818cf8" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ffffff' }}>
                  {user.name}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {user.email}
                </span>
              </div>
            </div>

            <button className="btn-danger" onClick={onLogout} title="Logout">
              <LogOut size={16} />
            </button>
          </>
        ) : (
          <button className="btn-primary" onClick={onOpenAuth}>
            <span>Sign In / Register</span>
          </button>
        )}
      </div>
    </header>
  );
}
