const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
};

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; name: string }) =>
    apiCall('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  
  login: (data: { email: string; password: string }) =>
    apiCall('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  
  forgotPassword: (email: string) =>
    apiCall('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  
  resetPassword: (token: string, password: string) =>
    apiCall('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
  
  getMe: () => apiCall('/auth/me'),
};

// User API
export const userAPI = {
  getProfile: () => apiCall('/user/profile'),
  updateProfile: (data: { name?: string; email?: string }) =>
    apiCall('/user/profile', { method: 'PUT', body: JSON.stringify(data) }),
  
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiCall('/user/password', { method: 'PUT', body: JSON.stringify(data) }),
  
  getDashboard: () => apiCall('/user/dashboard'),
  
  // API Key
  generateApiKey: () => apiCall('/user/api-key/generate', { method: 'POST' }),
  regenerateApiKey: () => apiCall('/user/api-key/regenerate', { method: 'POST' }),
  toggleApiKey: (isActive: boolean) =>
    apiCall('/user/api-key/toggle', { method: 'PUT', body: JSON.stringify({ isActive }) }),
  getApiKey: () => apiCall('/user/api-key'),
  
  // Messages
  send: (data: { to: string; type: string; content: any; file?: File }) => {
    if (data.file) {
      // Send with file upload
      const formData = new FormData();
      formData.append('to', data.to);
      formData.append('type', data.type);
      formData.append('content', JSON.stringify(data.content));
      formData.append('file', data.file);
      return apiCallWithFile('/messages/send', formData);
    } else {
      // Send without file (text or URL)
      const { file, ...dataWithoutFile } = data;
      return apiCall('/messages/send', { method: 'POST', body: JSON.stringify(dataWithoutFile) });
    }
  },
  getMessageLogs: (params?: { status?: string; type?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.append(key, String(value));
      });
    }
    return apiCall(`/user/messages?${query.toString()}`);
  },
  
  // Billing
  getBilling: (params?: { type?: string; status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.append(key, String(value));
      });
    }
    return apiCall(`/user/billing?${query.toString()}`);
  },
  
  // Download API Documentation PDF
  downloadApiDocumentation: () => {
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const url = `${apiUrl}/user/api-documentation/download`;
    
    return fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error('Failed to download documentation');
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'WhatsApp-API-Integration-Guide.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    });
  },
};

// WhatsApp API
export const whatsappAPI = {
  connect: () => apiCall('/whatsapp/connect', { method: 'POST' }),
  getQR: () => apiCall('/whatsapp/qr'),
  getStatus: () => apiCall('/whatsapp/status'),
  disconnect: () => apiCall('/whatsapp/disconnect', { method: 'POST' }),
};

// Helper for file uploads
const apiCallWithFile = async (endpoint: string, formData: FormData) => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
};

// Message API
export const messageAPI = {
  send: (data: { to: string; type: string; content: any; file?: File; files?: File[] }) => {
    // Handle multiple files for multiple message type
    if (data.type === 'multiple' && data.files && data.files.length > 0) {
      const formData = new FormData();
      formData.append('to', data.to);
      formData.append('type', data.type);
      formData.append('content', JSON.stringify(data.content));
      data.files.forEach((file) => {
        formData.append('files', file);
      });
      return apiCallWithFile('/messages/send', formData);
    } else if (data.file) {
      // Send with single file upload
      const formData = new FormData();
      formData.append('to', data.to);
      formData.append('type', data.type);
      formData.append('content', JSON.stringify(data.content));
      formData.append('file', data.file);
      return apiCallWithFile('/messages/send', formData);
    } else {
      // Send without file (text or URL)
      const { file, files, ...dataWithoutFile } = data;
      return apiCall('/messages/send', { method: 'POST', body: JSON.stringify(dataWithoutFile) });
    }
  },
  getLogs: (params?: { status?: string; type?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.append(key, String(value));
      });
    }
    return apiCall(`/messages/logs?${query.toString()}`);
  },
};

// Plan API
export const planAPI = {
  getPlans: () => apiCall('/plans'),
  getPlan: (id: string) => apiCall(`/plans/${id}`),
  subscribe: (planId: string) =>
    apiCall('/plans/subscribe', { method: 'POST', body: JSON.stringify({ planId }) }),
};

// Admin Plans API (for getting all plans including inactive)
export const adminPlansAPI = {
  getAllPlans: () => apiCall('/admin/plans'),
};

// Admin API
export const adminAPI = {
  getDashboard: () => apiCall('/admin/dashboard'),
  
  // Users
  getUsers: (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.append(key, String(value));
      });
    }
    return apiCall(`/admin/users?${query.toString()}`);
  },
  getUser: (id: string) => apiCall(`/admin/users/${id}`),
  suspendUser: (id: string) => apiCall(`/admin/users/${id}/suspend`, { method: 'PUT' }),
  activateUser: (id: string) => apiCall(`/admin/users/${id}/activate`, { method: 'PUT' }),
  updateUserCredits: (userId: string, credits: number, description?: string) =>
    apiCall(`/admin/users/${userId}/credits`, {
      method: 'PUT',
      body: JSON.stringify({ credits, description }),
    }),
  resetApiKey: (id: string) => apiCall(`/admin/users/${id}/reset-api-key`, { method: 'POST' }),
  disconnectWhatsApp: (id: string) =>
    apiCall(`/admin/users/${id}/disconnect-whatsapp`, { method: 'POST' }),
  assignPlanToUser: (userId: string, planId: string) =>
    apiCall('/admin/users/assign-plan', {
      method: 'POST',
      body: JSON.stringify({ userId, planId }),
    }),
  
  // WhatsApp Sessions
  getWhatsAppSessions: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.append(key, String(value));
      });
    }
    return apiCall(`/admin/whatsapp-sessions?${query.toString()}`);
  },
  
  // Messages
  getMessageLogs: (params?: {
    userId?: string;
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.append(key, String(value));
      });
    }
    return apiCall(`/admin/messages?${query.toString()}`);
  },
  
  // Transactions
  getTransactions: (params?: {
    userId?: string;
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.append(key, String(value));
      });
    }
    return apiCall(`/admin/transactions?${query.toString()}`);
  },
  
  // Credits
  addCredits: (data: { userId: string; amount: number; description?: string }) =>
    apiCall('/admin/credits/add', { method: 'POST', body: JSON.stringify(data) }),
  
  // Plans
  getPlans: () => apiCall('/admin/plans'),
  createPlan: (data: any) => apiCall('/plans', { method: 'POST', body: JSON.stringify(data) }),
  updatePlan: (id: string, data: any) =>
    apiCall(`/plans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePlan: (id: string) => apiCall(`/plans/${id}`, { method: 'DELETE' }),
};

