import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Decorative background */}
      <div style={styles.bgLeft} />
      <div style={styles.bgRight} />

      {/* Left panel — brand */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <div style={styles.logoWrap}>
            <span style={styles.logoGlyph}>⬡</span>
          </div>
          <h1 style={styles.heroTitle}>NexaBank</h1>
          <p style={styles.heroTagline}>Trusted. Secure. Modern Banking.</p>

          <div style={styles.featureList}>
            {[
              { icon: '🔒', text: 'Bank-grade 256-bit encryption' },
              { icon: '⚡', text: 'Instant transfers & payments' },
              { icon: '📊', text: 'Real-time account insights' },
            ].map((f, i) => (
              <div key={i} style={styles.featureItem}>
                <span style={styles.featureIcon}>{f.icon}</span>
                <span style={styles.featureText}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard} className="fade-in">
          {/* Mobile logo */}
          <div style={styles.mobileLogo}>
            <div style={styles.mobileLogoIcon}>⬡</div>
            <span style={styles.mobileLogoText}>NexaBank</span>
          </div>

          <h2 style={styles.title}>Welcome back</h2>
          <p style={styles.subtitle}>Sign in to your account to continue</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              id="login-submit-btn"
              style={{ width: '100%', padding: '13px', marginTop: '4px' }}
              disabled={loading}
            >
              {loading
                ? <span className="spinner" />
                : 'Sign In to Online Banking'}
            </button>
          </form>

          <p style={styles.switchText}>
            New customer?{' '}
            <Link to="/register" style={styles.link}>Open an account</Link>
          </p>

          <div style={styles.securityNote}>
            <span style={styles.lockIcon}>🔒</span>
            <span>Secured with 256-bit SSL encryption</span>
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
  bgLeft: {
    position: 'absolute',
    top: '-200px',
    left: '-200px',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,48,135,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgRight: {
    position: 'absolute',
    bottom: '-150px',
    right: '40%',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(184,134,11,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },

  /* Left brand panel */
  leftPanel: {
    flex: '0 0 45%',
    background: 'linear-gradient(155deg, #003087 0%, #001444 60%, #000B2E 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 48px',
    position: 'relative',
    overflow: 'hidden',
  },
  leftContent: {
    position: 'relative',
    zIndex: 1,
  },
  logoWrap: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '28px',
    backdropFilter: 'blur(8px)',
  },
  logoGlyph: {
    fontSize: '32px',
    color: '#FFFFFF',
    lineHeight: 1,
  },
  heroTitle: {
    fontSize: '42px',
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: '-1px',
    marginBottom: '12px',
    lineHeight: 1.1,
  },
  heroTagline: {
    fontSize: '16px',
    color: 'rgba(255,255,255,0.65)',
    marginBottom: '48px',
    fontWeight: '400',
    letterSpacing: '0.02em',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  featureIcon: {
    fontSize: '20px',
    width: '40px',
    height: '40px',
    background: 'rgba(255,255,255,0.10)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureText: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.80)',
    fontWeight: '500',
  },

  /* Right form panel */
  rightPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
  },
  formCard: {
    background: '#FFFFFF',
    borderRadius: '20px',
    padding: '44px 40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.06)',
    border: '1px solid #DDE3ED',
  },
  mobileLogo: {
    display: 'none',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '24px',
  },
  mobileLogoIcon: {
    fontSize: '24px',
    color: '#003087',
  },
  mobileLogoText: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#003087',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0D1B2E',
    marginBottom: '6px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#4A5568',
    marginBottom: '28px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  switchText: {
    textAlign: 'center',
    marginTop: '22px',
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
    marginTop: '20px',
    fontSize: '12px',
    color: '#8A99B0',
    fontWeight: '500',
  },
  lockIcon: {
    fontSize: '12px',
  },
};

export default LoginPage;
