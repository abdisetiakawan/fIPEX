import axios from "axios";
import { useAuthStore } from "../stores/auth";
import router from "../router";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Create axios instance with cookie support
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // Enable cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };

    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      params: config.params,
    });

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = new Date() - response.config.metadata.startTime;

    console.log(
      `✅ ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`,
      {
        status: response.status,
        data: response.data,
      }
    );

    return response;
  },
  async (error) => {
    // Calculate request duration
    const duration = error.config?.metadata
      ? new Date() - error.config.metadata.startTime
      : 0;

    console.error(
      `❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} (${duration}ms)`,
      {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      }
    );

    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          if (
            data.code === "TOKEN_EXPIRED" ||
            data.code === "INVALID_TOKEN" ||
            data.code === "TOKEN_REQUIRED"
          ) {
            console.log('Token expired/invalid, clearing auth state');
            
            // Get auth store instance
            const authStore = useAuthStore();
            
            // Clear auth state
            authStore.user = null;

            // Only redirect to login if not already on login page or public pages
            const currentPath = router.currentRoute.value.path;
            const publicPaths = ['/login', '/register', '/pengunjung', '/pengunjung/katalog'];
            const isPublicPath = publicPaths.some(path => currentPath.startsWith(path));
            
            if (!isPublicPath) {
              authStore.setRedirectPath(currentPath);
              router.push("/login");
            }
          }
          break;

        case 403:
          // Forbidden - insufficient permissions
          if (data.code === "INSUFFICIENT_PERMISSIONS") {
            console.log('Insufficient permissions, redirecting to appropriate dashboard');
            // Get auth store instance
            const authStore = useAuthStore();
            
            // Redirect to appropriate dashboard based on user role
            const userRole = authStore.user?.role;
            if (userRole === "mahasiswa") {
              router.push("/mahasiswa");
            } else if (userRole === "panitia") {
              router.push("/panitia");
            } else {
              router.push("/pengunjung");
            }
          }
          break;

        case 429:
          // Rate limit exceeded
          console.warn("Rate limit exceeded:", data.message);
          break;

        case 500:
          // Server error
          console.error("Server error:", data.message);
          break;
      }
    } else if (error.request) {
      // Network error
      console.error("Network error:", error.message);
    }

    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: (credentials) => apiClient.post("/auth/login", credentials),
  register: (userData) => apiClient.post("/auth/register", userData),
  me: () => apiClient.get("/auth/me"),
  updateProfile: (data) => apiClient.put("/auth/profile", data),
  changePassword: (data) => apiClient.put("/auth/change-password", data),
  logout: () => apiClient.post("/auth/logout"),
};

export const worksAPI = {
  getAll: (params) => apiClient.get("/works", { params }),
  getById: (id) => apiClient.get(`/works/${id}`),
  getMyWorks: (params) => apiClient.get("/works/my-works", { params }),
  create: (data) => apiClient.post("/works", data),
  update: (id, data) => apiClient.put(`/works/${id}`, data),
  delete: (id) => apiClient.delete(`/works/${id}`),
  vote: (id) => apiClient.post(`/works/${id}/vote`),
  favorite: (id) => apiClient.post(`/works/${id}/favorite`),
  comment: (id, data) => apiClient.post(`/works/${id}/comments`, data),
};

export const adminAPI = {
  getDashboard: () => apiClient.get("/admin/dashboard"),
  getWorks: (params) => apiClient.get("/admin/works", { params }),
  reviewWork: (id, data) => apiClient.put(`/admin/works/${id}/review`, data),
  getVotingStats: () => apiClient.get("/admin/voting-stats"),
  getSessions: () => apiClient.get("/admin/sessions"),
  createSession: (data) => apiClient.post("/admin/sessions", data),
  updateSession: (id, data) => apiClient.put(`/admin/sessions/${id}`, data),
  deleteSession: (id) => apiClient.delete(`/admin/sessions/${id}`),
};

export const publicAPI = {
  getStats: () => apiClient.get("/public/stats"),
  getWorks: (params) => apiClient.get("/public/works", { params }),
  getWork: (id) => apiClient.get(`/public/works/${id}`),
  vote: (id) => apiClient.post(`/public/works/${id}/vote`),
  comment: (id, data) => apiClient.post(`/public/works/${id}/comments`, data),
};

export default apiClient;