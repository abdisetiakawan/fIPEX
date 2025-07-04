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
            <router-link to="/panitia/voting" class="text-gray-500 hover:text-gray-700">Voting Monitor</router-link>
            <router-link to="/panitia/schedule" class="text-blue-600 font-medium">Jadwal & Sesi</router-link>
            <button @click="logout" class="text-gray-500 hover:text-gray-700">Logout</button>
          </nav>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Jadwal & Sesi Pameran</h1>
          <p class="text-gray-600">Kelola timeline dan sesi voting pameran digital</p>
        </div>
        <button 
          @click="showCreateModal = true"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Buat Sesi Baru
        </button>
      </div>

      <!-- Current Status -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold mb-2">Status Pameran Saat Ini</h2>
            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span class="text-sm text-gray-600">Voting Period Active</span>
              </div>
              <div class="text-sm text-gray-500">
                Berakhir: {{ currentSession?.endDate }}
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold text-green-600">{{ timeRemaining }}</div>
            <div class="text-sm text-gray-500">Waktu tersisa</div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Timeline -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow">
            <div class="p-6 border-b">
              <h2 class="text-lg font-semibold">Timeline Pameran</h2>
            </div>
            <div class="p-6">
              <div class="space-y-6">
                <div 
                  v-for="session in sessions" 
                  :key="session.id"
                  class="relative"
                >
                  <!-- Timeline line -->
                  <div 
                    v-if="sessions.indexOf(session) !== sessions.length - 1"
                    class="absolute left-4 top-8 w-0.5 h-16 bg-gray-200"
                  ></div>
                  
                  <div class="flex items-start space-x-4">
                    <!-- Status indicator -->
                    <div 
                      :class="getSessionStatusColor(session.status)"
                      class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    >
                      <div class="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    
                    <!-- Content -->
                    <div class="flex-1 bg-gray-50 rounded-lg p-4">
                      <div class="flex justify-between items-start mb-2">
                        <div>
                          <h3 class="font-semibold text-gray-900">{{ session.title }}</h3>
                          <p class="text-sm text-gray-600">{{ session.description }}</p>
                        </div>
                        <div class="flex space-x-2">
                          <button 
                            @click="editSession(session)"
                            class="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200"
                          >
                            Edit
                          </button>
                          <button 
                            @click="deleteSession(session.id)"
                            class="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                      
                      <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span class="text-gray-500">Mulai:</span>
                          <div class="font-medium">{{ formatDateTime(session.startDate) }}</div>
                        </div>
                        <div>
                          <span class="text-gray-500">Berakhir:</span>
                          <div class="font-medium">{{ formatDateTime(session.endDate) }}</div>
                        </div>
                        <div>
                          <span class="text-gray-500">Tipe:</span>
                          <div class="font-medium">{{ session.type }}</div>
                        </div>
                        <div>
                          <span class="text-gray-500">Status:</span>
                          <span :class="getStatusTextColor(session.status)" class="font-medium">
                            {{ getStatusText(session.status) }}
                          </span>
                        </div>
                      </div>
                      
                      <!-- Session Actions -->
                      <div class="mt-3 flex space-x-2">
                        <button 
                          v-if="session.status === 'scheduled'"
                          @click="startSession(session.id)"
                          class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Start Session
                        </button>
                        <button 
                          v-if="session.status === 'active'"
                          @click="pauseSession(session.id)"
                          class="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                        >
                          Pause
                        </button>
                        <button 
                          v-if="session.status === 'active'"
                          @click="endSession(session.id)"
                          class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          End Session
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Session Management -->
        <div class="space-y-6">
          <!-- Quick Stats -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="font-semibold mb-4">Session Statistics</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Total Sessions:</span>
                <span class="text-sm font-medium">{{ sessions.length }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Active:</span>
                <span class="text-sm font-medium text-green-600">{{ getSessionCount('active') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Scheduled:</span>
                <span class="text-sm font-medium text-blue-600">{{ getSessionCount('scheduled') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Completed:</span>
                <span class="text-sm font-medium text-gray-600">{{ getSessionCount('completed') }}</span>
              </div>
            </div>
          </div>

          <!-- Session Templates -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="font-semibold mb-4">Session Templates</h3>
            <div class="space-y-2">
              <button 
                @click="createFromTemplate('voting')"
                class="w-full text-left px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
              >
                🗳️ Voting Period
              </button>
              <button 
                @click="createFromTemplate('exhibition')"
                class="w-full text-left px-3 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100"
              >
                🎨 Exhibition Period
              </button>
              <button 
                @click="createFromTemplate('review')"
                class="w-full text-left px-3 py-2 bg-purple-50 text-purple-700 rounded hover:bg-purple-100"
              >
                📝 Review Period
              </button>
              <button 
                @click="createFromTemplate('announcement')"
                class="w-full text-left px-3 py-2 bg-orange-50 text-orange-700 rounded hover:bg-orange-100"
              >
                📢 Announcement
              </button>
            </div>
          </div>

          <!-- Notifications -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="font-semibold mb-4">Notifications</h3>
            <div class="space-y-3">
              <div class="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div class="text-sm font-medium text-yellow-800">Upcoming Session</div>
                <div class="text-xs text-yellow-600">Voting period akan berakhir dalam 2 jam</div>
              </div>
              <div class="p-3 bg-blue-50 border border-blue-200 rounded">
                <div class="text-sm font-medium text-blue-800">Scheduled</div>
                <div class="text-xs text-blue-600">Review period dimulai besok pagi</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Session Modal -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">
          {{ showEditModal ? 'Edit Session' : 'Buat Session Baru' }}
        </h3>
        
        <form @submit.prevent="saveSession" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Judul Session</label>
            <input 
              v-model="sessionForm.title"
              type="text" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
            <textarea 
              v-model="sessionForm.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tipe Session</label>
            <select 
              v-model="sessionForm.type"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="voting">Voting Period</option>
              <option value="exhibition">Exhibition Period</option>
              <option value="review">Review Period</option>
              <option value="announcement">Announcement</option>
            </select>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
              <input 
                v-model="sessionForm.startDate"
                type="datetime-local" 
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal Berakhir</label>
              <input 
                v-model="sessionForm.endDate"
                type="datetime-local" 
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
            </div>
          </div>
          
          <div class="flex space-x-3 pt-4">
            <button 
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {{ showEditModal ? 'Update' : 'Buat Session' }}
            </button>
            <button 
              type="button"
              @click="closeModal"
              class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
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

const showCreateModal = ref(false)
const showEditModal = ref(false)
const selectedSession = ref(null)

const sessionForm = ref({
  title: '',
  description: '',
  type: 'voting',
  startDate: '',
  endDate: ''
})

const sessions = ref([
  {
    id: 1,
    title: 'Periode Voting Utama',
    description: 'Periode voting untuk semua karya yang telah disetujui',
    type: 'voting',
    status: 'active',
    startDate: '2024-12-01T09:00:00',
    endDate: '2024-12-15T23:59:59',
    createdAt: '2024-11-25T10:00:00'
  },
  {
    id: 2,
    title: 'Review Period',
    description: 'Periode review karya oleh panitia',
    type: 'review',
    status: 'completed',
    startDate: '2024-11-20T09:00:00',
    endDate: '2024-11-30T17:00:00',
    createdAt: '2024-11-18T10:00:00'
  },
  {
    id: 3,
    title: 'Pengumuman Pemenang',
    description: 'Pengumuman hasil voting dan pemenang',
    type: 'announcement',
    status: 'scheduled',
    startDate: '2024-12-16T10:00:00',
    endDate: '2024-12-16T12:00:00',
    createdAt: '2024-11-25T15:00:00'
  }
])

const currentSession = computed(() => {
  return sessions.value.find(s => s.status === 'active')
})

const timeRemaining = ref('5 hari 12 jam')

let timeInterval = null

const getSessionStatusColor = (status) => {
  switch (status) {
    case 'active': return 'bg-green-500'
    case 'scheduled': return 'bg-blue-500'
    case 'completed': return 'bg-gray-500'
    case 'paused': return 'bg-yellow-500'
    default: return 'bg-gray-300'
  }
}

const getStatusTextColor = (status) => {
  switch (status) {
    case 'active': return 'text-green-600'
    case 'scheduled': return 'text-blue-600'
    case 'completed': return 'text-gray-600'
    case 'paused': return 'text-yellow-600'
    default: return 'text-gray-500'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'active': return 'Aktif'
    case 'scheduled': return 'Terjadwal'
    case 'completed': return 'Selesai'
    case 'paused': return 'Dijeda'
    default: return status
  }
}

const getSessionCount = (status) => {
  return sessions.value.filter(s => s.status === status).length
}

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const editSession = (session) => {
  selectedSession.value = session
  sessionForm.value = {
    title: session.title,
    description: session.description,
    type: session.type,
    startDate: session.startDate,
    endDate: session.endDate
  }
  showEditModal.value = true
}

const deleteSession = async (id) => {
  if (!confirm('Yakin ingin menghapus session ini?')) return
  
  try {
    const response = await fetch(`http://localhost:3000/api/panitia/sessions/${id}`, {
      method: 'DELETE',
      credentials: "include",
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (response.ok) {
      sessions.value = sessions.value.filter(s => s.id !== id)
      alert('Session berhasil dihapus')
    }
  } catch (error) {
    console.error('Error deleting session:', error)
    alert('Gagal menghapus session')
  }
}

const startSession = async (id) => {
  try {
    const response = await fetch(`http://localhost:3000/api/panitia/sessions/${id}/start`, {
      method: 'POST',
      credentials: "include",
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (response.ok) {
      const session = sessions.value.find(s => s.id === id)
      if (session) {
        session.status = 'active'
      }
      alert('Session berhasil dimulai')
    }
  } catch (error) {
    console.error('Error starting session:', error)
    alert('Gagal memulai session')
  }
}

const pauseSession = async (id) => {
  try {
    const response = await fetch(`http://localhost:3000/api/panitia/sessions/${id}/pause`, {
      method: 'POST',
      credentials: "include",
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (response.ok) {
      const session = sessions.value.find(s => s.id === id)
      if (session) {
        session.status = 'paused'
      }
      alert('Session berhasil dijeda')
    }
  } catch (error) {
    console.error('Error pausing session:', error)
    alert('Gagal menjeda session')
  }
}

const endSession = async (id) => {
  if (!confirm('Yakin ingin mengakhiri session ini?')) return
  
  try {
    const response = await fetch(`http://localhost:3000/api/panitia/sessions/${id}/end`, {
      method: 'POST',
      credentials: "include",
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (response.ok) {
      const session = sessions.value.find(s => s.id === id)
      if (session) {
        session.status = 'completed'
      }
      alert('Session berhasil diakhiri')
    }
  } catch (error) {
    console.error('Error ending session:', error)
    alert('Gagal mengakhiri session')
  }
}

const createFromTemplate = (type) => {
  const templates = {
    voting: {
      title: 'Periode Voting',
      description: 'Periode voting untuk karya-karya yang telah disetujui',
      type: 'voting'
    },
    exhibition: {
      title: 'Periode Pameran',
      description: 'Periode pameran digital untuk semua karya',
      type: 'exhibition'
    },
    review: {
      title: 'Periode Review',
      description: 'Periode review dan evaluasi karya oleh panitia',
      type: 'review'
    },
    announcement: {
      title: 'Pengumuman',
      description: 'Pengumuman hasil dan pemenang',
      type: 'announcement'
    }
  }
  
  const template = templates[type]
  if (template) {
    sessionForm.value = {
      ...template,
      startDate: '',
      endDate: ''
    }
    showCreateModal.value = true
  }
}

const saveSession = async () => {
  try {
    const url = showEditModal.value 
      ? `http://localhost:3000/api/panitia/sessions/${selectedSession.value.id}`
      : 'http://localhost:3000/api/panitia/sessions'
    
    const method = showEditModal.value ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(sessionForm.value)
    })
    
    if (response.ok) {
      const sessionData = await response.json()
      
      if (showEditModal.value) {
        const index = sessions.value.findIndex(s => s.id === selectedSession.value.id)
        if (index !== -1) {
          sessions.value[index] = { ...sessions.value[index], ...sessionData }
        }
        alert('Session berhasil diupdate')
      } else {
        sessions.value.push({
          ...sessionData,
          id: sessions.value.length + 1,
          status: 'scheduled',
          createdAt: new Date().toISOString()
        })
        alert('Session berhasil dibuat')
      }
      
      closeModal()
    }
  } catch (error) {
    console.error('Error saving session:', error)
    alert('Gagal menyimpan session')
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  selectedSession.value = null
  sessionForm.value = {
    title: '',
    description: '',
    type: 'voting',
    startDate: '',
    endDate: ''
  }
}

const updateTimeRemaining = () => {
  if (currentSession.value) {
    const endTime = new Date(currentSession.value.endDate)
    const now = new Date()
    const diff = endTime - now
    
    if (diff > 0) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      timeRemaining.value = `${days} hari ${hours} jam ${minutes} menit`
    } else {
      timeRemaining.value = 'Session berakhir'
    }
  }
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:3000/api/panitia/sessions', {
      credentials: "include",
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.length > 0) {
        sessions.value = data
      }
    }
  } catch (error) {
    console.error('Error loading sessions:', error)
  }
  
  // Update time remaining every minute
  updateTimeRemaining()
  timeInterval = setInterval(updateTimeRemaining, 60000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>
