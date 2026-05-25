import React, { useState, useEffect } from 'react';
import { accountAPI, transactionAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardPage = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [createForm, setCreateForm] = useState({ account_type: 'savings', currency: 'USD' });
  const [creating, setCreating] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [accRes, txRes] = await Promise.all([
        accountAPI.getMyAccounts(),
        transactionAPI.getMyTransactions({ limit: 10 }),
      ]);
      setAccounts(accRes.data.data);
      setTransactions(txRes.data.data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await accountAPI.create(createForm);
      setShowCreateAccount(false);
      loadData();
    } catch (err) {
    } finally {
      setCreating(false);
    }
  };

  const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(a.balance || 0), 0);

  const chartData = transactions
    .slice(0, 7)
    .reverse()
    .map((tx) => ({
      name: new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: parseFloat(tx.amount),
    }));

  const totalIn  = transactions.filter(t => t.type === 'deposit').reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalOut = transactions.filter(t => t.type !== 'deposit').reduce((s, t) => s + parseFloat(t.amount), 0);

  if (loading) {
    return (
      <div style={styles.pageLayout}>
        <Sidebar active="dashboard" />
        <div style={styles.content}>
          <div style={styles.loadingCenter}>
            <div className="spinner spinner-navy" style={{ width: 36, height: 36, borderWidth: 3 }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageLayout}>
      <Sidebar active="dashboard" />
      <div style={styles.content} className="fade-in">

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.greeting}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.first_name} 👋
            </h1>
            <p style={styles.subGreeting}>Here's an overview of your finances today</p>
          </div>
          <button
            className="btn btn-primary"
            id="create-account-btn"
            onClick={() => setShowCreateAccount(true)}
          >
            + New Account
          </button>
        </div>

        {/* Stats row */}
        <div style={styles.statsGrid}>
          {/* Balance hero card */}
          <div style={styles.balanceCard}>
            <div style={styles.balanceBadge}>Total Portfolio</div>
            <div style={styles.balanceAmount}>
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style={styles.balanceSub}>
              {accounts.length} account{accounts.length !== 1 ? 's' : ''} linked
            </div>
            <div style={styles.balanceDecoration}>⬡</div>
          </div>

          {/* Stat cards */}
          <div style={{ ...styles.statCard, borderTop: '3px solid #15803D' }} className="card">
            <div style={{ ...styles.statIcon, background: '#DCFCE7', color: '#15803D' }}>↑</div>
            <div>
              <div style={styles.statLabel}>Money In</div>
              <div style={{ ...styles.statValue, color: '#15803D' }}>
                ${totalIn.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div style={{ ...styles.statCard, borderTop: '3px solid #DC2626' }} className="card">
            <div style={{ ...styles.statIcon, background: '#FEE2E2', color: '#DC2626' }}>↓</div>
            <div>
              <div style={styles.statLabel}>Money Out</div>
              <div style={{ ...styles.statValue, color: '#DC2626' }}>
                ${totalOut.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div style={{ ...styles.statCard, borderTop: '3px solid #003087' }} className="card">
            <div style={{ ...styles.statIcon, background: '#EBF0FA', color: '#003087' }}>≡</div>
            <div>
              <div style={styles.statLabel}>Transactions</div>
              <div style={{ ...styles.statValue, color: '#003087' }}>{transactions.length}</div>
            </div>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="card" style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <h3 style={styles.sectionTitle}>Activity Overview</h3>
              <span style={styles.chartSubtitle}>Last 7 transactions</span>
            </div>
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#003087" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#003087" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} />
                <XAxis dataKey="name" stroke="#8A99B0" tick={{ fontSize: 12, fill: '#8A99B0' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#8A99B0" tick={{ fontSize: 12, fill: '#8A99B0' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid #DDE3ED',
                    borderRadius: '10px',
                    color: '#0D1B2E',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    fontSize: '13px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#003087"
                  strokeWidth={2.5}
                  fill="url(#colorAmount)"
                  dot={{ fill: '#003087', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#003087', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Two-column — Accounts + Transactions */}
        <div style={styles.twoCol}>
          {/* Accounts */}
          <div>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>My Accounts</h3>
              <span style={styles.sectionCount}>{accounts.length}</span>
            </div>
            {accounts.length === 0 ? (
              <div className="card" style={styles.emptyState}>
                <div style={styles.emptyIcon}>🏦</div>
                <p style={{ color: '#4A5568', fontWeight: '500' }}>No accounts yet</p>
                <p style={{ color: '#8A99B0', fontSize: '13px', marginTop: '4px' }}>Create your first account to get started</p>
              </div>
            ) : (
              accounts.map((account) => (
                <div key={account.id} style={styles.accountCard} className="card">
                  <div style={styles.accountTopRow}>
                    <div style={styles.accountTypeChip}>
                      {account.account_type.toUpperCase()}
                    </div>
                    <span className={`badge ${account.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {account.status}
                    </span>
                  </div>
                  <div style={styles.accountNumber}>{account.account_number}</div>
                  <div style={styles.accountBalance}>
                    ${parseFloat(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    <span style={styles.currency}>{account.currency}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Recent Transactions */}
          <div>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Recent Transactions</h3>
              <span style={styles.sectionCount}>{Math.min(transactions.length, 6)}</span>
            </div>
            {transactions.length === 0 ? (
              <div className="card" style={styles.emptyState}>
                <div style={styles.emptyIcon}>💳</div>
                <p style={{ color: '#4A5568', fontWeight: '500' }}>No transactions yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {transactions.slice(0, 6).map((tx) => {
                  const isDeposit  = tx.type === 'deposit';
                  const isTransfer = tx.type === 'transfer';
                  const iconBg     = isDeposit ? '#DCFCE7' : isTransfer ? '#EBF0FA' : '#FEE2E2';
                  const iconColor  = isDeposit ? '#15803D' : isTransfer ? '#003087' : '#DC2626';
                  const icon       = isDeposit ? '↓' : isTransfer ? '↔' : '↑';
                  return (
                    <div key={tx.id} className="card" style={styles.txCard}>
                      <div style={{ ...styles.txIcon, background: iconBg, color: iconColor }}>
                        {icon}
                      </div>
                      <div style={styles.txInfo}>
                        <div style={styles.txType}>{tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</div>
                        <div style={styles.txRef}>{tx.reference_id}</div>
                      </div>
                      <div style={{ ...styles.txAmount, color: isDeposit ? '#15803D' : '#DC2626' }}>
                        {isDeposit ? '+' : '-'}${parseFloat(tx.amount).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Create Account Modal */}
        {showCreateAccount && (
          <div style={styles.modal} onClick={() => setShowCreateAccount(false)}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()} className="fade-in">
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>Open New Account</h3>
                <button style={styles.modalClose} onClick={() => setShowCreateAccount(false)}>✕</button>
              </div>
              <p style={styles.modalSubtitle}>Choose your account type and currency</p>
              <form onSubmit={handleCreateAccount} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="input-group">
                  <label>Account Type</label>
                  <select value={createForm.account_type} onChange={(e) => setCreateForm({ ...createForm, account_type: e.target.value })}>
                    <option value="savings">Savings Account</option>
                    <option value="checking">Checking Account</option>
                    <option value="investment">Investment Account</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Currency</label>
                  <select value={createForm.currency} onChange={(e) => setCreateForm({ ...createForm, currency: e.target.value })}>
                    <option value="USD">USD — US Dollar</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="GBP">GBP — British Pound</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={creating}>
                    {creating ? <span className="spinner" /> : 'Open Account'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateAccount(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  pageLayout: { display: 'flex', minHeight: '100vh', background: '#F0F4F8' },
  content: { flex: 1, padding: '32px', overflowY: 'auto' },
  loadingCenter: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '28px',
  },
  greeting: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0D1B2E',
    letterSpacing: '-0.5px',
    marginBottom: '4px',
  },
  subGreeting: { color: '#4A5568', fontSize: '14px' },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1.6fr repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  balanceCard: {
    background: 'linear-gradient(135deg, #003087 0%, #001444 60%, #000B2E 100%)',
    borderRadius: '16px',
    padding: '28px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 8px 30px rgba(0,48,135,0.30)',
  },
  balanceBadge: {
    display: 'inline-block',
    background: 'rgba(255,255,255,0.15)',
    color: 'rgba(255,255,255,0.85)',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: '4px 10px',
    borderRadius: '20px',
    marginBottom: '14px',
  },
  balanceAmount: {
    fontSize: '34px',
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: '-1px',
    marginBottom: '8px',
    lineHeight: 1,
  },
  balanceSub: { fontSize: '13px', color: 'rgba(255,255,255,0.55)', fontWeight: '500' },
  balanceDecoration: {
    position: 'absolute',
    right: '-10px',
    bottom: '-20px',
    fontSize: '100px',
    color: 'rgba(255,255,255,0.05)',
    lineHeight: 1,
    pointerEvents: 'none',
  },

  statCard: { display: 'flex', alignItems: 'center', gap: '14px', padding: '20px' },
  statIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: '700',
    flexShrink: 0,
  },
  statLabel: { fontSize: '12px', color: '#8A99B0', fontWeight: '600', marginBottom: '4px', letterSpacing: '0.03em' },
  statValue: { fontSize: '19px', fontWeight: '800', letterSpacing: '-0.5px' },

  chartCard: { marginBottom: '24px', padding: '24px' },
  chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  chartSubtitle: { fontSize: '12px', color: '#8A99B0', fontWeight: '500' },

  sectionTitle: { fontSize: '15px', fontWeight: '800', color: '#0D1B2E', letterSpacing: '-0.2px' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' },
  sectionCount: {
    background: '#EBF0FA',
    color: '#003087',
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '20px',
  },

  twoCol: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' },

  emptyState: { textAlign: 'center', padding: '40px 24px' },
  emptyIcon: { fontSize: '36px', marginBottom: '12px' },

  accountCard: { marginBottom: '10px', padding: '20px' },
  accountTopRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  accountTypeChip: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#003087',
    background: '#EBF0FA',
    padding: '3px 10px',
    borderRadius: '20px',
    letterSpacing: '0.08em',
  },
  accountNumber: { fontSize: '13px', color: '#8A99B0', marginBottom: '10px', fontFamily: 'monospace' },
  accountBalance: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#0D1B2E',
    letterSpacing: '-0.5px',
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
  },
  currency: { fontSize: '12px', color: '#8A99B0', fontWeight: '600' },

  txCard: { display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px' },
  txIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '800',
    flexShrink: 0,
  },
  txInfo: { flex: 1 },
  txType: { fontSize: '14px', fontWeight: '600', color: '#0D1B2E' },
  txRef: { fontSize: '11px', color: '#8A99B0', marginTop: '2px' },
  txAmount: { fontSize: '15px', fontWeight: '800', letterSpacing: '-0.3px' },

  modal: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(13,27,46,0.55)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: '#FFFFFF',
    border: '1px solid #DDE3ED',
    borderRadius: '20px',
    padding: '32px',
    width: '440px',
    boxShadow: '0 24px 60px rgba(0,0,0,0.15)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  modalTitle: { fontSize: '18px', fontWeight: '800', color: '#0D1B2E' },
  modalClose: {
    background: '#F0F4F8',
    border: 'none',
    color: '#4A5568',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubtitle: { fontSize: '14px', color: '#4A5568', marginBottom: '24px' },
};

export default DashboardPage;
