import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import { BACKEND_URL } from '../services/api';

const QRLoginPage = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [scanning, setScanning] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const html5QrCodeRef = useRef(null);
  const qrReaderRegionId = "qr-reader-region";
  const MAX_RETRIES = 3;

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning && html5QrCodeRef.current.isScanning()) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
        setScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  const handleScan = async (decodedText) => {
    if (!scanning) return;

    setScanning(false);
    await stopScanner();

    try {
      console.log('Scanning QR code:', decodedText);
      const response = await axios.post(`${BACKEND_URL}/api/auth/login/qr/`, {
        id_code: decodedText
      });
      
      if (response.data.token) {
        setSuccess('QR Code successfully scanned! Logging you in...');
        setError('');
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setTimeout(() => {
          navigate('/home', { replace: true });
        }, 2000);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid QR code. Please try again.');
      setSuccess('');
      
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        console.log(`Retry attempt ${retryCount + 1} of ${MAX_RETRIES}`);
        setTimeout(() => {
          setError('');
          initializeScanner();
        }, 1500);
      } else {
        console.error('Max retries reached. Stopping scan.');
        setError('Failed to login after multiple attempts. Please try again later.');
        setScanning(false);
        setRetryCount(0);
      }
    }
  };

  const handleError = (err) => {
    console.error('QR Scan error from handler:', err);
    if (scanning) {
      setError('Error during scan: ' + err.message || 'Unknown scanning error.');
      setSuccess('');
      setScanning(false);
      stopScanner();
    }
  };

  const initializeScanner = async () => {
    console.log('Initializing scanner...');
    await stopScanner();
    setRetryCount(0);
    setError('');
    setSuccess('');

    html5QrCodeRef.current = new Html5Qrcode(qrReaderRegionId);
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      disableFlip: false,
      formatsToSupport: [ Html5Qrcode.Formats.QR_CODE ]
    };

    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length) {
        console.log('Cameras available, starting scanner.');
        await html5QrCodeRef.current.start(
          { facingMode: 'environment' },
          config,
          handleScan,
          handleError
        );
        setScanning(true);
        setError('');
      } else {
        console.error('No cameras found.');
        setError('No camera devices found on this system.');
        setScanning(false);
      }
    } catch (err) {
      console.error('Failed to start QR scanner:', err);
      setError('Could not start camera: ' + err.message || 'Please check permissions and try again.');
      setSuccess('');
      setScanning(false);
    }
  };

  const handleBackToLogin = async () => {
    await stopScanner();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    const handleBeforeNavigate = () => {
      stopScanner();
    };

    window.addEventListener('popstate', handleBeforeNavigate);
    window.addEventListener('beforeunload', handleBeforeNavigate);

    return () => {
      window.removeEventListener('popstate', handleBeforeNavigate);
      window.removeEventListener('beforeunload', handleBeforeNavigate);
      stopScanner();
    };
  }, []);

  useEffect(() => {
    const initializeWithDelay = async () => {
      setTimeout(async () => {
        try {
          await initializeScanner();
        } catch (err) {
          console.error('Initialization error:', err);
          setError('Failed to initialize scanner. Please refresh the page.');
        }
      }, 100);
    };

    initializeWithDelay();

    return () => {
      console.log('Component unmounting, stopping scanner.');
      stopScanner();
    };
  }, []);

  const resetScanner = async () => {
    console.log('Resetting scanner...');
    await initializeScanner();
  };

  return (
    <div className="qr-login-page-container fixed inset-0 w-full h-full flex items-center justify-center overflow-hidden">
      <style>{`
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');

        body {
          margin: 0;
          padding: 0;
          min-height: 100vh;
          overflow: hidden;
        }

        @keyframes rotate {
          100% {
            transform: rotate(1turn);
          }
        }

        .qr-login-page-container {
            background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1f 50%, #0f0f0f 100%);
            width: 100%;
            height: 100vh;
            position: fixed;
            top: 0;
            left: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .qr-box {
          position: relative;
          z-index: 1;
          width: 420px;
          max-width: 95%;
          height: auto;
          border-radius: 16px;
          overflow: hidden;
          padding: 2.5rem;
          background: #1a1a1f;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .qr-box::before {
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
          animation: rotate 6s linear infinite;
        }

        .qr-box::after {
          content: '';
          position: absolute;
          z-index: -1;
          left: 4px;
          top: 4px;
          width: calc(100% - 8px);
          height: calc(100% - 8px);
          background: #1a1a1f;
          border-radius: 14px;
          box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.3);
        }

        .scanner-container {
          width: 100%;
          max-width: 320px;
          margin: 0 auto;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 0 30px rgba(0, 242, 255, 0.3);
          border: 2px solid #00f2ff;
          background-color: rgba(0,0,0,0.5);
          height: 300px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .error-message {
          background: rgba(255, 45, 85, 0.15);
          border: 1px solid rgba(255, 45, 85, 0.4);
          color: #ff5577;
          padding: 1.2rem;
          border-radius: 8px;
          margin-top: 1.5rem;
          font-size: 1rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .success-message {
          background: rgba(72, 187, 120, 0.15);
          border: 1px solid rgba(72, 187, 120, 0.4);
          color: #68d391;
          padding: 1.2rem;
          border-radius: 8px;
          margin-top: 1.5rem;
          font-size: 1rem;
          text-align: center;
        }

        h2.qr-title {
          font-size: 2rem;
          margin-bottom: 2rem;
          text-align: center;
          color: white;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: 700;
          position: relative;
        }

        h2.qr-title::after {
          content: '';
          position: absolute;
          bottom: -0.75rem;
          left: 50%;
          transform: translateX(-50%);
          width: 50px;
          height: 4px;
          background: #00f2ff;
          border-radius: 2px;
        }

        .back-button {
          position: absolute;
          top: 1.5rem;
          left: 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          transition: all 0.3s ease;
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          z-index: 10;
        }

        .back-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .back-button i {
          font-size: 0.9rem;
        }
      `}</style>
      <button className="back-button" onClick={handleBackToLogin}>
        <i className="fas fa-arrow-left"></i>
        Back to Login
      </button>
      <div className="qr-box">
        <h2 className="qr-title">QR Login</h2>
        <div className="scanner-container">
          <div id={qrReaderRegionId} style={{ width: '100%' }} />
        </div>
        {error && (
          <div className="error-message">
            {error}
            {!scanning && (
              <button
                onClick={resetScanner}
                className="mt-3 px-5 py-2.5 bg-[#ff2d55] text-white rounded-md hover:bg-[#ff1a45] transition-colors font-medium"
              >
                Try Again
              </button>
            )}
          </div>
        )}
        {success && <div className="success-message">{success}</div>}
      </div>
    </div>
  );
};

export default QRLoginPage; 