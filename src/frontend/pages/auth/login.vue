<template>
  <div class="min-h-screen flex bg-base-200" :data-theme="currentTheme">
    <!-- Left side - Form -->
    <div class="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <!-- Back button and Theme switcher -->
        <div class="flex justify-between items-center">
          <NuxtLink to="/" class="btn btn-outline btn-sm">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </NuxtLink>
          
          <!-- Theme Switcher -->
          <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-circle btn-sm">
              <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <ul tabindex="0" class="dropdown-content z-[1] p-2 shadow-2xl bg-base-100 rounded-box w-40">
              <li><button @click="setTheme('light')" :class="{ 'btn-active': currentTheme === 'light' }" class="btn btn-sm btn-block btn-ghost justify-start">🌞 Light</button></li>
              <li><button @click="setTheme('dark')" :class="{ 'btn-active': currentTheme === 'dark' }" class="btn btn-sm btn-block btn-ghost justify-start">🌙 Dark</button></li>
            </ul>
          </div>
        </div>
        
        <div class="text-center">
          <div class="mx-auto h-12 w-12 flex items-center justify-center">
            <span class="text-3xl">📚</span>
          </div>
          <h2 class="mt-6 text-3xl font-extrabold text-base-content">
            Sign in to BookManager
          </h2>
          <p class="mt-2 text-sm text-base-content/70">
            Or
            <NuxtLink to="/auth/register" class="link link-primary font-medium">
              create a new account
            </NuxtLink>
          </p>
        </div>
        
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <form class="space-y-6" @submit.prevent="handleLogin">
              <div class="form-control">
                <label class="label" for="username">
                  <span class="label-text">Username</span>
                </label>
                <input
                  id="username"
                  v-model="form.username"
                  name="username"
                  type="text"
                  required
                  class="input input-bordered w-full"
                  :class="{ 'input-error': errors.username }"
                  placeholder="Enter your username"
                >
                <label v-if="errors.username" class="label">
                  <span class="label-text-alt text-error">{{ errors.username }}</span>
                </label>
              </div>

              <div class="form-control">
                <label class="label" for="password">
                  <span class="label-text">Password</span>
                </label>
                <input
                  id="password"
                  v-model="form.password"
                  name="password"
                  type="password"
                  required
                  class="input input-bordered w-full"
                  :class="{ 'input-error': errors.password }"
                  placeholder="Enter your password"
                >
                <label v-if="errors.password" class="label">
                  <span class="label-text-alt text-error">{{ errors.password }}</span>
                </label>
              </div>

              <div v-if="error" class="alert alert-error">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ error }}</span>
              </div>

              <div class="form-control mt-6">
                <button
                  type="submit"
                  :disabled="loading"
                  class="btn btn-primary w-full"
                >
                  <LoadingSpinner v-if="loading" size="sm" color="white" />
                  <span v-if="loading" class="ml-2">Signing in...</span>
                  <span v-else>Sign in</span>
                </button>
              </div>
            </form>
          </div>
        </div>
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

// Theme management (since this page doesn't use default layout)
const currentTheme = ref('light')

const setTheme = (theme) => {
  currentTheme.value = theme
  if (typeof window !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme)
    document.body.setAttribute('data-theme', theme)
    localStorage.setItem('bookmanager-theme', theme)
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('bookmanager-theme') || 'light'
    setTheme(savedTheme)
  }
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