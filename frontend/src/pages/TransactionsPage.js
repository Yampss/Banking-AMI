import React, { useState, useEffect } from 'react';
import { transactionAPI, accountAPI } from '../api';
import Sidebar from '../components/Sidebar';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('history');
  const [txForm, setTxForm] = useState({ account_id: '', amount: '', description: '' });
  const [transferForm, setTransferForm] = useState({ from_account_id: '', to_account_id: '', amount: '', description: '' });
  const [txLoading, setTxLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [txRes, accRes] = await Promise.all([
        transactionAPI.getMyTransactions({ limit: 50 }),
        accountAPI.getMyAccounts(),
      ]);
      setTransactions(txRes.data.data);
      setAccounts(accRes.data.data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleTx = (type) => async (e) => {
    e.preventDefault();
    setTxLoading(true);
    setMessage(null);
    try {
      if (type === 'transfer') {
        await transactionAPI.transfer({ ...transferForm, amount: parseFloat(transferForm.amount) });
      } else if (type === 'deposit') {
        await transactionAPI.deposit({ account_id: parseInt(txForm.account_id), amount: parseFloat(txForm.amount), description: txForm.description });
      } else {
        await transactionAPI.withdraw({ account_id: parseInt(txForm.account_id), amount: parseFloat(txForm.amount), description: txForm.description });
      }
      setMessage({ type: 'success', text: `${type.charAt(0).toUpperCase() + type.slice(1)} completed successfully!` });
      setTxForm({ account_id: '', amount: '', description: '' });
      setTransferForm({ from_account_id: '', to_account_id: '', amount: '', description: '' });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Transaction failed. Please try again.' });
    } finally {
      setTxLoading(false);
    }
  };

  const TAB_META = {
    deposit:  { color: '#15803D', bg: '#DCFCE7', icon: '↓', label: 'Deposit Funds' },
    withdrawal: { color: '#DC2626', bg: '#FEE2E2', icon: '↑', label: 'Withdraw Funds' },
    transfer: { color: '#003087', bg: '#EBF0FA', icon: '↔', label: 'Transfer' },
  };

  const tabs = [
    { id: 'history',    label: 'History',    icon: '≡' },
    { id: 'deposit',    label: 'Deposit',    icon: '↓' },
    { id: 'withdraw',   label: 'Withdraw',   icon: '↑' },
    { id: 'transfer',   label: 'Transfer',   icon: '↔' },
  ];

  return (
    <div style={styles.pageLayout}>
      <Sidebar active="transactions" />
      <div style={styles.content} className="fade-in">

        {/* Page header */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>Transactions</h1>
            <p style={styles.pageSubtitle}>Manage deposits, withdrawals and transfers</p>
          </div>
        </div>

        {/* Tab bar */}
        <div style={styles.tabBar}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              style={{
                ...styles.tab,
                ...(activeTab === tab.id ? styles.tabActive : {}),
              }}
              onClick={() => { setActiveTab(tab.id); setMessage(null); }}
            >
              <span style={styles.tabIcon}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* History Table */}
        {activeTab === 'history' && (
          <div>
            {loading ? (
              <div style={styles.center}>
                <div className="spinner spinner-navy" style={{ width: 32, height: 32, borderWidth: 3 }} />
              </div>
            ) : transactions.length === 0 ? (
              <div className="card" style={styles.emptyState}>
                <div style={styles.emptyIcon}>📊</div>
                <p style={{ color: '#4A5568', fontWeight: '600', fontSize: '15px' }}>No transactions yet</p>
                <p style={{ color: '#8A99B0', fontSize: '13px', marginTop: '4px' }}>Your transaction history will appear here</p>
              </div>
            ) : (
              <div className="card" style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {['Reference', 'Type', 'Amount', 'Description', 'Date', 'Status'].map((h) => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, i) => {
                      const meta = TAB_META[tx.type] || TAB_META.transfer;
                      const isDeposit = tx.type === 'deposit';
                      return (
                        <tr key={tx.id} style={{ ...styles.tr, background: i % 2 === 0 ? '#FFFFFF' : '#FAFBFD' }}>
                          <td style={styles.td}>
                            <code style={styles.refCode}>{tx.reference_id}</code>
                          </td>
                          <td style={styles.td}>
                            <div style={styles.typeCell}>
                              <div style={{ ...styles.txTypeIcon, background: meta.bg, color: meta.color }}>
                                {meta.icon}
                              </div>
                              <span style={{ textTransform: 'capitalize', fontWeight: '500', color: '#0D1B2E' }}>
                                {tx.type}
                              </span>
                            </div>
                          </td>
                          <td style={{ ...styles.td, color: isDeposit ? '#15803D' : '#DC2626', fontWeight: '700' }}>
                            {isDeposit ? '+' : '-'}${parseFloat(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ ...styles.td, color: '#4A5568' }}>{tx.description || '—'}</td>
                          <td style={{ ...styles.td, color: '#8A99B0' }}>
                            {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td style={styles.td}>
                            <span className="badge badge-success">{tx.status}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Deposit / Withdraw Form */}
        {(activeTab === 'deposit' || activeTab === 'withdraw') && (
          <div style={styles.formWrap}>
            <div className="card" style={styles.formCard}>
              {/* Form icon header */}
              <div style={styles.formTopRow}>
                <div style={{
                  ...styles.formIconBig,
                  background: activeTab === 'deposit' ? '#DCFCE7' : '#FEE2E2',
                  color: activeTab === 'deposit' ? '#15803D' : '#DC2626',
                }}>
                  {activeTab === 'deposit' ? '↓' : '↑'}
                </div>
                <div>
                  <h3 style={styles.formTitle}>{activeTab === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}</h3>
                  <p style={styles.formSubtitle}>{activeTab === 'deposit' ? 'Add money to your account' : 'Take money from your account'}</p>
                </div>
              </div>

              <div style={styles.formDivider} />

              {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

              <form onSubmit={handleTx(activeTab)} style={styles.form}>
                <div className="input-group">
                  <label>Select Account</label>
                  <select value={txForm.account_id} onChange={(e) => setTxForm({ ...txForm, account_id: e.target.value })} required>
                    <option value="">Choose account...</option>
                    {accounts.filter(a => a.status === 'active').map(a => (
                      <option key={a.id} value={a.id}>
                        {a.account_type} — {a.account_number} (${parseFloat(a.balance).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Amount (USD)</label>
                  <input type="number" min="0.01" step="0.01" placeholder="0.00" value={txForm.amount} onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label>Description <span style={{ color: '#8A99B0', fontWeight: '400' }}>(optional)</span></label>
                  <input type="text" placeholder="What's this for?" value={txForm.description} onChange={(e) => setTxForm({ ...txForm, description: e.target.value })} />
                </div>
                <button
                  className={`btn ${activeTab === 'deposit' ? 'btn-primary' : 'btn-danger'}`}
                  style={{ width: '100%', padding: '13px', marginTop: '4px' }}
                  disabled={txLoading}
                >
                  {txLoading ? <span className="spinner" /> : activeTab === 'deposit' ? 'Confirm Deposit' : 'Confirm Withdrawal'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Transfer Form */}
        {activeTab === 'transfer' && (
          <div style={styles.formWrap}>
            <div className="card" style={styles.formCard}>
              <div style={styles.formTopRow}>
                <div style={{ ...styles.formIconBig, background: '#EBF0FA', color: '#003087' }}>↔</div>
                <div>
                  <h3 style={styles.formTitle}>Transfer Funds</h3>
                  <p style={styles.formSubtitle}>Send money between accounts</p>
                </div>
              </div>

              <div style={styles.formDivider} />

              {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

              <form onSubmit={handleTx('transfer')} style={styles.form}>
                <div className="input-group">
                  <label>From Account</label>
                  <select value={transferForm.from_account_id} onChange={(e) => setTransferForm({ ...transferForm, from_account_id: e.target.value })} required>
                    <option value="">Choose account...</option>
                    {accounts.filter(a => a.status === 'active').map(a => (
                      <option key={a.id} value={a.id}>
                        {a.account_type} — {a.account_number} (${parseFloat(a.balance).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>To Account ID</label>
                  <input type="number" placeholder="Destination account ID" value={transferForm.to_account_id} onChange={(e) => setTransferForm({ ...transferForm, to_account_id: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label>Amount (USD)</label>
                  <input type="number" min="0.01" step="0.01" placeholder="0.00" value={transferForm.amount} onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label>Transfer Note <span style={{ color: '#8A99B0', fontWeight: '400' }}>(optional)</span></label>
                  <input type="text" placeholder="e.g. Rent, Invoice #123" value={transferForm.description} onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })} />
                </div>
                <button className="btn btn-primary" style={{ width: '100%', padding: '13px', marginTop: '4px' }} disabled={txLoading}>
                  {txLoading ? <span className="spinner" /> : 'Confirm Transfer'}
                </button>
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

  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  pageTitle: { fontSize: '24px', fontWeight: '800', color: '#0D1B2E', letterSpacing: '-0.5px', marginBottom: '4px' },
  pageSubtitle: { fontSize: '14px', color: '#4A5568' },

  tabBar: {
    display: 'flex',
    gap: '4px',
    background: '#FFFFFF',
    borderRadius: '12px',
    padding: '5px',
    marginBottom: '24px',
    width: 'fit-content',
    border: '1px solid #DDE3ED',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 18px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: '#4A5568',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
  },
  tabActive: {
    background: 'linear-gradient(135deg, #003087 0%, #001F5A 100%)',
    color: '#FFFFFF',
    boxShadow: '0 4px 12px rgba(0,48,135,0.25)',
  },
  tabIcon: { fontSize: '14px' },

  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px' },
  emptyState: { textAlign: 'center', padding: '56px 24px' },
  emptyIcon: { fontSize: '40px', marginBottom: '14px' },

  tableWrap: { overflowX: 'auto', padding: 0 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '13px 16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '700',
    color: '#8A99B0',
    background: '#F8FAFC',
    borderBottom: '1px solid #EEF2F7',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  tr: { borderBottom: '1px solid #EEF2F7', transition: 'background 0.15s ease' },
  td: { padding: '14px 16px', fontSize: '14px', color: '#0D1B2E' },
  refCode: {
    background: '#EBF0FA',
    color: '#003087',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  typeCell: { display: 'flex', alignItems: 'center', gap: '8px' },
  txTypeIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '7px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
  },

  formWrap: { display: 'flex', justifyContent: 'center' },
  formCard: { width: '100%', maxWidth: '500px', padding: '32px' },
  formTopRow: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' },
  formIconBig: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    fontWeight: '700',
    flexShrink: 0,
  },
  formTitle: { fontSize: '18px', fontWeight: '800', color: '#0D1B2E', marginBottom: '2px' },
  formSubtitle: { fontSize: '13px', color: '#4A5568' },
  formDivider: { height: '1px', background: '#EEF2F7', margin: '0 0 20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
};

export default TransactionsPage;
