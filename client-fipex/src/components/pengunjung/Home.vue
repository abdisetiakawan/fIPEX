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
            <router-link to="/pengunjung" class="text-blue-600 font-medium">Beranda</router-link>
            <router-link to="/pengunjung/katalog" class="text-gray-500 hover:text-gray-700">Katalog</router-link>
            <router-link v-if="authStore.isAuthenticated()" to="/pengunjung/favorit" class="text-gray-500 hover:text-gray-700">Favorit</router-link>
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

    <!-- Hero Section -->
    <div class="bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            Selamat Datang di Pameran Digital
          </h1>
          <p class="text-xl text-gray-600 mb-8">
            Jelajahi karya-karya inovatif mahasiswa dan berikan vote untuk karya favorit Anda
          </p>
          
          <!-- Registration CTA for non-authenticated users -->
          <div v-if="!authStore.isAuthenticated()" class="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p class="text-blue-800 mb-3">
              <strong>Daftar sekarang</strong> untuk dapat memberikan vote pada karya-karya yang Anda sukai!
            </p>
            <router-link 
              to="/register"
              class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Daftar Gratis
            </router-link>
          </div>
          
          <!-- Search Bar -->
          <div class="max-w-md mx-auto">
            <div class="relative">
              <input 
                v-model="searchQuery"
                @keyup.enter="searchWorks"
                type="text" 
                placeholder="Cari karya..."
                class="w-full px-4 py-3 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
              <div class="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics -->
    <div class="bg-gray-50 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="bg-white p-6 rounded-lg shadow text-center">
            <div class="text-3xl font-bold text-blue-600">{{ stats.totalKarya }}</div>
            <div class="text-gray-600">Total Karya</div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow text-center">
            <div class="text-3xl font-bold text-green-600">{{ stats.totalVote }}</div>
            <div class="text-gray-600">Total Vote</div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow text-center">
            <div class="text-3xl font-bold text-purple-600">{{ stats.totalMahasiswa }}</div>
            <div class="text-gray-600">Mahasiswa</div>
          </div>
          <div class="bg-white p-6 rounded-lg shadow text-center">
            <div class="text-3xl font-bold text-orange-600">{{ stats.totalPengunjung }}</div>
            <div class="text-gray-600">Pengunjung Terdaftar</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Featured Works -->
    <div class="bg-white py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900">Karya Terpopuler</h2>
          <p class="text-gray-600 mt-2">Karya dengan vote terbanyak dari pengunjung</p>
        </div>
        
        <!-- Loading State -->
        <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="bg-white border border-gray-200 rounded-lg shadow-sm animate-pulse">
            <div class="h-48 bg-gray-200 rounded-t-lg"></div>
            <div class="p-4">
              <div class="h-4 bg-gray-200 rounded mb-2"></div>
              <div class="h-6 bg-gray-200 rounded mb-2"></div>
              <div class="h-3 bg-gray-200 rounded mb-3"></div>
              <div class="flex justify-between">
                <div class="h-4 bg-gray-200 rounded w-16"></div>
                <div class="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Featured Works Grid -->
        <div v-else-if="featuredWorks.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="work in featuredWorks" 
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
                <div class="flex items-center space-x-4">
                  <span class="text-sm font-medium">{{ work.votes || 0 }} votes</span>
                  <span class="text-sm text-gray-500">{{ work.views || 0 }} views</span>
                </div>
                <div class="flex space-x-2">
                  <button 
                    @click="viewDetail(work.id)"
                    class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Detail
                  </button>
                  
                  <!-- Vote button for authenticated pengunjung -->
                  <button 
                    v-if="authStore.isAuthenticated() && authStore.user?.role === 'pengunjung'"
                    @click="vote(work)"
                    :disabled="work.hasVoted || work.isVoting"
                    :class="work.hasVoted ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'"
                    class="px-3 py-1 text-white text-sm rounded transition-colors"
                  >
                    {{ work.isVoting ? '...' : (work.hasVoted ? '✓' : '👍') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <div class="text-gray-400 text-6xl mb-4">🎨</div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Belum ada karya</h3>
          <p class="text-gray-600">Karya akan muncul setelah disetujui oleh panitia</p>
        </div>
        
        <div v-if="featuredWorks.length > 0" class="text-center mt-8">
          <router-link 
            to="/pengunjung/katalog"
            class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Lihat Semua Karya
          </router-link>
        </div>
      </div>
    </div>

    <!-- Categories Section -->
    <div class="bg-gray-50 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900">Kategori Karya</h2>
          <p class="text-gray-600 mt-2">Jelajahi karya berdasarkan kategori</p>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <router-link 
            v-for="category in categories" 
            :key="category.name"
            :to="`/pengunjung/katalog?category=${encodeURIComponent(category.name)}`"
            class="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
          >
            <div class="text-3xl mb-3">{{ category.icon }}</div>
            <h3 class="font-semibold text-gray-900 mb-1">{{ category.name }}</h3>
            <p class="text-sm text-gray-600">{{ category.count }} karya</p>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const searchQuery = ref('')
const isLoading = ref(true)
const stats = ref({
  totalKarya: 0,
  totalVote: 0,
  totalMahasiswa: 0,
  totalPengunjung: 0
})

const featuredWorks = ref([])
const categories = ref([
  { name: 'Aplikasi Mobile', icon: '📱', count: 0 },
  { name: 'Web Development', icon: '💻', count: 0 },
  { name: 'UI/UX Design', icon: '🎨', count: 0 },
  { name: 'Business Plan', icon: '📊', count: 0 },
  { name: 'Data Science', icon: '📈', count: 0 }
])

const getImageUrl = (thumbnail) => {
  if (thumbnail && thumbnail.startsWith('http')) {
    return thumbnail
  }
  return `http://localhost:3000${thumbnail}`
}

const onImageError = (event) => {
  event.target.style.display = 'none'
}

const searchWorks = () => {
  router.push(`/pengunjung/katalog?search=${searchQuery.value}`)
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
      
      // Update stats
      stats.value.totalVote++
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
      featuredWorks.value.forEach(work => {
        work.hasVoted = userVotes.includes(work.id)
      })
    }
  } catch (error) {
    console.error('Error checking user votes:', error)
  }
}

const loadStats = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/public/stats')
    if (response.ok) {
      const result = await response.json()
      stats.value = result.data
    }
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

const loadFeaturedWorks = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/public/works?limit=6&sort=votes')
    if (response.ok) {
      const result = await response.json()
      featuredWorks.value = result.data.works || []
      
      // Update category counts
      const categoryCounts = {}
      featuredWorks.value.forEach(work => {
        categoryCounts[work.category] = (categoryCounts[work.category] || 0) + 1
      })
      
      categories.value.forEach(category => {
        category.count = categoryCounts[category.name] || 0
      })
      
      // Check user votes
      await checkUserVotes()
    }
  } catch (error) {
    console.error('Error loading featured works:', error)
  }
}

const logout = () => {
  authStore.logout()
  router.push('/pengunjung')
}

onMounted(async () => {
  isLoading.value = true
  
  try {
    await Promise.all([
      loadStats(),
      loadFeaturedWorks()
    ])
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  } finally {
    isLoading.value = false
  }
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