'use client';

import { useState, useEffect } from 'react';

const LOGO_URL = process.env.NEXT_PUBLIC_LOGO_URL || 'https://raw.githubusercontent.com/NOCKIT09/logo/main/image.png';

interface Prize {
  id: number;
  title: string;
  type: string;
  description: string;
  imageUrl: string;
}

export default function Redeem() {
  const [code, setCode] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showShuffle, setShowShuffle] = useState(false);
  const [prize, setPrize] = useState<Prize | null>(null);
  const [shuffling, setShuffling] = useState(false);

  useEffect(() => {
    // Get deviceId
    let did = localStorage.getItem('deviceId');
    if (!did) {
      did = 'dev_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      localStorage.setItem('deviceId', did);
    }
    setDeviceId(did);

    // Pre-fill code if available
    const ticketCode = localStorage.getItem('ticketCode');
    if (ticketCode) {
      setCode(ticketCode);
    }
  }, []);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code) {
      setError('Please enter your ticket code');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, deviceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'not_approved') {
          throw new Error(data.message);
        }
        throw new Error(data.error || 'Redemption failed');
      }

      // Show shuffle animation
      setShowShuffle(true);
      setShuffling(true);

      // Run shuffle for 3 seconds
      setTimeout(() => {
        setShuffling(false);
        setPrize(data.prize);
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowShuffle(false);
    setPrize(null);
    setCode('');
  };

  return (
    <div className="container">
      <div className="header">
        <img src={LOGO_URL} alt="Brand Logo" className="logo" />
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Redeem Your Ticket</h2>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleRedeem}>
          <div className="input-group">
            <label className="input-label">Ticket Code</label>
            <input
              type="text"
              className="input-field"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="DRM25-KOL-XXXXXX"
              required
              style={{ fontFamily: 'monospace', letterSpacing: '1px' }}
            />
          </div>

          <button
            type="submit"
            className="button button-primary"
            disabled={loading}
          >
            {loading ? 'Checking...' : '🎁 Redeem Prize'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#999' }}>
          Your ticket must be approved by our team before redemption.
        </p>
      </div>

      {/* Shuffle Modal */}
      {showShuffle && (
        <div className="modal-overlay">
          <div className="modal-content">
            {shuffling ? (
              <>
                <h2 style={{ marginBottom: '20px' }}>Shuffling Cards...</h2>
                <div className="shuffle-container">
                  <div className="card-stack">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="prize-card shuffle"
                        style={{
                          animationDelay: `${i * 0.1}s`,
                          zIndex: 5 - i,
                          top: `${i * 2}px`,
                        }}
                      >
                        ?
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : prize ? (
              <div className="prize-result">
                <h2 style={{ color: 'var(--primary-red)', marginBottom: '16px' }}>
                  🎉 Congratulations! 🎉
                </h2>
                
                {prize.imageUrl && (
                  <img src={prize.imageUrl} alt={prize.title} className="prize-image" />
                )}

                <div className="prize-title">{prize.title}</div>
                
                {prize.description && (
                  <div className="prize-description">{prize.description}</div>
                )}

                {prize.type === 'product' && (
                  <div style={{ 
                    background: '#fff3cd', 
                    padding: '12px', 
                    borderRadius: '8px',
                    marginTop: '16px',
                    color: '#856404',
                    fontSize: '14px',
                  }}>
                    <strong>⚠️ Product Win!</strong><br />
                    Please visit our store for on-site verification.
                  </div>
                )}

                <button
                  className="button button-primary"
                  onClick={handleClose}
                  style={{ marginTop: '24px' }}
                >
                  Close
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
