import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="navbar glass-panel">
            <div className="container">
                <Link to="/" className="nav-brand">
                    ✈️ AeroBooking
                </Link>
                <div className="nav-links">
                    {token ? (
                        <>
                            <Link to="/" className="nav-link">Search Flights</Link>
                            <Link to="/bookings" className="nav-link">My Bookings</Link>
                            {user?.role === 'admin' && (
                                <span className="nav-link" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Admin Panel</span>
                            )}
                            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 1rem' }}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/register" className="btn btn-primary" style={{ padding: '0.4rem 1rem' }}>Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};
export default Navbar;
