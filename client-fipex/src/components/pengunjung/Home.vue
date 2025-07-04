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
            <router-link to="/pengunjung/favorit" class="text-gray-500 hover:text-gray-700">Favorit</router-link>
            <button @click="goToLogin" class="text-gray-500 hover:text-gray-700">Login</button>
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
            Jelajahi karya-karya inovatif mahasiswa
          </p>
          
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
            <div class="text-3xl font-bold text-orange-600">{{ stats.totalKategori }}</div>
            <div class="text-gray-600">Kategori</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Featured Works -->
    <div class="bg-white py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900">Karya Terpopuler</h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="work in featuredWorks" 
            :key="work.id"
            class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div class="h-48 bg-gray-200 rounded-t-lg"></div>
            <div class="p-4">
              <div class="text-sm text-blue-600 mb-1">{{ work.category }}</div>
              <h3 class="font-semibold text-gray-900 mb-2">{{ work.title }}</h3>
              <p class="text-gray-600 text-sm mb-3">{{ work.description }}</p>
              <div class="flex items-center justify-between">
                <div class="text-sm text-gray-500">{{ work.author }}</div>
                <div class="flex items-center space-x-2">
                  <span class="text-sm font-medium">{{ work.votes }} votes</span>
                  <button 
                    @click="viewDetail(work.id)"
                    class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Lihat Detail
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="text-center mt-8">
          <router-link 
            to="/pengunjung/katalog"
            class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Lihat Semua Karya
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const searchQuery = ref('')
const stats = ref({
  totalKarya: 156,
  totalVote: 2847,
  totalMahasiswa: 89,
  totalKategori: 12
})

const featuredWorks = ref([
  {
    id: 1,
    title: 'EcoTracker - Green Living App',
    description: 'Aplikasi mobile untuk tracking jejak karbon',
    author: 'Sarah Chen',
    category: 'Aplikasi Mobile',
    votes: 127
  },
  {
    id: 2,
    title: 'Smart IoT Dashboard',
    description: 'Dashboard monitoring IoT devices',
    author: 'John Doe',
    category: 'Web Development',
    votes: 89
  },
  {
    id: 3,
    title: 'UI/UX Portfolio',
    description: 'Portfolio design modern dan interaktif',
    author: 'Jane Smith',
    category: 'UI/UX Design',
    votes: 76
  }
])

const searchWorks = () => {
  router.push(`/pengunjung/katalog?search=${searchQuery.value}`)
}

const viewDetail = (id) => {
  router.push(`/pengunjung/detail/${id}`)
}

const goToLogin = () => {
  router.push('/login')
}

onMounted(async () => {
  // Load stats and featured works
  try {
    const response = await fetch('http://localhost:3000/api/public/stats')
    if (response.ok) {
      const data = await response.json()
      stats.value = data
    }
  } catch (error) {
    console.error('Error loading stats:', error)
  }
})
</script>
