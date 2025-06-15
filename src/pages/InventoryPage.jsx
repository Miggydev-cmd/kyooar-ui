import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import { getBackendUrl } from '../services/api';
import { FaArrowLeft, FaQrcode, FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import QRScanner from '../components/QRScanner';
import QRCode from 'react-qr-code';

const InventoryPage = () => {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showScanner, setShowScanner] = useState(false);
  const [scanAction, setScanAction] = useState(null);
  const [showItemQrModal, setShowItemQrModal] = useState(false);
  const [selectedItemQrCodeId, setSelectedItemQrCodeId] = useState(null);

  useEffect(() => {
    // Simulate fetching data with hardcoded values
    const sampleInventory = [
      {
        id: 'item-gun-001',
        name: 'M4 Carbine',
        description: 'Standard issue 5.56mm assault rifle.',
        category: 'weapons',
        serial_number: 'M4A1-2023-001',
        status: 'available',
      },
      {
        id: 'item-gun-002',
        name: 'Glock 19',
        description: 'Compact 9mm semi-automatic pistol.',
        category: 'weapons',
        serial_number: 'GLOCK19-2023-005',
        status: 'in_use',
      },
      {
        id: 'item-ammo-001',
        name: '5.56x45mm NATO Rounds',
        description: 'Box of 100 rounds for M4 Carbine.',
        category: 'ammunition',
        serial_number: 'AMMO-556-NATO-BOX1',
        status: 'available',
      },
      {
        id: 'item-ammo-002',
        name: '9mm Parabellum Rounds',
        description: 'Box of 50 rounds for Glock 19.',
        category: 'ammunition',
        serial_number: 'AMMO-9MM-PARA-BOX1',
        status: 'available',
      },
      {
        id: 'item-explosive-001',
        name: 'M112 Demolition Charge (C4)',
        description: '2.5 lb block of C4 explosive.',
        category: 'explosives',
        serial_number: 'C4-DEMO-2023-001',
        status: 'available',
      },
      {
        id: 'item-explosive-002',
        name: 'M67 Fragmentation Grenade',
        description: 'Hand grenade with 5 second fuse.',
        category: 'explosives',
        serial_number: 'GRENADE-FRAG-2023-003',
        status: 'available',
      },
      {
        id: 'item-equip-001',
        name: 'Tactical Vest',
        description: 'Lightweight tactical vest with MOLLE system.',
        category: 'equipment',
        serial_number: 'VEST-TAC-2023-010',
        status: 'in_use',
      }
    ];
    setInventory(sampleInventory);
    setLoading(false);
  }, []);

  const handleScan = async (qrData) => {
    try {
      // For hardcoded data, scan actions won't persist unless you implement state logic.
      // For a real application, this would interact with your backend.
      alert(`Simulating ${scanAction} for item: ${qrData}. This action is not persisted with hardcoded data.`);

      // Example: To simulate a status change for hardcoded data:
      setInventory(prevInventory =>
        prevInventory.map(item =>
          item.id === qrData
            ? { ...item, status: scanAction === 'withdraw' ? 'in_use' : 'available' }
            : item
        )
      );
      setShowScanner(false);
    } catch (error) {
      console.error('Error processing item:', error);
      setError(error.response?.data?.message || 'Failed to process item');
    }
  };

  const handleItemQrClick = (itemId) => {
    setSelectedItemQrCodeId(itemId);
    setShowItemQrModal(true);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group items by category
  const categories = ['weapons', 'ammunition', 'explosives', 'equipment', 'vehicles', 'electronics'];
  const groupedInventory = categories.reduce((acc, category) => {
    acc[category] = filteredInventory.filter(item => item.category === category);
    return acc;
  }, {});

  // Determine if any items are found across all categories
  const hasResults = filteredInventory.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/home')}
              className="flex items-center text-gray-300 hover:text-white transition-colors duration-200"
            >
              <FaArrowLeft className="mr-2" />
              Back to Home
            </button>
            <h1 className="text-xl font-bold">Inventory Management</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Action Buttons */}
        <div className="mb-8 flex gap-4 justify-center">
          <button
            onClick={() => {
              setScanAction('withdraw');
              setShowScanner(true);
            }}
            className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition-colors duration-200 flex items-center"
          >
            <FaQrcode className="mr-2" />
            Scan to Withdraw
          </button>
          <button
            onClick={() => {
              setScanAction('return');
              setShowScanner(true);
            }}
            className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
          >
            <FaQrcode className="mr-2" />
            Scan to Return
          </button>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
          <div className="w-full md:w-48">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Categories</option>
                <option value="weapons">Weapons</option>
                <option value="ammunition">Ammunition</option>
                <option value="explosives">Explosives</option>
                <option value="equipment">Equipment</option>
                <option value="vehicles">Vehicles</option>
                <option value="electronics">Electronics</option>
              </select>
              <FaFilter className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Inventory Grid */}
        {
          hasResults ? (
            categories.map(category => (
              groupedInventory[category].length > 0 && (
                <div key={category} className="mb-10 bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b-2 border-red-600 pb-3 flex items-center">
                    <span className="w-2 h-10 bg-red-600 mr-4"></span>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {groupedInventory[category].map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            item.status === 'in_use' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {item.status === 'in_use' ? 'In Use' : 'Available'}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4">{item.description}</p>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>Category: {item.category}</span>
                          <span>Serial: {item.serial_number}</span>
                        </div>
                        <div className="mt-4 flex justify-center">
                          <div
                            onClick={() => handleItemQrClick(item.id)}
                            className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
                          >
                            <QRCode
                              value={item.id}
                              size={32}
                              level="H"
                              style={{ height: "32px", maxWidth: "100%", width: "32px" }}
                              className="rounded"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))
          ) : (
            /* No Results Message */
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No items found matching your search criteria.</p>
            </div>
          )
        }
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScan={handleScan}
          onError={(error) => setError(error.message)}
          onClose={() => setShowScanner(false)}
          title={scanAction === 'withdraw' ? 'Withdraw Item' : 'Return Item'}
          description={`Scan the QR code to ${scanAction === 'withdraw' ? 'withdraw' : 'return'} the item`}
        />
      )}

      {/* Item QR Code Modal */}
      {showItemQrModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300 ease-out">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-6 transform scale-95 transition-transform duration-300 ease-out">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Item QR Code</h2>
              <button
                onClick={() => setShowItemQrModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 text-2xl"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>
            <div className="flex justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
              {selectedItemQrCodeId && (
                <QRCode
                  value={selectedItemQrCodeId}
                  size={256}
                  level="H"
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  className="rounded"
                />
              )}
            </div>
            <p className="mt-6 text-base text-gray-600 text-center">
              Scan this QR code to identify the item.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage; 