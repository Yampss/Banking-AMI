import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { id: 'dashboard',    label: 'Dashboard',    path: '/dashboard',    icon: '⊞' },
  { id: 'transactions', label: 'Transactions', path: '/transactions', icon: '↔' },
];

const Sidebar = ({ active }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.sidebar}>
      {/* Brand */}
      <div style={styles.brand}>
        <div style={styles.brandIconWrap}>
          <span style={styles.brandIconGlyph}>⬡</span>
        </div>
        <div>
          <div style={styles.brandName}>NexaBank</div>
          <div style={styles.brandSub}>Personal Banking</div>
        </div>
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Nav */}
      <nav style={styles.nav}>
        <div style={styles.navLabel}>MAIN MENU</div>
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            })}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom user section */}
      <div style={styles.bottom}>
        <div style={styles.divider} />
        <div style={styles.userCard}>
          <div style={styles.avatar}>
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user?.first_name} {user?.last_name}</div>
            <div style={styles.userEmail}>{user?.email}</div>
          </div>
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          <span>⎋</span> Sign Out
        </button>
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '256px',
    background: '#FFFFFF',
    borderRight: '1px solid #DDE3ED',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    position: 'sticky',
    top: 0,
    height: '100vh',
    flexShrink: 0,
    boxShadow: '2px 0 12px rgba(0,0,0,0.04)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    paddingLeft: '6px',
  },
  brandIconWrap: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #003087 0%, #001F5A 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,48,135,0.3)',
    flexShrink: 0,
  },
  brandIconGlyph: {
    fontSize: '20px',
    color: '#FFFFFF',
    lineHeight: 1,
  },
  brandName: {
    fontSize: '17px',
    fontWeight: '800',
    color: '#003087',
    letterSpacing: '-0.3px',
    lineHeight: 1.2,
  },
  brandSub: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#8A99B0',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginTop: '1px',
  },
  divider: {
    height: '1px',
    background: '#EEF2F7',
    margin: '4px 0',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
    marginTop: '16px',
  },
  navLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#8A99B0',
    letterSpacing: '0.10em',
    padding: '0 10px',
    marginBottom: '8px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#4A5568',
    transition: 'all 0.18s ease',
    textDecoration: 'none',
    position: 'relative',
  },
  navItemActive: {
    background: 'linear-gradient(135deg, #EBF0FA 0%, #DCE8FF 100%)',
    color: '#003087',
    fontWeight: '700',
    borderLeft: '3px solid #003087',
    paddingLeft: '9px',
  },
  navIcon: {
    fontSize: '17px',
    width: '22px',
    textAlign: 'center',
    flexShrink: 0,
  },
  bottom: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    borderRadius: '10px',
    background: '#F0F4F8',
    border: '1px solid #DDE3ED',
    marginTop: '8px',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #003087 0%, #001F5A 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '800',
    color: '#FFFFFF',
    flexShrink: 0,
    letterSpacing: '0.5px',
  },
  userInfo: { flex: 1, overflow: 'hidden' },
  userName: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0D1B2E',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  userEmail: {
    fontSize: '11px',
    color: '#8A99B0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    marginTop: '1px',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#FEF2F2',
    border: '1.5px solid #FECACA',
    color: '#DC2626',
    borderRadius: '8px',
    padding: '9px 14px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    width: '100%',
    justifyContent: 'center',
  },
};

export default Sidebar;
