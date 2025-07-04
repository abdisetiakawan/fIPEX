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
            <router-link to="/panitia/management" class="text-blue-600 font-medium">Manajemen Karya</router-link>
            <router-link to="/panitia/voting" class="text-gray-500 hover:text-gray-700">Voting Monitor</router-link>
            <router-link to="/panitia/schedule" class="text-gray-500 hover:text-gray-700">Jadwal & Sesi</router-link>
            <button @click="logout" class="text-gray-500 hover:text-gray-700">Logout</button>
          </nav>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Manajemen Karya</h1>
        <p class="text-gray-600">Review dan kelola semua karya yang disubmit mahasiswa</p>
      </div>

      <!-- Filters & Stats -->
      <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <!-- Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Pencarian</label>
            <input 
              v-model="filters.search"
              @input="applyFilters"
              type="text" 
              placeholder="Cari karya atau mahasiswa..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
          </div>
          
          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select 
              v-model="filters.status"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>
          
          <!-- Category Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
            <select 
              v-model="filters.category"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Kategori</option>
              <option value="Aplikasi Mobile">Aplikasi Mobile</option>
              <option value="Web Development">Web Development</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Business Plan">Business Plan</option>
            </select>
          </div>
          
          <!-- Sort -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Urutkan</label>
            <select 
              v-model="filters.sort"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="votes">Most Voted</option>
              <option value="title">Judul A-Z</option>
            </select>
          </div>
        </div>
        
        <!-- Quick Stats -->
        <div class="grid grid-cols-4 gap-4 pt-4 border-t">
          <div class="text-center">
            <div class="text-2xl font-bold text-yellow-600">{{ statusCounts.pending }}</div>
            <div class="text-sm text-gray-600">Pending</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ statusCounts.approved }}</div>
            <div class="text-sm text-gray-600">Approved</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-red-600">{{ statusCounts.rejected }}</div>
            <div class="text-sm text-gray-600">Rejected</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ filteredWorks.length }}</div>
            <div class="text-sm text-gray-600">Total Filtered</div>
          </div>
        </div>
      </div>

      <!-- Works List -->
      <div class="space-y-4">
        <div 
          v-for="work in paginatedWorks" 
          :key="work.id"
          class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="p-6">
            <div class="flex items-start space-x-4">
              <!-- Thumbnail -->
              <div class="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0"></div>
              
              <!-- Content -->
              <div class="flex-1">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900">{{ work.title }}</h3>
                    <div class="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span>{{ work.author }}</span>
                      <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded">{{ work.category }}</span>
                      <span :class="getStatusColor(work.status)" class="px-2 py-1 rounded">
                        {{ getStatusText(work.status) }}
                      </span>
                    </div>
                  </div>
                  
                  <!-- Actions -->
                  <div class="flex space-x-2">
                    <button 
                      @click="viewDetail(work)"
                      class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
                    >
                      Detail
                    </button>
                    <button 
                      v-if="work.status === 'pending'"
                      @click="reviewWork(work, 'approved')"
                      class="px-3 py-1 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200"
                    >
                      Approve
                    </button>
                    <button 
                      v-if="work.status === 'pending'"
                      @click="showRejectModal(work)"
                      class="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
                    >
                      Reject
                    </button>
                    <button 
                      v-if="work.status !== 'pending'"
                      @click="changeStatus(work)"
                      class="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded hover:bg-yellow-200"
                    >
                      Change Status
                    </button>
                  </div>
                </div>
                
                <p class="text-gray-600 text-sm mb-3">{{ work.description }}</p>
                
                <div class="flex items-center justify-between text-sm text-gray-500">
                  <div class="flex items-center space-x-4">
                    <span>{{ work.votes || 0 }} votes</span>
                    <span>{{ work.views || 0 }} views</span>
                    <span>Submitted: {{ formatDate(work.createdAt) }}</span>
                  </div>
                  
                  <div v-if="work.reviewedAt" class="text-xs">
                    Reviewed: {{ formatDate(work.reviewedAt) }}
                  </div>
                </div>
                
                <!-- Feedback -->
                <div v-if="work.feedback" class="mt-3 p-3 bg-gray-50 rounded">
                  <div class="text-sm font-medium text-gray-700 mb-1">Feedback:</div>
                  <div class="text-sm text-gray-600">{{ work.feedback }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pagination -->
      <div class="flex justify-center mt-8">
        <nav class="flex space-x-2">
          <button 
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          
          <button 
            v-for="page in totalPages" 
            :key="page"
            @click="currentPage = page"
            :class="currentPage === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'"
            class="px-3 py-2 text-sm font-medium border border-gray-300 rounded-md"
          >
            {{ page }}
          </button>
          
          <button 
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </nav>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetailModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold">Detail Karya</h3>
          <button @click="showDetailModal = false" class="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        <div v-if="selectedWork" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Judul:</label>
              <div class="text-gray-900">{{ selectedWork.title }}</div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Kategori:</label>
              <div class="text-gray-900">{{ selectedWork.category }}</div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Author:</label>
              <div class="text-gray-900">{{ selectedWork.author }}</div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Status:</label>
              <span :class="getStatusColor(selectedWork.status)" class="px-2 py-1 rounded text-sm">
                {{ getStatusText(selectedWork.status) }}
              </span>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Deskripsi:</label>
            <div class="text-gray-900 bg-gray-50 p-3 rounded">{{ selectedWork.description }}</div>
          </div>
          
          <div v-if="selectedWork.technologies" class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Technologies:</label>
              <div class="text-gray-900">{{ selectedWork.technologies.join(', ') }}</div>
            </div>
          </div>
          
          <div v-if="selectedWork.links" class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Links:</label>
            <div class="space-y-1">
              <a v-if="selectedWork.links.github" :href="selectedWork.links.github" target="_blank" class="block text-blue-600 hover:underline">
                GitHub: {{ selectedWork.links.github }}
              </a>
              <a v-if="selectedWork.links.live" :href="selectedWork.links.live" target="_blank" class="block text-blue-600 hover:underline">
                Live Demo: {{ selectedWork.links.live }}
              </a>
              <a v-if="selectedWork.links.figma" :href="selectedWork.links.figma" target="_blank" class="block text-blue-600 hover:underline">
                Design: {{ selectedWork.links.figma }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div v-if="showRejectModalFlag" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">Reject Karya</h3>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Alasan Penolakan:</label>
          <textarea 
            v-model="rejectFeedback"
            placeholder="Berikan feedback untuk mahasiswa..."
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>
        <div class="flex space-x-3">
          <button 
            @click="confirmReject"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reject
          </button>
          <button 
            @click="showRejectModalFlag = false"
            class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const works = ref([])
const filters = ref({
  search: '',
  status: '',
  category: '',
  sort: 'newest'
})

const currentPage = ref(1)
const itemsPerPage = 10

const showDetailModal = ref(false)
const showRejectModalFlag = ref(false)
const selectedWork = ref(null)
const rejectFeedback = ref('')

const filteredWorks = computed(() => {
  let filtered = [...works.value]
  
  if (filters.value.search) {
    filtered = filtered.filter(work => 
      work.title.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      work.author.toLowerCase().includes(filters.value.search.toLowerCase())
    )
  }
  
  if (filters.value.status) {
    filtered = filtered.filter(work => work.status === filters.value.status)
  }
  
  if (filters.value.category) {
    filtered = filtered.filter(work => work.category === filters.value.category)
  }
  
  // Sort
  if (filters.value.sort === 'newest') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } else if (filters.value.sort === 'oldest') {
    filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  } else if (filters.value.sort === 'votes') {
    filtered.sort((a, b) => (b.votes || 0) - (a.votes || 0))
  } else if (filters.value.sort === 'title') {
    filtered.sort((a, b) => a.title.localeCompare(b.title))
  }
  
  return filtered
})

const statusCounts = computed(() => {
  return {
    pending: works.value.filter(w => w.status === 'pending').length,
    approved: works.value.filter(w => w.status === 'approved').length,
    rejected: works.value.filter(w => w.status === 'rejected').length
  }
})

const totalPages = computed(() => {
  return Math.ceil(filteredWorks.value.length / itemsPerPage)
})

const paginatedWorks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredWorks.value.slice(start, end)
})

const getStatusColor = (status) => {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-800'
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'rejected': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'approved': return 'Disetujui'
    case 'pending': return 'Pending Review'
    case 'rejected': return 'Ditolak'
    default: return status
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID')
}

const applyFilters = () => {
  currentPage.value = 1
}

const viewDetail = (work) => {
  selectedWork.value = work
  showDetailModal.value = true
}

const reviewWork = async (work, status) => {
  try {
    const response = await fetch(`http://localhost:3000/api/panitia/works/${work.id}/status`, {
      method: 'PUT',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ status })
    })
    
    if (response.ok) {
      const updatedWork = await response.json()
      const index = works.value.findIndex(w => w.id === work.id)
      if (index !== -1) {
        works.value[index] = updatedWork
      }
      alert(`Karya berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}`)
    }
  } catch (error) {
    console.error('Error reviewing work:', error)
    alert('Terjadi kesalahan')
  }
}

const showRejectModal = (work) => {
  selectedWork.value = work
  rejectFeedback.value = ''
  showRejectModalFlag.value = true
}

const confirmReject = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/panitia/works/${selectedWork.value.id}/status`, {
      method: 'PUT',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ 
        status: 'rejected',
        feedback: rejectFeedback.value
      })
    })
    
    if (response.ok) {
      const updatedWork = await response.json()
      const index = works.value.findIndex(w => w.id === selectedWork.value.id)
      if (index !== -1) {
        works.value[index] = updatedWork
      }
      showRejectModalFlag.value = false
      alert('Karya berhasil ditolak dengan feedback')
    }
  } catch (error) {
    console.error('Error rejecting work:', error)
    alert('Terjadi kesalahan')
  }
}

const changeStatus = (work) => {
  // Logic to change status of already reviewed work
  const newStatus = work.status === 'approved' ? 'rejected' : 'approved'
  reviewWork(work, newStatus)
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:3000/api/panitia/works', {
      credentials: "include",
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (response.ok) {
      works.value = await response.json()
    }
  } catch (error) {
    console.error('Error loading works:', error)
  }
})
</script>
