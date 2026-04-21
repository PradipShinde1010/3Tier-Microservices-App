// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import AddEmployee from './pages/AddEmployee';
import AddDepartment from './pages/AddDepartment';

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} style={{
      color: isActive ? 'white' : '#c4b5fd',
      textDecoration: 'none',
      fontWeight: isActive ? 700 : 500,
      padding: '10px 20px',
      borderRadius: '50px',
      background: isActive ? 'rgba(139,92,246,0.3)' : 'transparent',
      transition: 'all 0.25s',
      fontSize: '0.95rem'
    }}>
      {children}
    </Link>
  );
}

function Footer() {
  return (
    <footer style={{
      marginTop: '80px',
      padding: '32px 24px',
      background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
      borderRadius: '40px 40px 0 0',
      textAlign: 'center',
      borderTop: '1px solid rgba(139,92,246,0.2)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ fontSize: '28px' }}>🎓</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, background: 'linear-gradient(135deg, #c084fc, #f472b6)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>Learn With KASTRO</span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '8px' }}>Empowering teams with modern HR technology</p>
        <p style={{ color: '#64748b', fontSize: '0.75rem' }}>© 2026 Learn With KASTRO — Employee Management Portal</p>
      </div>
    </footer>
  );
}

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <nav style={{
          background: '#0f172a',
          padding: '0 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          borderBottom: '1px solid rgba(139,92,246,0.2)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0' }}>
            <div style={{
              width: '42px',
              height: '42px',
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px'
            }}>🚀</div>
            <div>
              <span style={{ color: 'white', fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.3px' }}>HR<span style={{ color: '#c084fc' }}>Portal</span></span>
              <span style={{ color: '#94a3b8', fontSize: '0.7rem', marginLeft: '8px' }}>by KASTRO</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '12px 0' }}>
            <NavLink to="/">Employees</NavLink>
            <NavLink to="/departments">Departments</NavLink>
            <NavLink to="/add">Add Employee</NavLink>
            <NavLink to="/add-department">Add Dept</NavLink>
          </div>
        </nav>
        
        <div style={{ padding: '40px 32px', maxWidth: '1400px', margin: '0 auto', width: '100%', flex: 1 }}>
          <Routes>
            <Route path="/" element={<Employees />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/add" element={<AddEmployee />} />
            <Route path="/add-department" element={<AddDepartment />} />
          </Routes>
        </div>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;
