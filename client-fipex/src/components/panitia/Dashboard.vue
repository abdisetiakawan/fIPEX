<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">Exhibition Admin</h1>
          </div>
          <nav class="flex items-center space-x-8">
            <router-link to="/panitia" class="text-blue-600 font-medium"
              >Dashboard</router-link
            >
            <router-link
              to="/panitia/management"
              class="text-gray-500 hover:text-gray-700"
              >Manajemen Karya</router-link
            >
            <router-link
              to="/panitia/voting"
              class="text-gray-500 hover:text-gray-700"
              >Voting Monitor</router-link
            >
            <router-link
              to="/panitia/schedule"
              class="text-gray-500 hover:text-gray-700"
              >Jadwal & Sesi</router-link
            >
            <button @click="logout" class="text-gray-500 hover:text-gray-700">
              Logout
            </button>
          </nav>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Dashboard Overview -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Dashboard Admin - Real-time Analytics
        </h1>
        <div class="flex items-center space-x-4 text-sm text-gray-600">
          <span>Last updated: {{ lastUpdated }}</span>
          <button 
            @click="refreshData"
            :disabled="isRefreshing"
            class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {{ isRefreshing ? 'Refreshing...' : '🔄 Refresh' }}
          </button>
        </div>
      </div>

      <!-- Main Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="text-3xl font-bold text-blue-600 mb-2">
              {{ dashboardData.summary?.totalProjects || 0 }}
            </div>
            <div class="ml-2 text-green-500 text-sm">
              +{{ getNewSubmissions() }} baru
            </div>
          </div>
          <div class="text-gray-600">Total Karya</div>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="text-3xl font-bold text-yellow-600 mb-2">
            {{ dashboardData.summary?.pendingReview || 0 }}
          </div>
          <div class="text-gray-600">Pending Review</div>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="text-3xl font-bold text-green-600 mb-2">
              {{ dashboardData.summary?.totalVotes || 0 }}
            </div>
            <div class="ml-2 text-green-500 text-sm">
              +{{ getTodayVotes() }} hari ini
            </div>
          </div>
          <div class="text-gray-600">Total Votes</div>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="text-3xl font-bold text-purple-600 mb-2">
            {{ dashboardData.votingStats?.uniqueVoters || 0 }}
          </div>
          <div class="text-gray-600">Active Voters</div>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="text-3xl font-bold text-orange-600 mb-2">
            {{ dashboardData.participationRate || 0 }}%
          </div>
          <div class="text-gray-600">Participation Rate</div>
        </div>
      </div>

      <!-- Secondary Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-4 rounded-lg shadow text-center">
          <div class="text-2xl font-bold text-indigo-600">{{ dashboardData.summary?.totalComments || 0 }}</div>
          <div class="text-sm text-gray-600">Total Komentar</div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow text-center">
          <div class="text-2xl font-bold text-pink-600">{{ dashboardData.approvalRate || 0 }}%</div>
          <div class="text-sm text-gray-600">Approval Rate</div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow text-center">
          <div class="text-2xl font-bold text-teal-600">{{ dashboardData.userStats?.mahasiswa || 0 }}</div>
          <div class="text-sm text-gray-600">Mahasiswa</div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow text-center">
          <div class="text-2xl font-bold text-cyan-600">{{ dashboardData.userStats?.pengunjung || 0 }}</div>
          <div class="text-sm text-gray-600">Pengunjung</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Top Voted Works -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow">
            <div class="p-6 border-b">
              <div class="flex justify-between items-center">
                <h2 class="text-lg font-semibold">Top 10 Karya Terpopuler</h2>
                <div class="flex space-x-2">
                  <button 
                    @click="sortTopWorks = 'votes'"
                    :class="sortTopWorks === 'votes' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
                    class="px-3 py-1 text-sm rounded"
                  >
                    By Votes
                  </button>
                  <button 
                    @click="sortTopWorks = 'views'"
                    :class="sortTopWorks === 'views' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
                    class="px-3 py-1 text-sm rounded"
                  >
                    By Views
                  </button>
                </div>
              </div>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <div 
                  v-for="(work, index) in sortedTopWorks" 
                  :key="work.id"
                  class="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <!-- Ranking -->
                  <div class="flex-shrink-0">
                    <div 
                      :class="getRankingColor(index)"
                      class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    >
                      {{ index + 1 }}
                    </div>
                  </div>
                  
                  <!-- Thumbnail -->
                  <div class="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                    <img 
                      v-if="work.thumbnail"
                      :src="getImageUrl(work.thumbnail)"
                      :alt="work.title"
                      class="w-full h-full object-cover"
                      @error="onImageError"
                    />
                  </div>
                  
                  <!-- Content -->
                  <div class="flex-1">
                    <h3 class="font-medium text-gray-900">{{ work.title }}</h3>
                    <p class="text-sm text-gray-600">{{ work.author?.name || work.author }}</p>
                    <div class="flex items-center space-x-4 mt-1">
                      <span class="text-sm text-blue-600 font-medium">{{ work.votes || 0 }} votes</span>
                      <span class="text-sm text-gray-500">{{ work.views || 0 }} views</span>
                      <span class="text-sm text-purple-600">{{ work.category }}</span>
                    </div>
                  </div>
                  
                  <!-- Actions -->
                  <div class="flex-shrink-0">
                    <router-link 
                      :to="`/panitia/management?work=${work.id}`"
                      class="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200"
                    >
                      Detail
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Analytics & Quick Actions -->
        <div class="space-y-6">
          <!-- Category Performance -->
          <div class="bg-white rounded-lg shadow">
            <div class="p-6 border-b">
              <h3 class="font-semibold">Performance by Category</h3>
            </div>
            <div class="p-6">
              <div class="space-y-3">
                <div 
                  v-for="(stats, category) in dashboardData.categoryStats" 
                  :key="category"
                  class="flex items-center justify-between"
                >
                  <div class="text-sm text-gray-700">{{ category }}</div>
                  <div class="flex items-center space-x-2">
                    <div class="text-sm font-medium">{{ stats.totalVotes }}</div>
                    <div class="text-xs text-gray-500">votes</div>
                    <div class="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        class="bg-blue-600 h-2 rounded-full"
                        :style="{ width: `${getCategoryPercentage(stats.totalVotes)}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Program Statistics (for Mahasiswa) -->
          <div class="bg-white rounded-lg shadow">
            <div class="p-6 border-b">
              <h3 class="font-semibold">Program Studi</h3>
            </div>
            <div class="p-6">
              <div class="space-y-2">
                <div 
                  v-for="(count, program) in dashboardData.programStats" 
                  :key="program"
                  class="flex justify-between text-sm"
                >
                  <span class="text-gray-600">{{ program }}</span>
                  <span class="font-medium">{{ count }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Activities -->
          <div class="bg-white rounded-lg shadow">
            <div class="p-6 border-b">
              <h3 class="font-semibold">Recent Activities</h3>
            </div>
            <div class="p-6">
              <div class="space-y-3 max-h-64 overflow-y-auto">
                <div 
                  v-for="activity in dashboardData.recentActivities" 
                  :key="activity.id"
                  class="flex items-start space-x-3 text-sm"
                >
                  <div 
                    :class="getActivityIcon(activity.type)"
                    class="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                  ></div>
                  <div>
                    <div class="text-gray-900">
                      <span v-if="activity.type === 'submission'">
                        📝 <strong>{{ activity.author }}</strong> submitted "{{ activity.title }}"
                      </span>
                      <span v-else-if="activity.type === 'vote'">
                        🗳️ <strong>{{ activity.voter }}</strong> voted for "{{ activity.title }}"
                      </span>
                    </div>
                    <div class="text-gray-500 text-xs">{{ activity.timeAgo }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-lg shadow">
            <div class="p-6 border-b">
              <h3 class="font-semibold">Quick Actions</h3>
            </div>
            <div class="p-6 space-y-3">
              <router-link
                to="/panitia/management?status=pending"
                class="block w-full px-4 py-2 bg-yellow-600 text-white text-center rounded-md hover:bg-yellow-700"
              >
                Review Pending ({{ dashboardData.workStats?.pending || 0 }})
              </router-link>
              <router-link
                to="/panitia/voting"
                class="block w-full px-4 py-2 bg-green-600 text-white text-center rounded-md hover:bg-green-700"
              >
                Voting Analytics
              </router-link>
              <button 
                @click="exportData"
                class="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                📊 Export Data
              </button>
              <router-link
                to="/panitia/schedule"
                class="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700"
              >
                Manage Schedule
              </router-link>
            </div>
          </div>

          <!-- System Status -->
          <div class="bg-white rounded-lg shadow">
            <div class="p-6 border-b">
              <h3 class="font-semibold">System Status</h3>
            </div>
            <div class="p-6 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Voting System:</span>
                <div class="flex items-center">
                  <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span class="text-sm font-medium text-green-600">Active</span>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Database:</span>
                <div class="flex items-center">
                  <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span class="text-sm font-medium text-green-600">Connected</span>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">File Upload:</span>
                <div class="flex items-center">
                  <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span class="text-sm font-medium text-green-600">Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const dashboardData = ref({});
const isRefreshing = ref(false);
const lastUpdated = ref('');
const sortTopWorks = ref('votes');

let refreshInterval = null;

const sortedTopWorks = computed(() => {
  if (!dashboardData.value.topWorks) return [];
  
  const works = [...dashboardData.value.topWorks];
  if (sortTopWorks.value === 'views') {
    return works.sort((a, b) => (b.views || 0) - (a.views || 0));
  }
  return works.sort((a, b) => (b.votes || 0) - (a.votes || 0));
});

const getRankingColor = (index) => {
  if (index === 0) return 'bg-yellow-500' // Gold
  if (index === 1) return 'bg-gray-400'   // Silver
  if (index === 2) return 'bg-orange-600' // Bronze
  return 'bg-blue-600'
};

const getImageUrl = (thumbnail) => {
  if (thumbnail && thumbnail.startsWith('http')) {
    return thumbnail;
  }
  return `http://localhost:3000${thumbnail}`;
};

const onImageError = (event) => {
  event.target.style.display = 'none';
};

const getActivityIcon = (type) => {
  switch (type) {
    case 'submission': return 'bg-blue-500';
    case 'vote': return 'bg-green-500';
    case 'comment': return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
};

const getCategoryPercentage = (votes) => {
  const maxVotes = Math.max(...Object.values(dashboardData.value.categoryStats || {}).map(s => s.totalVotes));
  return maxVotes > 0 ? (votes / maxVotes) * 100 : 0;
};

const getNewSubmissions = () => {
  // Calculate new submissions today
  const today = new Date().toISOString().split('T')[0];
  const monthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  return dashboardData.value.monthlySubmissions?.[monthKey] || 0;
};

const getTodayVotes = () => {
  // Calculate today's votes from voting trends
  const today = new Date().toISOString().split('T')[0];
  return dashboardData.value.votingStats?.votesPerDay?.[today] || 0;
};

const refreshData = async () => {
  isRefreshing.value = true;
  
  try {
    const response = await fetch('http://localhost:3000/api/admin/dashboard', {
      credentials: "include",
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      dashboardData.value = result.data;
      lastUpdated.value = new Date().toLocaleTimeString('id-ID');
    }
  } catch (error) {
    console.error('Error refreshing dashboard:', error);
  }
  
  isRefreshing.value = false;
};

const exportData = async () => {
  try {
    // Export comprehensive data
    const data = {
      summary: dashboardData.value.summary,
      workStats: dashboardData.value.workStats,
      userStats: dashboardData.value.userStats,
      votingStats: dashboardData.value.votingStats,
      categoryStats: dashboardData.value.categoryStats,
      topWorks: dashboardData.value.topWorks,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting data:', error);
    alert('Gagal export data');
  }
};

const logout = () => {
  authStore.logout();
  router.push('/login');
};

onMounted(async () => {
  await refreshData();
  
  // Set up auto-refresh every 30 seconds
  refreshInterval = setInterval(refreshData, 30000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>