import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchBookings = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/bookings/mybookings', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBookings(res.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchBookings();
    }, [token, navigate]);

    return (
        <div className="animate-fade-in">
            <h2 style={{ marginBottom: '2rem' }}>My Bookings History</h2>

            {bookings.length === 0 ? (
                <div className="glass-panel text-center" style={{ padding: '3rem' }}>
                    <p>You haven't booked any flights yet.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {bookings.map(booking => (
                        <div key={booking._id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h4 style={{ margin: 0, color: 'var(--primary)' }}>Flight {booking.flight.flightNumber}</h4>
                                <p style={{ margin: '0.5rem 0', color: 'white' }}>{booking.flight.from} ✈️ {booking.flight.to}</p>
                                <p style={{ fontSize: '0.875rem', margin: 0 }}>Departure: {new Date(booking.flight.date).toLocaleDateString()}</p>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <p style={{ margin: '0 0 0.5rem 0' }}>Seats booked: {booking.numberOfSeats}</p>
                                <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Total: ${booking.totalPrice}</p>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '99px',
                                    fontSize: '0.875rem',
                                    backgroundColor: booking.status === 'confirmed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                    color: booking.status === 'confirmed' ? 'var(--secondary)' : 'var(--danger)',
                                    textTransform: 'capitalize'
                                }}>
                                    {booking.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default Bookings;
