import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

// Import components
import Home from "../components/pengunjung/Home.vue";
import Katalog from "../components/pengunjung/Katalog.vue";
import Detail from "../components/pengunjung/Detail.vue";
import Favorit from "../components/pengunjung/Favorit.vue";
import Login from "../components/Login.vue";
import Register from "../components/Register.vue";
import NotFound from "../components/NotFound.vue";

// Mahasiswa components
import MahasiswaDashboard from "../components/mahasiswa/Dashboard.vue";
import MahasiswaPortfolio from "../components/mahasiswa/Portfolio.vue";
import MahasiswaUpload from "../components/mahasiswa/Upload.vue";
import MahasiswaProfile from "../components/mahasiswa/Profile.vue";
import MahasiswaEditWork from "../components/mahasiswa/EditWork.vue";
import MahasiswaDetailWork from "../components/mahasiswa/DetailWork.vue";

// Panitia components
import PanitiaDashboard from "../components/panitia/Dashboard.vue";
import PanitiaManagement from "../components/panitia/Management.vue";
import PanitiaVoting from "../components/panitia/Voting.vue";
import PanitiaSchedule from "../components/panitia/Schedule.vue";

const routes = [
  // Public routes
  { path: "/", redirect: "/pengunjung" },
  { path: "/pengunjung", component: Home },
  { path: "/pengunjung/katalog", component: Katalog },
  { path: "/pengunjung/detail/:id", component: Detail },
  { 
    path: "/pengunjung/favorit", 
    component: Favorit,
    meta: { requiresAuth: true, roles: ["pengunjung"] }
  },
  { path: "/login", component: Login },
  { path: "/register", component: Register },

  // Mahasiswa routes
  {
    path: "/mahasiswa",
    component: MahasiswaDashboard,
    meta: { requiresAuth: true, roles: ["mahasiswa"] },
  },
  {
    path: "/mahasiswa/portfolio",
    component: MahasiswaPortfolio,
    meta: { requiresAuth: true, roles: ["mahasiswa"] },
  },
  {
    path: "/mahasiswa/upload",
    component: MahasiswaUpload,
    meta: { requiresAuth: true, roles: ["mahasiswa"] },
  },
  {
    path: "/mahasiswa/profile",
    component: MahasiswaProfile,
    meta: { requiresAuth: true, roles: ["mahasiswa"] },
  },
  {
    path: "/mahasiswa/edit/:id",
    component: MahasiswaEditWork,
    meta: { requiresAuth: true, roles: ["mahasiswa"] },
  },
  {
    path: "/mahasiswa/detail/:id",
    component: MahasiswaDetailWork,
    meta: { requiresAuth: true, roles: ["mahasiswa"] },
  },

  // Panitia routes
  {
    path: "/panitia",
    component: PanitiaDashboard,
    meta: { requiresAuth: true, roles: ["panitia"] },
  },
  {
    path: "/panitia/management",
    component: PanitiaManagement,
    meta: { requiresAuth: true, roles: ["panitia"] },
  },
  {
    path: "/panitia/voting",
    component: PanitiaVoting,
    meta: { requiresAuth: true, roles: ["panitia"] },
  },
  {
    path: "/panitia/schedule",
    component: PanitiaSchedule,
    meta: { requiresAuth: true, roles: ["panitia"] },
  },

  // 404 route
  { path: "/:pathMatch(.*)*", component: NotFound },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  console.log('Navigation guard - Going to:', to.path, 'Requires auth:', to.meta.requiresAuth);

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    console.log('Route requires auth, checking authentication...');
    
    // Check if user is authenticated
    const isAuthenticated = await authStore.checkAuth();
    console.log('Authentication check result:', isAuthenticated);

    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      // Store the intended destination
      authStore.setRedirectPath(to.fullPath);
      return next("/login");
    }

    console.log('User authenticated:', authStore.user?.name, 'Role:', authStore.user?.role);

    // Check role-based access
    if (to.meta.roles && !authStore.hasRole(to.meta.roles)) {
      console.log('User does not have required role. Required:', to.meta.roles, 'User role:', authStore.user?.role);
      // Redirect to appropriate dashboard based on user role
      const userRole = authStore.user?.role;
      if (userRole === "mahasiswa") {
        return next("/mahasiswa");
      } else if (userRole === "panitia") {
        return next("/panitia");
      } else {
        return next("/pengunjung");
      }
    }
  }

  // If user is authenticated and trying to access login/register, redirect to dashboard
  if (
    (to.path === "/login" || to.path === "/register") &&
    authStore.isAuthenticated()
  ) {
    console.log('Authenticated user trying to access login/register, redirecting to dashboard');
    const userRole = authStore.user?.role;
    if (userRole === "mahasiswa") {
      return next("/mahasiswa");
    } else if (userRole === "panitia") {
      return next("/panitia");
    } else {
      return next("/pengunjung");
    }
  }

  console.log('Navigation allowed, proceeding to:', to.path);
  next();
});

export default router;