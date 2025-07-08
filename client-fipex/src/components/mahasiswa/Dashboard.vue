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
        <p class="text-gray-600">
          Selamat datang, {{ user?.name }}
          <span v-if="user?.program" class="ml-2 text-blue-600">{{ user.program }}</span>
          <span v-if="user?.angkatan" class="ml-1 text-blue-600">{{ user.angkatan }}</span>
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div v-for="i in 4" :key="i" class="bg-white p-6 rounded-lg shadow animate-pulse">
          <div class="h-8 bg-gray-200 rounded mb-2"></div>
          <div class="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div v-else class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="text-3xl font-bold text-blue-600 mb-2">
              {{ dashboardStats.totalKarya }}
            </div>
            <div class="ml-auto">
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>
          <div class="text-gray-600">Total Karya</div>
          <div class="text-xs text-gray-500 mt-1">
            {{ dashboardStats.thisMonth }} karya bulan ini
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="text-3xl font-bold text-green-600 mb-2">
              {{ dashboardStats.approved }}
            </div>
            <div class="ml-auto">
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div class="text-gray-600">Disetujui</div>
          <div class="text-xs text-gray-500 mt-1">
            {{ Math.round((dashboardStats.approved / Math.max(dashboardStats.totalKarya, 1)) * 100) }}% approval rate
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="text-3xl font-bold text-yellow-600 mb-2">
              {{ dashboardStats.pending }}
            </div>
            <div class="ml-auto">
              <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div class="text-gray-600">Pending Review</div>
          <div class="text-xs text-gray-500 mt-1">
            Menunggu persetujuan panitia
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="text-3xl font-bold text-purple-600 mb-2">
              {{ dashboardStats.totalVotes }}
            </div>
            <div class="ml-auto">
              <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div class="text-gray-600">Total Vote</div>
          <div class="text-xs text-gray-500 mt-1">
            {{ dashboardStats.totalViews }} total views
          </div>
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
                  class="text-blue-600 hover:underline text-sm"
                >
                  Lihat Semua
                </router-link>
              </div>
            </div>
            <div class="p-6">
              <!-- Loading State -->
              <div v-if="isLoadingWorks" class="space-y-4">
                <div v-for="i in 3" :key="i" class="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg animate-pulse">
                  <div class="w-16 h-16 bg-gray-200 rounded"></div>
                  <div class="flex-1">
                    <div class="h-4 bg-gray-200 rounded mb-2"></div>
                    <div class="h-3 bg-gray-200 rounded mb-2"></div>
                    <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>

              <!-- Works List -->
              <div v-else-if="recentWorks.length > 0" class="space-y-4">
                <div
                  v-for="work in recentWorks"
                  :key="work.id"
                  class="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  @click="viewWorkDetail(work.id)"
                >
                  <div class="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    <img 
                      v-if="work.thumbnail"
                      :src="getImageUrl(work.thumbnail)"
                      :alt="work.title"
                      class="w-full h-full object-cover"
                      @error="onImageError"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-medium text-gray-900 truncate">{{ work.title }}</h3>
                    <p class="text-sm text-gray-600 truncate">{{ work.category }}</p>
                    <div class="flex items-center space-x-4 mt-2">
                      <span
                        :class="getStatusColor(work.status)"
                        class="px-2 py-1 text-xs rounded-full"
                      >
                        {{ getStatusText(work.status) }}
                      </span>
                      <span class="text-sm text-gray-500">{{ work.votes || 0 }} votes</span>
                      <span class="text-sm text-gray-500">{{ work.views || 0 }} views</span>
                    </div>
                  </div>
                  <div class="flex-shrink-0">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div v-else class="text-center py-8">
                <div class="text-gray-400 text-4xl mb-4">📁</div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Belum ada karya</h3>
                <p class="text-gray-600 mb-4">Mulai upload karya pertama Anda</p>
                <router-link
                  to="/mahasiswa/upload"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Upload Karya Baru
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Profile Card -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="font-semibold mb-4">Profil Saya</h3>
            <div class="text-center">
              <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span class="text-white text-xl font-bold">
                  {{ user?.name?.charAt(0)?.toUpperCase() || 'M' }}
                </span>
              </div>
              <h4 class="font-medium text-gray-900">{{ user?.name }}</h4>
              <p class="text-sm text-gray-600">{{ user?.nim }}</p>
              <p class="text-sm text-gray-600">{{ user?.program }}</p>
              <p class="text-sm text-gray-600">Angkatan {{ user?.angkatan }}</p>
              <router-link
                to="/mahasiswa/profile"
                class="mt-3 inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                Edit Profil
              </router-link>
            </div>
          </div>

          <!-- Performance Chart -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="font-semibold mb-4">Performance Overview</h3>
            <div class="space-y-4">
              <!-- Approval Rate -->
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-600">Approval Rate</span>
                  <span class="font-medium">{{ approvalRate }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-green-600 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${approvalRate}%` }"
                  ></div>
                </div>
              </div>

              <!-- Engagement Score -->
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-600">Engagement Score</span>
                  <span class="font-medium">{{ engagementScore }}/100</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${engagementScore}%` }"
                  ></div>
                </div>
              </div>

              <!-- Category Distribution -->
              <div>
                <div class="text-sm text-gray-600 mb-2">Kategori Karya</div>
                <div class="space-y-1">
                  <div 
                    v-for="(count, category) in categoryDistribution" 
                    :key="category"
                    class="flex justify-between text-xs"
                  >
                    <span class="text-gray-600">{{ category }}</span>
                    <span class="font-medium">{{ count }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="font-semibold mb-4">Aktivitas Terbaru</h3>
            <div class="space-y-3">
              <div v-if="recentActivities.length > 0">
                <div 
                  v-for="activity in recentActivities" 
                  :key="activity.id"
                  class="flex items-start space-x-3 text-sm"
                >
                  <div 
                    :class="getActivityIcon(activity.type)"
                    class="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                  ></div>
                  <div class="flex-1">
                    <div class="text-gray-900">{{ activity.message }}</div>
                    <div class="text-gray-500 text-xs">{{ formatTimeAgo(activity.timestamp) }}</div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-4 text-gray-500 text-sm">
                Belum ada aktivitas terbaru
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="font-semibold mb-4">Quick Actions</h3>
            <div class="space-y-3">
              <router-link
                to="/mahasiswa/upload"
                class="w-full flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Upload Karya Baru
              </router-link>
              
              <router-link
                to="/mahasiswa/portfolio"
                class="w-full flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Kelola Portfolio
              </router-link>
              
              <router-link
                to="/pengunjung/katalog"
                class="w-full flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Jelajahi Karya Lain
              </router-link>
            </div>
          </div>

          <!-- Tips & Insights -->
          <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
            <h3 class="font-semibold mb-3 text-blue-900">💡 Tips & Insights</h3>
            <div class="space-y-2 text-sm">
              <div v-if="dashboardStats.pending > 0" class="text-blue-800">
                • {{ dashboardStats.pending }} karya menunggu review panitia
              </div>
              <div v-if="dashboardStats.totalVotes === 0" class="text-blue-800">
                • Upload karya untuk mulai mendapatkan vote dari pengunjung
              </div>
              <div v-if="approvalRate < 50" class="text-blue-800">
                • Tingkatkan kualitas deskripsi dan thumbnail untuk approval rate yang lebih baik
              </div>
              <div class="text-blue-800">
                • Karya dengan thumbnail menarik mendapat 3x lebih banyak views
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const user = ref(authStore.user);
const isLoading = ref(true);
const isLoadingWorks = ref(true);

const dashboardStats = ref({
  totalKarya: 0,
  approved: 0,
  pending: 0,
  rejected: 0,
  totalVotes: 0,
  totalViews: 0,
  thisMonth: 0,
});

const recentWorks = ref([]);
const recentActivities = ref([]);
const categoryDistribution = ref({});

// Computed properties
const approvalRate = computed(() => {
  if (dashboardStats.value.totalKarya === 0) return 0;
  return Math.round((dashboardStats.value.approved / dashboardStats.value.totalKarya) * 100);
});

const engagementScore = computed(() => {
  const votes = dashboardStats.value.totalVotes;
  const views = dashboardStats.value.totalViews;
  const works = dashboardStats.value.approved;
  
  if (works === 0) return 0;
  
  // Calculate engagement based on votes and views per approved work
  const avgVotes = votes / works;
  const avgViews = views / works;
  
  // Normalize to 0-100 scale (adjust these multipliers based on your data)
  const score = Math.min(100, (avgVotes * 10) + (avgViews * 0.5));
  return Math.round(score);
});

// Helper functions
const getImageUrl = (thumbnail) => {
  if (thumbnail && thumbnail.startsWith('http')) {
    return thumbnail;
  }
  return `http://localhost:3000${thumbnail}`;
};

const onImageError = (event) => {
  event.target.style.display = 'none';
};

const getStatusColor = (status) => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "draft":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status) => {
  switch (status) {
    case "approved":
      return "Disetujui";
    case "pending":
      return "Pending";
    case "rejected":
      return "Ditolak";
    case "draft":
      return "Draft";
    default:
      return status;
  }
};

const getActivityIcon = (type) => {
  switch (type) {
    case 'upload': return 'bg-blue-500';
    case 'approved': return 'bg-green-500';
    case 'rejected': return 'bg-red-500';
    case 'vote': return 'bg-purple-500';
    case 'comment': return 'bg-orange-500';
    default: return 'bg-gray-500';
  }
};

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Unknown time';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} detik lalu`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
  
  return date.toLocaleDateString('id-ID');
};

const viewWorkDetail = (workId) => {
  router.push(`/mahasiswa/detail/${workId}`);
};

const logout = () => {
  authStore.logout();
  router.push('/login');
};

// Load dashboard data
const loadDashboardData = async () => {
  try {
    isLoading.value = true;
    
    // Load user's works
    const worksResponse = await fetch('http://localhost:3000/api/works/my-works?limit=100', {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
      },
    });

    if (worksResponse.ok) {
      const worksData = await worksResponse.json();
      const works = worksData.data.works || [];
      
      // Calculate stats
      const stats = {
        totalKarya: works.length,
        approved: works.filter(w => w.status === 'approved').length,
        pending: works.filter(w => w.status === 'pending').length,
        rejected: works.filter(w => w.status === 'rejected').length,
        totalVotes: works.reduce((sum, w) => sum + (w.votes || 0), 0),
        totalViews: works.reduce((sum, w) => sum + (w.views || 0), 0),
        thisMonth: 0,
      };

      // Calculate this month's submissions
      const thisMonth = new Date();
      thisMonth.setDate(1);
      stats.thisMonth = works.filter(w => {
        const createdAt = w.createdAt?.toDate ? w.createdAt.toDate() : new Date(w.createdAt);
        return createdAt >= thisMonth;
      }).length;

      dashboardStats.value = stats;

      // Get recent works (last 5)
      recentWorks.value = works
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB - dateA;
        })
        .slice(0, 5);

      // Calculate category distribution
      const categories = {};
      works.forEach(work => {
        if (work.category) {
          categories[work.category] = (categories[work.category] || 0) + 1;
        }
      });
      categoryDistribution.value = categories;

      // Generate recent activities
      const activities = [];
      
      // Add upload activities
      works.forEach(work => {
        activities.push({
          id: `upload-${work.id}`,
          type: 'upload',
          message: `Mengupload karya "${work.title}"`,
          timestamp: work.createdAt,
        });

        if (work.status === 'approved') {
          activities.push({
            id: `approved-${work.id}`,
            type: 'approved',
            message: `Karya "${work.title}" disetujui`,
            timestamp: work.reviewedAt || work.updatedAt,
          });
        } else if (work.status === 'rejected') {
          activities.push({
            id: `rejected-${work.id}`,
            type: 'rejected',
            message: `Karya "${work.title}" ditolak`,
            timestamp: work.reviewedAt || work.updatedAt,
          });
        }
      });

      // Sort activities by timestamp and take recent 10
      recentActivities.value = activities
        .sort((a, b) => {
          const dateA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
          const dateB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
          return dateB - dateA;
        })
        .slice(0, 10);
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  } finally {
    isLoading.value = false;
    isLoadingWorks.value = false;
  }
};

onMounted(async () => {
  await loadDashboardData();
});
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-shadow {
  transition-property: box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>