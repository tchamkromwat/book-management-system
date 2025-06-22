<template>
  <div :data-theme="currentTheme" class="min-h-screen bg-base-100">
    <!-- Navigation -->
    <div class="navbar bg-base-100 shadow-lg border-b border-base-200">
      <div class="navbar-start">
        <div class="dropdown">
          <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 gap-1">
            <li>
              <NuxtLink to="/books" class="text-base-content">Books</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/books/create" class="text-base-content">Add Book</NuxtLink>
            </li>
          </ul>
        </div>
        <NuxtLink to="/" class="btn btn-ghost text-xl">
          📚 BookManager
        </NuxtLink>
      </div>
      
      <div class="navbar-center hidden lg:flex">
        <ul class="menu menu-horizontal px-1 gap-2">
          <li>
            <NuxtLink to="/books" class="text-base-content" active-class="bg-primary text-primary-content">
              Books
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/books/create" class="text-base-content" active-class="bg-primary text-primary-content">
              Add Book
            </NuxtLink>
          </li>
        </ul>
      </div>
      
      <div class="navbar-end gap-2">
        <!-- Theme Switcher -->
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <ul tabindex="0" class="dropdown-content z-[1] p-2 shadow-2xl bg-base-100 rounded-box w-52">
            <li><button @click="setTheme('light')" :class="{ 'btn-active': currentTheme === 'light' }" class="btn btn-sm btn-block btn-ghost justify-start">🌞 Light</button></li>
            <li><button @click="setTheme('dark')" :class="{ 'btn-active': currentTheme === 'dark' }" class="btn btn-sm btn-block btn-ghost justify-start">🌙 Dark</button></li>
          </ul>
        </div>

        <!-- User Menu or Login -->
        <div v-if="authStore.isAuthenticated" class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
            <div class="w-8 rounded-full bg-primary text-primary-content flex items-center justify-center content-center">
                {{ authStore.user?.first_name?.charAt(0) || 'U' }}
            </div>
          </div>
          <ul tabindex="0" class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-64">
            <li class="menu-title">
              <span>{{ authStore.user?.email }}</span>
              <span class="text-xs opacity-60 capitalize">{{ authStore.user?.role || 'User' }}</span>
            </li>
            <li><button @click="handleLogout" class="text-error">Sign out</button></li>
          </ul>
        </div>

        <!-- Login buttons for guests -->
        <div v-else class="flex gap-2">
          <NuxtLink to="/auth/login" class="btn btn-ghost">
            Sign in
          </NuxtLink>
          <NuxtLink to="/auth/register" class="btn btn-primary">
            Sign up
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Page Loading Indicator -->
    <div v-if="$nuxt.isNavigating" class="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-primary z-50 animate-pulse"></div>

    <!-- Main content -->
    <main :class="isHomePage ? '' : 'max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'">
      <slot />
    </main>
  </div>
</template>

<script setup>
const authStore = useAuthStore()
const route = useRoute()

// Check if we're on the homepage
const isHomePage = computed(() => route.name === 'index')

// Theme management - initialize properly
const { currentTheme, setTheme, themes, loadSavedTheme } = useTheme()

// Load saved theme on mount and handle SSR
onMounted(() => {
  loadSavedTheme()
})

// Also load theme immediately if on client side
if (process.client) {
  loadSavedTheme()
}

// Handle logout
const handleLogout = async () => {
  await authStore.logout()
}

// Watch for theme changes and update document
watch(currentTheme, (newTheme) => {
  if (typeof window !== 'undefined') {
    document.documentElement.setAttribute('data-theme', newTheme)
    document.body.setAttribute('data-theme', newTheme)
  }
}, { immediate: true })
</script> 