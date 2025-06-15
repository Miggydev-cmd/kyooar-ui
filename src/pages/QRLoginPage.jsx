import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import axiosInstance from '../services/axiosInstance';
import { getBackendUrl } from '../services/api';

const QRLoginPage = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [scanning, setScanning] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [qrDetected, setQrDetected] = useState(false);
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
    setQrDetected(true);
    await stopScanner();

    try {
      console.log('Scanning QR code:', decodedText);
      const response = await axiosInstance.post(`${getBackendUrl()}/api/auth/login/qr/`, {
        id_code: decodedText
      });
      
      if (response.data.access_token) {
        setSuccess('QR Code successfully scanned! Logging you in...');
        setError('');
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        setTimeout(() => {
          navigate('/home', { replace: true });
        }, 2000);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid QR code. Please try again.');
      setSuccess('');
      setQrDetected(false);
      
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
      let displayErrorMessage = 'Error during scan: ' + (err.message || 'Unknown scanning error.');
      if (err.name === 'NotFoundException' || (err.message && err.message.includes('No MultiFormat Readers'))) {
        displayErrorMessage = 'No QR code detected. Please ensure the QR code is clearly visible, well-lit, centered in the box, and fully within the green frame. Try adjusting the distance or angle.';
        setQrDetected(false);
      }
      setError(displayErrorMessage);
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
    setQrDetected(false);

    html5QrCodeRef.current = new Html5Qrcode(qrReaderRegionId);
    
    // Calculate qrbox size dynamically based on the scanner-container's current width
    const scannerContainer = document.getElementById("qr-reader-region");
    const scannerWidth = scannerContainer ? scannerContainer.offsetWidth : 320; // Default to 320 if not found
    const qrboxSize = Math.max(200, Math.min(scannerWidth * 0.8, 320)); // 80% of container width, with min/max

    const config = {
      fps: 20,
      qrbox: { width: qrboxSize, height: qrboxSize },
      aspectRatio: 1.0,
      disableFlip: true,
      formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ],
      tryHarder: true
    };
    console.log('Html5QrcodeScanner configuration:', config);

    try {
      const devices = await Html5Qrcode.getCameras();
      console.log('Detected camera devices:', devices);
      if (devices && devices.length) {
        console.log('Cameras available, starting scanner with device:', devices[0].id);
        await html5QrCodeRef.current.start(
          { facingMode: 'environment' },
          config,
          handleScan,
          handleError
        );
        console.log('Html5QrcodeScanner start command executed.');

        // Log actual video dimensions after scanner starts
        const videoElement = document.getElementById(qrReaderRegionId)?.querySelector('video');
        if (videoElement) {
          videoElement.onloadedmetadata = () => {
            console.log(`Video stream dimensions: ${videoElement.videoWidth}x${videoElement.videoHeight}`);
          };
        } else {
          console.warn('Video element not found after scanner start.');
        }

        setScanning(true);
        setError('');
      } else {
        console.error('No cameras found: devices array is empty or null.', devices);
        setError('No camera devices found on this system. Please check your hardware.');
        setScanning(false);
      }
    } catch (err) {
      console.error('Failed to start QR scanner during initialization:', err);
      setError('Could not start camera. Please check permissions, ensure no other app is using the camera, and use a secure connection (HTTPS).');
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
            background: var(--bg-primary);
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
          background: var(--bg-secondary);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          border: 1px solid var(--input-border);
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
          background-color: var(--bg-secondary);
          background-repeat: no-repeat;
          background-position: 0 0;
          background-image: conic-gradient(transparent, var(--accent-cyan), transparent 30%),
                          conic-gradient(transparent, var(--accent-pink), transparent 30%);
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
          background: var(--bg-secondary);
          border-radius: 14px;
          box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.3);
        }

        .scanner-container {
          width: 100%;
          max-width: 320px;
          margin: 0 auto;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 0 30px rgba(var(--accent-cyan-rgb), 0.3);
          transition: border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
          height: 300px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .scanner-container.detected {
          border: 2px solid var(--accent-green);
          box-shadow: 0 0 30px rgba(var(--accent-green-rgb), 0.3);
        }

        .scanner-container.error {
          border: 2px solid var(--accent-pink);
          box-shadow: 0 0 30px rgba(var(--accent-pink-rgb), 0.3);
        }

        /* Style for the video element generated by html5-qrcode */
        .scanner-container video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
          border-radius: 10px; /* Match container border-radius slightly */
        }

        /* Style for the canvas element generated by html5-qrcode */
        .scanner-container canvas {
          display: none; /* Hide the canvas overlay if not needed */
        }

        .error-message {
          background: rgba(var(--accent-pink-rgb), 0.15);
          border: 1px solid rgba(var(--accent-pink-rgb), 0.4);
          color: var(--accent-pink);
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
          background: rgba(var(--color-success-rgb), 0.15);
          border: 1px solid rgba(var(--color-success-rgb), 0.4);
          color: var(--color-success);
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
          color: var(--text-primary);
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
          background: var(--accent-cyan);
          border-radius: 2px;
        }

        .back-button {
          position: absolute;
          top: 1.5rem;
          left: 1.5rem;
          background: rgba(var(--text-primary-rgb), 0.1); /* Use text-primary for transparency */
          border: none;
          color: var(--text-primary);
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
          background: rgba(var(--text-primary-rgb), 0.2);
        }

        .back-button i {
          font-size: 0.9rem;
        }

        #qr-reader-region {
          width: 100%;
          min-height: 200px; /* Ensure visibility before video loads */
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          border-radius: 8px;
          background-color: rgba(0, 0, 0, 0.1); /* Subtle background for debugging */
        }

        #qr-reader-region video {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
          transform: scaleX(-1); /* Flip horizontally for selfie-mode feel */
        }

        #qr-reader-region img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .qr-login-container {
          width: 100%;
          max-width: 400px;
          padding: 2rem;
        }

        .qr-instructions {
          margin-top: 1rem;
          color: var(--text-secondary);
          font-size: 0.95rem;
          text-align: center;
          line-height: 1.4;
        }
      `}</style>
      <button className="back-button" onClick={handleBackToLogin}>
        <i className="fas fa-arrow-left"></i>
        Back to Login
      </button>
      <div className="qr-box">
        <h2 className="qr-title">QR Login</h2>
        <div className={`scanner-container ${qrDetected ? 'detected' : error ? 'error' : ''}`}>
          <div id={qrReaderRegionId} style={{ width: '100%', height: '100%' }} />
        </div>
        {scanning && !error && !qrDetected && (
          <p className="qr-instructions mt-4">Center the QR code in the box.</p>
        )}
        {error && (
          <div className="error-message">
            <div>{error}</div>
            {!scanning && error.includes('Could not start camera') && (
              <div className="text-xs text-gray-400 mt-2">
                Please ensure you have granted camera permission and are using a secure connection (HTTPS).
              </div>
            )}
            {!scanning && (
              <button
                onClick={resetScanner}
                className="mt-3 px-5 py-2.5 bg-[var(--accent-pink)] text-white rounded-md hover:bg-[var(--accent-pink)] transition-colors font-medium"
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