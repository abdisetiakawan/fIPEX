<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <button @click="$router.go(-1)" class="mr-4 text-gray-500 hover:text-gray-700">
              ← Kembali
            </button>
            <h1 class="text-xl font-bold text-gray-900">Digital Exhibition</h1>
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" v-if="work">
      <!-- Work Preview -->
      <div class="bg-white rounded-lg shadow-sm mb-8">
        <div class="h-64 bg-gray-200 rounded-t-lg"></div>
        <div class="p-6">
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="text-sm text-blue-600 mb-2">{{ work.category }}</div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ work.title }}</h1>
              <div class="flex items-center space-x-4 text-sm text-gray-500">
                <span>{{ work.author }}</span>
                <span>{{ work.program }}</span>
              </div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-600">{{ work.votes }}</div>
              <div class="text-sm text-gray-500">Total Votes</div>
              <button 
                @click="vote"
                :disabled="work.hasVoted"
                :class="work.hasVoted ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'"
                class="mt-2 px-4 py-2 text-white text-sm rounded"
              >
                {{ work.hasVoted ? 'Voted' : 'Vote Karya Ini' }}
              </button>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex space-x-4 mb-6">
            <button 
              @click="toggleFavorite"
              :class="work.isFavorite ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'"
              class="flex items-center px-4 py-2 text-white text-sm rounded"
            >
              ♥ {{ work.isFavorite ? 'Hapus dari Favorit' : 'Tambah ke Favorit' }}
            </button>
            <button class="flex items-center px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700">
              📤 Bagikan
            </button>
          </div>
          
          <!-- Description -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-3">Deskripsi</h3>
            <p class="text-gray-700 leading-relaxed">{{ work.description }}</p>
          </div>
          
          <!-- Links -->
          <div class="mb-6" v-if="work.links">
            <h3 class="text-lg font-semibold mb-3">Links</h3>
            <div class="space-y-2">
              <a v-if="work.links.demo" :href="work.links.demo" target="_blank" class="block text-blue-600 hover:underline">
                🎥 Demo Video - YouTube
              </a>
              <a v-if="work.links.github" :href="work.links.github" target="_blank" class="block text-blue-600 hover:underline">
                💻 GitHub - Source Code
              </a>
              <a v-if="work.links.live" :href="work.links.live" target="_blank" class="block text-blue-600 hover:underline">
                🌐 Live Demo
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Comments Section -->
      <div class="bg-white rounded-lg shadow-sm">
        <div class="p-6">
          <h3 class="text-lg font-semibold mb-4">Komentar ({{ comments.length }})</h3>
          
          <!-- Comment Form -->
          <div class="mb-6">
            <textarea 
              v-model="newComment"
              placeholder="Tulis komentar..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows="3"
            ></textarea>
            <button 
              @click="submitComment"
              :disabled="!newComment.trim()"
              class="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Kirim
            </button>
          </div>
          
          <!-- Comments List -->
          <div class="space-y-4">
            <div v-for="comment in comments" :key="comment.id" class="flex space-x-3">
              <div class="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-1">
                  <span class="font-medium text-sm">{{ comment.author }}</span>
                  <span class="text-xs text-gray-500">{{ comment.timeAgo }}</span>
                </div>
                <p class="text-gray-700 text-sm">{{ comment.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const workId = route.params.id

const work = ref(null)
const newComment = ref('')
const comments = ref([
  {
    id: 1,
    author: 'User 1',
    content: 'Aplikasi yang sangat inovatif! UI/UX nya juga sangat user-friendly.',
    timeAgo: '1 jam lalu'
  },
  {
    id: 2,
    author: 'User 2',
    content: 'Konsep yang menarik, implementasinya juga bagus.',
    timeAgo: '2 jam lalu'
  },
  {
    id: 3,
    author: 'User 3',
    content: 'Semoga bisa dikembangkan lebih lanjut!',
    timeAgo: '3 jam lalu'
  }
])

const vote = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/public/vote/${workId}`, {
      credentials: "include",
      method: 'POST'
      
    })
    
    if (response.ok) {
      work.value.votes++
      work.value.hasVoted = true
    }
  } catch (error) {
    console.error('Error voting:', error)
  }
}

const toggleFavorite = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/public/favorite/${workId}`, {
      method: 'POST'
    })
    
    if (response.ok) {
      work.value.isFavorite = !work.value.isFavorite
    }
  } catch (error) {
    console.error('Error toggling favorite:', error)
  }
}

const submitComment = async () => {
  if (!newComment.value.trim()) return
  
  try {
    const response = await fetch(`http://localhost:3000/api/public/comment/${workId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: newComment.value
      })
    })
    
    if (response.ok) {
      const comment = await response.json()
      comments.value.unshift({
        id: Date.now(),
        author: 'Anonymous',
        content: newComment.value,
        timeAgo: 'Baru saja'
      })
      newComment.value = ''
    }
  } catch (error) {
    console.error('Error submitting comment:', error)
  }
}

onMounted(async () => {
  // Load work details
  work.value = {
    id: parseInt(workId),
    title: 'EcoTracker - Green Living App',
    description: 'EcoTracker adalah aplikasi mobile yang dirancang untuk membantu individu dalam menjalani gaya hidup yang lebih berkelanjutan. Aplikasi ini menggunakan teknologi machine learning untuk menghitung jejak karbon berdasarkan aktivitas harian pengguna. Fitur utama meliputi carbon footprint calculator, daily challenges, community features, dan reward system.',
    author: 'Sarah Chen',
    program: 'Teknik Informatika Angkatan 2022',
    category: 'Aplikasi Mobile React Native',
    votes: 127,
    hasVoted: false,
    isFavorite: false,
    links: {
      demo: 'https://youtube.com/watch?v=demo',
      github: 'https://github.com/user/repo',
      live: 'https://demo.app.com'
    }
  }
})
</script>
