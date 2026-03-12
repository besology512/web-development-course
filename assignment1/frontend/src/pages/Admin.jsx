import { useState, useEffect } from 'react';
import axios from 'axios';

const Admin = () => {
    const [flights, setFlights] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [newFlight, setNewFlight] = useState({
        flightNumber: '',
        from: '',
        to: '',
        date: '',
        totalSeats: '',
        price: ''
    });

    const token = localStorage.getItem('token');

    const fetchData = async () => {
        try {
            const flightsRes = await axios.get('http://localhost:5000/api/flights');
            setFlights(flightsRes.data);

            const bookingsRes = await axios.get('http://localhost:5000/api/bookings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(bookingsRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateFlight = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/flights', newFlight, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Flight created successfully!');
            setNewFlight({ flightNumber: '', from: '', to: '', date: '', totalSeats: '', price: '' });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create flight');
        }
    };

    const handleDeleteFlight = async (id) => {
        if (!window.confirm('Are you sure you want to delete this flight?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/flights/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete flight');
        }
    };

    const handleUpdateBookingStatus = async (id, status) => {
        try {
            await axios.put(`http://localhost:5000/api/bookings/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
        }
    };

    return (
        <div className="animate-fade-in">
            <h1 className="text-center" style={{ marginBottom: '2rem' }}>Admin Dashboard</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h2>Create New Flight</h2>
                    <form onSubmit={handleCreateFlight} className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input type="text" placeholder="Flight Number" value={newFlight.flightNumber} onChange={e => setNewFlight({ ...newFlight, flightNumber: e.target.value })} required />
                        <input type="text" placeholder="From" value={newFlight.from} onChange={e => setNewFlight({ ...newFlight, from: e.target.value })} required />
                        <input type="text" placeholder="To" value={newFlight.to} onChange={e => setNewFlight({ ...newFlight, to: e.target.value })} required />
                        <input type="datetime-local" value={newFlight.date} onChange={e => setNewFlight({ ...newFlight, date: e.target.value })} required />
                        <input type="number" placeholder="Total Seats" value={newFlight.totalSeats} onChange={e => setNewFlight({ ...newFlight, totalSeats: e.target.value })} required />
                        <input type="number" placeholder="Price ($)" value={newFlight.price} onChange={e => setNewFlight({ ...newFlight, price: e.target.value })} required />
                        <button type="submit" className="btn btn-primary btn-block">Add Flight</button>
                    </form>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', maxHeight: '600px', overflowY: 'auto' }}>
                    <h2>Manage Flights</h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding: '1rem 0' }}>Flight</th>
                                <th>Route</th>
                                <th>Seats</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {flights.map(flight => (
                                <tr key={flight._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem 0' }}>{flight.flightNumber}</td>
                                    <td>{flight.from} → {flight.to}</td>
                                    <td>{flight.availableSeats}/{flight.totalSeats}</td>
                                    <td>
                                        <button onClick={() => handleDeleteFlight(flight._id)} className="btn btn-danger" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
                <h2>Recent Bookings</h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding: '1rem 0' }}>User</th>
                                <th>Flight</th>
                                <th>Seats</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(booking => (
                                <tr key={booking._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem 0' }}>
                                        {booking.user?.name}<br />
                                        <small style={{ opacity: 0.6 }}>{booking.user?.email}</small>
                                    </td>
                                    <td>{booking.flight?.flightNumber || 'N/A'}</td>
                                    <td>{booking.numberOfSeats}</td>
                                    <td>${booking.totalPrice}</td>
                                    <td>
                                        <span style={{ 
                                            padding: '0.2rem 0.6rem', 
                                            borderRadius: '20px', 
                                            fontSize: '0.8rem',
                                            backgroundColor: booking.status === 'confirmed' ? 'rgba(0,255,0,0.1)' : booking.status === 'canceled' ? 'rgba(255,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                                            color: booking.status === 'confirmed' ? '#4ade80' : booking.status === 'canceled' ? '#f87171' : 'white'
                                        }}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td>
                                        <select 
                                            value={booking.status} 
                                            onChange={(e) => handleUpdateBookingStatus(booking._id, e.target.value)}
                                            style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '0.2rem', borderRadius: '4px' }}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="canceled">Canceled</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Admin;
