// API configuration for different environments
const API_CONFIG = {
  // Development URLs (localhost)
  development: {
    apiUrl: 'http://localhost:5000',
    pythonServiceUrl: 'http://localhost:8000'
  },
  // Production URLs (Google Cloud Run)
  production: {
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    pythonServiceUrl: import.meta.env.VITE_PYTHON_SERVICE_URL || 'http://localhost:8000'
  }
};

// Detect current environment
const currentEnv = import.meta.env.MODE || 'development';

// Export URLs for current environment
export const API_URL = API_CONFIG[currentEnv].apiUrl;
export const PYTHON_SERVICE_URL = API_CONFIG[currentEnv].pythonServiceUrl;

console.log('Current environment:', currentEnv);
console.log('API URL:', API_URL);
console.log('Python Service URL:', PYTHON_SERVICE_URL);
