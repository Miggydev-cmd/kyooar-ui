import React from 'react';

const PrintableTransactionSlip = ({ user, inventory }) => {
  return (
    <div className="printable-slip p-8 bg-white text-gray-900 leading-normal" style={{ width: '80mm', margin: '0 auto', fontFamily: 'monospace', fontSize: '10px' }}>
      <h1 className="text-center text-lg font-bold mb-4">Transaction Slip</h1>
      <div className="mb-4">
        <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
        <p><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
      </div>

      <div className="mb-4 border-b border-gray-400 pb-2">
        <h2 className="text-md font-semibold mb-2">Military Personnel Details:</h2>
        {user ? (
          <>
            <p><strong>Full Name:</strong> {user.full_name}</p>
            <p><strong>Rank:</strong> {user.rank}</p>
            <p><strong>Unit:</strong> {user.unit}</p>
            <p><strong>ID Number:</strong> {user.id_code}</p>
          </>
        ) : (
          <p>User details not available.</p>
        )}
      </div>

      <div className="mb-4">
        <h2 className="text-md font-semibold mb-2">Withdrawn Items:</h2>
        {inventory.length > 0 ? (
          <ul className="list-none p-0 m-0">
            {inventory.filter(item => item.status === 'withdrawn').map((item, index) => (
              <li key={item.id} className="flex justify-between items-center py-1 border-b border-gray-200 last:border-b-0">
                <span>{index + 1}. {item.name} ({item.type}) - SN: {item.serial_number}</span>
                <span className="ml-4">[_]</span> {/* Checkbox placeholder */}
              </li>
            ))}
          </ul>
        ) : (
          <p>No withdrawn items found in history.</p>
        )}
      </div>

      <div className="mt-8 text-center pt-4 border-t border-gray-400">
        <p>Signature: _________________________</p>
        <p className="mt-2">Thank You!</p>
      </div>
    </div>
  );
};

export default PrintableTransactionSlip; 