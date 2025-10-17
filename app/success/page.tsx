'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const LOGO_URL = process.env.NEXT_PUBLIC_LOGO_URL || 'https://raw.githubusercontent.com/NOCKIT09/logo/main/image.png';

export default function Success() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ticketCode = localStorage.getItem('ticketCode');
    if (!ticketCode) {
      router.push('/');
      return;
    }
    setCode(ticketCode);
  }, [router]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleRedeem = () => {
    router.push('/redeem');
  };

  return (
    <div className="container">
      <div className="header">
        <img src={LOGO_URL} alt="Brand Logo" className="logo" />
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '20px', textAlign: 'center', color: 'var(--primary-red)' }}>
          Registration Successful! 🎉
        </h2>

        <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
          Please take a screenshot of this ticket number:
        </p>

        <div className="success-code">{code}</div>

        <button
          className="button button-secondary"
          onClick={handleCopy}
          style={{ marginBottom: '12px' }}
        >
          {copied ? '✓ Copied!' : '📋 Copy Code'}
        </button>

        <button
          className="button button-primary"
          onClick={handleRedeem}
        >
          🎁 Redeem Now
        </button>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#999' }}>
          You can redeem your ticket once it's approved by our team.
        </p>
      </div>
    </div>
  );
}
