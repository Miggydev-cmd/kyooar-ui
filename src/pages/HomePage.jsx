import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InventoryQRScanner from '../components/InventoryQRScanner';

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const soldierInfo = localStorage.getItem('soldier_info');

    if (!token || !soldierInfo) {
      navigate('/login');
      return;
    }

    try {
      const userInfo = JSON.parse(soldierInfo);
      setUser(userInfo);
      setLoading(false);
    } catch (err) {
      setError('Failed to load user data');
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('soldier_info');
    navigate('/login');
  };

  const handleScan = async (data) => {
    if (data) {
      try {
        setInventory(prev => [...prev, data]);
        setShowScanner(false);
      } catch (err) {
        setError('Failed to process scanned item');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-2xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-gray-900">Military Personnel Profile</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ID Photo Section */}
            <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">ID Photo</h3>
              {user?.idImage ? (
                <img 
                  src={user.idImage} 
                  alt="ID" 
                  className="max-w-full h-auto rounded-lg shadow-lg"
                  style={{ maxHeight: '300px' }}
                />
              ) : (
                <div className="bg-gray-200 p-4 rounded-lg">
                  No ID photo available
                </div>
              )}
            </div>

            {/* Profile Information Section */}
            <div className="flex flex-col">
              <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
              {user && (
                <div className="grid gap-4">
                  <div className="border-b pb-2">
                    <p className="text-gray-600 text-sm">Full Name</p>
                    <p className="font-semibold">{user.full_name}</p>
                  </div>
                  <div className="border-b pb-2">
                    <p className="text-gray-600 text-sm">Rank</p>
                    <p className="font-semibold">{user.rank}</p>
                  </div>
                  <div className="border-b pb-2">
                    <p className="text-gray-600 text-sm">Unit</p>
                    <p className="font-semibold">{user.unit}</p>
                  </div>
                  <div className="border-b pb-2">
                    <p className="text-gray-600 text-sm">ID Number</p>
                    <p className="font-semibold">{user.id_code}</p>
                  </div>
                  {user.position && (
                    <div className="border-b pb-2">
                      <p className="text-gray-600 text-sm">Position</p>
                      <p className="font-semibold">{user.position}</p>
                    </div>
                  )}
                  {user.department && (
                    <div className="border-b pb-2">
                      <p className="text-gray-600 text-sm">Department</p>
                      <p className="font-semibold">{user.department}</p>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={() => navigate('/inventory')}
                className="mt-6 px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 w-full md:w-auto"
              >
                Inventory
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">My Inventory</h2>
            <button
              onClick={() => setShowScanner(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Scan Item
            </button>
          </div>

          {showScanner ? (
            <InventoryQRScanner
              onScan={handleScan}
              onClose={() => setShowScanner(false)}
              label="Scan Item QR Code"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventory.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">{item.type}</td>
                      <td className="px-6 py-4">{item.name}</td>
                      <td className="px-6 py-4">{item.serial_number}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.status === 'available'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
