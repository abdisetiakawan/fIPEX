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
            <router-link to="/pengunjung/katalog" class="text-gray-500 hover:text-gray-700">Katalog</router-link>
            <router-link to="/pengunjung/favorit" class="text-blue-600 font-medium">Favorit</router-link>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-600">Halo, {{ authStore.user?.name }}</span>
              <button @click="logout" class="text-gray-500 hover:text-gray-700">Logout</button>
            </div>
          </nav>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Karya Favorit Saya</h1>
        <p class="text-gray-600">{{ favoriteWorks.length }} karya yang telah Anda simpan</p>
      </div>
      
      <!-- Filters -->
      <div class="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div class="flex space-x-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Filter:</label>
            <select 
              v-model="filters.category"
              @change="applyFilters"
              class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Kategori</option>
              <option value="Aplikasi Mobile">Aplikasi Mobile</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Web Development">Web Development</option>
              <option value="Business Plan">Business Plan</option>
              <option value="Data Science">Data Science</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
            <select 
              v-model="filters.status"
              @change="applyFilters"
              class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="voted">Sudah Vote</option>
              <option value="not-voted">Belum Vote</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- Loading State -->
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
      
      <!-- Favorite Works -->
      <div v-else-if="filteredFavorites.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="work in filteredFavorites" 
          :key="work.id"
          class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow relative"
        >
          <!-- Voted Badge -->
          <div v-if="work.hasVoted" class="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded z-10">
            ✓ Voted
          </div>
          
          <!-- Remove from favorites -->
          <button 
            @click="removeFavorite(work.id)"
            :disabled="work.isRemoving"
            class="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full text-xs hover:bg-red-700 z-10 disabled:opacity-50"
          >
            {{ work.isRemoving ? '...' : '×' }}
          </button>
          
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
            <div class="text-sm text-gray-500 mb-3">{{ work.votes || 0 }} votes</div>
            <div class="flex items-center justify-between">
              <div class="text-xs text-gray-400">Ditambahkan {{ formatDate(work.addedToFavorites) }}</div>
              <div class="flex space-x-2">
                <button 
                  @click="viewDetail(work.id)"
                  class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Lihat Detail
                </button>
                <button 
                  v-if="!work.hasVoted"
                  @click="vote(work)"
                  :disabled="work.isVoting"
                  class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {{ work.isVoting ? '...' : 'Vote' }}
                </button>
                <span v-else class="px-3 py-1 bg-gray-400 text-white text-sm rounded">
                  ✓ Voted
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <div class="text-gray-400 text-6xl mb-4">♥</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ favoriteWorks.length === 0 ? 'Belum ada karya favorit' : 'Tidak ada karya yang sesuai filter' }}
        </h3>
        <p class="text-gray-600 mb-4">
          {{ favoriteWorks.length === 0 ? 'Mulai jelajahi katalog dan tambahkan karya ke favorit Anda' : 'Coba ubah filter untuk melihat karya favorit lainnya' }}
        </p>
        <router-link 
          v-if="favoriteWorks.length === 0"
          to="/pengunjung/katalog"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Jelajahi Katalog
        </router-link>
        <button 
          v-else
          @click="clearFilters"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Reset Filter
        </button>
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

const filters = ref({
  category: '',
  status: ''
})

const favoriteWorks = ref([])
const isLoading = ref(true)

const getImageUrl = (thumbnail) => {
  if (thumbnail && thumbnail.startsWith('http')) {
    return thumbnail
  }
  return `http://localhost:3000${thumbnail}`
}

const onImageError = (event) => {
  event.target.style.display = 'none'
}

const formatDate = (dateInput) => {
  if (dateInput && typeof dateInput === 'object' && dateInput._seconds) {
    const date = new Date(dateInput._seconds * 1000)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short'
    })
  }
  
  if (dateInput) {
    return new Date(dateInput).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short'
    })
  }
  
  return 'Unknown'
}

const filteredFavorites = computed(() => {
  let works = [...favoriteWorks.value]
  
  if (filters.value.category) {
    works = works.filter(work => work.category === filters.value.category)
  }
  
  if (filters.value.status === 'voted') {
    works = works.filter(work => work.hasVoted)
  } else if (filters.value.status === 'not-voted') {
    works = works.filter(work => !work.hasVoted)
  }
  
  return works
})

const applyFilters = () => {
  // Filters are reactive, no additional action needed
}

const clearFilters = () => {
  filters.value = {
    category: '',
    status: ''
  }
}

const viewDetail = (id) => {
  router.push(`/pengunjung/detail/${id}`)
}

const vote = async (work) => {
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

const removeFavorite = async (workId) => {
  const work = favoriteWorks.value.find(w => w.id === workId)
  if (!work || work.isRemoving) return

  work.isRemoving = true

  try {
    const response = await fetch(`http://localhost:3000/api/public/works/${workId}/favorite`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      favoriteWorks.value = favoriteWorks.value.filter(work => work.id !== workId)
    } else {
      const error = await response.json()
      alert(error.message || 'Gagal menghapus dari favorit')
    }
  } catch (error) {
    console.error('Error removing favorite:', error)
    alert('Terjadi kesalahan saat menghapus dari favorit')
  } finally {
    work.isRemoving = false
  }
}

const checkUserVotes = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/public/user-votes', {
      credentials: 'include'
    })
    
    if (response.ok) {
      const result = await response.json()
      const userVotes = result.data.votes || []
      
      // Mark works as voted
      favoriteWorks.value.forEach(work => {
        work.hasVoted = userVotes.includes(work.id)
      })
    }
  } catch (error) {
    console.error('Error checking user votes:', error)
  }
}

const loadFavorites = async () => {
  isLoading.value = true
  
  try {
    const response = await fetch('http://localhost:3000/api/public/favorites', {
      credentials: 'include'
    })
    
    if (response.ok) {
      const result = await response.json()
      favoriteWorks.value = result.data.works || []
      
      // Check user votes
      await checkUserVotes()
    }
  } catch (error) {
    console.error('Error loading favorites:', error)
  } finally {
    isLoading.value = false
  }
}

const logout = () => {
  authStore.logout()
  router.push('/pengunjung')
}

onMounted(() => {
  // Check if user is pengunjung
  if (!authStore.isAuthenticated() || authStore.user?.role !== 'pengunjung') {
    router.push('/login')
    return
  }
  
  loadFavorites()
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