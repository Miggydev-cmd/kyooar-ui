import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import { getBackendUrl } from '../services/api';
import QRCode from 'react-qr-code';
import { FaUser, FaSignOutAlt, FaPrint, FaCamera, FaTimes } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [user, setUser] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        let userId = null;

        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            userId = parsedUser.id;
          } catch (e) {
            console.error('HomePage: Error parsing stored user data:', e);
          }
        }
        
        if (!token || !userId) {
          console.log('HomePage: No token or userId found, redirecting to login.');
          navigate('/login', { replace: true });
          return;
        }

        const userResponse = await axiosInstance.get(`${getBackendUrl()}/api/users/${userId}/`);
        setUser(userResponse.data);

        const inventoryResponse = await axiosInstance.get(`${getBackendUrl()}/api/logs/`);
        setInventory(inventoryResponse.data);

      } catch (error) {
        console.error('Error fetching data for HomePage:', error.response?.data || error.message);
        setError('Failed to fetch user data or inventory.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await axiosInstance.post(`${getBackendUrl()}/api/users/upload-photo/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      setUser(prev => ({ ...prev, photo_url: response.data.photo_url }));
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-700">Loading HomePage...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-800 text-white shadow-xl border-b-4 border-red-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Military Inventory System</h1>
            <div className="flex items-center space-x-6">
              <span className="text-gray-300 text-lg">{user?.name || ''}</span>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-300 hover:text-white transition-colors duration-200 text-lg"
              >
                <FaSignOutAlt className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-4 max-w-6xl">
        <div className="grid grid-cols-1 gap-10">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-xl p-8 relative overflow-hidden border border-gray-200">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-60"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-8 text-gray-800 uppercase tracking-wider flex items-center">
                <span className="w-1.5 h-10 bg-red-600 mr-4"></span>
                Military Profile
              </h2>

              {/* ID Photo Section */}
              <div className="mb-10 text-center">
                <h3 className="text-xl font-semibold mb-5 text-gray-700 uppercase tracking-wider">ID Photo</h3>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-40 h-40 mx-auto cursor-pointer group rounded-full overflow-hidden border-4 border-gray-300 hover:border-red-600 transition-colors duration-300 transform hover:scale-105 shadow-md"
                >
                  <div className="w-full h-full overflow-hidden">
                    {user?.photo_url ? (
                      <img
                        src={user.photo_url}
                        alt="ID Photo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <FaCamera className="text-5xl text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300 flex items-center justify-center rounded-full">
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-base font-semibold">
                      Click to upload
                    </span>
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
                {error && (
                  <p className="mt-3 text-sm text-red-600 text-center font-medium">{error}</p>
                )}
                {uploading && (
                  <p className="mt-3 text-sm text-blue-600 text-center font-medium">Uploading...</p>
                )}
              </div>

              {/* Information Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-5 rounded-lg border-l-6 border-red-600 hover:shadow-lg transition-shadow duration-300">
                  <label className="block text-base font-medium text-red-600 uppercase tracking-wider">Name</label>
                  <p className="mt-1 text-xl font-semibold text-gray-900">{user?.full_name || ''}</p>
                </div>
                <div className="bg-gray-50 p-5 rounded-lg border-l-6 border-red-600 hover:shadow-lg transition-shadow duration-300">
                  <label className="block text-base font-medium text-red-600 uppercase tracking-wider">Rank</label>
                  <p className="mt-1 text-xl font-semibold text-gray-900">{user?.rank || 'Not Specified'}</p>
                </div>
                <div className="bg-gray-50 p-5 rounded-lg border-l-6 border-red-600 hover:shadow-lg transition-shadow duration-300">
                  <label className="block text-base font-medium text-red-600 uppercase tracking-wider">Service Number</label>
                  <p className="mt-1 text-xl font-semibold text-gray-900">{user?.service_number || 'Not Specified'}</p>
                </div>
                <div className="bg-gray-50 p-5 rounded-lg border-l-6 border-red-600 hover:shadow-lg transition-shadow duration-300">
                  <label className="block text-base font-medium text-red-600 uppercase tracking-wider">Unit</label>
                  <p className="mt-1 text-xl font-semibold text-gray-900">{user?.unit || 'Not Specified'}</p>
                </div>
                <div className="bg-gray-50 p-5 rounded-lg border-l-6 border-red-600 hover:shadow-lg transition-shadow duration-300">
                  <label className="block text-base font-medium text-red-600 uppercase tracking-wider">Branch</label>
                  <p className="mt-1 text-xl font-semibold text-gray-900">{user?.branch || 'Not Specified'}</p>
                </div>
                <div className="bg-gray-50 p-5 rounded-lg border-l-6 border-red-600 hover:shadow-lg transition-shadow duration-300">
                  <label className="block text-base font-medium text-red-600 uppercase tracking-wider">Email</label>
                  <p className="mt-1 text-xl font-semibold text-gray-900">{user?.email || ''}</p>
                </div>
                <div className="bg-gray-50 p-5 rounded-lg border-l-6 border-red-600 hover:shadow-lg transition-shadow duration-300">
                  <label className="block text-base font-medium text-red-600 uppercase tracking-wider">ID Code</label>
                  <div className="flex items-center space-x-3">
                    <span className="text-base text-gray-600">ID Code:</span>
                    <div className="relative group">
                      <div
                        onClick={() => setShowQrModal(true)}
                        className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
                      >
                        <QRCode
                          value={user?.id_code || ''}
                          size={48}
                          level="H"
                          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                          className="rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <button
                  onClick={() => navigate('/inventory')}
                  className="w-full px-8 py-4 bg-red-600 text-white rounded-lg shadow-xl hover:bg-red-700 transition-colors duration-300 uppercase tracking-wider font-bold text-lg"
                >
                  View Inventory
                </button>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-lg shadow-xl p-8 relative overflow-hidden border border-gray-200">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-red-600"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-red-600"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-red-600"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-red-600"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-60"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 uppercase tracking-wider flex items-center">
                  <span className="w-1.5 h-10 bg-red-600 mr-4"></span>
                  Transaction History
                </h2>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-300 uppercase tracking-wider shadow-xl hover:shadow-2xl"
                >
                  <FaPrint className="mr-3 text-xl" />
                  Print History
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inventory.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">{new Date(item.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">{item.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">
                          <span className={
                            `px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full 
                            ${item.status === 'checked_out' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`
                          }>
                            {item.status === 'checked_out' ? 'Checked Out' : 'Checked In'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300 ease-out">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-6 transform scale-95 transition-transform duration-300 ease-out">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Military ID QR Code</h2>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 text-2xl"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>
            <div className="flex justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
              <QRCode
                value={user?.id_code || ''}
                size={256} // Increased size for modal
                level="H"
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                className="rounded"
              />
            </div>
            <p className="mt-6 text-base text-gray-600 text-center">
              Scan this QR code to quickly access your military profile
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
