import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [flights, setFlights] = useState([]);
    const [searchParams, setSearchParams] = useState({ from: '', to: '', date: '' });
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const fetchFlights = async (queryString = '') => {
        try {
            const res = await axios.get(`http://localhost:5000/api/flights${queryString}`);
            setFlights(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchFlights();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const query = new URLSearchParams(searchParams).toString();
        fetchFlights(`?${query}`);
    };

    const handleBooking = async (flightId) => {
        if (!token) {
            alert("Please login to book a flight");
            navigate('/login');
            return;
        }
        try {
            await axios.post('http://localhost:5000/api/bookings',
                { flightId, numberOfSeats: 1 },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Flight booked successfully!');
            fetchFlights(); // refresh seats
        } catch (err) {
            alert(err.response?.data?.message || 'Booking failed');
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h2>Find Your Next Flight</h2>
                <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>From</label>
                        <input type="text" placeholder="Departure City" value={searchParams.from} onChange={e => setSearchParams({ ...searchParams, from: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>To</label>
                        <input type="text" placeholder="Arrival City" value={searchParams.to} onChange={e => setSearchParams({ ...searchParams, to: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Date</label>
                        <input type="date" value={searchParams.date} onChange={e => setSearchParams({ ...searchParams, date: e.target.value })} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ height: '46px' }}>Search</button>
                </form>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {flights.length === 0 ? <p className="text-center" style={{ gridColumn: '1/-1' }}>No flights found</p> : null}
                {flights.map(flight => (
                    <div key={flight._id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>{flight.flightNumber}</h3>
                            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>${flight.price}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ margin: 0, fontWeight: 'bold', color: 'white' }}>{flight.from}</p>
                            </div>
                            <div>✈️</div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ margin: 0, fontWeight: 'bold', color: 'white' }}>{flight.to}</p>
                            </div>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.875rem' }}>Date: {new Date(flight.date).toLocaleDateString()}</p>
                            <p style={{ fontSize: '0.875rem' }}>Available Seats: <span style={{ color: flight.availableSeats > 0 ? 'var(--secondary)' : 'var(--danger)' }}>{flight.availableSeats}</span></p>
                        </div>
                        <button
                            className="btn btn-primary btn-block"
                            onClick={() => handleBooking(flight._id)}
                            disabled={flight.availableSeats === 0}
                        >
                            {flight.availableSeats > 0 ? 'Book Flight' : 'Sold Out'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default Home;
