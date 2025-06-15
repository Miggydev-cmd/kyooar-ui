// Backend API configuration
export const BACKEND_PORT = 8000;
export const getBackendUrl = () => `http://127.0.0.1:${BACKEND_PORT}`;
export const API_BASE = `${getBackendUrl()}/api`;
