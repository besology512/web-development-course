import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
    const location = useLocation();
    const [email, setEmail] = useState(location.state?.email || '');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/auth/verify-email', { email, code });
            navigate('/login', { state: { message: 'Email verified! You can now log in.' } });
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        }
    };

    return (
        <div className="auth-layout">
            <div className="auth-card glass-panel">
                <h2 className="text-center">Verify Email</h2>
                <p className="text-center mb-4">Enter the 6-digit code sent to your email.</p>
                {error && <div className="text-danger text-center mb-4">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Verification Code</label>
                        <input type="text" maxLength="6" required value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.5rem' }} />
                    </div>
                    <button type="submit" className="btn btn-secondary btn-block">Verify Code</button>
                </form>
            </div>
        </div>
    );
};
export default VerifyEmail;
