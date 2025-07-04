<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900">Digital Exhibition</h1>
          </div>
          <nav class="flex items-center space-x-8">
            <router-link to="/mahasiswa" class="text-gray-500 hover:text-gray-700">Dashboard</router-link>
            <router-link to="/mahasiswa/portfolio" class="text-gray-500 hover:text-gray-700">Karya Saya</router-link>
            <router-link to="/mahasiswa/upload" class="text-gray-500 hover:text-gray-700">Upload Karya</router-link>
            <router-link to="/mahasiswa/profile" class="text-blue-600 font-medium">Profil</router-link>
          </nav>
        </div>
      </div>
    </header>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Profil Saya</h1>
        <p class="text-gray-600">Kelola informasi profil dan portfolio Anda</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Profile Form -->
        <div class="lg:col-span-2">
          <form @submit.prevent="updateProfile" class="bg-white rounded-lg shadow p-6 space-y-6">
            <!-- Basic Information -->
            <div>
              <h3 class="text-lg font-semibold mb-4">Informasi Dasar</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <input 
                    v-model="form.name"
                    type="text" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    NIM
                  </label>
                  <input 
                    v-model="form.nim"
                    type="text" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input 
                    v-model="form.email"
                    type="email" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Program Studi
                  </label>
                  <input 
                    v-model="form.program"
                    type="text" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Angkatan
                  </label>
                  <input 
                    v-model="form.angkatan"
                    type="text" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    No. Telepon
                  </label>
                  <input 
                    v-model="form.phone"
                    type="tel" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>
              </div>
              
              <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea 
                  v-model="form.bio"
                  placeholder="Ceritakan tentang diri Anda..."
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
            </div>

            <!-- Profile Photo -->
            <div>
              <h3 class="text-lg font-semibold mb-4">Foto Profil</h3>
              <div class="flex items-center space-x-4">
                <div class="w-20 h-20 bg-gray-300 rounded-full"></div>
                <div>
                  <button 
                    type="button"
                    @click="$refs.photoInput.click()"
                    class="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Upload Foto
                  </button>
                  <p class="text-xs text-gray-500 mt-1">JPG, PNG maksimal 2MB</p>
                  <input 
                    ref="photoInput"
                    type="file" 
                    accept="image/*"
                    @change="handlePhotoUpload"
                    class="hidden"
                  >
                </div>
              </div>
            </div>

            <!-- Social Media & Portfolio -->
            <div>
              <h3 class="text-lg font-semibold mb-4">Social Media & Portfolio</h3>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn
                  </label>
                  <input 
                    v-model="form.linkedin"
                    type="url" 
                    placeholder="https://linkedin.com/in/username"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    GitHub
                  </label>
                  <input 
                    v-model="form.github"
                    type="url" 
                    placeholder="https://github.com/username"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Portfolio Website
                  </label>
                  <input 
                    v-model="form.portfolio"
                    type="url" 
                    placeholder="https://yourportfolio.com"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Behance/Dribbble
                  </label>
                  <input 
                    v-model="form.behance"
                    type="url" 
                    placeholder="https://behance.net/username"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="pt-6 border-t">
              <button 
                type="submit"
                :disabled="loading"
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {{ loading ? 'Menyimpan...' : 'Simpan Perubahan' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Profile Stats & Achievements -->
        <div class="space-y-6">
          <!-- Profile Stats -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="font-semibold mb-4">Statistik Profil</h3>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Total Karya:</span>
                <span class="text-sm font-medium">{{ stats.totalKarya }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Total Vote:</span>
                <span class="text-sm font-medium">{{ stats.totalVote }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Profile Views:</span>
                <span class="text-sm font-medium">{{ stats.profileViews }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Bergabung:</span>
                <span class="text-sm font-medium">{{ stats.joinDate }}</span>
              </div>
            </div>
          </div>

          <!-- Achievements -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="font-semibold mb-4">Pencapaian</h3>
            <div class="space-y-3">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  🏆
                </div>
                <div>
                  <div class="text-sm font-medium">First Upload</div>
                  <div class="text-xs text-gray-500">Upload karya pertama</div>
                </div>
              </div>
              
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  ⭐
                </div>
                <div>
                  <div class="text-sm font-medium">Popular Work</div>
                  <div class="text-xs text-gray-500">Karya mencapai 100+ votes</div>
                </div>
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
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()

const form = ref({
  name: '',
  nim: '',
  email: '',
  program: '',
  angkatan: '',
  phone: '',
  bio: '',
  linkedin: '',
  github: '',
  portfolio: '',
  behance: ''
})

const stats = ref({
  totalKarya: 3,
  totalVote: 245,
  profileViews: 1234,
  joinDate: 'Nov 2024'
})

const loading = ref(false)

const handlePhotoUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Handle photo upload
    console.log('Photo uploaded:', file)
  }
}

const updateProfile = async () => {
  loading.value = true
  
  try {
    // Update profile logic
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    alert('Profil berhasil diperbarui!')
  } catch (error) {
    console.error('Error updating profile:', error)
    alert('Gagal memperbarui profil')
  }
  
  loading.value = false
}

onMounted(() => {
  // Load current user data
  if (authStore.user) {
    form.value = {
      name: authStore.user.name || '',
      nim: authStore.user.nim || '',
      email: authStore.user.email || '',
      program: authStore.user.program || '',
      angkatan: authStore.user.angkatan || '',
      phone: authStore.user.phone || '',
      bio: authStore.user.bio || '',
      linkedin: authStore.user.linkedin || '',
      github: authStore.user.github || '',
      portfolio: authStore.user.portfolio || '',
      behance: authStore.user.behance || ''
    }
  }
})
</script>
