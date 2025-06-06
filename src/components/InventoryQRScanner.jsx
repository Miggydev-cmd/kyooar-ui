// src/components/InventoryQRScanner.jsx
import React, { useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';

const InventoryQRScanner = ({ onScan, onClose, label }) => {
  const qrRegionId = 'qr-scanner-region';
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    // Initialize scanner
    html5QrCodeRef.current = new Html5Qrcode(qrRegionId);

    html5QrCodeRef.current
      .start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          onScan(decodedText); // Pass scanned text to parent
          html5QrCodeRef.current.stop().then(() => onClose());
        },
        (errorMessage) => {
          // Optional: console.warn("QR scan error:", errorMessage);
        }
      )
      .catch((err) => {
        console.error('Failed to start QR scanner:', err);
        // Potentially call onClose or show an error state to the user
      });

    // Cleanup on unmount
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
        html5QrCodeRef.current
          .stop()
          .then(() => html5QrCodeRef.current.clear())
          .catch(() => {}); // Ignore errors during cleanup stop
      }
    };
  }, [onScan, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-4 text-center">
          {label || 'Scan Item QR Code'}
        </h2>
        <div id={qrRegionId} style={{ width: 300, height: 300 }} />
        <button
          onClick={onClose}
          className="w-full py-2 px-4 rounded bg-red-600 text-white font-medium hover:bg-red-700 mt-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default InventoryQRScanner;
