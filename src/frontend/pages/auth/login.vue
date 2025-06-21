<template>
  <div class="min-h-screen flex bg-gray-50">
    <!-- Left side - Form -->
    <div class="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <div class="mx-auto h-12 w-12 flex items-center justify-center">
            <span class="text-3xl">📚</span>
          </div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to BookManager
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Or
            <NuxtLink to="/auth/register" class="font-medium text-blue-600 hover:text-blue-500">
              create a new account
            </NuxtLink>
          </p>
        </div>
        
        <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="username" class="sr-only">Username</label>
              <input
                id="username"
                v-model="form.username"
                name="username"
                type="text"
                required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                :class="{ 'border-red-300': errors.username }"
                placeholder="Username"
              >
              <p v-if="errors.username" class="mt-1 text-sm text-red-600">{{ errors.username }}</p>
            </div>
            <div>
              <label for="password" class="sr-only">Password</label>
              <input
                id="password"
                v-model="form.password"
                name="password"
                type="password"
                required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                :class="{ 'border-red-300': errors.password }"
                placeholder="Password"
              >
              <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
            </div>
          </div>

          <div v-if="error" class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  {{ error }}
                </h3>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
              <span v-else>Sign in</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Right side - Image (hidden on mobile, visible on md and up) -->
    <div class="hidden md:flex md:w-1/2 lg:w-3/5 relative">
      <img 
        src="/images/cozy-bookstore-entrance-with-outdoor-view-illustration.jpg" 
        alt="Cozy bookstore entrance" 
        class="w-full h-screen object-cover object-center"
      >
      <div class="absolute inset-0 bg-black bg-opacity-20"></div>
      <div class="absolute bottom-8 right-8 text-white text-right">
        <h1 class="text-3xl font-bold mb-2">Welcome to BookManager</h1>
        <p class="text-lg opacity-90">Your personal library management system</p>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false,
  middleware: 'guest'
})

// Form state
const form = reactive({
  username: '',
  password: ''
})

const errors = reactive({})
const error = ref('')
const loading = ref(false)

// Validation
const validateForm = () => {
  const newErrors = {}
  
  if (!form.username) {
    newErrors.username = 'Username is required'
  }
  
  if (!form.password) {
    newErrors.password = 'Password is required'
  } else if (form.password.length < 6) {
    newErrors.password = 'Password must be at least 6 characters'
  }
  
  Object.assign(errors, newErrors)
  return Object.keys(newErrors).length === 0
}

// Handle login
const handleLogin = async () => {
  // Clear previous errors
  Object.keys(errors).forEach(key => delete errors[key])
  error.value = ''
  
  if (!validateForm()) return
  
  loading.value = true
  const authStore = useAuthStore()
  
  try {
    await authStore.login(form)
    
    // On success, redirect to dashboard
    await navigateTo('/books')
  } catch (err) {
    error.value = authStore.error || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script> 