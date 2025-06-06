// Backend API configuration
export const BACKEND_PORT = 8000;
export const BACKEND_URL = `http://127.0.0.1:${BACKEND_PORT}`;
export const API_BASE = `${BACKEND_URL}/api`;

export const scanID = async (idNumber) => {
  try {
    const response = await fetch(`${API_BASE}/scan-id/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: idNumber }),
    });

    if (!response.ok) {
      // Try to parse and return error message from backend
      const errorData = await response.json().catch(() => null);
      const message = errorData?.error || `Scan ID failed with status ${response.status}`;
      throw new Error(message);
    }

    // Return parsed JSON response
    return await response.json();
  } catch (error) {
    console.error('Scan ID Error:', error.message);
    throw error;
  }
};

export const loginQR = async (id_code) => {
  try {
    const response = await fetch(`${API_BASE}/auth/login/qr/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id_code }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message = errorData?.error || `QR Login failed with status ${response.status}`;
      throw new Error(message);
    }
    return await response.json();
  } catch (error) {
    console.error('QR Login Error:', error.message);
    throw error;
  }
};
