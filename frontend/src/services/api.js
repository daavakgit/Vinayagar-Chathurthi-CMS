import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for unified error messages
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// Health check / Backend Pre-warm
export const checkHealthApi = (config) => api.get('/health', config);

let prewarmPromise = null;
let isBackendWarmedUp = false;

export const warmUpBackend = () => {
  if (isBackendWarmedUp) {
    return Promise.resolve(true);
  }
  if (prewarmPromise) {
    return prewarmPromise;
  }

  prewarmPromise = (async () => {
    const startTime = Date.now();
    const MAX_TOTAL_WARMUP_TIME = 20000; // 20 seconds maximum timeout
    const SINGLE_REQUEST_TIMEOUT = 5000; // 5 seconds per request timeout
    const RETRY_INTERVAL = 1500; // 1.5 seconds delay between retries

    while (Date.now() - startTime < MAX_TOTAL_WARMUP_TIME) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), SINGLE_REQUEST_TIMEOUT);

        const res = await api.get('/health', { signal: controller.signal });
        clearTimeout(timer);

        if (res && (res.status === 'OK' || res.status === 'ok' || res.system)) {
          isBackendWarmedUp = true;
          return true;
        }
      } catch (err) {
        // Backend waking up or network error, retry
      }

      if (Date.now() - startTime >= MAX_TOTAL_WARMUP_TIME) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
    }

    return isBackendWarmedUp;
  })();

  return prewarmPromise;
};

// Trigger pre-warm immediately when API module is loaded
warmUpBackend();

// Dashboard
export const getDashboardApi = (year) => api.get(`/dashboard?year=${year}`);

// Collections
export const getCollectionsApi = (params) => api.get('/collections', { params });
export const getCollectionByIdApi = (id) => api.get(`/collections/${id}`);
export const createCollectionApi = (data) => api.post('/collections', data);
export const updateCollectionApi = (id, data) => api.put(`/collections/${id}`, data);
export const deleteCollectionApi = (id) => api.delete(`/collections/${id}`);

// Expenses
export const getExpensesApi = (params) => api.get('/expenses', { params });
export const getExpenseByIdApi = (id) => api.get(`/expenses/${id}`);
export const createExpenseApi = (data) => api.post('/expenses', data);
export const updateExpenseApi = (id, data) => api.put(`/expenses/${id}`, data);
export const deleteExpenseApi = (id) => api.delete(`/expenses/${id}`);

// Splits & Recoveries
export const getSplitsApi = (params) => api.get('/splits', { params });
export const getSplitByIdApi = (id) => api.get(`/splits/${id}`);
export const createSplitApi = (data) => api.post('/splits', data);
export const updateSplitApi = (id, data) => api.put(`/splits/${id}`, data);
export const deleteSplitApi = (id) => api.delete(`/splits/${id}`);
export const createRecoveryApi = (splitId, data) => api.post(`/splits/${splitId}/recoveries`, data);
export const getRecoveriesApi = (splitId) => api.get(`/splits/${splitId}/recoveries`);
export const deleteRecoveryApi = (id) => api.delete(`/recoveries/${id}`);

// Settings & Year Management
export const getSettingsApi = () => api.get('/settings');
export const getSettingsByYearApi = (year) => api.get(`/settings/by-year/${year}`);
export const createYearSettingApi = (data) => api.post('/settings', data);
export const updateSettingApi = (id, data) => api.put(`/settings/${id}`, data);
export const backupDataApi = () => api.get('/settings/backup');
export const restoreDataApi = (data) => api.post('/settings/restore', { data });
export const clearDataApi = (payload) => api.post('/settings/clear-data', payload);

// Reports
export const getReportsApi = (params) => api.get('/reports', { params });

// Authentication
export const loginAdminApi = (credentials) => api.post('/auth/login', credentials);

export default api;
