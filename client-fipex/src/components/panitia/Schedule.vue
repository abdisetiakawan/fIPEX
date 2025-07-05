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
          <p class="text-gray-600">Kelola timeline dan sesi voting pameran digital dengan notifikasi email otomatis</p>
        </div>
        <div class="flex space-x-3">
          <button 
            @click="showCreateModal = true"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + Buat Sesi Baru
          </button>
          <button 
            @click="showNotificationHistory = true"
            class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            📧 Riwayat Email
          </button>
        </div>
      </div>

      <!-- Current Status -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold mb-2">Status Pameran Saat Ini</h2>
            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <div :class="currentSession?.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'" class="w-3 h-3 rounded-full mr-2"></div>
                <span class="text-sm text-gray-600">
                  {{ currentSession ? getStatusText(currentSession.status) : 'Tidak ada sesi aktif' }}
                </span>
              </div>
              <div v-if="currentSession" class="text-sm text-gray-500">
                {{ currentSession.title }}
              </div>
            </div>
          </div>
          <div v-if="currentSession" class="text-right">
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
              <div class="flex justify-between items-center">
                <h2 class="text-lg font-semibold">Timeline Pameran</h2>
                <div class="flex space-x-2">
                  <button 
                    @click="refreshSessions"
                    :disabled="loading"
                    class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 disabled:opacity-50"
                  >
                    {{ loading ? 'Loading...' : '🔄' }}
                  </button>
                </div>
              </div>
            </div>
            <div class="p-6">
              <div class="space-y-6">
                <div 
                  v-for="(session, index) in sortedSessions" 
                  :key="session.id"
                  class="relative"
                >
                  <!-- Timeline line -->
                  <div 
                    v-if="index !== sortedSessions.length - 1"
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
                            @click="sendManualNotification(session)"
                            class="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded hover:bg-purple-200"
                          >
                            📧 Notify
                          </button>
                          <button 
                            @click="deleteSession(session.id)"
                            class="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                      
                      <div class="grid grid-cols-2 gap-4 text-sm mb-3">
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
                          <div class="font-medium">{{ getSessionTypeText(session.type) }}</div>
                        </div>
                        <div>
                          <span class="text-gray-500">Status:</span>
                          <span :class="getStatusTextColor(session.status)" class="font-medium">
                            {{ getStatusText(session.status) }}
                          </span>
                        </div>
                      </div>

                      <!-- Email notification status -->
                      <div v-if="session.notificationSent" class="mb-3 p-2 bg-green-50 border border-green-200 rounded text-sm">
                        <div class="flex items-center text-green-800">
                          <span class="mr-2">✅</span>
                          Email terkirim ke {{ session.emailStats?.sent || 0 }} penerima
                          <span v-if="session.emailStats?.failed > 0" class="ml-2 text-red-600">
                            ({{ session.emailStats.failed }} gagal)
                          </span>
                        </div>
                      </div>
                      
                      <!-- Session Actions -->
                      <div class="flex space-x-2">
                        <button 
                          v-if="session.status === 'scheduled'"
                          @click="startSession(session.id)"
                          class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          ▶️ Start Session
                        </button>
                        <button 
                          v-if="session.status === 'active'"
                          @click="pauseSession(session.id)"
                          class="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                        >
                          ⏸️ Pause
                        </button>
                        <button 
                          v-if="session.status === 'active' || session.status === 'paused'"
                          @click="endSession(session.id)"
                          class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          ⏹️ End Session
                        </button>
                        <button 
                          v-if="session.status === 'paused'"
                          @click="startSession(session.id)"
                          class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          ▶️ Resume
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-if="!sessions.length" class="text-center py-8 text-gray-500">
                <div class="text-4xl mb-2">📅</div>
                <p>Belum ada sesi yang dibuat</p>
                <button 
                  @click="showCreateModal = true"
                  class="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Buat Sesi Pertama
                </button>
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

          <!-- Email Notifications -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="font-semibold mb-4">Email Notifications</h3>
            <div class="space-y-3">
              <div class="p-3 bg-blue-50 border border-blue-200 rounded">
                <div class="text-sm font-medium text-blue-800">Auto Notifications</div>
                <div class="text-xs text-blue-600">Email otomatis saat sesi dibuat/diupdate</div>
              </div>
              <div class="p-3 bg-green-50 border border-green-200 rounded">
                <div class="text-sm font-medium text-green-800">Reminder System</div>
                <div class="text-xs text-green-600">Reminder 24h & 1h sebelum sesi</div>
              </div>
              <div class="p-3 bg-purple-50 border border-purple-200 rounded">
                <div class="text-sm font-medium text-purple-800">Manual Notifications</div>
                <div class="text-xs text-purple-600">Kirim notifikasi manual kapan saja</div>
              </div>
            </div>
          </div>

          <!-- Recent Notifications -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="font-semibold mb-4">Recent Email Activity</h3>
            <div class="space-y-2 max-h-48 overflow-y-auto">
              <div 
                v-for="notification in recentNotifications" 
                :key="notification.id"
                class="p-2 bg-gray-50 rounded text-sm"
              >
                <div class="font-medium">{{ notification.type }}</div>
                <div class="text-gray-600">{{ notification.recipientCount }} recipients</div>
                <div class="text-xs text-gray-500">{{ formatDate(notification.sentAt) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Session Modal -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-semibold mb-4">
          {{ showEditModal ? 'Edit Session' : 'Buat Session Baru' }}
        </h3>
        
        <form @submit.prevent="saveSession" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Judul Session *</label>
            <input 
              v-model="sessionForm.title"
              type="text" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Deskripsi *</label>
            <textarea 
              v-model="sessionForm.description"
              rows="3"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tipe Session *</label>
            <select 
              v-model="sessionForm.type"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="voting">🗳️ Voting Period</option>
              <option value="exhibition">🎨 Exhibition Period</option>
              <option value="review">📝 Review Period</option>
              <option value="announcement">📢 Announcement</option>
            </select>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai *</label>
              <input 
                v-model="sessionForm.startDate"
                type="datetime-local" 
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal Berakhir *</label>
              <input 
                v-model="sessionForm.endDate"
                type="datetime-local" 
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
            </div>
          </div>

          <!-- Email Notification Options -->
          <div class="border-t pt-4">
            <h4 class="font-medium text-gray-900 mb-3">📧 Email Notifications</h4>
            
            <div class="space-y-3">
              <div class="flex items-center">
                <input 
                  v-model="sessionForm.sendNotification"
                  type="checkbox" 
                  id="sendNotification"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                >
                <label for="sendNotification" class="ml-2 text-sm text-gray-700">
                  Kirim notifikasi email saat session dibuat
                </label>
              </div>

              <div v-if="sessionForm.sendNotification" class="ml-6 space-y-2">
                <div class="text-sm text-gray-600 mb-2">Target Penerima:</div>
                <div class="flex items-center space-x-4">
                  <label class="flex items-center">
                    <input 
                      v-model="sessionForm.targetRoles"
                      type="checkbox" 
                      value="mahasiswa"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    >
                    <span class="ml-2 text-sm">Mahasiswa</span>
                  </label>
                  <label class="flex items-center">
                    <input 
                      v-model="sessionForm.targetRoles"
                      type="checkbox" 
                      value="pengunjung"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    >
                    <span class="ml-2 text-sm">Pengunjung</span>
                  </label>
                </div>
              </div>

              <div class="flex items-center">
                <input 
                  v-model="sessionForm.scheduleReminders"
                  type="checkbox" 
                  id="scheduleReminders"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                >
                <label for="scheduleReminders" class="ml-2 text-sm text-gray-700">
                  Jadwalkan reminder email (24h & 1h sebelum sesi)
                </label>
              </div>
            </div>
          </div>
          
          <div class="flex space-x-3 pt-4">
            <button 
              type="submit"
              :disabled="isSubmitting"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {{ isSubmitting ? 'Menyimpan...' : (showEditModal ? 'Update Session' : 'Buat Session') }}
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

    <!-- Manual Notification Modal -->
    <div v-if="showNotifyModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">📧 Kirim Notifikasi Manual</h3>
        
        <div class="mb-4">
          <p class="text-sm text-gray-600 mb-3">
            Kirim notifikasi untuk: <strong>{{ selectedSessionForNotify?.title }}</strong>
          </p>
          
          <div class="space-y-2">
            <div class="text-sm font-medium text-gray-700">Target Penerima:</div>
            <div class="space-y-2">
              <label class="flex items-center">
                <input 
                  v-model="notifyForm.roles"
                  type="checkbox" 
                  value="mahasiswa"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                >
                <span class="ml-2 text-sm">Mahasiswa</span>
              </label>
              <label class="flex items-center">
                <input 
                  v-model="notifyForm.roles"
                  type="checkbox" 
                  value="pengunjung"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                >
                <span class="ml-2 text-sm">Pengunjung</span>
              </label>
            </div>
          </div>
        </div>
        
        <div class="flex space-x-3">
          <button 
            @click="sendNotification"
            :disabled="notifyForm.roles.length === 0 || isSendingNotification"
            class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {{ isSendingNotification ? 'Mengirim...' : 'Kirim Notifikasi' }}
          </button>
          <button 
            @click="showNotifyModal = false"
            class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Notification History Modal -->
    <div v-if="showNotificationHistory" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">📧 Riwayat Email Notifications</h3>
          <button @click="showNotificationHistory = false" class="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        <div class="space-y-3">
          <div 
            v-for="notification in notificationHistory" 
            :key="notification.id"
            class="p-4 border border-gray-200 rounded-lg"
          >
            <div class="flex justify-between items-start">
              <div>
                <div class="font-medium">{{ notification.type }}</div>
                <div class="text-sm text-gray-600">{{ notification.sessionId ? 'Session ID: ' + notification.sessionId : 'General notification' }}</div>
                <div class="text-sm text-gray-500">{{ formatDateTime(notification.sentAt) }}</div>
              </div>
              <div class="text-right">
                <div class="text-sm">
                  <span class="text-green-600">✅ {{ notification.successCount }}</span>
                  <span v-if="notification.failCount > 0" class="text-red-600 ml-2">❌ {{ notification.failCount }}</span>
                </div>
                <div class="text-xs text-gray-500">{{ notification.recipientCount }} total</div>
              </div>
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

const sessions = ref([])
const loading = ref(false)
const isSubmitting = ref(false)
const isSendingNotification = ref(false)
const timeRemaining = ref('')
const recentNotifications = ref([])
const notificationHistory = ref([])

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showNotifyModal = ref(false)
const showNotificationHistory = ref(false)
const selectedSession = ref(null)
const selectedSessionForNotify = ref(null)

const sessionForm = ref({
  title: '',
  description: '',
  type: 'voting',
  startDate: '',
  endDate: '',
  sendNotification: true,
  targetRoles: ['mahasiswa', 'pengunjung'],
  scheduleReminders: true
})

const notifyForm = ref({
  roles: ['mahasiswa', 'pengunjung']
})

let timeInterval = null

const sortedSessions = computed(() => {
  return [...sessions.value].sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
})

const currentSession = computed(() => {
  return sessions.value.find(s => s.status === 'active')
})

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

const getSessionTypeText = (type) => {
  const types = {
    'voting': '🗳️ Voting Period',
    'exhibition': '🎨 Exhibition Period',
    'review': '📝 Review Period',
    'announcement': '📢 Announcement'
  }
  return types[type] || type
}

const getSessionCount = (status) => {
  return sessions.value.filter(s => s.status === status).length
}

const formatDateTime = (dateString) => {
  if (!dateString) return 'Unknown'
  const date = dateString.toDate ? dateString.toDate() : new Date(dateString)
  return date.toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'
  const date = dateString.toDate ? dateString.toDate() : new Date(dateString)
  return date.toLocaleDateString('id-ID')
}

const refreshSessions = async () => {
  loading.value = true
  
  try {
    const response = await fetch('http://localhost:3000/api/panitia/sessions', {
      credentials: "include",
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (response.ok) {
      const result = await response.json()
      sessions.value = result.data.sessions || []
    }
  } catch (error) {
    console.error('Error loading sessions:', error)
  }
  
  loading.value = false
}

const loadNotificationHistory = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/panitia/notifications', {
      credentials: "include",
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (response.ok) {
      const result = await response.json()
      notificationHistory.value = result.data.notifications || []
      recentNotifications.value = result.data.notifications?.slice(0, 5) || []
    }
  } catch (error) {
    console.error('Error loading notification history:', error)
  }
}

const editSession = (session) => {
  selectedSession.value = session
  sessionForm.value = {
    title: session.title,
    description: session.description,
    type: session.type,
    startDate: session.startDate,
    endDate: session.endDate,
    sendNotification: false,
    targetRoles: session.targetRoles || ['mahasiswa', 'pengunjung'],
    scheduleReminders: false
  }
  showEditModal.value = true
}

const deleteSession = async (id) => {
  if (!confirm('Yakin ingin menghapus session ini? Email pembatalan akan dikirim ke semua user.')) return
  
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
      alert('Session berhasil dihapus dan email pembatalan telah dikirim')
      await loadNotificationHistory()
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
      alert('Session berhasil dimulai dan notifikasi telah dikirim')
      await loadNotificationHistory()
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
      alert('Session berhasil dijeda dan notifikasi telah dikirim')
      await loadNotificationHistory()
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
      alert('Session berhasil diakhiri dan notifikasi telah dikirim')
      await loadNotificationHistory()
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
      description: 'Periode voting untuk karya-karya yang telah disetujui. Pengunjung dapat memberikan vote dan komentar.',
      type: 'voting'
    },
    exhibition: {
      title: 'Periode Pameran',
      description: 'Periode pameran digital untuk semua karya. Karya dapat dilihat dan dieksplorasi oleh semua pengunjung.',
      type: 'exhibition'
    },
    review: {
      title: 'Periode Review',
      description: 'Periode review dan evaluasi karya oleh panitia. Karya akan dinilai dan disetujui.',
      type: 'review'
    },
    announcement: {
      title: 'Pengumuman Penting',
      description: 'Pengumuman hasil voting, pemenang, atau informasi penting lainnya.',
      type: 'announcement'
    }
  }
  
  const template = templates[type]
  if (template) {
    sessionForm.value = {
      ...template,
      startDate: '',
      endDate: '',
      sendNotification: true,
      targetRoles: ['mahasiswa', 'pengunjung'],
      scheduleReminders: true
    }
    showCreateModal.value = true
  }
}

const saveSession = async () => {
  isSubmitting.value = true
  
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
      const result = await response.json()
      
      if (showEditModal.value) {
        const index = sessions.value.findIndex(s => s.id === selectedSession.value.id)
        if (index !== -1) {
          sessions.value[index] = result.data.session
        }
        alert('Session berhasil diupdate')
      } else {
        sessions.value.push(result.data.session)
        alert('Session berhasil dibuat' + (sessionForm.value.sendNotification ? ' dan email notifikasi telah dikirim' : ''))
      }
      
      closeModal()
      await loadNotificationHistory()
    } else {
      const error = await response.json()
      alert(error.message || 'Gagal menyimpan session')
    }
  } catch (error) {
    console.error('Error saving session:', error)
    alert('Gagal menyimpan session')
  }
  
  isSubmitting.value = false
}

const sendManualNotification = (session) => {
  selectedSessionForNotify.value = session
  notifyForm.value.roles = ['mahasiswa', 'pengunjung']
  showNotifyModal.value = true
}

const sendNotification = async () => {
  if (notifyForm.value.roles.length === 0) {
    alert('Pilih minimal satu target penerima')
    return
  }
  
  isSendingNotification.value = true
  
  try {
    const response = await fetch(`http://localhost:3000/api/panitia/sessions/${selectedSessionForNotify.value.id}/notify`, {
      method: 'POST',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        roles: notifyForm.value.roles,
        type: 'reminder'
      })
    })
    
    if (response.ok) {
      const result = await response.json()
      const totalSent = result.data.results.reduce((sum, r) => sum + r.sent, 0)
      alert(`Notifikasi berhasil dikirim ke ${totalSent} penerima`)
      showNotifyModal.value = false
      await loadNotificationHistory()
    } else {
      const error = await response.json()
      alert(error.message || 'Gagal mengirim notifikasi')
    }
  } catch (error) {
    console.error('Error sending notification:', error)
    alert('Gagal mengirim notifikasi')
  }
  
  isSendingNotification.value = false
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
    endDate: '',
    sendNotification: true,
    targetRoles: ['mahasiswa', 'pengunjung'],
    scheduleReminders: true
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
  await refreshSessions()
  await loadNotificationHistory()
  
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