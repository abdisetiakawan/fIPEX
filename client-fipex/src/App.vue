<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

onMounted(async () => {
  // Check if user is already authenticated on app start
  console.log('App mounted, checking authentication...')
  
  try {
    await authStore.checkAuth()
    console.log('Auth check completed. User:', authStore.user?.name, 'Role:', authStore.user?.role)
  } catch (error) {
    console.error('Auth check failed:', error)
    // Don't logout here, let the auth store handle it
  }
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>