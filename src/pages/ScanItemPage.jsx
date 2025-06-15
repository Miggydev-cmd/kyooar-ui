import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { FaArrowLeft, FaCheck, FaTimes } from 'react-icons/fa';

const ScanItemPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const scannerRef = useRef(null);

  const action = location.state?.action || 'withdraw';

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 10,
    });

    scannerRef.current = scanner;

    scanner.render(handleScanSuccess, handleScanError);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const handleScanSuccess = async (decodedText) => {
    try {
      setScanning(false);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const endpoint = action === 'withdraw' 
        ? 'http://localhost:5000/api/inventory/withdraw'
        : 'http://localhost:5000/api/inventory/return';

      const response = await axios.post(endpoint, 
        { item_id: decodedText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(`Item successfully ${action === 'withdraw' ? 'withdrawn' : 'returned'}`);
      
      // Stop scanning
      if (scannerRef.current) {
        scannerRef.current.clear();
      }

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/inventory');
      }, 2000);

    } catch (error) {
      console.error('Error processing item:', error);
      setError(error.response?.data?.message || 'Failed to process item');
      setScanning(true);
    }
  };

  const handleScanError = (error) => {
    console.warn('QR Code scan error:', error);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/inventory')}
              className="flex items-center text-gray-300 hover:text-white transition-colors duration-200"
            >
              <FaArrowLeft className="mr-2" />
              Back to Inventory
            </button>
            <h1 className="text-xl font-bold">
              {action === 'withdraw' ? 'Withdraw Item' : 'Return Item'}
            </h1>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Scanner Container */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div id="reader" className="w-full"></div>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
              <FaTimes className="mr-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
              <FaCheck className="mr-2" />
              {success}
            </div>
          )}

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Instructions</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Position the QR code within the scanner frame</li>
              <li>Hold the device steady for best results</li>
              <li>Ensure good lighting conditions</li>
              <li>Wait for the automatic scan confirmation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanItemPage; 