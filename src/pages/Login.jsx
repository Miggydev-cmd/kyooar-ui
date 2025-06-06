import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE, loginQR } from '../services/api';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/login/`, {
        username: credentials.username,
        password: credentials.password,
        remember_me: rememberMe
      });
      if (rememberMe) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } else {
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('user', JSON.stringify(response.data.user));
      }
      navigate('/home', { replace: true });
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-[#0f0f0f] flex items-center justify-center">
      <style>{`
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');

        body {
          margin: 0;
          padding: 0;
          min-height: 100vh;
          background: #0f0f0f;
          overflow: hidden;
        }

        @keyframes rotate {
          100% {
            transform: rotate(1turn);
          }
        }

        .login-box {
          position: relative;
          z-index: 0;
          width: 400px; /* Adjusted width for login form */
          max-width: 90%; /* Ensure responsiveness */
          height: auto;
          border-radius: 12px;
          overflow: hidden;
          padding: 2rem;
          background: #1a1a1f;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .login-box::before {
          content: '';
          position: absolute;
          z-index: -2;
          left: -50%;
          top: -50%;
          width: 200%;
          height: 200%;
          background-color: #1a1a1a;
          background-repeat: no-repeat;
          background-position: 0 0;
          background-image: conic-gradient(transparent, #00f2ff, transparent 30%),
                          conic-gradient(transparent, #ff2d75, transparent 30%);
          animation: rotate 4s linear infinite;
        }

        .login-box::after {
          content: '';
          position: absolute;
          z-index: -1;
          left: 6px;
          top: 6px;
          width: calc(100% - 12px);
          height: calc(100% - 12px);
          background: #1a1a1f;
          border-radius: 10px;
          box-shadow: inset 0 0 32px rgba(0, 0, 0, 0.2);
        }

        .form-container {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%; /* Make form take full width of the box */
        }

        .input-group {
          margin-bottom: 0;
          width: 100%; /* Ensure input group takes full width */
        }

        .input-group-label {
          color: rgba(255,255,255,0.9);
          font-size: 1.5rem; /* Increased font size */
          font-weight: 700; /* Make it bold */
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 4rem; /* Increased space below text */
          display: block;
          position: relative;
          text-align: center; /* Center the text */
          padding-left: 0;
        }

        .input-group-label::before {
          content: '';
          position: absolute;
          bottom: -5px; /* Position below the text */
          left: 50%; /* Center the line */
          transform: translateX(-50%);
          width: 50px; /* Width of the line */
          height: 3px; /* Thickness of the line */
          background: #00f2ff;
          border-radius: 2px;
        }

        .input-box {
          width: 100%;
          height: 36px;
          margin-bottom: 0.6rem;
          position: relative;
        }

        .input-box input {
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid rgba(255,255,255,0.1);
          outline: none;
          border-radius: 8px;
          font-size: 0.8rem;
          color: #fff;
          padding: 0 0.875rem;
          transition: all 0.3s ease;
        }

        .input-box input:focus {
          border-color: #00f2ff;
          background: rgba(0, 242, 255, 0.03);
          box-shadow: 0 0 0 4px rgba(0, 242, 255, 0.1);
        }

        .input-box input::placeholder {
          color: rgba(255,255,255,0.35);
          font-size: 0.9rem;
        }

        .password-input-container {
          position: relative;
          width: 100%;
          margin-bottom: 0.6rem;
        }

        .password-input-container input {
          width: 100%;
          height: 36px;
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid rgba(255,255,255,0.1);
          outline: none;
          border-radius: 8px;
          font-size: 0.8rem;
          color: #fff;
          padding: 0 2.5rem 0 0.875rem; /* Added padding for icon */
          transition: all 0.3s ease;
        }

        .password-input-container input:focus {
          border-color: #00f2ff;
          background: rgba(0, 242, 255, 0.03);
          box-shadow: 0 0 0 4px rgba(0, 242, 255, 0.1);
        }

        .password-input-container input::placeholder {
          color: rgba(255,255,255,0.35);
          font-size: 0.9rem;
        }

        .password-toggle {
          position: absolute;
          right: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.4);
          cursor: pointer;
          font-size: 0.9rem;
          transition: color 0.2s ease;
        }

        .password-toggle:hover {
          color: #00f2ff;
        }

        .remember-me {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
          color: rgba(255,255,255,0.7);
          font-size: 0.85rem;
          width: 100%; /* Ensure remember me takes full width */
          justify-content: flex-start; /* Align checkbox to the left */
        }

        .remember-me input[type="checkbox"] {
          margin-right: 0.5rem;
          accent-color: #00f2ff; /* Customizing checkbox color */
        }

        .login-button,
        .qr-login-button {
          width: 100%;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(90deg, #00f2ff 0%, #00c6ff 100%);
          color: #1a1a1f;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
          text-decoration: none; /* Ensure no underline on links styled as buttons */
          display: inline-block; /* Ensure padding works correctly */
          margin-top: 0.5rem; /* Added space above buttons */
        }

        .login-button:hover,
        .qr-login-button:hover {
          background: linear-gradient(90deg, #00c6ff 0%, #00f2ff 100%);
          box-shadow: 0 4px 12px rgba(0, 242, 255, 0.3);
        }

        .error-message {
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: rgba(255, 45, 117, 0.1);
          border: 1px solid #ff2d75;
          border-radius: 8px;
          color: #ff2d75;
          font-size: 0.85rem;
          text-align: center;
        }

        .divider {
          position: relative;
          text-align: center;
          margin: 1.5rem 0;
          color: rgba(255,255,255,0.5);
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          width: 100%; /* Make divider take full width */
        }

        .divider::before,
        .divider::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 35%; /* Adjusted width for better spacing */
          height: 1px;
          background: rgba(255,255,255,0.2);
        }

        .divider::before {
          left: 0;
        }

        .divider::after {
          right: 0;
        }

        .links {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 1.5rem;
          font-size: 0.9rem;
          width: 100%; /* Make links container take full width */
        }

        .links a {
          color: #00f2ff;
          text-decoration: none;
          transition: color 0.2s ease;
          margin-bottom: 0.5rem; /* Added space between links */
        }

        .links a:hover {
          color: #fff;
          text-decoration: underline;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .login-box {
            width: 90%;
            padding: 1rem;
          }

          .form-container {
            gap: 0.8rem;
          }

          .input-group-label {
            font-size: 1.2rem; /* Adjusted for smaller screens */
            margin-bottom: 2.5rem; /* Adjusted space for smaller screens */
          }

          .input-box input,
          .input-box select,
          .password-input-container input {
            font-size: 0.75rem;
            padding: 0 0.75rem;
          }

          .password-input-container input {
             padding: 0 2rem 0 0.75rem; /* Adjusted padding for icon */
          }

          .password-toggle {
            right: 0.75rem;
            font-size: 0.8rem;
          }

          .remember-me {
            font-size: 0.8rem;
          }

          .login-button,
          .qr-login-button {
            font-size: 0.9rem;
            padding: 0.6rem 1rem;
          }

          .error-message {
             padding: 0.6rem;
             font-size: 0.8rem;
          }

          .divider {
            margin: 1rem 0;
            font-size: 0.7rem;
          }

          .links {
            margin-top: 1rem;
            font-size: 0.85rem;
          }
        }

      `}</style>
      <div className="login-box">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="form-container">
          <div className="input-group">
            <label className="input-group-label">Login</label>
            <div className="input-box">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={credentials.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={credentials.password}
                onChange={handleChange}
                required
              />
              <span
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </span>
            </div>
          </div>

          <div className="remember-me">
            <input
              type="checkbox"
              id="remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember-me">Remember me</label>
          </div>

          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>

        <div className="divider">OR</div>

        <button
          onClick={() => navigate('/qr-login', { replace: true })}
          className="qr-login-button"
        >
          Scan QR to Login
        </button>

        <div className="links">
          <Link to="/forgot-password">
            Forgot Password?
          </Link>
          <Link to="/register">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
