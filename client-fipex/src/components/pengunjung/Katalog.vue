<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">Digital Exhibition</h1>
          </div>
          <nav class="flex space-x-8">
            <router-link to="/pengunjung" class="text-gray-500 hover:text-gray-700">Beranda</router-link>
            <router-link to="/pengunjung/katalog" class="text-blue-600 font-medium">Katalog</router-link>
            <router-link v-if="authStore.isAuthenticated() && authStore.user?.role === 'pengunjung'" to="/pengunjung/favorit" class="text-gray-500 hover:text-gray-700">Favorit</router-link>
            <div v-if="authStore.isAuthenticated()" class="flex items-center space-x-4">
              <span class="text-sm text-gray-600">Halo, {{ authStore.user?.name }}</span>
              <button @click="logout" class="text-gray-500 hover:text-gray-700">Logout</button>
            </div>
            <div v-else class="flex space-x-4">
              <router-link to="/login" class="text-gray-500 hover:text-gray-700">Login</router-link>
              <router-link to="/register" class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Daftar</router-link>
            </div>
          </nav>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Katalog Karya</h1>
        
        <!-- Voting reminder for non-pengunjung -->
        <div v-if="!authStore.isAuthenticated()" class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            <div>
              <p class="text-blue-800 font-medium">Ingin memberikan vote dan komentar?</p>
              <p class="text-blue-700 text-sm">
                <router-link to="/register" class="underline">Daftar</router-link> atau 
                <router-link to="/login" class="underline">login</router-link> sebagai pengunjung untuk dapat berinteraksi dengan karya.
              </p>
            </div>
          </div>
        </div>
        
        <!-- Role reminder for non-pengunjung users -->
        <div v-else-if="authStore.user?.role !== 'pengunjung'" class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <div>
              <p class="text-yellow-800 font-medium">Informasi</p>
              <p class="text-yellow-700 text-sm">
                Anda login sebagai {{ authStore.user?.role }}. Hanya pengunjung yang dapat memberikan vote dan komentar.
              </p>
            </div>
          </div>
        </div>
        
        <!-- Filters -->
        <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Search -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Pencarian</label>
              <input 
                v-model="filters.search"
                @input="applyFilters"
                type="text" 
                placeholder="Cari karya..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
            </div>
            
            <!-- Category -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <select 
                v-model="filters.category"
                @change="applyFilters"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Semua</option>
                <option value="Aplikasi Mobile">Aplikasi Mobile</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Web Development">Web Development</option>
                <option value="Business Plan">Business Plan</option>
                <option value="Data Science">Data Science</option>
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
                <option value="popular">Terpopuler</option>
                <option value="votes">Most Voted</option>
              </select>
            </div>
            
            <!-- Results count -->
            <div class="flex items-end">
              <div class="text-sm text-gray-600">
                {{ filteredWorks.length }} karya ditemukan
              </div>
            </div>
          </div>
        </div>
        
        <!-- Works Grid -->
        <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="bg-white border border-gray-200 rounded-lg shadow-sm animate-pulse">
            <div class="h-48 bg-gray-200 rounded-t-lg"></div>
            <div class="p-4">
              <div class="h-4 bg-gray-200 rounded mb-2"></div>
              <div class="h-6 bg-gray-200 rounded mb-2"></div>
              <div class="h-3 bg-gray-200 rounded mb-3"></div>
              <div class="h-3 bg-gray-200 rounded mb-3"></div>
              <div class="flex justify-between">
                <div class="h-4 bg-gray-200 rounded w-16"></div>
                <div class="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else-if="paginatedWorks.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="work in paginatedWorks" 
            :key="work.id"
            class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div class="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
              <img 
                v-if="work.thumbnail"
                :src="getImageUrl(work.thumbnail)" 
                :alt="work.title"
                class="w-full h-full object-cover"
                @error="onImageError"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                No Image
              </div>
            </div>
            <div class="p-4">
              <div class="text-sm text-blue-600 mb-1">{{ work.category }}</div>
              <h3 class="font-semibold text-gray-900 mb-2">{{ work.title }}</h3>
              <p class="text-gray-600 text-sm mb-3 line-clamp-2">{{ work.description }}</p>
              <div class="text-sm text-gray-500 mb-3">{{ work.author?.name || work.author }}</div>
              <div class="flex items-center justify-between">
                <div class="text-sm font-medium">{{ work.votes || 0 }} votes</div>
                <div class="flex space-x-2">
                  <button 
                    @click="viewDetail(work.id)"
                    class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Lihat Detail
                  </button>
                  
                  <!-- Vote button - Only for pengunjung -->
                  <button 
                    v-if="authStore.isAuthenticated() && authStore.user?.role === 'pengunjung'"
                    @click="vote(work)"
                    :disabled="work.hasVoted || work.isVoting"
                    :class="work.hasVoted ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'"
                    class="px-3 py-1 text-white text-sm rounded transition-colors"
                  >
                    {{ work.isVoting ? '...' : (work.hasVoted ? '✓' : '👍') }}
                  </button>
                  
                  <!-- Login prompt for non-pengunjung -->
                  <router-link 
                    v-else-if="!authStore.isAuthenticated()"
                    to="/login"
                    class="px-3 py-1 bg-gray-400 text-white text-sm rounded"
                    title="Login sebagai pengunjung untuk vote"
                  >
                    Vote
                  </router-link>
                  
                  <!-- Disabled for non-pengunjung users -->
                  <span 
                    v-else
                    class="px-3 py-1 bg-gray-300 text-gray-500 text-sm rounded cursor-not-allowed"
                    title="Hanya pengunjung yang dapat vote"
                  >
                    Vote
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <div class="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Tidak ada karya ditemukan</h3>
          <p class="text-gray-600 mb-4">Coba ubah filter pencarian Anda</p>
          <button 
            @click="clearFilters"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Reset Filter
          </button>
        </div>
        
        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center mt-8">
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const filters = ref({
  search: route.query.search || '',
  category: route.query.category || '',
  sort: 'newest'
})

const currentPage = ref(1)
const itemsPerPage = 9
const isLoading = ref(true)

const allWorks = ref([])

const getImageUrl = (thumbnail) => {
  if (thumbnail && thumbnail.startsWith('http')) {
    return thumbnail
  }
  return `http://localhost:3000${thumbnail}`
}

const onImageError = (event) => {
  event.target.style.display = 'none'
}

const filteredWorks = computed(() => {
  let works = [...allWorks.value]
  
  // Filter by search
  if (filters.value.search) {
    works = works.filter(work => 
      work.title.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      work.description.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      (work.author?.name || work.author || '').toLowerCase().includes(filters.value.search.toLowerCase())
    )
  }
  
  // Filter by category
  if (filters.value.category) {
    works = works.filter(work => work.category === filters.value.category)
  }
  
  // Sort
  if (filters.value.sort === 'oldest') {
    works.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  } else if (filters.value.sort === 'votes') {
    works.sort((a, b) => (b.votes || 0) - (a.votes || 0))
  } else if (filters.value.sort === 'popular') {
    works.sort((a, b) => (b.votes || 0) - (a.votes || 0))
  } else {
    works.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
  
  return works
})

const totalPages = computed(() => {
  return Math.ceil(filteredWorks.value.length / itemsPerPage)
})

const paginatedWorks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredWorks.value.slice(start, end)
})

const applyFilters = () => {
  currentPage.value = 1
}

const clearFilters = () => {
  filters.value = {
    search: '',
    category: '',
    sort: 'newest'
  }
  currentPage.value = 1
}

const viewDetail = (id) => {
  router.push(`/pengunjung/detail/${id}`)
}

const vote = async (work) => {
  if (!authStore.isAuthenticated() || authStore.user?.role !== 'pengunjung') {
    router.push('/login')
    return
  }

  if (work.hasVoted || work.isVoting) return

  work.isVoting = true
  
  try {
    const response = await fetch(`http://localhost:3000/api/public/works/${work.id}/vote`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      work.votes = (work.votes || 0) + 1
      work.hasVoted = true
    } else {
      const error = await response.json()
      alert(error.message || 'Gagal memberikan vote')
    }
  } catch (error) {
    console.error('Error voting:', error)
    alert('Terjadi kesalahan saat memberikan vote')
  } finally {
    work.isVoting = false
  }
}

const checkUserVotes = async () => {
  if (!authStore.isAuthenticated() || authStore.user?.role !== 'pengunjung') {
    return
  }

  try {
    const response = await fetch('http://localhost:3000/api/public/user-votes', {
      credentials: 'include'
    })
    
    if (response.ok) {
      const result = await response.json()
      const userVotes = result.data.votes || []
      
      // Mark works as voted
      allWorks.value.forEach(work => {
        work.hasVoted = userVotes.includes(work.id)
      })
    }
  } catch (error) {
    console.error('Error checking user votes:', error)
  }
}

const loadWorks = async () => {
  isLoading.value = true
  
  try {
    const response = await fetch('http://localhost:3000/api/public/works')
    
    if (response.ok) {
      const result = await response.json()
      allWorks.value = result.data.works || []
      
      // Check user votes
      await checkUserVotes()
    }
  } catch (error) {
    console.error('Error loading works:', error)
  } finally {
    isLoading.value = false
  }
}

const logout = () => {
  authStore.logout()
  router.push('/pengunjung')
}

// Watch for auth changes to update vote status
watch(() => authStore.user, async () => {
  if (authStore.isAuthenticated() && authStore.user?.role === 'pengunjung') {
    await checkUserVotes()
  }
}, { deep: true })

onMounted(() => {
  loadWorks()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>