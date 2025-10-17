'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const LOGO_URL = process.env.NEXT_PUBLIC_LOGO_URL || 'https://raw.githubusercontent.com/NOCKIT09/logo/main/image.png';
const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/dreamsunllimited/';
const YOUTUBE_URL = process.env.NEXT_PUBLIC_YOUTUBE_URL || 'https://youtube.com/@dreamsunllimited?si=32NGV0nYhDoNMyqx';
const FACEBOOK_URL = process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://www.facebook.com/share/17R7faq94G/';

export default function Home() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState('');
  const [clicked, setClicked] = useState({
    instagram: false,
    youtube: false,
    facebook: false,
  });
  const [uploaded, setUploaded] = useState({
    instagram: false,
    youtube: false,
    facebook: false,
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize session
    const initSession = async () => {
      // Check localStorage for existing session
      let sid = localStorage.getItem('sessionId');
      if (!sid) {
        const response = await fetch('/api/social/start', { method: 'POST' });
        const data = await response.json();
        sid = data.sessionId;
        if (sid) {
          localStorage.setItem('sessionId', sid);
        }
      }
      if (sid) {
        setSessionId(sid);
      }

      // Load saved state
      const savedClicked = localStorage.getItem('clicked');
      const savedUploaded = localStorage.getItem('uploaded');
      if (savedClicked) setClicked(JSON.parse(savedClicked));
      if (savedUploaded) setUploaded(JSON.parse(savedUploaded));
    };

    initSession();
  }, []);

  const handleSocialClick = (platform: 'instagram' | 'youtube' | 'facebook') => {
    const newClicked = { ...clicked, [platform]: true };
    setClicked(newClicked);
    localStorage.setItem('clicked', JSON.stringify(newClicked));

    // Open social media in new tab
    const urls = {
      instagram: INSTAGRAM_URL,
      youtube: YOUTUBE_URL,
      facebook: FACEBOOK_URL,
    };
    window.open(urls[platform], '_blank');
  };

  const handleFileUpload = async (platform: 'instagram' | 'youtube' | 'facebook', file: File) => {
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG/PNG)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('sessionId', sessionId);
      formData.append('platform', platform);
      formData.append('file', file);

      const response = await fetch('/api/proof/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      const newUploaded = { ...uploaded, [platform]: true };
      setUploaded(newUploaded);
      localStorage.setItem('uploaded', JSON.stringify(newUploaded));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const canContinue = 
    clicked.instagram && clicked.youtube && clicked.facebook &&
    uploaded.instagram && uploaded.youtube && uploaded.facebook;

  const handleContinue = () => {
    router.push('/register');
  };

  return (
    <div className="container">
      <div className="header">
        <img src={LOGO_URL} alt="Brand Logo" className="logo" />
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Follow Us & Upload Proof</h2>
        
        {error && <div className="error">{error}</div>}

        {/* Instagram */}
        <div className="social-button">
          <button
            className="button button-instagram"
            onClick={() => handleSocialClick('instagram')}
            disabled={clicked.instagram}
          >
            <span className="social-icon">📷</span>
            {clicked.instagram ? '✓ Followed Instagram' : 'Follow on Instagram'}
          </button>
        </div>

        {clicked.instagram && (
          <div className={`upload-area ${uploaded.instagram ? 'uploaded' : ''}`}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload('instagram', e.target.files[0])}
              style={{ display: 'none' }}
              id="instagram-upload"
              disabled={uploaded.instagram || uploading}
            />
            <label htmlFor="instagram-upload" style={{ cursor: 'pointer' }}>
              <div className="upload-icon">{uploaded.instagram ? '✓' : '📸'}</div>
              <div className="upload-text">
                {uploaded.instagram ? 'Instagram proof uploaded' : 'Upload Instagram screenshot'}
              </div>
            </label>
          </div>
        )}

        {/* YouTube */}
        <div className="social-button">
          <button
            className="button button-youtube"
            onClick={() => handleSocialClick('youtube')}
            disabled={!clicked.instagram || clicked.youtube}
          >
            <span className="social-icon">▶️</span>
            {clicked.youtube ? '✓ Subscribed YouTube' : 'Subscribe on YouTube'}
          </button>
        </div>

        {clicked.youtube && (
          <div className={`upload-area ${uploaded.youtube ? 'uploaded' : ''}`}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload('youtube', e.target.files[0])}
              style={{ display: 'none' }}
              id="youtube-upload"
              disabled={uploaded.youtube || uploading}
            />
            <label htmlFor="youtube-upload" style={{ cursor: 'pointer' }}>
              <div className="upload-icon">{uploaded.youtube ? '✓' : '📸'}</div>
              <div className="upload-text">
                {uploaded.youtube ? 'YouTube proof uploaded' : 'Upload YouTube screenshot'}
              </div>
            </label>
          </div>
        )}

        {/* Facebook */}
        <div className="social-button">
          <button
            className="button button-facebook"
            onClick={() => handleSocialClick('facebook')}
            disabled={!clicked.youtube || clicked.facebook}
          >
            <span className="social-icon">👍</span>
            {clicked.facebook ? '✓ Liked Facebook' : 'Like on Facebook'}
          </button>
        </div>

        {clicked.facebook && (
          <div className={`upload-area ${uploaded.facebook ? 'uploaded' : ''}`}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload('facebook', e.target.files[0])}
              style={{ display: 'none' }}
              id="facebook-upload"
              disabled={uploaded.facebook || uploading}
            />
            <label htmlFor="facebook-upload" style={{ cursor: 'pointer' }}>
              <div className="upload-icon">{uploaded.facebook ? '✓' : '📸'}</div>
              <div className="upload-text">
                {uploaded.facebook ? 'Facebook proof uploaded' : 'Upload Facebook screenshot'}
              </div>
            </label>
          </div>
        )}

        {uploading && (
          <div style={{ textAlign: 'center', color: '#666', marginTop: '12px' }}>
            Uploading...
          </div>
        )}

        <button
          className="button button-primary"
          onClick={handleContinue}
          disabled={!canContinue}
          style={{ marginTop: '24px' }}
        >
          Continue to Registration
        </button>
      </div>
    </div>
  );
}
