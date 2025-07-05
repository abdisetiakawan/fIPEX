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
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Voting Analytics & Monitor</h1>
          <p class="text-gray-600">Real-time monitoring voting dan analytics mendalam</p>
        </div>
        <div class="flex space-x-3">
          <select 
            v-model="selectedPeriod"
            @change="loadVotingAnalytics"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="24h">24 Jam Terakhir</option>
            <option value="7d">7 Hari Terakhir</option>
            <option value="30d">30 Hari Terakhir</option>
            <option value="90d">90 Hari Terakhir</option>
          </select>
          <button 
            @click="refreshData"
            :disabled="loading"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {{ loading ? 'Refreshing...' : '🔄 Refresh' }}
          </button>
          <button 
            @click="exportVotingData"
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
            <div class="text-3xl font-bold text-blue-600 mb-2">{{ votingAnalytics.totalVotes || 0 }}</div>
            <div class="ml-2 text-green-500 text-sm">
              +{{ getTodayVotes() }} hari ini
            </div>
          </div>
          <div class="text-gray-600">Total Votes ({{ selectedPeriod }})</div>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="text-3xl font-bold text-purple-600 mb-2">{{ votingAnalytics.summary?.uniqueVoters || 0 }}</div>
          <div class="text-gray-600">Unique Voters</div>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="text-3xl font-bold text-orange-600 mb-2">{{ votingAnalytics.summary?.uniqueWorks || 0 }}</div>
          <div class="text-gray-600">Works Voted</div>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="text-3xl font-bold text-red-600 mb-2">{{ votingAnalytics.summary?.averageVotesPerDay || 0 }}</div>
          <div class="text-gray-600">Avg Votes/Day</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Top Voted Works in Period -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow">
            <div class="p-6 border-b">
              <div class="flex justify-between items-center">
                <h2 class="text-lg font-semibold">Top Voted Works ({{ selectedPeriod }})</h2>
                <div class="flex space-x-2">
                  <button 
                    @click="sortBy = 'periodVotes'"
                    :class="sortBy === 'periodVotes' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
                    class="px-3 py-1 text-sm rounded"
                  >
                    Period Votes
                  </button>
                  <button 
                    @click="sortBy = 'totalVotes'"
                    :class="sortBy === 'totalVotes' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
                    class="px-3 py-1 text-sm rounded"
                  >
                    Total Votes
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
                  
                  <!-- Content -->
                  <div class="flex-1">
                    <h3 class="font-medium text-gray-900">{{ work.title }}</h3>
                    <p class="text-sm text-gray-600">{{ work.author }}</p>
                    <div class="flex items-center space-x-4 mt-1">
                      <span class="text-sm text-blue-600 font-medium">
                        +{{ work.periodVotes }} votes ({{ selectedPeriod }})
                      </span>
                      <span class="text-sm text-gray-500">{{ work.totalVotes }} total</span>
                      <span class="text-sm text-purple-600">{{ work.category }}</span>
                    </div>
                  </div>
                  
                  <!-- Vote Progress -->
                  <div class="flex-shrink-0 w-24">
                    <div class="text-xs text-gray-500 mb-1">
                      {{ Math.round((work.periodVotes / (votingAnalytics.totalVotes || 1)) * 100) }}%
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        :style="{ width: `${getVotePercentage(work.periodVotes)}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-if="!votingAnalytics.topVotedWorks?.length" class="text-center py-8 text-gray-500">
                Tidak ada data voting untuk periode ini
              </div>
            </div>
          </div>
        </div>

        <!-- Analytics & Top Voters -->
        <div class="space-y-6">
          <!-- Voting Trends Chart -->
          <div class="bg-white rounded-lg shadow">
            <div class="p-6 border-b">
              <h3 class="font-semibold">Voting Trends ({{ selectedPeriod }})</h3>
            </div>
            <div class="p-6">
              <div class="space-y-3">
                <div 
                  v-for="(votes, date) in sortedVotingTrends" 
                  :key="date"
                  class="flex items-center justify-between"
                >
                  <div class="text-sm text-gray-600">{{ formatDate(date) }}</div>
                  <div class="flex items-center space-x-2">
                    <div class="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        class="bg-blue-600 h-2 rounded-full"
                        :style="{ width: `${getTrendPercentage(votes)}%` }"
                      ></div>
                    </div>
                    <div class="text-sm font-medium w-8">{{ votes }}</div>
                  </div>
                </div>
              </div>
              
              <div v-if="!Object.keys(votingAnalytics.votingTrends || {}).length" class="text-center py-4 text-gray-500">
                Tidak ada data trend
              </div>
            </div>
          </div>

          <!-- Top Voters -->
          <div class="bg-white rounded-lg shadow">
            <div class="p-6 border-b">
              <h3 class="font-semibold">Most Active Voters ({{ selectedPeriod }})</h3>
            </div>
            <div class="p-6">
              <div class="space-y-3">
                <div 
                  v-for="(voter, index) in votingAnalytics.topVoters?.slice(0, 10)" 
                  :key="voter.id"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {{ index + 1 }}
                    </div>
                    <div>
                      <div class="text-sm font-medium">{{ voter.name }}</div>
                      <div class="text-xs text-gray-500">{{ voter.institution || voter.role }}</div>
                    </div>
                  </div>
                  <div class="text-sm font-medium text-blue-600">
                    {{ voter.periodVotes }} votes
                  </div>
                </div>
              </div>
              
              <div v-if="!votingAnalytics.topVoters?.length" class="text-center py-4 text-gray-500">
                Tidak ada data voter
              </div>
            </div>
          </div>

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

          <!-- Quick Actions -->
          <div class="bg-white rounded-lg shadow">
            <div class="p-6 border-b">
              <h3 class="font-semibold">Quick Actions</h3>
            </div>
            <div class="p-6 space-y-3">
              <button 
                @click="downloadDetailedReport"
                class="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                📋 Download Detailed Report
              </button>
              <button 
                @click="exportVoterList"
                class="w-full px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                👥 Export Voter List
              </button>
              <button 
                @click="viewWorkAnalytics"
                class="w-full px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
              >
                📊 Work Analytics
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
const selectedPeriod = ref('7d')
const sortBy = ref('periodVotes')

const votingAnalytics = ref({})
const liveActivities = ref([])

let refreshInterval = null

const sortedTopWorks = computed(() => {
  if (!votingAnalytics.value.topVotedWorks) return []
  
  const works = [...votingAnalytics.value.topVotedWorks]
  if (sortBy.value === 'totalVotes') {
    return works.sort((a, b) => b.totalVotes - a.totalVotes)
  }
  return works.sort((a, b) => b.periodVotes - a.periodVotes)
})

const sortedVotingTrends = computed(() => {
  if (!votingAnalytics.value.votingTrends) return {}
  
  const trends = votingAnalytics.value.votingTrends
  const sortedEntries = Object.entries(trends).sort(([a], [b]) => new Date(a) - new Date(b))
  return Object.fromEntries(sortedEntries)
})

const getRankingColor = (index) => {
  if (index === 0) return 'bg-yellow-500' // Gold
  if (index === 1) return 'bg-gray-400'   // Silver
  if (index === 2) return 'bg-orange-600' // Bronze
  return 'bg-blue-600'
}

const getVotePercentage = (votes) => {
  const maxVotes = Math.max(...(votingAnalytics.value.topVotedWorks?.map(w => w.periodVotes) || [1]))
  return maxVotes > 0 ? (votes / maxVotes) * 100 : 0
}

const getTrendPercentage = (votes) => {
  const maxVotes = Math.max(...Object.values(votingAnalytics.value.votingTrends || {}))
  return maxVotes > 0 ? (votes / maxVotes) * 100 : 0
}

const getTodayVotes = () => {
  const today = new Date().toISOString().split('T')[0]
  return votingAnalytics.value.votingTrends?.[today] || 0
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', { 
    month: 'short', 
    day: 'numeric',
    weekday: 'short'
  })
}

const loadVotingAnalytics = async () => {
  loading.value = true
  
  try {
    const response = await fetch(`http://localhost:3000/api/admin/voting-analytics?period=${selectedPeriod.value}`, {
      credentials: "include",
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (response.ok) {
      const result = await response.json()
      votingAnalytics.value = result.data
    }
  } catch (error) {
    console.error('Error loading voting analytics:', error)
  }
  
  loading.value = false
}

const refreshData = async () => {
  await loadVotingAnalytics()
  updateLiveActivities()
}

const updateLiveActivities = () => {
  // Simulate live activities from recent votes
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

const exportVotingData = () => {
  try {
    const data = {
      period: selectedPeriod.value,
      analytics: votingAnalytics.value,
      exportedAt: new Date().toISOString(),
    }
    
    const csv = [
      ['Work Title', 'Author', 'Category', 'Period Votes', 'Total Votes', 'Status'].join(','),
      ...(votingAnalytics.value.topVotedWorks || []).map(work => [
        `"${work.title}"`,
        `"${work.author}"`,
        `"${work.category}"`,
        work.periodVotes,
        work.totalVotes,
        work.status
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `voting-analytics-${selectedPeriod.value}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting data:', error)
    alert('Gagal export data')
  }
}

const downloadDetailedReport = () => {
  try {
    const report = {
      period: selectedPeriod.value,
      summary: votingAnalytics.value.summary,
      topWorks: votingAnalytics.value.topVotedWorks,
      topVoters: votingAnalytics.value.topVoters,
      trends: votingAnalytics.value.votingTrends,
      generatedAt: new Date().toISOString(),
    }
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `detailed-voting-report-${selectedPeriod.value}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading report:', error)
    alert('Gagal download report')
  }
}

const exportVoterList = () => {
  try {
    const csv = [
      ['Rank', 'Name', 'Institution/Role', 'Votes in Period'].join(','),
      ...(votingAnalytics.value.topVoters || []).map((voter, index) => [
        index + 1,
        `"${voter.name}"`,
        `"${voter.institution || voter.role}"`,
        voter.periodVotes
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `top-voters-${selectedPeriod.value}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting voter list:', error)
    alert('Gagal export voter list')
  }
}

const viewWorkAnalytics = () => {
  router.push('/panitia/management?tab=analytics')
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  await loadVotingAnalytics()
  
  // Set up real-time updates
  refreshInterval = setInterval(() => {
    updateLiveActivities()
  }, 5000) // Update every 5 seconds
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>