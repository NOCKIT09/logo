'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const LOGO_URL = process.env.NEXT_PUBLIC_LOGO_URL || 'https://raw.githubusercontent.com/NOCKIT09/logo/main/image.png';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    // Get or create deviceId
    let did = localStorage.getItem('deviceId');
    if (!did) {
      did = 'dev_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      localStorage.setItem('deviceId', did);
    }
    setDeviceId(did);

    // Get sessionId
    const sid = localStorage.getItem('sessionId');
    if (!sid) {
      router.push('/');
      return;
    }
    setSessionId(sid);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.phone) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate phone number
    if (!/^\d{10,15}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          deviceId,
          sessionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Save code and redirect to success page
      localStorage.setItem('ticketCode', data.code);
      router.push('/success');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <img src={LOGO_URL} alt="Brand Logo" className="logo" />
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Registration</h2>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Full Name *</label>
            <input
              type="text"
              className="input-field"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Phone Number *</label>
            <input
              type="tel"
              className="input-field"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Email (Optional)</label>
            <input
              type="email"
              className="input-field"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email"
            />
          </div>

          <button
            type="submit"
            className="button button-primary"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}
