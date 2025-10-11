import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LoginPage.css'; // We will create this file next

const LoginPage = () => {
  // State for the form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Get the login function from our context and the navigate function for redirection
  const { login } = useAuth();
  const navigate = useNavigate();
  

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  try {
    // This now calls the REAL Firebase login function
    await login(email, password); 
    navigate('/dashboard');
  } catch (err) {
    setError('Failed to log in. Please check your credentials.');
    console.error(err);
  }
};

// src/pages/Login/LoginPage.jsx

// ... imports and component logic ...

// src/pages/Login/LoginPage.jsx

// ... imports and component logic ...

return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">DR Detection System</h1>
        <p className="auth-subtitle">Welcome back! Please log in to your account.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-button">Login</button>
          <p className="auth-switch">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;