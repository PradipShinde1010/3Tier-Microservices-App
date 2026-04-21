// frontend/src/components/DepartmentCard.js
import React from 'react';

export default function DepartmentCard({ dept }) {
  return (
    <div className="dept-card fade-in" style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #fefeff 100%)',
      borderRadius: '28px',
      padding: '24px',
      boxShadow: '0 20px 35px -12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.02)',
      transition: 'all 0.35s cubic-bezier(0.2, 0.9, 0.4, 1.1)',
      border: '1px solid rgba(139,92,246,0.12)',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-6px)';
      e.currentTarget.style.boxShadow = '0 25px 40px -12px rgba(139,92,246,0.25)';
      e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 20px 35px -12px rgba(0,0,0,0.08)';
      e.currentTarget.style.borderColor = 'rgba(139,92,246,0.12)';
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '4px',
        background: 'linear-gradient(90deg, #8b5cf6, #ec4899, #f59e0b)'
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          boxShadow: '0 8px 14px -6px rgba(139,92,246,0.3)'
        }}>
          🏢
        </div>
      </div>
      <h3 style={{
        margin: '0 0 8px 0',
        fontSize: '1.4rem',
        fontWeight: 700,
        background: 'linear-gradient(135deg, #1e1b4b, #4c1d95)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent'
      }}>{dept.name}</h3>
      <p style={{ margin: '0 0 16px 0', color: '#475569', lineHeight: 1.5, fontSize: '0.9rem' }}>{dept.description || '✨ No description provided'}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
        <span style={{ background: '#f3e8ff', padding: '5px 14px', borderRadius: '40px', fontSize: '0.75rem', fontWeight: 600, color: '#6b21a5' }}>
          👔 {dept.manager || 'Unassigned'}
        </span>
        <span style={{ background: '#f3e8ff', padding: '5px 14px', borderRadius: '40px', fontSize: '0.75rem', fontWeight: 600, color: '#6b21a5' }}>
          📍 {dept.location || 'Remote'}
        </span>
      </div>
    </div>
  );
}
