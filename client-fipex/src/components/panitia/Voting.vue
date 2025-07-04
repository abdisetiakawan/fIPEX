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
            <router-link to="/panitia" class="text-gray-500 hover:text-gray-700">Dashboard</router-link>
            <router-link to="/panitia/management" class="text-gray-500 hover:text-gray-700">Manajemen Karya</router-link>
            <router-link to="/panitia/voting" class="text-blue-600 font-medium">Voting Monitor</router-link>
            <router-link to="/panitia/schedule" class="text-gray-500 hover:text-gray-700">Jadwal & Sesi</router-link>
            <button @click="logout" class="text-gray-500 hover:text-gray-700">Logout</button>
          </nav>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Voting Monitor</h1>
          <p class="text-gray-600">Real-time monitoring voting dan analytics</p>
        </div>
        <div class="flex space-x-3">
          <button 
            @click="refreshData"
            :disabled="loading"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {{ loading ? 'Refreshing...' : '🔄 Refresh' }}
          </button>
          <button 
            @click="exportData"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            📊 Export Data
          </button>
        </div>
      </div>

      <!-- Real-time Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="text-3xl font-bold text-blue-600 mb-2">{{ votingStats.totalVotes }}</div>
            <div class="ml-2 text-green-500 text-sm">
              +{{ votingStats.todayVotes }} hari ini
            </div>
          </div>
          <div class="text-gray-600">Total Votes</div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="text-3xl font-bold text-purple-600 mb-2">{{ votingStats.activeVoters }}</div>
          <div class="text-gray-600">Active Voters</div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="text-3xl font-bold text-orange-600 mb-2">{{ votingStats.avgVotesPerWork }}</div>
          <div class="text-gray-600">Avg Votes/Karya</div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="text-3xl font-bold text-red-600 mb-2">{{ votingStats.participationRate }}%</div>
          <div class="text-gray-600">Participation Rate</div>
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
                    @click="sortBy = 'votes'"
                    :class="sortBy === 'votes' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
                    class="px-3 py-1 text-sm rounded"
                  >
                    By Votes
                  </button>
                  <button 
                    @click="sortBy = 'growth'"
                    :class="sortBy === 'growth' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
                    class="px-3 py-1 text-sm rounded"
                  >
                    By Growth
                  </button>
                </div>
              </div>
            </div>
            <div class="p-6">
              <div class="space-y-4">
                <div 
                  v-for="(work, index) in topWorks" 
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
                  <div class="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                  
                  <!-- Content -->
                  <div class="flex-1">
                    <h3 class="font-medium text-gray-900">{{ work.title }}</h3>
                    <p class="text-sm text-gray-600">{{ work.author }}</p>
                    <div class="flex items-center space-x-4 mt-1">
                      <span class="text-sm text-blue-600 font-medium">{{ work.votes }} votes</span>
                      <span class="text-sm text-gray-500">{{ work.views }} views</span>
                      <span 
                        v-if="work.growth > 0"
                        class="text-sm text-green-600"
                      >
                        +{{ work.growth }}% today
                      </span>
                    </div>
                  </div>
                  
                  <!-- Vote Progress -->
                  <div class="flex-shrink-0 w-24">
                    <div class="text-xs text-gray-500 mb-1">{{ Math.round((work.votes / votingStats.totalVotes) * 100) }}%</div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        :style="{ width: `${(work.votes / topWorks[0].votes) * 100}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Live Activity & Analytics -->
        <div class="space-y-6">
          <!-- Live Activity Feed -->
          <div class="bg-white rounded-lg shadow">
            <div class="p-6 border-b">
              <div class="flex items-center">
                <h3 class="font-semibold">Live Activity</h3>
                <div class="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div class="p-6">
              <div class="space-y-3 max-h-64 overflow-y-auto">
                <div 
                  v-for="activity in liveActivities" 
                  :key="activity.id"
                  class="flex items-start space-x-3 text-sm"
                >
                  <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <div class="text-gray-900">{{ activity.message }}</div>
                    <div class="text-gray-500 text-xs">{{ activity.timeAgo }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Voting Trends Chart -->
          <div class="bg-white rounded-lg shadow">
            <div class="p-6 border-b">
              <h3 class="font-semibold">Voting Trends (7 Hari)</h3>
            </div>
            <div class="p-6">
              <div class="space-y-3">
                <div 
                  v-for="(day, index) in votingTrends" 
                  :key="index"
                  class="flex items-center justify-between"
                >
                  <div class="text-sm text-gray-600">{{ day.date }}</div>
                  <div class="flex items-center space-x-2">
                    <div class="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        class="bg-blue-600 h-2 rounded-full"
                        :style="{ width: `${(day.votes / Math.max(...votingTrends.map(d => d.votes))) * 100}%` }"
                      ></div>
                    </div>
                    <div class="text-sm font-medium w-8">{{ day.votes }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Category Performance -->
          <div class="bg-white rounded-lg shadow">
            <div class="p-6 border-b">
              <h3 class="font-semibold">Performance by Category</h3>
            </div>
            <div class="p-6">
              <div class="space-y-3">
                <div 
                  v-for="category in categoryStats" 
                  :key="category.name"
                  class="flex items-center justify-between"
                >
                  <div class="text-sm text-gray-700">{{ category.name }}</div>
                  <div class="flex items-center space-x-2">
                    <div class="text-sm font-medium">{{ category.avgVotes }}</div>
                    <div class="text-xs text-gray-500">avg</div>
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
              <button 
                @click="resetVoting"
                class="w-full px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                🔄 Reset All Voting
              </button>
              <button 
                @click="pauseVoting"
                class="w-full px-4 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
              >
                ⏸️ Pause Voting
              </button>
              <button 
                @click="announceWinner"
                class="w-full px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                🏆 Announce Winner
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const sortBy = ref('votes')

const votingStats = ref({
  totalVotes: 2847,
  todayVotes: 156,
  activeVoters: 89,
  avgVotesPerWork: 23,
  participationRate: 67
})

const topWorks = ref([
  {
    id: 1,
    title: 'EcoTracker - Green Living App',
    author: 'Sarah Chen',
    votes: 127,
    views: 1234,
    growth: 15
  },
  {
    id: 2,
    title: 'Smart IoT Dashboard',
    author: 'John Doe',
    votes: 89,
    views: 567,
    growth: 8
  },
  {
    id: 3,
    title: 'UI/UX Portfolio Website',
    author: 'Jane Smith',
    votes: 76,
    views: 890,
    growth: 12
  },
  {
    id: 4,
    title: 'FinTech Mobile App',
    author: 'Mike Johnson',
    votes: 65,
    views: 432,
    growth: 5
  },
  {
    id: 5,
    title: 'E-Commerce Platform',
    author: 'Lisa Wong',
    votes: 54,
    views: 321,
    growth: 3
  }
])

const liveActivities = ref([
  {
    id: 1,
    message: 'New vote for "EcoTracker App"',
    timeAgo: '2 detik lalu'
  },
  {
    id: 2,
    message: 'New vote for "Smart IoT Dashboard"',
    timeAgo: '15 detik lalu'
  },
  {
    id: 3,
    message: 'New comment on "UI/UX Portfolio"',
    timeAgo: '1 menit lalu'
  },
  {
    id: 4,
    message: 'New vote for "FinTech Mobile App"',
    timeAgo: '2 menit lalu'
  },
  {
    id: 5,
    message: 'New vote for "EcoTracker App"',
    timeAgo: '3 menit lalu'
  }
])

const votingTrends = ref([
  { date: 'Sen', votes: 45 },
  { date: 'Sel', votes: 67 },
  { date: 'Rab', votes: 89 },
  { date: 'Kam', votes: 123 },
  { date: 'Jum', votes: 156 },
  { date: 'Sab', votes: 134 },
  { date: 'Min', votes: 98 }
])

const categoryStats = ref([
  { name: 'Aplikasi Mobile', avgVotes: 45 },
  { name: 'Web Development', avgVotes: 38 },
  { name: 'UI/UX Design', avgVotes: 32 },
  { name: 'Business Plan', avgVotes: 28 },
  { name: 'Data Science', avgVotes: 25 }
])

let refreshInterval = null

const getRankingColor = (index) => {
  if (index === 0) return 'bg-yellow-500' // Gold
  if (index === 1) return 'bg-gray-400'   // Silver
  if (index === 2) return 'bg-orange-600' // Bronze
  return 'bg-blue-600'
}

const refreshData = async () => {
  loading.value = true
  
  try {
    const response = await fetch('http://localhost:3000/api/panitia/voting-stats', {
      credentials: "include",
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      // Update stats with real data
      topWorks.value = data.topWorks || topWorks.value
      votingStats.value = { ...votingStats.value, ...data }
    }
  } catch (error) {
    console.error('Error refreshing data:', error)
  }
  
  loading.value = false
}

const exportData = () => {
  // Export voting data to CSV
  const csvData = topWorks.value.map(work => ({
    Ranking: topWorks.value.indexOf(work) + 1,
    Title: work.title,
    Author: work.author,
    Votes: work.votes,
    Views: work.views,
    Growth: work.growth + '%'
  }))
  
  const csv = [
    Object.keys(csvData[0]).join(','),
    ...csvData.map(row => Object.values(row).join(','))
  ].join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'voting-data.csv'
  a.click()
  window.URL.revokeObjectURL(url)
}

const resetVoting = () => {
  if (confirm('Yakin ingin reset semua voting? Tindakan ini tidak dapat dibatalkan.')) {
    // Reset voting logic
    alert('Voting berhasil direset')
  }
}

const pauseVoting = () => {
  if (confirm('Yakin ingin pause voting sementara?')) {
    // Pause voting logic
    alert('Voting telah dipause')
  }
}

const announceWinner = () => {
  if (confirm('Yakin ingin mengumumkan pemenang berdasarkan voting saat ini?')) {
    // Announce winner logic
    alert('Pemenang telah diumumkan!')
  }
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}

// Simulate live updates
const simulateLiveUpdate = () => {
  // Add new activity
  const activities = [
    'New vote for "EcoTracker App"',
    'New vote for "Smart IoT Dashboard"',
    'New comment on "UI/UX Portfolio"',
    'New vote for "FinTech Mobile App"',
    'New favorite added'
  ]
  
  const newActivity = {
    id: Date.now(),
    message: activities[Math.floor(Math.random() * activities.length)],
    timeAgo: 'Baru saja'
  }
  
  liveActivities.value.unshift(newActivity)
  if (liveActivities.value.length > 10) {
    liveActivities.value.pop()
  }
  
  // Update time ago for existing activities
  liveActivities.value.forEach((activity, index) => {
    if (index > 0) {
      const timeUnits = ['detik', 'menit', 'jam']
      const randomTime = Math.floor(Math.random() * 60) + 1
      const randomUnit = timeUnits[Math.floor(Math.random() * timeUnits.length)]
      activity.timeAgo = `${randomTime} ${randomUnit} lalu`
    }
  })
}

onMounted(() => {
  refreshData()
  
  // Set up real-time updates
  refreshInterval = setInterval(() => {
    simulateLiveUpdate()
  }, 5000) // Update every 5 seconds
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>
