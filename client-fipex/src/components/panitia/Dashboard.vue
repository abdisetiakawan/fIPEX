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
          Dashboard Panitia - Overview
        </h1>
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
          <div class="text-3xl font-bold text-yellow-600 mb-2">
            {{ stats.pendingReview }}
          </div>
          <div class="text-gray-600">Pending Review</div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="text-3xl font-bold text-green-600 mb-2">
            {{ stats.totalVoting }}
          </div>
          <div class="text-gray-600">Total Voting</div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="text-3xl font-bold text-purple-600 mb-2">
            {{ stats.activeSessions }}
          </div>
          <div class="text-gray-600">Sesi Aktif</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Quick Actions -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Quick Actions</h2>
            <div class="space-y-3">
              <router-link
                to="/panitia/management"
                class="block w-full px-4 py-3 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700"
              >
                Review Karya
              </router-link>
              <router-link
                to="/panitia/schedule"
                class="block w-full px-4 py-3 bg-green-600 text-white text-center rounded-md hover:bg-green-700"
              >
                Buat Jadwal
              </router-link>
              <button
                class="w-full px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Export Data
              </button>
              <router-link
                to="/panitia/voting"
                class="block w-full px-4 py-3 bg-orange-600 text-white text-center rounded-md hover:bg-orange-700"
              >
                Live Monitor
              </router-link>
            </div>
          </div>
        </div>

        <!-- Recent Activities & Pending Reviews -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Pending Reviews -->
          <div class="bg-white rounded-lg shadow">
            <div class="p-6 border-b">
              <div class="flex justify-between items-center">
                <h2 class="text-lg font-semibold">Karya Pending Review</h2>
                <router-link
                  to="/panitia/management"
                  class="text-blue-600 hover:underline"
                >
                  Lihat Semua
                </router-link>
              </div>
            </div>
            <div class="p-6">
              <div v-if="pendingWorks.length > 0" class="space-y-4">
                <div
                  v-for="work in pendingWorks.slice(0, 3)"
                  :key="work.id"
                  class="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                >
                  <div class="w-12 h-12 bg-gray-200 rounded"></div>
                  <div class="flex-1">
                    <h3 class="font-medium">{{ work.title }}</h3>
                    <p class="text-sm text-gray-600">{{ work.author }}</p>
                    <p class="text-xs text-gray-500">{{ work.category }}</p>
                  </div>
                  <div class="flex space-x-2">
                    <button
                      @click="reviewWork(work.id, 'approved')"
                      class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      @click="reviewWork(work.id, 'rejected')"
                      class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8 text-gray-500">
                Tidak ada karya yang perlu direview
              </div>
            </div>
          </div>

          <!-- Recent Activities -->
          <div class="bg-white rounded-lg shadow">
            <div class="p-6 border-b">
              <h2 class="text-lg font-semibold">Recent Activities</h2>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <div
                  v-for="activity in recentActivities"
                  :key="activity.id"
                  class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div
                    :class="getActivityIcon(activity.type)"
                    class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  >
                    {{ getActivityEmoji(activity.type) }}
                  </div>
                  <div class="flex-1">
                    <p class="text-sm text-gray-900">{{ activity.message }}</p>
                    <p class="text-xs text-gray-500">{{ activity.timeAgo }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Voting Statistics -->
          <div class="bg-white rounded-lg shadow">
            <div class="p-6 border-b">
              <h2 class="text-lg font-semibold">Voting Statistics</h2>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-blue-600">
                    {{ votingStats.totalVotes }}
                  </div>
                  <div class="text-sm text-gray-600">Total Votes</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-green-600">
                    {{ votingStats.todayVotes }}
                  </div>
                  <div class="text-sm text-gray-600">Today</div>
                </div>
              </div>

              <!-- Top 3 Works -->
              <div class="space-y-2">
                <h4 class="text-sm font-medium text-gray-700 mb-2">
                  Top 3 Karya:
                </h4>
                <div
                  v-for="(work, index) in topWorks.slice(0, 3)"
                  :key="work.id"
                  class="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div class="flex items-center space-x-2">
                    <div
                      :class="getRankBadge(index)"
                      class="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    >
                      {{ index + 1 }}
                    </div>
                    <span class="text-sm font-medium">{{ work.title }}</span>
                  </div>
                  <span class="text-sm text-gray-600"
                    >{{ work.votes }} votes</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- System Status -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="font-semibold mb-4">System Status</h3>
            <div class="space-y-3">
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
                  <span class="text-sm font-medium text-green-600"
                    >Connected</span
                  >
                </div>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">File Upload:</span>
                <div class="flex items-center">
                  <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span class="text-sm font-medium text-green-600"
                    >Operational</span
                  >
                </div>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Email Service:</span>
                <div class="flex items-center">
                  <div class="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  <span class="text-sm font-medium text-yellow-600"
                    >Limited</span
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Submissions -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="font-semibold mb-4">Recent Submissions</h3>
            <div class="space-y-3">
              <div
                v-for="submission in recentSubmissions"
                :key="submission.id"
                class="flex items-center space-x-3"
              >
                <div class="w-8 h-8 bg-gray-200 rounded"></div>
                <div class="flex-1">
                  <div class="text-sm font-medium">{{ submission.title }}</div>
                  <div class="text-xs text-gray-500">
                    {{ submission.author }}
                  </div>
                </div>
                <div class="text-xs text-gray-400">
                  {{ submission.timeAgo }}
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Analytics -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="font-semibold mb-4">Quick Analytics</h3>
            <div class="space-y-4">
              <!-- Category Distribution -->
              <div>
                <div class="text-sm text-gray-600 mb-2">
                  Category Distribution:
                </div>
                <div class="space-y-2">
                  <div
                    v-for="category in categoryDistribution"
                    :key="category.name"
                    class="flex items-center justify-between"
                  >
                    <span class="text-xs text-gray-600">{{
                      category.name
                    }}</span>
                    <div class="flex items-center space-x-2">
                      <div class="w-16 bg-gray-200 rounded-full h-1">
                        <div
                          class="bg-blue-600 h-1 rounded-full"
                          :style="{ width: `${category.percentage}%` }"
                        ></div>
                      </div>
                      <span class="text-xs font-medium w-8">{{
                        category.count
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Approval Rate -->
              <div>
                <div class="text-sm text-gray-600 mb-2">Approval Rate:</div>
                <div class="flex items-center space-x-2">
                  <div class="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-green-600 h-2 rounded-full"
                      :style="{ width: `${approvalRate}%` }"
                    ></div>
                  </div>
                  <span class="text-sm font-medium">{{ approvalRate }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Admin Tools -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="font-semibold mb-4">Admin Tools</h3>
            <div class="space-y-2">
              <button
                @click="exportAllData"
                class="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                📊 Export All Data
              </button>
              <button
                @click="sendNotifications"
                class="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                📧 Send Notifications
              </button>
              <button
                @click="generateReport"
                class="w-full px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
              >
                📋 Generate Report
              </button>
              <button
                @click="backupData"
                class="w-full px-3 py-2 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
              >
                💾 Backup Data
              </button>
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

const stats = ref({
  totalKarya: 0,
  pendingReview: 0,
  totalVoting: 0,
  activeSessions: 0,
});

const pendingWorks = ref([]);

const recentActivities = ref([
  {
    id: 1,
    type: "submission",
    message: 'New work submitted: "AI-Powered Learning Platform"',
    timeAgo: "5 menit lalu",
  },
  {
    id: 2,
    type: "vote",
    message: "EcoTracker App received 5 new votes",
    timeAgo: "12 menit lalu",
  },
  {
    id: 3,
    type: "review",
    message: "Smart IoT Dashboard approved by admin",
    timeAgo: "1 jam lalu",
  },
  {
    id: 4,
    type: "comment",
    message: "New comment on UI/UX Portfolio",
    timeAgo: "2 jam lalu",
  },
  {
    id: 5,
    type: "submission",
    message: 'New work submitted: "Blockchain Voting System"',
    timeAgo: "3 jam lalu",
  },
]);

const votingStats = ref({
  totalVotes: 2847,
  todayVotes: 156,
});

const topWorks = ref([
  { id: 1, title: "EcoTracker App", votes: 127 },
  { id: 2, title: "Smart IoT Dashboard", votes: 89 },
  { id: 3, title: "UI/UX Portfolio", votes: 76 },
]);

const recentSubmissions = ref([
  {
    id: 1,
    title: "AI Learning Platform",
    author: "John Doe",
    timeAgo: "5m",
  },
  {
    id: 2,
    title: "Blockchain Voting",
    author: "Jane Smith",
    timeAgo: "15m",
  },
  {
    id: 3,
    title: "Mobile Banking App",
    author: "Mike Johnson",
    timeAgo: "1h",
  },
  {
    id: 4,
    title: "E-Commerce Platform",
    author: "Sarah Wilson",
    timeAgo: "2h",
  },
]);

const categoryDistribution = ref([
  { name: "Mobile App", count: 45, percentage: 35 },
  { name: "Web Dev", count: 38, percentage: 30 },
  { name: "UI/UX", count: 25, percentage: 20 },
  { name: "Business", count: 19, percentage: 15 },
]);

const approvalRate = computed(() => {
  if (stats.value.totalKarya === 0) return 0;
  const approved = stats.value.totalKarya - stats.value.pendingReview;
  return Math.round((approved / stats.value.totalKarya) * 100);
});

const getActivityIcon = (type) => {
  switch (type) {
    case "submission":
      return "bg-blue-500";
    case "vote":
      return "bg-green-500";
    case "review":
      return "bg-purple-500";
    case "comment":
      return "bg-orange-500";
    default:
      return "bg-gray-500";
  }
};

const getActivityEmoji = (type) => {
  switch (type) {
    case "submission":
      return "📝";
    case "vote":
      return "🗳️";
    case "review":
      return "✅";
    case "comment":
      return "💬";
    default:
      return "📌";
  }
};

const getRankBadge = (index) => {
  if (index === 0) return "bg-yellow-500";
  if (index === 1) return "bg-gray-400";
  if (index === 2) return "bg-orange-600";
  return "bg-blue-600";
};

const reviewWork = async (workId, status) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/panitia/works/${workId}/status`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({ status }),
      }
    );

    if (response.ok) {
      // Remove from pending list
      pendingWorks.value = pendingWorks.value.filter(
        (work) => work.id !== workId
      );

      // Update stats
      stats.value.pendingReview--;

      alert(
        `Karya berhasil ${status === "approved" ? "disetujui" : "ditolak"}`
      );
    }
  } catch (error) {
    console.error("Error reviewing work:", error);
    alert("Terjadi kesalahan");
  }
};

const exportAllData = () => {
  // Export all data functionality
  alert("Exporting all data...");
};

const sendNotifications = () => {
  // Send notifications functionality
  alert("Sending notifications to all users...");
};

const generateReport = () => {
  // Generate report functionality
  alert("Generating comprehensive report...");
};

const backupData = () => {
  // Backup data functionality
  alert("Creating data backup...");
};

const logout = () => {
  authStore.logout();
  router.push("/login");
};

onMounted(async () => {
  try {
    const response = await fetch(
      "http://localhost:3000/api/panitia/dashboard",
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
    }
  } catch (error) {
    console.error("Error loading dashboard:", error);
  }

  // Load pending works
  try {
    const response = await fetch(
      "http://localhost:3000/api/panitia/works?status=pending",
      {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      }
    );

    if (response.ok) {
      const works = await response.json();
      pendingWorks.value = works.slice(0, 3); // Show only first 3
    }
  } catch (error) {
    console.error("Error loading pending works:", error);
  }
});
</script>
