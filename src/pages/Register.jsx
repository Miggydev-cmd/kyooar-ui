import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../services/api';
import QRCode from 'react-qr-code';
import { v4 as uuidv4 } from 'uuid';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirm_password: '',
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
  const navigate = useNavigate();

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
      // delete formDataToSend.confirm_password;
      formDataToSend['remember_me'] = rememberMe;
      const response = await axios.post(`${BACKEND_URL}/api/register/`, formDataToSend, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });
      if (response.data.token) {
        localStorage.setItem('registered_user', JSON.stringify(response.data.user));
        if (rememberMe) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } else {
          sessionStorage.setItem('token', response.data.token);
          sessionStorage.setItem('user', JSON.stringify(response.data.user));
        }
        navigate('/login', { replace: true });
      }
    } catch (err) {
      console.error('Registration failed:', err.response?.data || err.message);
      setError('Registration failed. Please try again.');
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

        .register-box {
          position: relative;
          z-index: 0;
          width: 600px;
          max-width: 95%;
          height: auto;
          border-radius: 12px;
          overflow: hidden;
          padding: 1.2rem;
          background: #1a1a1f;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .register-box::before {
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

        .register-box::after {
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

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          position: relative;
          z-index: 1;
        }

        .form-column {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-group {
          margin-bottom: 0.1rem;
        }

        .input-group-label {
          color: rgba(255,255,255,0.9);
          font-size: 0.65rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 0.3rem;
          display: block;
          position: relative;
          padding-left: 0.5rem;
        }

        .input-group-label::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 2px;
          height: 12px;
          background: #00f2ff;
          border-radius: 2px;
        }

        .input-box {
          width: 100%;
          height: 30px;
          margin-bottom: 0.3rem;
          position: relative;
        }

        .input-box input,
        .input-box select {
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid rgba(255,255,255,0.1);
          outline: none;
          border-radius: 8px;
          font-size: 0.75rem;
          color: #fff;
          padding: 0 0.75rem;
          transition: all 0.3s ease;
        }

        .input-box input:focus,
        .input-box select:focus {
          border-color: #00f2ff;
          background: rgba(0, 242, 255, 0.03);
          box-shadow: 0 0 0 4px rgba(0, 242, 255, 0.1);
        }

        .input-box input::placeholder {
          color: rgba(255,255,255,0.35);
          font-size: 0.9rem;
        }

        .input-box select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1.2em;
          padding-right: 3rem;
        }

        .input-box select option {
          background-color: #1a1a1f;
          color: #fff;
          padding: 1rem;
          font-size: 0.9rem;
        }

        .input-box input[type="date"] {
          color-scheme: dark;
          padding-right: 1rem;
        }

        .input-box input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          opacity: 0.5;
          cursor: pointer;
        }

        .upload-box {
          border: 2px dashed rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          min-height: 110px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.02);
          margin-bottom: 1rem;
        }

        .upload-box:hover {
          border-color: #00f2ff;
          background: rgba(0, 242, 255, 0.02);
          transform: translateY(-2px);
        }

        .preview-image {
          max-width: 100%;
          max-height: 110px;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .register-button {
          width: 100%;
          height: 32px;
          border: none;
          outline: none;
          border-radius: 8px;
          background: linear-gradient(135deg, #00f2ff, #00d4e0);
          color: #1a1a1f;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 0.4rem;
          text-transform: uppercase;
          box-shadow: 0 4px 12px rgba(0, 242, 255, 0.3);
        }

        .register-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 242, 255, 0.4);
        }

        .register-button:active {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(0, 242, 255, 0.3);
        }

        .login-link {
          text-align: center;
          margin-top: 1rem;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .login-link a {
          color: #00f2ff;
          text-decoration: none;
          margin-left: 0.5rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .login-link a:hover {
          color: #33f5ff;
          text-decoration: none;
        }

        h2.register-title {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          text-align: center;
          color: white;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: 700;
          position: relative;
        }

        h2.register-title::after {
          content: '';
          position: absolute;
          bottom: -0.5rem;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 3px;
          background: #00f2ff;
          border-radius: 2px;
        }

        .remember-me {
          margin: 0.8rem 0;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .remember-me input[type="checkbox"] {
          width: 14px;
          height: 14px;
          accent-color: #00f2ff;
          cursor: pointer;
          margin-right: 0.5rem;
        }

        .remember-me label {
          cursor: pointer;
          user-select: none;
        }

        .password-input-container {
          position: relative;
          margin-bottom: 0.4rem;
          width: 100%;
          height: 30px;
        }

        .password-input-container input {
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid rgba(255,255,255,0.1);
          outline: none;
          border-radius: 8px;
          font-size: 0.75rem;
          color: #fff;
          padding: 0 2rem 0 0.75rem;
          transition: all 0.3s ease;
        }

        .password-input-container input:focus {
          border-color: #00f2ff;
          background: rgba(0, 242, 255, 0.03);
          box-shadow: 0 0 0 4px rgba(0, 242, 255, 0.1);
        }

        .password-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          color: rgba(255, 255, 255, 0.4);
          transition: all 0.3s ease;
          z-index: 2;
          font-size: 0.8rem;
        }

        .password-toggle:hover {
          color: #00f2ff;
        }

        .error-message {
          background: rgba(255, 45, 85, 0.1);
          border: 1px solid rgba(255, 45, 85, 0.3);
          color: #ff2d55;
          padding: 1rem 1.2rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .error-message::before {
          content: '⚠️';
          font-size: 1.1rem;
        }

        .password-requirements-modal {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }

        .password-requirements-modal.show {
          opacity: 1;
          visibility: visible;
        }

        .password-requirements-content {
          background: #1c1c1f;
          border: 2px solid #00f2ff;
          border-radius: 12px;
          padding: 2rem;
          width: 90%;
          max-width: 400px;
          position: relative;
          transform: translateY(-20px);
          transition: all 0.3s ease;
        }

        .password-requirements-modal.show .password-requirements-content {
          transform: translateY(0);
        }

        .requirement {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #a0aec0;
          margin-bottom: 1rem;
          font-size: 1rem;
        }

        .requirement i {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 0.8rem;
        }

        .requirement i.fa-check {
          background: #48bb78;
          color: #fff;
        }

        .requirement i.fa-times {
          background: #f56565;
          color: #fff;
        }

        .requirement.met {
          color: #48bb78;
        }

        .close-requirements {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          font-size: 1.2rem;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .close-requirements:hover {
          color: #fff;
        }

        .qr-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 0.8rem;
          gap: 0.4rem;
        }

        .qr-box > div {
           background: transparent;
           padding: 6px;
           border-radius: 8px;
        }

        .qr-box .text-xs {
          margin-top: 0.4rem;
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .register-box {
            width: 95%;
            padding: 0.8rem;
          }

          h2.register-title {
            font-size: 1.3rem;
            margin-bottom: 1.2rem;
          }
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
                  <div className="qr-box">
                    <div style={{ background: 'transparent', padding: 6, borderRadius: 8 }}>
                      <QRCode
                        value={qrValue}
                        size={150}
                        bgColor="transparent"
                        fgColor="#00f2ff"
                      />
                      <div className="text-xs text-cyan-400 mt-2 break-all">{qrValue}</div>
                    </div>
                  </div>
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
