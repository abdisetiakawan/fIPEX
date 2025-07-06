import { defineStore } from "pinia";
import { ref } from "vue";
import { authAPI } from "../services/api";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const loading = ref(false);
  const redirectPath = ref(null);

  const setLoading = (value) => {
    loading.value = value;
  };

  const setRedirectPath = (path) => {
    redirectPath.value = path;
  };

  const login = async (credentials) => {
    try {
      loading.value = true;

      const response = await authAPI.login(credentials);

      if (response.data.success) {
        const { user: userData } = response.data.data;

        user.value = userData;

        return {
          success: true,
          user: userData,
          redirectPath: getRedirectPath(userData.role),
        };
      } else {
        return {
          success: false,
          message: response.data.message,
        };
      }
    } catch (error) {
      console.error("Login error:", error);

      const message = error.response?.data?.message || "Login failed";
      return {
        success: false,
        message,
      };
    } finally {
      loading.value = false;
    }
  };

  const register = async (userData) => {
    try {
      loading.value = true;

      const response = await authAPI.register(userData);

      if (response.data.success) {
        const { user: newUser } = response.data.data;

        user.value = newUser;

        return {
          success: true,
          user: newUser,
          redirectPath: getRedirectPath(newUser.role),
        };
      } else {
        return {
          success: false,
          message: response.data.message,
        };
      }
    } catch (error) {
      console.error("Register error:", error);

      const message = error.response?.data?.message || "Registration failed";
      return {
        success: false,
        message,
      };
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to clear server-side cookie
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with client-side logout even if server call fails
    } finally {
      // Clear client-side state
      user.value = null;
      redirectPath.value = null;
    }
  };

  const checkAuth = async () => {
    try {
      const response = await authAPI.me();

      if (response.data.success) {
        user.value = response.data.data.user;
        return true;
      } else {
        user.value = null;
        return false;
      }
    } catch (error) {
      console.error("Auth check error:", error);
      user.value = null;
      return false;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      loading.value = true;

      const response = await authAPI.updateProfile(profileData);

      if (response.data.success) {
        user.value = { ...user.value, ...response.data.data.user };
        return { success: true };
      } else {
        return {
          success: false,
          message: response.data.message,
        };
      }
    } catch (error) {
      console.error("Profile update error:", error);

      const message = error.response?.data?.message || "Profile update failed";
      return {
        success: false,
        message,
      };
    } finally {
      loading.value = false;
    }
  };

  const changePassword = async (passwordData) => {
    try {
      loading.value = true;

      const response = await authAPI.changePassword(passwordData);

      if (response.data.success) {
        return { success: true };
      } else {
        return {
          success: false,
          message: response.data.message,
        };
      }
    } catch (error) {
      console.error("Password change error:", error);

      const message = error.response?.data?.message || "Password change failed";
      return {
        success: false,
        message,
      };
    } finally {
      loading.value = false;
    }
  };

  const getRedirectPath = (role) => {
    if (redirectPath.value) {
      const path = redirectPath.value;
      redirectPath.value = null;
      return path;
    }

    switch (role) {
      case "mahasiswa":
        return "/mahasiswa";
      case "panitia":
        return "/panitia";
      default:
        return "/pengunjung";
    }
  };

  const hasRole = (roles) => {
    if (!user.value) return false;
    if (typeof roles === "string") {
      return user.value.role === roles;
    }
    return roles.includes(user.value.role);
  };

  const isAuthenticated = () => {
    return !!user.value;
  };

  return {
    user,
    loading,
    redirectPath,
    setLoading,
    setRedirectPath,
    login,
    register,
    logout,
    checkAuth,
    updateProfile,
    changePassword,
    hasRole,
    isAuthenticated,
  };
});