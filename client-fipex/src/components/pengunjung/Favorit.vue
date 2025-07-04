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
              class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Kategori</option>
              <option value="Aplikasi Mobile">Aplikasi Mobile</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Web Development">Web Development</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
            <select 
              v-model="filters.status"
              class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="voted">Sudah Vote</option>
              <option value="not-voted">Belum Vote</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- Favorite Works -->
      <div v-if="filteredFavorites.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="work in filteredFavorites" 
          :key="work.id"
          class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow relative"
        >
          <!-- Voted Badge -->
          <div v-if="work.hasVoted" class="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
            ✓ Voted
          </div>
          
          <!-- Remove from favorites -->
          <button 
            @click="removeFavorite(work.id)"
            class="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full text-xs hover:bg-red-700"
          >
            ×
          </button>
          
          <div class="h-48 bg-gray-200 rounded-t-lg"></div>
          <div class="p-4">
            <div class="text-sm text-blue-600 mb-1">{{ work.category }}</div>
            <h3 class="font-semibold text-gray-900 mb-2">{{ work.title }}</h3>
            <p class="text-gray-600 text-sm mb-3">{{ work.description }}</p>
            <div class="text-sm text-gray-500 mb-3">{{ work.author }}</div>
            <div class="text-sm text-gray-500 mb-3">{{ work.votes }} votes</div>
            <div class="flex items-center justify-between">
              <div class="text-xs text-gray-400">Ditambahkan {{ work.addedDate }}</div>
              <div class="flex space-x-2">
                <button 
                  @click="viewDetail(work.id)"
                  class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Lihat Detail
                </button>
                <button 
                  v-if="!work.hasVoted"
                  @click="vote(work.id)"
                  class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Vote
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
        <h3 class="text-lg font-medium text-gray-900 mb-2">Belum ada karya favorit</h3>
        <p class="text-gray-600 mb-4">Mulai jelajahi katalog dan tambahkan karya ke favorit Anda</p>
        <router-link 
          to="/pengunjung/katalog"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Jelajahi Katalog
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const filters = ref({
  category: '',
  status: ''
})

const favoriteWorks = ref([
  {
    id: 1,
    title: 'EcoTracker - Green Living App',
    description: 'Aplikasi mobile untuk tracking jejak karbon',
    author: 'Sarah Chen',
    category: 'Aplikasi Mobile',
    votes: 127,
    hasVoted: true,
    addedDate: '1 hari lalu'
  },
  {
    id: 2,
    title: 'Smart IoT Dashboard',
    description: 'Dashboard monitoring IoT devices',
    author: 'John Doe',
    category: 'Web Development',
    votes: 89,
    hasVoted: false,
    addedDate: '2 hari lalu'
  },
  {
    id: 3,
    title: 'UI/UX Portfolio',
    description: 'Portfolio design modern dan interaktif',
    author: 'Jane Smith',
    category: 'UI/UX Design',
    votes: 76,
    hasVoted: true,
    addedDate: '3 hari lalu'
  }
])

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

const viewDetail = (id) => {
  router.push(`/pengunjung/detail/${id}`)
}

const vote = async (id) => {
  try {
    const response = await fetch(`http://localhost:3000/api/public/vote/${id}`, {
      method: 'POST'
    })
    
    if (response.ok) {
      const work = favoriteWorks.value.find(w => w.id === id)
      if (work) {
        work.votes++
        work.hasVoted = true
      }
    }
  } catch (error) {
    console.error('Error voting:', error)
  }
}

const removeFavorite = async (id) => {
  try {
    const response = await fetch(`http://localhost:3000/api/public/favorite/${id}`, {
      method: 'DELETE'
    })
    
    if (response.ok) {
      favoriteWorks.value = favoriteWorks.value.filter(work => work.id !== id)
    }
  } catch (error) {
    console.error('Error removing favorite:', error)
  }
}

onMounted(() => {
  // Load favorite works from API
})
</script>
