// src/pages/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  console.log('✅ Login page loaded');

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('📨 Submitting login for:', email);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        { email, password }
      );
      console.log('✅ Login response:', response.data);

      const { token } = response.data;
      localStorage.setItem('token', token);

      // Decode the JWT to extract role
      const decoded = jwtDecode(token);
      const role = decoded?.role || 'CUSTOMER';  // ⬅️ updated line
      console.log('🎫 Decoded role:', role);

      localStorage.setItem('role', role);
      setMessage('✅ Login successful');

      // Redirect based on role
      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'RESTAURANT_MANAGER') navigate('/manager');
      else navigate('/search');
    } catch (error) {
      console.error('❌ Login error:', error.response || error);
      setMessage('❌ Login failed');
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '400px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px' }}>Login</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button
          type="submit"
          style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none' }}
        >
          Login
        </button>
      </form>
      <p style={{ marginTop: '20px' }}>{message}</p>
    </div>
  );
}
