import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../services/api';

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BACKEND_URL}/inventory/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInventory(response.data);
      } catch (err) {
        setError('Failed to fetch inventory.');
      }
    };
    fetchInventory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">My Inventory</h2>
        {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {inventory.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 flex flex-col items-center bg-gray-50">
              <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
              <div className="mb-2 text-sm text-gray-600">Type: {item.category}</div>
              <div className="mb-2 text-sm text-gray-600">Status: {item.status}</div>
              <QRCode value={item.qr_string || item.id.toString()} size={120} bgColor="transparent" fgColor="#00f2ff" />
              <div className="text-xs text-cyan-400 mt-2 break-all">{item.qr_string || item.id}</div>
            </div>
          ))}
        </div>
        <button onClick={() => navigate('/home')} className="mt-8 px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600">Back to Profile</button>
      </div>
    </div>
  );
};

export default InventoryPage; 