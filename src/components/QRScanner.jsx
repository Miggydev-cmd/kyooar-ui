import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { FaTimes } from 'react-icons/fa';

const QRScanner = ({ onScan, onError, onClose, title, description }) => {
  const [scanning, setScanning] = useState(true);
  const scannerRef = useRef(null);

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

  const handleScanSuccess = (decodedText) => {
    setScanning(false);
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
    onScan(decodedText);
  };

  const handleScanError = (error) => {
    console.warn('QR Code scan error:', error);
    if (onError) {
      onError(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        {description && (
          <p className="text-gray-600 mb-4">{description}</p>
        )}

        {/* Scanner Container */}
        <div className="bg-gray-100 rounded-lg p-4 mb-4">
          <div id="reader" className="w-full"></div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Instructions:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Position the QR code within the scanner frame</li>
            <li>• Hold the device steady for best results</li>
            <li>• Ensure good lighting conditions</li>
            <li>• Wait for the automatic scan confirmation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QRScanner; 