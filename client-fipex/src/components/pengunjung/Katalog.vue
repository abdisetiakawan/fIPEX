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
            <router-link to="/pengunjung/favorit" class="text-gray-500 hover:text-gray-700">Favorit</router-link>
          </nav>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Katalog Karya</h1>
        
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
                <option value="popular">Terpopuler</option>
                <option value="newest">Terbaru</option>
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
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="work in paginatedWorks" 
            :key="work.id"
            class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div class="h-48 bg-gray-200 rounded-t-lg"></div>
            <div class="p-4">
              <div class="text-sm text-blue-600 mb-1">{{ work.category }}</div>
              <h3 class="font-semibold text-gray-900 mb-2">{{ work.title }}</h3>
              <p class="text-gray-600 text-sm mb-3">{{ work.description }}</p>
              <div class="text-sm text-gray-500 mb-3">{{ work.author }}</div>
              <div class="flex items-center justify-between">
                <div class="text-sm font-medium">{{ work.votes }} votes</div>
                <div class="flex space-x-2">
                  <button 
                    @click="viewDetail(work.id)"
                    class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Lihat Detail
                  </button>
                  <button 
                    @click="vote(work.id)"
                    :disabled="work.hasVoted"
                    :class="work.hasVoted ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'"
                    class="px-3 py-1 text-white text-sm rounded"
                  >
                    {{ work.hasVoted ? 'Voted' : 'Vote' }}
                  </button>
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const filters = ref({
  search: route.query.search || '',
  category: '',
  sort: 'popular'
})

const currentPage = ref(1)
const itemsPerPage = 9

const allWorks = ref([
  {
    id: 1,
    title: 'EcoTracker - Green Living App',
    description: 'Aplikasi mobile untuk tracking jejak karbon',
    author: 'Sarah Chen',
    category: 'Aplikasi Mobile',
    votes: 127,
    hasVoted: false,
    createdAt: '2024-11-15'
  },
  {
    id: 2,
    title: 'Smart IoT Dashboard',
    description: 'Dashboard monitoring IoT devices',
    author: 'John Doe',
    category: 'Web Development',
    votes: 89,
    hasVoted: false,
    createdAt: '2024-11-20'
  },
  {
    id: 3,
    title: 'UI/UX Portfolio',
    description: 'Portfolio design modern dan interaktif',
    author: 'Jane Smith',
    category: 'UI/UX Design',
    votes: 76,
    hasVoted: false,
    createdAt: '2024-11-10'
  },
  {
    id: 4,
    title: 'FinTech Mobile App',
    description: 'Aplikasi keuangan digital',
    author: 'Mike Johnson',
    category: 'Aplikasi Mobile',
    votes: 65,
    hasVoted: false,
    createdAt: '2024-11-18'
  },
  {
    id: 5,
    title: 'E-Commerce Platform',
    description: 'Platform jual beli online',
    author: 'Lisa Wong',
    category: 'Web Development',
    votes: 54,
    hasVoted: false,
    createdAt: '2024-11-12'
  },
  {
    id: 6,
    title: 'Business Plan Startup',
    description: 'Rencana bisnis teknologi',
    author: 'David Lee',
    category: 'Business Plan',
    votes: 43,
    hasVoted: false,
    createdAt: '2024-11-16'
  }
])

const filteredWorks = computed(() => {
  let works = [...allWorks.value]
  
  // Filter by search
  if (filters.value.search) {
    works = works.filter(work => 
      work.title.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      work.author.toLowerCase().includes(filters.value.search.toLowerCase())
    )
  }
  
  // Filter by category
  if (filters.value.category) {
    works = works.filter(work => work.category === filters.value.category)
  }
  
  // Sort
  if (filters.value.sort === 'popular') {
    works.sort((a, b) => b.votes - a.votes)
  } else if (filters.value.sort === 'newest') {
    works.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } else if (filters.value.sort === 'votes') {
    works.sort((a, b) => b.votes - a.votes)
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

const viewDetail = (id) => {
  router.push(`/pengunjung/detail/${id}`)
}

const vote = async (id) => {
  try {
    const response = await fetch(`http://localhost:3000/api/public/vote/${id}`, {
      method: 'POST'
    })
    
    if (response.ok) {
      const work = allWorks.value.find(w => w.id === id)
      if (work) {
        work.votes++
        work.hasVoted = true
      }
    }
  } catch (error) {
    console.error('Error voting:', error)
  }
}

onMounted(() => {
  // Load works from API
})
</script>
