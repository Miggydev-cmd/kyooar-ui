export const sendScannedData = async (qrData) => {
  const response = await fetch('http://localhost:8000/api/scan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ qrData }),
  });

  if (!response.ok) throw new Error('Failed to send scanned data');
  return await response.json();
};
