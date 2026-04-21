// frontend/src/components/EmployeeCard.js
import React from 'react';

export default function EmployeeCard({ employee, onDelete }) {
  const statusConfig = {
    active: { bg: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', color: '#15803d', label: 'Active', icon: '🟢' },
    inactive: { bg: 'linear-gradient(135deg, #ffe4e2, #fecaca)', color: '#b91c1c', label: 'Inactive', icon: '🔴' }
  };
  const status = statusConfig[employee.status] || statusConfig.active;
  
  return (
    <div className="employee-card fade-in" style={{
      background: 'white',
      borderRadius: '28px',
      padding: '1.5rem',
      boxShadow: '0 12px 28px -8px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.02)',
      transition: 'all 0.35s cubic-bezier(0.2, 0.9, 0.4, 1.1)',
      border: '1px solid rgba(139,92,246,0.1)',
      position: 'relative'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-6px)';
      e.currentTarget.style.boxShadow = '0 25px 40px -12px rgba(139,92,246,0.2)';
      e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 12px 28px -8px rgba(0,0,0,0.06)';
      e.currentTarget.style.borderColor = 'rgba(139,92,246,0.1)';
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          background: 'linear-gradient(135deg, #8b5cf6, #c084fc)',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          boxShadow: '0 10px 20px -8px rgba(139,92,246,0.4)'
        }}>
          {employee.name?.charAt(0) || '👤'}
        </div>
        <span style={{
          background: status.bg,
          color: status.color,
          borderRadius: '40px',
          padding: '6px 14px',
          fontSize: '0.7rem',
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          letterSpacing: '0.3px'
        }}>
          {status.icon} {status.label}
        </span>
      </div>
      
      <h3 style={{ margin: '12px 0 4px 0', fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>{employee.name}</h3>
      <p style={{ margin: '0 0 12px 0', color: '#8b5cf6', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '-0.2px' }}>{employee.jobTitle}</p>
      
      <div style={{ marginTop: '12px', borderTop: '2px solid #f3e8ff', paddingTop: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', fontSize: '0.85rem', color: '#475569' }}>
          <span>✉️</span> <span style={{ wordBreak: 'break-all' }}>{employee.email}</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '8px', fontSize: '0.85rem', color: '#475569' }}>
          <span>🏢 {employee.department?.name || 'No department'}</span>
          <span>📍 {employee.location || 'Not specified'}</span>
        </div>
        {employee.joinDate && (
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📅</span> Joined: {new Date(employee.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
        )}
      </div>
      
      <button onClick={() => onDelete(employee._id)}
        style={{
          marginTop: '16px',
          width: '100%',
          background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
          color: '#b91c1c',
          border: 'none',
          borderRadius: '40px',
          padding: '8px 20px',
          fontSize: '0.8rem',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.25s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #fecaca, #fca5a5)';
          e.currentTarget.style.transform = 'scale(0.98)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #fee2e2, #fecaca)';
          e.currentTarget.style.transform = 'scale(1)';
        }}>
        🗑️ Delete Employee
      </button>
    </div>
  );
}
