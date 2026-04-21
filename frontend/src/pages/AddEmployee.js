// frontend/src/pages/AddEmployee.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AddEmployee() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', jobTitle: '',
    department: '', location: '', status: 'active', joinDate: ''
  });
  const [departments, setDepartments] = useState([]);
  const [msg, setMsg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    axios.get('/api/departments').then(res => setDepartments(res.data)).catch(err => console.error('Failed to load departments', err));
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Prepare data - send empty department as null so backend handles it properly
      const submitData = { ...form };
      if (!submitData.department || submitData.department === "") {
        delete submitData.department;
      }
      
      const response = await axios.post('/api/employees', submitData);
      console.log('Employee added:', response.data);
      
      setMsg({ type: 'success', text: '🎉 Employee added successfully! Redirecting to home page...' });
      setForm({ name: '', email: '', phone: '', jobTitle: '', department: '', location: '', status: 'active', joinDate: '' });
      
      // Force redirect to home page after 1 second to see the new employee
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (err) {
      console.error('Add employee error:', err);
      setMsg({ type: 'error', text: '❌ Error: ' + (err.response?.data?.error || err.message) });
      setTimeout(() => setMsg(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = { width: '100%', padding: '14px 16px', marginBottom: '16px', borderRadius: '20px', border: '2px solid #e2e8f0', fontSize: '0.95rem', transition: 'all 0.25s', background: '#fff', fontFamily: 'inherit' };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div className="fade-in" style={{
        background: 'white',
        borderRadius: '40px',
        padding: '42px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
        border: '1px solid rgba(139,92,246,0.15)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '70px',
            height: '70px',
            background: 'linear-gradient(135deg, #ec4899, #f43f5e)',
            borderRadius: '30px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            marginBottom: '16px',
            boxShadow: '0 15px 30px -10px rgba(236,72,153,0.4)'
          }}>👥</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px', background: 'linear-gradient(135deg, #1e1b4b, #be185d)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>
            Add Team Member
          </h2>
          <p style={{ color: '#64748b' }}>Onboard new talent to your organization</p>
        </div>
        
        {msg && (
          <div style={{
            background: msg.type === 'success' ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)' : 'linear-gradient(135deg, #fee2e2, #fecaca)',
            color: msg.type === 'success' ? '#065f46' : '#991b1b',
            padding: '14px 20px',
            borderRadius: '24px',
            marginBottom: '28px',
            fontWeight: 600,
            fontSize: '0.85rem',
            textAlign: 'center'
          }}>
            {msg.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <input name="name" placeholder="Full name *" value={form.name} onChange={handleChange} style={inputStyle} required onFocus={(e)=>e.target.style.borderColor='#ec4899'} onBlur={(e)=>e.target.style.borderColor='#e2e8f0'}/>
            <input name="email" placeholder="Email address *" value={form.email} onChange={handleChange} style={inputStyle} required />
            <input name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange} style={inputStyle} />
            <input name="jobTitle" placeholder="Job title *" value={form.jobTitle} onChange={handleChange} style={inputStyle} required />
            <input name="location" placeholder="Location" value={form.location} onChange={handleChange} style={inputStyle} />
            <select name="department" value={form.department} onChange={handleChange} style={inputStyle}>
              <option value="">Select Department</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
            <select name="status" value={form.status} onChange={handleChange} style={inputStyle}>
              <option value="active">🟢 Active</option>
              <option value="inactive">🔴 Inactive</option>
            </select>
            <input name="joinDate" type="date" value={form.joinDate} onChange={handleChange} style={inputStyle} />
          </div>
          <button type="submit" disabled={isSubmitting} style={{
            marginTop: '20px',
            background: 'linear-gradient(135deg, #ec4899, #f43f5e)',
            width: '100%',
            padding: '14px',
            border: 'none',
            borderRadius: '40px',
            color: 'white',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'transform 0.2s',
            boxShadow: '0 10px 20px -8px rgba(236,72,153,0.5)'
          }}>
            {isSubmitting ? '⏳ Adding Employee...' : '✨ Add Employee'}
          </button>
        </form>
      </div>
    </div>
  );
}
