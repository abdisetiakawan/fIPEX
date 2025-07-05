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
          <nav class="flex space-x-8">
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

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" v-if="work">
      <!-- Work Preview -->
      <div class="bg-white rounded-lg shadow-sm mb-8">
        <div v-if="work.thumbnail" class="h-64 bg-gray-200 rounded-t-lg overflow-hidden">
          <img 
            :src="getImageUrl(work.thumbnail)" 
            :alt="work.title"
            class="w-full h-full object-cover"
            @error="onImageError"
          />
        </div>
        <div v-else class="h-64 bg-gray-200 rounded-t-lg flex items-center justify-center">
          <span class="text-gray-400">No Image</span>
        </div>
        
        <div class="p-6">
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="text-sm text-blue-600 mb-2">{{ work.category }}</div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ work.title }}</h1>
              <div class="flex items-center space-x-4 text-sm text-gray-500">
                <span>{{ work.author }}</span>
                <span v-if="work.program">{{ work.program }}</span>
                <span v-if="work.angkatan">Angkatan {{ work.angkatan }}</span>
              </div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-600">{{ work.votes || 0 }}</div>
              <div class="text-sm text-gray-500">Total Votes</div>
              
              <!-- Voting Button - Only for Pengunjung -->
              <div v-if="authStore.isAuthenticated() && authStore.user?.role === 'pengunjung'">
                <button 
                  @click="vote"
                  :disabled="work.hasVoted || isVoting"
                  :class="work.hasVoted ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'"
                  class="mt-2 px-4 py-2 text-white text-sm rounded transition-colors"
                >
                  {{ isVoting ? 'Voting...' : (work.hasVoted ? '✓ Voted' : '👍 Vote Karya Ini') }}
                </button>
              </div>
              
              <!-- Login prompt for non-pengunjung -->
              <div v-else-if="authStore.isAuthenticated() && authStore.user?.role !== 'pengunjung'" class="mt-2">
                <div class="px-4 py-2 bg-yellow-100 text-yellow-800 text-sm rounded">
                  Hanya pengunjung yang dapat vote
                </div>
              </div>
              
              <!-- Login prompt for unauthenticated -->
              <div v-else class="mt-2">
                <router-link 
                  to="/login"
                  class="block px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Login sebagai Pengunjung untuk Vote
                </router-link>
              </div>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex space-x-4 mb-6">
            <button 
              v-if="authStore.isAuthenticated() && authStore.user?.role === 'pengunjung'"
              @click="toggleFavorite"
              :disabled="isFavoriting"
              :class="work.isFavorite ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'"
              class="flex items-center px-4 py-2 text-white text-sm rounded transition-colors"
            >
              {{ isFavoriting ? 'Loading...' : (work.isFavorite ? '♥ Hapus dari Favorit' : '♡ Tambah ke Favorit') }}
            </button>
            
            <button 
              @click="shareWork"
              class="flex items-center px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              📤 Bagikan
            </button>
          </div>
          
          <!-- Description -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-3">Deskripsi</h3>
            <p class="text-gray-700 leading-relaxed">{{ work.description }}</p>
          </div>
          
          <!-- Technologies -->
          <div v-if="work.technologies && work.technologies.length > 0" class="mb-6">
            <h3 class="text-lg font-semibold mb-3">Teknologi yang Digunakan</h3>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="tech in work.technologies" 
                :key="tech"
                class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {{ tech }}
              </span>
            </div>
          </div>
          
          <!-- Tools -->
          <div v-if="work.tools && work.tools.length > 0" class="mb-6">
            <h3 class="text-lg font-semibold mb-3">Tools yang Digunakan</h3>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="tool in work.tools" 
                :key="tool"
                class="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
              >
                {{ tool }}
              </span>
            </div>
          </div>
          
          <!-- Links -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold mb-3">Links</h3>
            <div class="grid grid-cols-2 gap-4">
              <a v-if="work.githubUrl" :href="work.githubUrl" target="_blank" 
                 class="flex items-center px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd" />
                </svg>
                GitHub
              </a>
              
              <a v-if="work.liveUrl" :href="work.liveUrl" target="_blank" 
                 class="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Live Demo
              </a>
              
              <a v-if="work.figmaUrl" :href="work.figmaUrl" target="_blank" 
                 class="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.354-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.015-4.49-4.491S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117v-6.038H8.148z" />
                </svg>
                Figma
              </a>
              
              <a v-if="work.videoUrl" :href="work.videoUrl" target="_blank" 
                 class="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                Video Demo
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Comments Section -->
      <div class="bg-white rounded-lg shadow-sm">
        <div class="p-6">
          <h3 class="text-lg font-semibold mb-4">Komentar ({{ comments.length }})</h3>
          
          <!-- Comment Form - Only for Pengunjung -->
          <div v-if="authStore.isAuthenticated() && authStore.user?.role === 'pengunjung'" class="mb-6">
            <textarea 
              v-model="newComment"
              placeholder="Tulis komentar..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows="3"
            ></textarea>
            <button 
              @click="submitComment"
              :disabled="!newComment.trim() || isSubmittingComment"
              class="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {{ isSubmittingComment ? 'Mengirim...' : 'Kirim Komentar' }}
            </button>
          </div>
          
          <!-- Login prompt for non-pengunjung -->
          <div v-else-if="authStore.isAuthenticated() && authStore.user?.role !== 'pengunjung'" class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p class="text-yellow-800 text-center">
              Hanya pengunjung yang dapat memberikan komentar
            </p>
          </div>
          
          <!-- Login prompt for unauthenticated -->
          <div v-else class="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p class="text-gray-600 text-center">
              <router-link to="/login" class="text-blue-600 hover:underline">Login sebagai Pengunjung</router-link> 
              untuk dapat memberikan komentar
            </p>
          </div>
          
          <!-- Comments List -->
          <div v-if="comments.length > 0" class="space-y-4">
            <div v-for="comment in comments" :key="comment.id" class="flex space-x-3 p-4 bg-gray-50 rounded-lg">
              <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                {{ comment.user?.name?.charAt(0) || 'A' }}
              </div>
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-1">
                  <span class="font-medium text-sm">{{ comment.user?.name || 'Anonymous' }}</span>
                  <span class="text-xs text-gray-500">{{ formatDate(comment.createdAt) }}</span>
                  <span v-if="comment.user?.role === 'pengunjung'" class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    Pengunjung
                  </span>
                </div>
                <p class="text-gray-700 text-sm">{{ comment.content }}</p>
              </div>
            </div>
          </div>
          
          <!-- Empty Comments State -->
          <div v-else class="text-center py-8 text-gray-500">
            <div class="text-4xl mb-2">💬</div>
            <p>Belum ada komentar. Jadilah yang pertama!</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-else-if="isLoading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Memuat karya...</p>
      </div>
    </div>
    
    <!-- Error State -->
    <div v-else class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="text-6xl mb-4">❌</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Karya tidak ditemukan</h3>
        <p class="text-gray-600 mb-4">Karya yang Anda cari tidak dapat ditemukan</p>
        <router-link 
          to="/pengunjung/katalog"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Kembali ke Katalog
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const workId = route.params.id

const work = ref(null)
const comments = ref([])
const newComment = ref('')
const isLoading = ref(true)
const isVoting = ref(false)
const isFavoriting = ref(false)
const isSubmittingComment = ref(false)

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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  if (dateInput) {
    return new Date(dateInput).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  return 'Unknown date'
}

const vote = async () => {
  if (!authStore.isAuthenticated() || authStore.user?.role !== 'pengunjung') {
    router.push('/login')
    return
  }

  if (work.value.hasVoted || isVoting.value) return

  isVoting.value = true
  
  try {
    const response = await fetch(`http://localhost:3000/api/public/works/${workId}/vote`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      work.value.votes = (work.value.votes || 0) + 1
      work.value.hasVoted = true
      
      // Show success message
      alert('Vote berhasil diberikan!')
    } else {
      const error = await response.json()
      alert(error.message || 'Gagal memberikan vote')
    }
  } catch (error) {
    console.error('Error voting:', error)
    alert('Terjadi kesalahan saat memberikan vote')
  } finally {
    isVoting.value = false
  }
}

const toggleFavorite = async () => {
  if (!authStore.isAuthenticated() || authStore.user?.role !== 'pengunjung') {
    router.push('/login')
    return
  }

  if (isFavoriting.value) return

  isFavoriting.value = true

  try {
    const response = await fetch(`http://localhost:3000/api/public/works/${workId}/favorite`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      work.value.isFavorite = !work.value.isFavorite
    }
  } catch (error) {
    console.error('Error toggling favorite:', error)
  } finally {
    isFavoriting.value = false
  }
}

const shareWork = () => {
  if (navigator.share) {
    navigator.share({
      title: work.value.title,
      text: work.value.description,
      url: window.location.href
    })
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(window.location.href)
    alert('Link berhasil disalin ke clipboard!')
  }
}

const submitComment = async () => {
  if (!newComment.value.trim() || !authStore.isAuthenticated() || authStore.user?.role !== 'pengunjung') {
    return
  }
  
  if (isSubmittingComment.value) return

  isSubmittingComment.value = true
  
  try {
    const response = await fetch(`http://localhost:3000/api/public/works/${workId}/comments`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: newComment.value.trim()
      })
    })
    
    if (response.ok) {
      const result = await response.json()
      
      // Add new comment to the beginning of the list
      comments.value.unshift({
        id: result.data.comment.id,
        content: newComment.value.trim(),
        createdAt: new Date(),
        user: {
          id: authStore.user.uid,
          name: authStore.user.name,
          role: authStore.user.role
        }
      })
      
      newComment.value = ''
      alert('Komentar berhasil ditambahkan!')
    } else {
      const error = await response.json()
      alert(error.message || 'Gagal menambahkan komentar')
    }
  } catch (error) {
    console.error('Error submitting comment:', error)
    alert('Terjadi kesalahan saat menambahkan komentar')
  } finally {
    isSubmittingComment.value = false
  }
}

const loadComments = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/public/works/${workId}/comments`)
    
    if (response.ok) {
      const result = await response.json()
      comments.value = result.data.comments || []
    }
  } catch (error) {
    console.error('Error loading comments:', error)
  }
}

const checkUserVote = async () => {
  if (!authStore.isAuthenticated() || authStore.user?.role !== 'pengunjung') {
    return
  }

  try {
    const response = await fetch(`http://localhost:3000/api/public/works/${workId}/vote-status`, {
      credentials: 'include'
    })
    
    if (response.ok) {
      const result = await response.json()
      work.value.hasVoted = result.data.hasVoted
    }
  } catch (error) {
    console.error('Error checking vote status:', error)
  }
}

const logout = () => {
  authStore.logout()
  router.push('/pengunjung')
}

onMounted(async () => {
  isLoading.value = true
  
  try {
    // Load work details
    const response = await fetch(`http://localhost:3000/api/public/works/${workId}`)
    
    if (response.ok) {
      const result = await response.json()
      work.value = result.data.work
      
      // Load comments
      await loadComments()
      
      // Check if user has voted
      await checkUserVote()
    } else {
      work.value = null
    }
  } catch (error) {
    console.error('Error loading work:', error)
    work.value = null
  } finally {
    isLoading.value = false
  }
})
</script>