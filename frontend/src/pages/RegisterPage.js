import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '',
    phone: '', address: '', date_of_birth: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div style={styles.container}>
      <div style={styles.bgAccent1} />
      <div style={styles.bgAccent2} />

      {/* Left branding strip */}
      <div style={styles.leftPanel}>
        <div style={styles.leftInner}>
          <div style={styles.logoBox}>
            <span style={styles.logoGlyph}>⬡</span>
          </div>
          <h1 style={styles.heroTitle}>NexaBank</h1>
          <p style={styles.heroSub}>Trusted. Secure. Modern Banking.</p>

          <div style={styles.statsRow}>
            {[
              { value: '2M+', label: 'Customers' },
              { value: '$50B+', label: 'Assets managed' },
              { value: '99.9%', label: 'Uptime SLA' },
            ].map((s, i) => (
              <div key={i} style={styles.statBox}>
                <div style={styles.statVal}>{s.value}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard} className="fade-in">
          <h2 style={styles.title}>Create your account</h2>
          <p style={styles.subtitle}>Join millions of customers banking smarter</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div className="grid-2">
              <div className="input-group">
                <label>First Name</label>
                <input type="text" placeholder="John" value={form.first_name} onChange={set('first_name')} required />
              </div>
              <div className="input-group">
                <label>Last Name</label>
                <input type="text" placeholder="Doe" value={form.last_name} onChange={set('last_name')} required />
              </div>
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <input type="email" placeholder="john@example.com" value={form.email} onChange={set('email')} required />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input type="password" placeholder="Minimum 8 characters" value={form.password} onChange={set('password')} required minLength={8} />
            </div>

            <div className="grid-2">
              <div className="input-group">
                <label>Phone Number</label>
                <input type="tel" placeholder="+1 234 567 8900" value={form.phone} onChange={set('phone')} />
              </div>
              <div className="input-group">
                <label>Date of Birth</label>
                <input type="date" value={form.date_of_birth} onChange={set('date_of_birth')} />
              </div>
            </div>

            <div className="input-group">
              <label>Address</label>
              <input type="text" placeholder="123 Main St, City, Country" value={form.address} onChange={set('address')} />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              id="register-submit-btn"
              style={{ width: '100%', padding: '13px', marginTop: '4px' }}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : 'Open My Account'}
            </button>
          </form>

          <p style={styles.switchText}>
            Already have an account?{' '}
            <Link to="/login" style={styles.link}>Sign in</Link>
          </p>

          <div style={styles.securityNote}>
            <span>🔒</span>
            <span>Your data is protected with bank-grade encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    background: '#F0F4F8',
  },
  bgAccent1: {
    position: 'absolute',
    top: '-180px',
    right: '30%',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,48,135,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgAccent2: {
    position: 'absolute',
    bottom: '-100px',
    left: '-100px',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(184,134,11,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },

  leftPanel: {
    flex: '0 0 38%',
    background: 'linear-gradient(155deg, #003087 0%, #001444 60%, #000B2E 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 40px',
    position: 'relative',
    overflow: 'hidden',
  },
  leftInner: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
  },
  logoBox: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  logoGlyph: { fontSize: '28px', color: '#FFFFFF', lineHeight: 1 },
  heroTitle: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: '-1px',
    marginBottom: '10px',
  },
  heroSub: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.60)',
    marginBottom: '48px',
    fontWeight: '400',
  },
  statsRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  statBox: {
    padding: '16px 20px',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  statVal: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#C8962E',
    letterSpacing: '-0.5px',
    marginBottom: '2px',
  },
  statLabel: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.60)',
    fontWeight: '500',
    letterSpacing: '0.03em',
  },

  rightPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    overflowY: 'auto',
  },
  formCard: {
    background: '#FFFFFF',
    borderRadius: '20px',
    padding: '40px 36px',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.06)',
    border: '1px solid #DDE3ED',
  },
  title: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#0D1B2E',
    letterSpacing: '-0.5px',
    marginBottom: '6px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#4A5568',
    marginBottom: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  switchText: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '14px',
    color: '#4A5568',
  },
  link: {
    color: '#003087',
    fontWeight: '700',
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
  },
  securityNote: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    marginTop: '18px',
    fontSize: '12px',
    color: '#8A99B0',
    fontWeight: '500',
  },
};

export default RegisterPage;
