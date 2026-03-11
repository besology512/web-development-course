import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const message = location.state?.message;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/');
            window.location.reload(); // Quick refresh for navbar state
        } catch (err) {
            if (err.response?.data?.notVerified) {
                navigate('/verify-email', { state: { email: formData.email } });
            } else {
                setError(err.response?.data?.message || 'Login failed');
            }
        }
    };

    return (
        <div className="auth-layout">
            <div className="auth-card glass-panel">
                <h2 className="text-center">Welcome Back</h2>
                <p className="text-center mb-4">Log in to manage your bookings</p>
                {message && <div className="text-success text-center mb-4">{message}</div>}
                {error && <div className="text-danger text-center mb-4">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">Log In</button>
                </form>
                <div className="text-center mt-4">
                    <p>Don't have an account? <Link to="/register" className="text-success">Sign up</Link></p>
                </div>
            </div>
        </div>
    );
};
export default Login;
