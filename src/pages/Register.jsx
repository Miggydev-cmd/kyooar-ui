import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import { getBackendUrl } from '../services/api';
import QRCode from 'react-qr-code';
import { v4 as uuidv4 } from 'uuid';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirm_password: '',
    email: '',
    full_name: '',
    rank: '',
    unit: '',
    phone_number: '',
    birth_date: '',
    role: '',
    id_code: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [showQrCode, setShowQrCode] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already registered
    const storedUser = localStorage.getItem('registered_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      // Pre-fill form with stored data
      setFormData(prev => ({
        ...prev,
        username: userData.username || '',
        email: userData.email || '',
        full_name: userData.full_name || '',
        rank: userData.rank || '',
        unit: userData.unit || '',
        phone_number: userData.phone_number || '',
        birth_date: userData.birth_date || '',
        role: userData.role || '',
        id_code: userData.id_code || '',
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    if (!formData.id_code) {
      setError('Please generate your QR code first.');
      return;
    }
    try {
      const formDataToSend = { ...formData };
      formDataToSend['remember_me'] = rememberMe;
      const response = await axiosInstance.post(`${getBackendUrl()}/api/register/`, formDataToSend, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });
      if (response.data.access_token) {
        // Store user data
        localStorage.setItem('registered_user', JSON.stringify(response.data.user));
        
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
        
        // Clear any existing session data if switching storage types
        if (rememberMe) {
          sessionStorage.removeItem('access_token');
          sessionStorage.removeItem('refresh_token');
          sessionStorage.removeItem('user');
        } else {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
        }
        
        navigate('/login', { replace: true });
      }
    } catch (err) {
      console.error('Registration failed:', err.response?.data || err.message);
      let errorMessage = 'Registration failed. Please try again.';

      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Handle validation errors
        if (errorData.details) {
          // Handle field-specific errors
          const fieldErrors = Object.entries(errorData.details)
            .map(([field, errors]) => {
              if (Array.isArray(errors)) {
                return errors.map(error => {
                  // Format field names for better readability
                  const formattedField = field.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ');
                  
                  // Handle specific error messages
                  if (error.includes('already exists')) {
                    return `${formattedField} is already taken.`;
                  }
                  return `${formattedField}: ${error}`;
                }).join('\n');
              }
              return `${field}: ${errors}`;
            })
            .filter(Boolean)
            .join('\n');

          if (fieldErrors) {
            errorMessage = fieldErrors;
          }
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      }

      setError(errorMessage);
    }
  };

  const handleGenerateQrCode = () => {
    const newIdCode = uuidv4();
    setFormData(prev => ({ ...prev, id_code: newIdCode }));
    setQrValue(newIdCode);
    setShowQrCode(true);
  };

  const ranks = [
    'Airman (Amn)', 'Airman First Class (A1C)', 'Senior Airman (SrA)', 'Staff Sergeant (SSgt)',
    'Technical Sergeant (TSgt)', 'Master Sergeant (MSgt)', 'Senior Master Sergeant (SMSgt)',
    'Chief Master Sergeant (CMSgt)', 'Second Lieutenant (2Lt)', 'First Lieutenant (1Lt)',
    'Captain (Capt)', 'Major (Maj)', 'Lieutenant Colonel (LtCol)', 'Colonel (Col)',
    'Brigadier General (BGen)', 'Major General (MGen)', 'Lieutenant General (LtGen)',
    'General (Gen)', 'Civilian Employee Grade I', 'Civilian Employee Grade II',
    'Civilian Employee Grade III', 'Civilian Employee Grade IV', 'Civilian Employee Grade V',
    'Civilian Employee Grade VI', 'Civilian Employee Grade VII', 'Civilian Employee SG-1',
    'Civilian Employee SG-2', 'Civilian Employee SG-3', 'Not Applicable'
  ];

  const roles = [
    'Military Personnel', 'Civilian Employee', 'Contractor/Supplier', 'Visitor', 'Dependent'
  ];

  const pafUnits = [
    'Air Defense Command (ADC)', '580th Aircraft Control and Warning Wing', '505th Search and Rescue Group',
    'Tactical Operations Command (TOC)', '15th Strike Wing', '300th Air Intelligence and Security Wing',
    '355th Aviation Engineering Wing', '530th Air Base Group', '710th Special Operations Wing',
    'Air Mobility Command (AMC)', '220th Airlift Wing', '250th Presidential Airlift Wing',
    '470th Air Base Group', 'Air Education, Training and Doctrine Command (AETDC)',
    'Air Force Officer School', 'Basic Military Training School', 'Officer Candidate School',
    'PAF Technical and Administrative Training Center', 'PAF Flying School',
    'Air Force Reserve Command (AFRC)', '1st Air Reserve Center', '2nd Air Reserve Center',
    '3rd Air Reserve Center', '4th Air Reserve Center', '5th Air Reserve Center',
    'Air Force General Hospital', 'Air Force Research and Development Center',
    'Air Force Logistics Command', 'Air Installation Management Command',
    'Communications, Electronics and Information System Management', 'Office of the Inspector General',
    'Office of Special Studies', 'Other Units'
  ];

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center">
      <style>{`
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');

        body {
          margin: 0;
          padding: 0;
          min-height: 100vh;
          background: var(--bg-primary);
          overflow: hidden;
        }

        @keyframes rotate {
          100% {
            transform: rotate(1turn);
          }
        }

        .register-box {
          position: relative;
          z-index: 0;
          width: 780px;
          max-width: 95%;
          height: auto;
          max-height: 85vh;
          border-radius: 28px;
          overflow: hidden;
          padding: 2.5rem;
          background: #fdfdfd;
          box-shadow: 0 4px 25px rgba(0, 0, 0, 0.07);
          border: 1px solid #ebebeb;
        }

        .register-box::before,
        .register-box::after {
          display: none;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.2rem;
          position: relative;
          z-index: 1;
        }

        .form-column {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .input-group {
          margin-bottom: 0.4rem;
        }

        .input-group-label {
          color: #555;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 0.3rem;
          display: block;
          position: relative;
          padding-left: 0;
        }

        .input-group-label::before {
          display: none;
        }

        .input-box {
          width: 100%;
          height: 38px;
          margin-bottom: 0.4rem;
          position: relative;
        }

        .input-box input,
        .input-box select {
          width: 100%;
          height: 100%;
          background: #fff;
          border: 1px solid #dcdcdc;
          outline: none;
          border-radius: 10px;
          font-size: 0.9rem;
          color: #333;
          padding: 0 0.8rem;
          transition: all 0.3s ease;
        }

        .input-box input:focus,
        .input-box select:focus {
          border-color: #79b8f3;
          background: #fff;
          box-shadow: 0 0 0 2px rgba(121, 184, 243, 0.3);
        }

        .input-box input::placeholder {
          color: #aaa;
          font-size: 0.9rem;
        }

        .input-box select {
          width: 100%;
          height: 100%;
          background: #fff;
          border: 1px solid #dcdcdc;
          outline: none;
          border-radius: 10px;
          font-size: 0.9rem;
          color: #333;
          padding: 0 0.8rem;
          transition: all 0.3s ease;
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23555' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.7rem center;
          background-size: 1em;
          padding-right: 2.2rem;
        }

        .input-box select:focus {
          border-color: #79b8f3;
          background-color: #fff;
          box-shadow: 0 0 0 2px rgba(121, 184, 243, 0.3);
        }

        .input-box select option {
          background-color: #fff;
          color: #333;
          padding: 0.8rem;
          font-size: 0.9rem;
        }

        .input-box select:hover {
          border-color: #79b8f3;
        }

        .input-box input[type="date"] {
          color-scheme: light;
          padding-right: 0.8rem;
        }

        .input-box input[type="date"]::-webkit-calendar-picker-indicator {
          filter: none;
          opacity: 0.7;
          cursor: pointer;
        }

        .upload-box {
          border: 1px dashed #ccc;
          border-radius: 8px;
          padding: 1rem;
          min-height: 100px;
          background: #fff;
          margin-bottom: 0.8rem;
        }

        .upload-box:hover {
          border-color: #79b8f3;
          background: #f5fafd;
          transform: translateY(-1px);
        }

        .preview-image {
          max-width: 100%;
          max-height: 110px;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .register-button {
          width: 100%;
          height: 42px;
          border: none;
          outline: none;
          border-radius: 10px;
          background: #1a73e8;
          color: #fff;
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 0.8rem;
          text-transform: uppercase;
          box-shadow: 0 2px 8px rgba(26, 115, 232, 0.15);
        }

        .register-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(26, 115, 232, 0.25);
        }

        .register-button:active {
          transform: translateY(0);
          box-shadow: 0 1px 4px rgba(26, 115, 232, 0.15);
        }

        .login-link {
          text-align: center;
          margin-top: 0.9rem;
          font-size: 0.82rem;
          color: #777;
        }

        .login-link a {
          color: #1a73e8;
          text-decoration: none;
          margin-left: 0.4rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .login-link a:hover {
          color: #1a73e8;
          text-decoration: underline;
        }

        h2.register-title {
          font-size: 1.6rem;
          margin-bottom: 1.2rem;
          text-align: center;
          color: #333;
          text-transform: uppercase;
          letter-spacing: 1.8px;
          font-weight: 700;
          position: relative;
        }

        h2.register-title::after {
          content: '';
          position: absolute;
          bottom: -0.4rem;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 3px;
          background: #1a73e8;
          border-radius: 2px;
        }

        .remember-me {
          margin: 0.6rem 0;
          font-size: 0.82rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #777;
        }

        .remember-me input[type="checkbox"] {
          width: 14px;
          height: 14px;
          accent-color: #1a73e8;
          cursor: pointer;
          margin-right: 0.4rem;
        }

        .remember-me label {
          cursor: pointer;
          user-select: none;
        }

        .password-input-container {
          position: relative;
          margin-bottom: 0.4rem;
          width: 100%;
          height: 38px;
        }

        .password-input-container input {
          width: 100%;
          height: 100%;
          background: #fff;
          border: 1px solid #dcdcdc;
          outline: none;
          border-radius: 10px;
          font-size: 0.9rem;
          color: #333;
          padding: 0 2.2rem 0 0.8rem;
          transition: all 0.3s ease;
        }

        .password-input-container input:focus {
          border-color: #79b8f3;
          background: #fff;
          box-shadow: 0 0 0 2px rgba(121, 184, 243, 0.3);
        }

        .password-toggle {
          position: absolute;
          right: 0.8rem;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          color: #777;
          transition: all 0.3s ease;
          z-index: 2;
          font-size: 0.85rem;
        }

        .password-toggle:hover {
          color: #1a73e8;
        }

        .error-message {
          background: rgba(255, 235, 235, 0.7);
          border: 1px solid rgba(255, 150, 150, 0.5);
          color: #cc0000;
          padding: 0.8rem 1rem;
          border-radius: 10px;
          margin-bottom: 0.8rem;
          font-size: 0.85rem;
          display: flex;
          align-items: flex-start;
          gap: 0.4rem;
          white-space: pre-line;
        }

        .error-message::before {
          content: '⚠️';
          font-size: 1rem;
          margin-top: 0.1rem;
        }

        .qr-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 0.8rem;
          gap: 0.4rem;
        }

        .qr-box > div {
           background: #fff;
           padding: 12px;
           border-radius: 20px;
           box-shadow: 0 1px 4px rgba(0,0,0,0.08);
        }

        .qr-box .text-xs {
          margin-top: 0.3rem;
          font-size: 0.82rem;
        }

        .mb-4.p-4.bg-green-100 {
          padding: 1rem;
          background: #e9ffe9;
          border: 1px solid #cceccc;
          color: #338833;
          border-radius: 18px;
        }

        .block.text-sm.font-medium.text-gray-700 {
            color: #555;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.8px;
        }
        .text-red-500 {
            color: #cc0000;
        }
        .mt-1.block.w-full.px-3.py-2.border.border-gray-300.rounded-md.shadow-sm.focus\:outline-none.focus\:ring-red-500.focus\:border-red-500 {
            background: #fff;
            border: 1px solid #dcdcdc;
            border-radius: 10px;
            font-size: 0.9rem;
            color: #333;
            padding: 0 0.8rem;
            box-shadow: none;
        }
        .mt-1.block.w-full.px-3.py-2.pr-10.border.border-gray-300.rounded-md.shadow-sm.focus\:outline-none.focus\:ring-red-500.focus\:border-red-500 {
            background: #fff;
            border: 1px solid #dcdcdc;
            border-radius: 10px;
            font-size: 0.9rem;
            color: #333;
            padding: 0 2.2rem 0 0.8rem;
            box-shadow: none;
        }
        .px-4.py-2.bg-blue-500.text-white.rounded-md.hover\:bg-blue-600.transition-colors.duration-200 {
            background: #1a73e8;
            color: #fff;
            border-radius: 8px;
            font-size: 0.9rem;
            padding: 0.6rem 1rem;
            box-shadow: 0 1px 4px rgba(26, 115, 232, 0.15);
        }
        .px-4.py-2.bg-blue-500.text-white.rounded-md.hover\:bg-blue-600.transition-colors.duration-200:hover {
            box-shadow: 0 2px 8px rgba(26, 115, 232, 0.25);
        }
        .text-\[\#00f2ff\] {
            color: #1a73e8;
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
            gap: 0.8rem;
          }

          .register-box {
            width: 95%;
            max-height: 95vh;
            padding: 1.2rem;
            border-radius: 15px;
          }

          h2.register-title {
            font-size: 1.3rem;
            margin-bottom: 1rem;
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) and (orientation: landscape) {
          .register-box {
            width: 90%;
            max-width: 750px;
            max-height: 88vh;
            padding: 2rem;
          }
          .form-grid {
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
          }
        }

        @media (min-width: 1025px) {
          .register-box {
            width: 780px;
            max-width: 95%;
            max-height: 85vh;
            padding: 2.5rem;
          }
          .form-grid {
            gap: 1.2rem;
          }
        }

        .qr-code-display {
          max-width: 100%;
          overflow: hidden;
          margin: 0.2rem 0;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .qr-code-display:hover {
          transform: scale(1.02);
        }

        .qr-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }

        .qr-modal.active {
          opacity: 1;
          visibility: visible;
        }

        .qr-modal-content {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          text-align: center;
          transform: scale(0.9);
          transition: transform 0.3s ease;
          max-width: 90%;
          max-height: 90vh;
          overflow: auto;
          position: relative;
          z-index: 1001;
        }

        .qr-modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: white;
          border: none;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          color: #333;
          transition: all 0.2s ease;
          z-index: 1002;
        }

        .qr-modal-close:hover {
          background: #f0f0f0;
          transform: rotate(90deg);
        }

        .qr-modal-title {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #333;
        }

        .qr-modal-description {
          font-size: 0.9rem;
          color: #666;
          margin-top: 1rem;
        }
      `}</style>
      <div className="register-box">
        <form onSubmit={handleSubmit}>
          <h2 className="register-title">Register</h2>
          {error && (
            <div className="mb-4 p-3 bg-[#ff2d75] bg-opacity-10 border border-[#ff2d75] rounded-lg text-[#ff2d75] text-sm">
              {error}
            </div>
          )}

          <div className="form-grid">
            {/* Left Column */}
            <div className="form-column">
              {/* Account Information */}
              <div className="input-group">
                <label className="input-group-label">Account Information</label>
                <div className="input-box">
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-box">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                  />
                  <span
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </span>
                </div>
                <div className="password-input-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                    required
                  />
                  <span
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </span>
                </div>
              </div>

              {/* Personal Information */}
              <div className="input-group">
                <label className="input-group-label">Personal Information</label>
                <div className="input-box">
                  <input
                    type="text"
                    name="full_name"
                    placeholder="Full Name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-box">
                  <select
                    name="rank"
                    value={formData.rank}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Rank</option>
                    {ranks.map(rank => (
                      <option key={rank} value={rank}>{rank}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Contact & Details */}
              <div className="input-group">
                <label className="input-group-label">Contact & Details</label>
                <div className="input-box">
                  <input
                    type="tel"
                    name="phone_number"
                    placeholder="Phone Number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-box">
                  <input
                    type="date"
                    name="birth_date"
                    value={formData.birth_date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="form-column">
              {/* Role & Unit */}
              <div className="input-group">
                <label className="input-group-label">Role & Unit</label>
                <div className="input-box">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Role</option>
                    {roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div className="input-box">
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Unit</option>
                    {pafUnits.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* QR Code */}
              <div className="input-group">
                <label className="input-group-label">Your QR Code</label>
                <button type="button" className="register-button" onClick={handleGenerateQrCode} disabled={showQrCode}>
                  {showQrCode ? 'QR Code Generated' : 'Generate QR Code'}
                </button>

                {showQrCode && qrValue && (
                  <>
                    <div 
                      className="qr-code-display mb-1 p-1 rounded-lg flex flex-col items-center" 
                      style={{ backgroundColor: '#ffffff' }}
                      onClick={() => setShowQrModal(true)}
                    >
                      <h3 className="text-xs font-semibold mb-0.5">QR Code</h3>
                      <div className="p-0.5" style={{ background: '#ffffff' }}>
                        <QRCode
                          id="qr-code-value"
                          value={qrValue}
                          size={80}
                          level="H"
                          bgColor="transparent"
                          fgColor="#000000"
                        />
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">Click to enlarge</p>
                    </div>

                    <div className={`qr-modal ${showQrModal ? 'active' : ''}`}>
                      <button 
                        className="qr-modal-close"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowQrModal(false);
                        }}
                      >
                        ×
                      </button>
                      <div 
                        className="qr-modal-content"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <h3 className="qr-modal-title">Your QR Code</h3>
                        <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '8px' }}>
                          <QRCode
                            value={qrValue}
                            size={256}
                            level="H"
                            bgColor="transparent"
                            fgColor="#000000"
                          />
                        </div>
                        <p className="qr-modal-description">
                          This QR code contains your unique identification number.<br />
                          Keep it safe and use it for identification purposes.
                        </p>
                      </div>
                    </div>
                  </>
                )}
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

              <button type="submit" className="register-button">
                Register
              </button>

              <div className="login-link">
                Already have an account?
                <Link to="/login" className="text-[#00f2ff] ml-2">Login here</Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
