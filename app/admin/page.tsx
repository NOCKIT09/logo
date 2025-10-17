'use client';

import { useState, useEffect } from 'react';

const LOGO_URL = process.env.NEXT_PUBLIC_LOGO_URL || 'https://raw.githubusercontent.com/NOCKIT09/logo/main/image.png';

interface Ticket {
  id: number;
  name: string;
  phone: string;
  email: string;
  code: string;
  status: string;
  approved: number;
  createdAt: string;
}

interface Prize {
  id: number;
  title: string;
  type: string;
  description: string;
  imageUrl: string;
  quantity: number;
  weight: number;
}

export default function Admin() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'tickets' | 'prizes'>('tickets');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [newPrize, setNewPrize] = useState({
    title: '',
    type: 'voucher',
    description: '',
    imageUrl: '',
    quantity: -1,
    weight: 1.0,
  });

  useEffect(() => {
    const savedPassword = sessionStorage.getItem('adminPassword');
    if (savedPassword) {
      setPassword(savedPassword);
      setAuthenticated(true);
      loadTickets(savedPassword);
      loadPrizes(savedPassword);
    }
  }, []);

  const handleLogin = () => {
    sessionStorage.setItem('adminPassword', password);
    setAuthenticated(true);
    loadTickets(password);
    loadPrizes(password);
  };

  const loadTickets = async (pwd: string, query = '') => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/search?adminPassword=${encodeURIComponent(pwd)}&q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (response.ok) {
        setTickets(data.tickets || []);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPrizes = async (pwd: string) => {
    try {
      const response = await fetch(`/api/admin/prizes?adminPassword=${encodeURIComponent(pwd)}`);
      const data = await response.json();
      if (response.ok) {
        setPrizes(data.prizes || []);
      }
    } catch (err) {
      console.error('Failed to load prizes:', err);
    }
  };

  const handleSearch = () => {
    loadTickets(password, searchQuery);
  };

  const handleApprove = async (code: string) => {
    try {
      await fetch(`/api/tickets/${code}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true, adminPassword: password }),
      });
      loadTickets(password, searchQuery);
    } catch (err) {
      console.error('Failed to approve:', err);
    }
  };

  const handleStatusChange = async (code: string, status: string) => {
    try {
      await fetch(`/api/tickets/${code}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminPassword: password }),
      });
      loadTickets(password, searchQuery);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async (code: string) => {
    const confirmCode = prompt(`Type "${code}" to confirm deletion:`);
    if (confirmCode !== code) {
      alert('Code does not match. Deletion cancelled.');
      return;
    }

    try {
      await fetch(`/api/tickets/${code}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPassword: password }),
      });
      loadTickets(password, searchQuery);
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleExport = () => {
    window.open(`/api/admin/export?adminPassword=${encodeURIComponent(password)}`, '_blank');
  };

  const handleViewProofs = (code: string) => {
    window.open(`/api/admin/proofs/${code}?adminPassword=${encodeURIComponent(password)}`, '_blank');
  };

  const handleDownloadProofs = (code: string) => {
    window.open(`/api/admin/proofs/${code}?adminPassword=${encodeURIComponent(password)}&download=zip`, '_blank');
  };

  const handleAddPrize = async () => {
    try {
      await fetch('/api/admin/prizes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newPrize, adminPassword: password }),
      });
      setNewPrize({
        title: '',
        type: 'voucher',
        description: '',
        imageUrl: '',
        quantity: -1,
        weight: 1.0,
      });
      loadPrizes(password);
    } catch (err) {
      console.error('Failed to add prize:', err);
    }
  };

  const handleDeletePrize = async (id: number) => {
    if (!confirm('Delete this prize?')) return;

    try {
      await fetch(`/api/admin/prizes/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPassword: password }),
      });
      loadPrizes(password);
    } catch (err) {
      console.error('Failed to delete prize:', err);
    }
  };

  if (!authenticated) {
    return (
      <div className="container">
        <div className="header">
          <img src={LOGO_URL} alt="Brand Logo" className="logo" />
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Admin Login</h2>
          
          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Enter admin password"
            />
          </div>

          <button className="button button-primary" onClick={handleLogin}>
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="header">
        <img src={LOGO_URL} alt="Brand Logo" className="logo" />
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <button
          className={`button ${activeTab === 'tickets' ? 'button-primary' : 'button-secondary'}`}
          onClick={() => setActiveTab('tickets')}
          style={{ flex: 1 }}
        >
          Tickets
        </button>
        <button
          className={`button ${activeTab === 'prizes' ? 'button-primary' : 'button-secondary'}`}
          onClick={() => setActiveTab('prizes')}
          style={{ flex: 1 }}
        >
          Prizes
        </button>
      </div>

      {activeTab === 'tickets' ? (
        <>
          <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
            <input
              type="text"
              className="search-box"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by phone, code, or name..."
              style={{ flex: 1 }}
            />
            <button className="button button-primary" onClick={handleSearch} style={{ width: 'auto' }}>
              Search
            </button>
            <button className="button button-secondary" onClick={handleExport} style={{ width: 'auto' }}>
              Export CSV
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Approved</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td style={{ fontFamily: 'monospace' }}>{ticket.code}</td>
                      <td>{ticket.name}</td>
                      <td>{ticket.phone}</td>
                      <td>{ticket.email || '-'}</td>
                      <td>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          background: ticket.status === 'active' ? '#d4edda' : ticket.status === 'used' ? '#fff3cd' : '#f8d7da',
                          color: ticket.status === 'active' ? '#155724' : ticket.status === 'used' ? '#856404' : '#721c24',
                        }}>
                          {ticket.status}
                        </span>
                      </td>
                      <td>{ticket.approved ? '✓' : '✗'}</td>
                      <td style={{ fontSize: '12px' }}>{new Date(ticket.createdAt).toLocaleString()}</td>
                      <td>
                        {!ticket.approved && (
                          <button className="action-button action-approve" onClick={() => handleApprove(ticket.code)}>
                            Approve
                          </button>
                        )}
                        {ticket.status === 'active' && (
                          <button className="action-button action-used" onClick={() => handleStatusChange(ticket.code, 'used')}>
                            Mark Used
                          </button>
                        )}
                        {ticket.status === 'active' && (
                          <button className="action-button action-cancel" onClick={() => handleStatusChange(ticket.code, 'cancelled')}>
                            Cancel
                          </button>
                        )}
                        <button className="action-button" onClick={() => handleViewProofs(ticket.code)} style={{ background: '#17a2b8', color: 'white' }}>
                          View Proofs
                        </button>
                        <button className="action-button" onClick={() => handleDownloadProofs(ticket.code)} style={{ background: '#6f42c1', color: 'white' }}>
                          Download
                        </button>
                        <button className="action-button action-delete" onClick={() => handleDelete(ticket.code)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '16px' }}>Add New Prize</h3>
            
            <div className="input-group">
              <label className="input-label">Title</label>
              <input
                type="text"
                className="input-field"
                value={newPrize.title}
                onChange={(e) => setNewPrize({ ...newPrize, title: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Type</label>
              <select
                className="input-field"
                value={newPrize.type}
                onChange={(e) => setNewPrize({ ...newPrize, type: e.target.value })}
              >
                <option value="voucher">Voucher</option>
                <option value="product">Product</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Description</label>
              <textarea
                className="input-field"
                value={newPrize.description}
                onChange={(e) => setNewPrize({ ...newPrize, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Image URL</label>
              <input
                type="text"
                className="input-field"
                value={newPrize.imageUrl}
                onChange={(e) => setNewPrize({ ...newPrize, imageUrl: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Quantity (-1 = unlimited)</label>
                <input
                  type="number"
                  className="input-field"
                  value={newPrize.quantity}
                  onChange={(e) => setNewPrize({ ...newPrize, quantity: parseInt(e.target.value) })}
                />
              </div>

              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Weight</label>
                <input
                  type="number"
                  step="0.1"
                  className="input-field"
                  value={newPrize.weight}
                  onChange={(e) => setNewPrize({ ...newPrize, weight: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <button className="button button-primary" onClick={handleAddPrize}>
              Add Prize
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Weight</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prizes.map((prize) => (
                  <tr key={prize.id}>
                    <td>{prize.title}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        background: prize.type === 'product' ? '#ffd700' : '#d4edda',
                        color: '#000',
                      }}>
                        {prize.type}
                      </span>
                    </td>
                    <td>{prize.description || '-'}</td>
                    <td>{prize.quantity === -1 ? '∞' : prize.quantity}</td>
                    <td>{prize.weight}</td>
                    <td>
                      <button className="action-button action-delete" onClick={() => handleDeletePrize(prize.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
