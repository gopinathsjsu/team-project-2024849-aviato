import React, { useState } from 'react';
import axios from 'axios';

export default function SearchRestaurants() {
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [people, setPeople] = useState(2);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setResults([]);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('❌ You must be logged in to search.');
        return;
      }

      const params = new URLSearchParams({
        date,
        time,
        partySize: people,
      });
      if (city) params.append('city', city);
      if (state) params.append('state', state);
      if (zip) params.append('zip', zip);

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/restaurants/search?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setResults(response.data);
    } catch (err) {
      console.error('Search failed:', err);
      setError('❌ Failed to fetch restaurants. Please try again.');
    }
  };

  return (
    <div style={{ padding: '30px' }}>
      <h2>Search for Restaurants</h2>
      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        &nbsp;
        <input
          type="text"
          placeholder="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
        />
        &nbsp;
        <input
          type="text"
          placeholder="Zip"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
        />
        &nbsp;
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        &nbsp;
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />
        &nbsp;
        <input
          type="number"
          min="1"
          value={people}
          onChange={(e) => setPeople(e.target.value)}
          required
        />
        &nbsp;
        <button type="submit">Search</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {results.length > 0 && (
        <div>
          <h3>Available Restaurants:</h3>
          {results.map((r) => (
            <div
              key={r.restaurantId}
              style={{
                border: '1px solid #ccc',
                padding: '15px',
                marginBottom: '10px',
              }}
            >
              <h3>{r.name}</h3>
              <p>{r.description}</p>
              <p>
                📍 {r.address}, {r.city}, {r.state} {r.zipCode} <br />
                🍽 Cuisine: {r.cuisine} | 💲 {r.costRating} | 📞 {r.phone}
              </p>
              {r.photoUrl && (
                <img
                  src={r.photoUrl}
                  alt={r.name}
                  style={{ width: '100%', maxWidth: '300px', marginTop: '10px' }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
