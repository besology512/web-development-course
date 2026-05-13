'use client';

import React, { useState } from 'react';
import { loginWithGoogle } from '@/lib/firebase';
import TerminalUI from '@/components/TerminalUI';
import { Ghost, LogIn } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [idToken, setIdToken] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [mfaPending, setMfaPending] = useState(false);
  const [mfaUid, setMfaUid] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { user, idToken } = await loginWithGoogle();
      
      // Send to backend for silent registration
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/auth/login`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.status === 'PENDING_MFA') {
        setMfaPending(true);
        setMfaUid(data.uid);
      } else if (response.ok) {
        setUser(user);
        setIdToken(idToken);
      } else {
        setError('Backend authentication failed');
      }
    } catch (error) {
      setError('Login flow failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/auth/verify-mfa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: mfaUid, code: otp })
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        // idToken is already set if needed
      } else {
        setError('Invalid or expired OTP code');
      }
    } catch (err) {
      setError('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div className="logo-section">
            <Ghost size={48} className="ghost-logo" />
            <h1>GHOST_MESSENGER</h1>
            <p>ESTABLISHING_IDENTITY_REQUIRED</p>
          </div>
          
          {!mfaPending ? (
            <button 
              onClick={handleLogin} 
              disabled={loading}
              className="login-btn"
            >
              <LogIn size={20} />
              {loading ? 'INITIALIZING_OAUTH...' : 'AUTHENTICATE_WITH_GOOGLE'}
            </button>
          ) : (
            <form onSubmit={handleVerifyMFA} className="mfa-form">
              <input 
                type="text" 
                maxLength={6} 
                placeholder="6-DIGIT_CODE" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                autoFocus
              />
              <button disabled={loading} className="login-btn">
                {loading ? 'VERIFYING...' : 'SECURE_SESSION'}
              </button>
              <button type="button" onClick={() => setMfaPending(false)} className="cancel-link">
                CANCEL_HANDSHAKE
              </button>
            </form>
          )}

          {error && <p className="error-msg">{error}</p>}

          <div className="security-footer">
            <p>ENCRYPTION: AES-256 (ACTIVE)</p>
            <p>STORAGE: VOLATILE_REDIS_LIST</p>
          </div>
        </div>

        <style jsx>{`
          .login-screen {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #050505;
            color: #00ff41;
            font-family: 'JetBrains Mono', monospace;
          }

          .login-card {
            background: #0a0a0a;
            border: 1px solid #222;
            padding: 3rem;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 0 20px rgba(0, 255, 65, 0.05);
            max-width: 400px;
            width: 100%;
          }

          .logo-section h1 {
            font-size: 1.5rem;
            letter-spacing: 2px;
            margin: 1rem 0 0.5rem;
          }

          .logo-section p {
            font-size: 0.8rem;
            color: #555;
            margin-bottom: 2rem;
          }

          .ghost-logo {
            animation: float 3s ease-in-out infinite;
          }

          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }

          .login-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            width: 100%;
            padding: 1rem;
            background: #00ff41;
            color: #000;
            border: none;
            border-radius: 4px;
            font-family: inherit;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.1s, background 0.2s;
          }

          .login-btn:hover {
            background: #00cf35;
          }

          .login-btn:active {
            transform: scale(0.98);
          }

          .login-btn:disabled {
            background: #222;
            color: #555;
            cursor: not-allowed;
          }

          .security-footer {
            margin-top: 2rem;
            font-size: 0.6rem;
            color: #333;
            text-align: left;
            border-top: 1px solid #111;
            padding-top: 1rem;
          }

          .security-footer p { margin: 0.2rem 0; }

          .mfa-form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .mfa-form input {
            background: #111;
            border: 1px solid #333;
            color: #00ff41;
            padding: 1rem;
            text-align: center;
            font-size: 1.2rem;
            letter-spacing: 4px;
            font-family: inherit;
            outline: none;
          }

          .cancel-link {
            background: none;
            border: none;
            color: #555;
            font-size: 0.7rem;
            cursor: pointer;
            font-family: inherit;
            margin-top: 0.5rem;
          }

          .error-msg {
            color: #ff0000;
            font-size: 0.8rem;
            margin-top: 1rem;
          }
        `}</style>
      </div>
    );
  }

  return <TerminalUI user={user} idToken={idToken} />;
}
