<template>
  <div class="min-h-screen flex bg-gray-50">
    <!-- Left side - Form -->
    <div class="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <!-- Back button -->
        <div class="flex justify-start">
          <NuxtLink 
            to="/" 
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </NuxtLink>
        </div>
        
        <div>
          <div class="mx-auto h-12 w-12 flex items-center justify-center">
            <span class="text-3xl">📚</span>
          </div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Just username and password to get started! You can add more details later.
          </p>
          <p class="mt-1 text-center text-sm text-gray-600">
            Already have an account?
            <NuxtLink to="/auth/login" class="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </NuxtLink>
          </p>
        </div>
        
        <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
          <div class="space-y-4">
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                v-model="form.username"
                name="username"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                :class="{ 'border-red-300': errors.username }"
                placeholder="Choose a username"
              >
              <p v-if="errors.username" class="mt-1 text-sm text-red-600">{{ errors.username }}</p>
            </div>
            
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                v-model="form.password"
                name="password"
                type="password"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                :class="{ 'border-red-300': errors.password }"
                placeholder="Create a password"
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
                <LoadingSpinner size="sm" color="white" />
                <span class="ml-2">Creating Account...</span>
              </span>
              <span v-else>Create Account</span>
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
        <h1 class="text-3xl font-bold mb-2">Join BookManager</h1>
        <p class="text-lg opacity-90">Start managing your personal library today</p>
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
  password: '',
})

const errors = reactive({})
const error = ref('')
const loading = ref(false)

// Validation
const validateForm = () => {
  const newErrors = {}
  
  if (!form.username) {
    newErrors.username = 'Username is required'
  } else if (form.username.length < 3) {
    newErrors.username = 'Username must be at least 3 characters'
  } else if (form.username.length > 50) {
    newErrors.username = 'Username must be less than 50 characters'
  }
  
  if (!form.password) {
    newErrors.password = 'Password is required'
  } else if (form.password.length < 6) {
    newErrors.password = 'Password must be at least 6 characters'
  }
  
  Object.assign(errors, newErrors)
  return Object.keys(newErrors).length === 0
}

// Handle registration
const handleRegister = async () => {
  // Clear previous errors
  Object.keys(errors).forEach(key => delete errors[key])
  error.value = ''
  
  if (!validateForm()) return
  
  loading.value = true
  const authStore = useAuthStore()
  
  try {
    await authStore.register(form)
    
    // On success, redirect to dashboard
    await navigateTo('/books')
  } catch (err) {
    error.value = authStore.error || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script> 