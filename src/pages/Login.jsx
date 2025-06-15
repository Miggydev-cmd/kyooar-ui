import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import { getBackendUrl } from '../services/api';
import { FaQrcode } from 'react-icons/fa';
import QRScanner from '../components/QRScanner';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for stored credentials
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('access_token');
    
    if (storedUser && storedToken) {
      const userData = JSON.parse(storedUser);
      setFormData({
        username: userData.username,
        password: '' // Don't auto-fill password for security
      });
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Clear all tokens and user data from both storages before attempting new login
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user');

    try {
      console.log('Attempting login with:', { username: formData.username });
      const response = await axiosInstance.post(`${getBackendUrl()}/api/auth/login/`, {
        username: formData.username,
        password: formData.password
      });

      console.log('Login response:', response.data);

      if (response.data.access_token) {
        setSuccess('Login successful! Redirecting...');
        
        // Store tokens based on remember me preference
        if (rememberMe) {
          localStorage.setItem('access_token', response.data.access_token);
          localStorage.setItem('refresh_token', response.data.refresh_token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } else {
          sessionStorage.setItem('access_token', response.data.access_token);
          sessionStorage.setItem('refresh_token', response.data.refresh_token);
          sessionStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        // Add a small delay before navigation
        setTimeout(() => {
          // Redirect to the attempted URL or home page
          const from = location.state?.from?.pathname || '/home';
          console.log('Login: Navigating to:', from);
          navigate(from, { replace: true });
        }, 1000);
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      setError(error.response?.data?.error || 'Login failed. Please check your credentials.');
    }
  };

  const handleQRScan = async (qrData) => {
    console.log('QR Data received:', qrData);
    setError('');
    setSuccess('');
    
    // Clear all tokens and user data from both storages before attempting new QR login
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user');

    try {
      const response = await axiosInstance.post(`${getBackendUrl()}/api/auth/login/qr/`, {
        id_code: qrData
      });

      console.log('QR Login response:', response.data);

      if (response.data.access_token) {
        setSuccess('QR Code successfully scanned! Logging you in...');
        
        let userToStore = response.data.user;
        if (!userToStore || Object.keys(userToStore).length === 0) {
          // Fallback: if backend user object is empty, create a minimal one from formData
          userToStore = {
            username: formData.username || 'scanned_user',
            name: 'Scanned User', // Default name to prevent HomePage rendering issues
            email: 'scanned@example.com' // Default email to prevent HomePage rendering issues
          };
          console.warn('QR Login: Backend returned empty user object, creating minimal user for storage.', userToStore);
        } else {
          // Ensure name and email are present, even if empty strings from backend
          userToStore.name = userToStore.name || 'Unknown User';
          userToStore.email = userToStore.email || 'unknown@example.com';
        }

        // Store tokens
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        localStorage.setItem('user', JSON.stringify(userToStore));
        
        // Close scanner
        setShowScanner(false);
        
        // Add a small delay before navigation
        setTimeout(() => {
          // Redirect to the attempted URL or home page
          const from = location.state?.from?.pathname || '/home';
          console.log('Login: Navigating to:', from);
          navigate(from, { replace: true });
        }, 1000);
      }
    } catch (err) {
      console.error('QR Login failed:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'QR Login failed. Please try again.');
      setShowScanner(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Login</h1>
            <p className="text-gray-600">Welcome back to the Military Inventory System</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="flex flex-col space-y-4">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <FaQrcode className="mr-2" />
                Login with QR Code
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-red-600 hover:text-red-500">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {showScanner && (
        <QRScanner
          onScan={handleQRScan}
          onError={(error) => setError(error.message)}
          onClose={() => setShowScanner(false)}
          title="QR Code Login"
          description="Scan your military ID QR code to login"
        />
      )}
    </div>
  );
};

export default Login;
