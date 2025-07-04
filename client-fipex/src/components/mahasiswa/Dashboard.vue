<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">Digital Exhibition</h1>
          </div>
          <nav class="flex items-center space-x-8">
            <router-link to="/mahasiswa" class="text-blue-600 font-medium"
              >Dashboard</router-link
            >
            <router-link
              to="/mahasiswa/portfolio"
              class="text-gray-500 hover:text-gray-700"
              >Karya Saya</router-link
            >
            <router-link
              to="/mahasiswa/upload"
              class="text-gray-500 hover:text-gray-700"
              >Upload Karya</router-link
            >
            <router-link
              to="/mahasiswa/profile"
              class="text-gray-500 hover:text-gray-700"
              >Profil</router-link
            >
            <button @click="logout" class="text-gray-500 hover:text-gray-700">
              Logout
            </button>
          </nav>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Section -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Dashboard Mahasiswa
        </h1>
        <p class="text-gray-600">Selamat datang, {{ user?.name }}</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="text-3xl font-bold text-blue-600 mb-2">
            {{ stats.totalKarya }}
          </div>
          <div class="text-gray-600">Total Karya</div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="text-3xl font-bold text-green-600 mb-2">
            {{ stats.approved }}
          </div>
          <div class="text-gray-600">Disetujui</div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="text-3xl font-bold text-yellow-600 mb-2">
            {{ stats.pending }}
          </div>
          <div class="text-gray-600">Pending</div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="text-3xl font-bold text-purple-600 mb-2">
            {{ stats.totalVotes }}
          </div>
          <div class="text-gray-600">Total Vote</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Recent Works -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow">
            <div class="p-6 border-b">
              <div class="flex justify-between items-center">
                <h2 class="text-lg font-semibold">Karya Terbaru</h2>
                <router-link
                  to="/mahasiswa/portfolio"
                  class="text-blue-600 hover:underline"
                >
                  Lihat Semua
                </router-link>
              </div>
            </div>
            <div class="p-6">
              <div v-if="recentWorks.length > 0" class="space-y-4">
                <div
                  v-for="work in recentWorks"
                  :key="work.id"
                  class="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                >
                  <div class="w-16 h-16 bg-gray-200 rounded"></div>
                  <div class="flex-1">
                    <h3 class="font-medium">{{ work.title }}</h3>
                    <p class="text-sm text-gray-600">{{ work.category }}</p>
                    <div class="flex items-center space-x-4 mt-2">
                      <span
                        :class="getStatusColor(work.status)"
                        class="px-2 py-1 text-xs rounded"
                      >
                        {{ getStatusText(work.status) }}
                      </span>
                      <span class="text-sm text-gray-500"
                        >{{ work.votes }} votes</span
                      >
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8 text-gray-500">
                Belum ada karya.
                <router-link to="/mahasiswa/upload" class="text-blue-600"
                  >Upload karya pertama</router-link
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Profile & Notifications -->
        <div class="space-y-6">
          <!-- Profile Card -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="font-semibold mb-4">Profil Saya</h3>
            <div class="text-center">
              <div
                class="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3"
              ></div>
              <h4 class="font-medium">{{ user?.name }}</h4>
              <p class="text-sm text-gray-600">{{ user?.program }}</p>
              <p class="text-sm text-gray-600">{{ user?.angkatan }}</p>
              <router-link
                to="/mahasiswa/profile"
                class="mt-3 inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Edit Profil
              </router-link>
            </div>
          </div>

          <!-- Notifications -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="font-semibold mb-4">Notifikasi</h3>
            <div class="space-y-3">
              <div class="p-3 bg-green-50 border border-green-200 rounded">
                <div class="text-sm font-medium text-green-800">
                  Karya Disetujui
                </div>
                <div class="text-xs text-green-600">
                  EcoTracker App telah disetujui
                </div>
              </div>
              <div class="p-3 bg-blue-50 border border-blue-200 rounded">
                <div class="text-sm font-medium text-blue-800">Vote Baru</div>
                <div class="text-xs text-blue-600">
                  5 vote baru untuk UI/UX Portfolio
                </div>
              </div>
              <div class="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div class="text-sm font-medium text-yellow-800">
                  Review Pending
                </div>
                <div class="text-xs text-yellow-600">
                  Smart IoT Dashboard menunggu review
                </div>
              </div>
            </div>
          </div>

          <!-- Monthly Stats -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="font-semibold mb-4">Statistik Bulan Ini</h3>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Total Views:</span>
                <span class="text-sm font-medium">1,234</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">New Votes:</span>
                <span class="text-sm font-medium">45</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Comments:</span>
                <span class="text-sm font-medium">12</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const user = ref(authStore.user);
const stats = ref({
  totalKarya: 0,
  approved: 0,
  pending: 0,
  totalVotes: 0,
});
const recentWorks = ref([]);

const getStatusColor = (status) => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status) => {
  switch (status) {
    case "approved":
      return "Disetujui";
    case "pending":
      return "Pending Review";
    case "rejected":
      return "Ditolak";
    default:
      return status;
  }
};

const logout = () => {
  authStore.logout();
  router.push("/login");
};

onMounted(async () => {
  try {
    const response = await fetch(
      "http://localhost:3000/api/mahasiswa/dashboard",
      {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      stats.value = data;
      recentWorks.value = data.recentWorks || [];
    }
  } catch (error) {
    console.error("Error loading dashboard:", error);
  }
});
</script>
