<template>
  <div>
    <!-- Modern Full-Screen Hero Section -->
    <div class="relative min-h-screen flex items-center justify-center">
      <!-- Full-Screen Background Image -->
      <div 
        class="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style="background-image: url('/images/library.jpg')"
      ></div>
      
      <!-- Gradient Overlay for better text readability -->
      <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
      
      <!-- Hero Content -->
      <div class="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-8">
          Welcome to
          <span class="text-blue-400">BookManager</span>
        </h1>
        <p class="text-xl sm:text-2xl text-gray-200 leading-relaxed mb-12 max-w-3xl mx-auto">
          {{ authStore.isAuthenticated 
              ? `Hello ${authStore.fullName || 'there'}! Manage your digital book collection with ease and discover new reads.` 
              : 'Your ultimate digital library management solution. Organize, track, and discover books effortlessly with our modern platform.' 
          }}
        </p>
        
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <NuxtLink
            v-if="!authStore.isAuthenticated"
            to="/auth/register"
            class="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Get Started Free
          </NuxtLink>
          
          <NuxtLink
            :to="authStore.isAuthenticated ? '/books' : '/auth/login'"
            class="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {{ authStore.isAuthenticated ? 'View Your Library' : 'Sign In' }}
          </NuxtLink>
          
          <NuxtLink
            to="/books"
            class="inline-flex items-center px-6 py-3 text-lg font-medium text-white hover:text-blue-300 transition-colors duration-300"
          >
            <span>Browse Collection</span>
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </NuxtLink>
        </div>
        
        <!-- Scroll indicator -->
        <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Content Container -->
    <div class="px-4 sm:px-6 lg:px-8">
      <!-- Stats Section (for authenticated users) -->
      <div v-if="authStore.isAuthenticated" class="py-16 bg-gray-50 -mt-16 pt-32">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-gray-900 mb-4">Your Library at a Glance</h2>
            <p class="text-lg text-gray-600">Track your reading journey with these insights</p>
          </div>
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <!-- Total Books -->
            <div class="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
              <div class="p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">📚</div>
                  </div>
                  <div class="ml-4 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Total Books</dt>
                      <dd class="text-2xl font-bold text-gray-900">
                        {{ stats.totalBooks || 0 }}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <!-- Total Genres -->
            <div class="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
              <div class="p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xl">🎭</div>
                  </div>
                  <div class="ml-4 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Genres</dt>
                      <dd class="text-2xl font-bold text-gray-900">
                        {{ stats.totalGenres || 0 }}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent Books -->
            <div class="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
              <div class="p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl">📖</div>
                  </div>
                  <div class="ml-4 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">This Year</dt>
                      <dd class="text-2xl font-bold text-gray-900">
                        {{ stats.booksThisYear || 0 }}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <!-- Average Year -->
            <div class="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
              <div class="p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xl">📅</div>
                  </div>
                  <div class="ml-4 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Avg. Year</dt>
                      <dd class="text-2xl font-bold text-gray-900">
                        {{ stats.averageYear ? Math.round(stats.averageYear) : 'N/A' }}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Features section -->
      <div class="py-24 sm:py-32">
        <div class="mx-auto max-w-7xl px-6 lg:px-8">
          <div class="mx-auto max-w-2xl lg:text-center">
            <h2 class="text-base font-semibold leading-7 text-blue-600">Everything you need</h2>
            <p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Manage your books like a pro
            </p>
            <p class="mt-6 text-lg leading-8 text-gray-600">
              BookManager provides all the tools you need to organize, track, and manage your personal book collection.
            </p>
          </div>
          <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div class="flex flex-col">
                <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-600 text-white text-xl">
                    📚
                  </div>
                  Complete Book Management
                </dt>
                <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p class="flex-auto">Add, edit, and organize your books with detailed information including author, genre, publication year, and more.</p>
                </dd>
              </div>
              <div class="flex flex-col">
                <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-600 text-white text-xl">
                    🔍
                  </div>
                  Advanced Search & Filtering
                </dt>
                <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p class="flex-auto">Find books quickly with powerful search and filtering options by title, author, genre, or publication year.</p>
                </dd>
              </div>
              <div class="flex flex-col">
                <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-600 text-white text-xl">
                    📊
                  </div>
                  Analytics & Statistics
                </dt>
                <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p class="flex-auto">Track your collection with detailed statistics and insights about your reading preferences.</p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <!-- Recent Books Section (for authenticated users) -->
      <div v-if="authStore.isAuthenticated && recentBooks.length > 0" class="mb-12">
        <div class="sm:flex sm:items-center sm:justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Recently Added Books</h2>
          <NuxtLink
            to="/books"
            class="mt-4 sm:mt-0 text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View all books →
          </NuxtLink>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="book in recentBooks.slice(0, 3)"
            :key="book.id"
            class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900">{{ book.title }}</h3>
              <p class="text-sm text-gray-600">by {{ book.author }}</p>
              <div class="mt-2">
                <span
                  v-if="book.genre"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {{ book.genre }}
                </span>
              </div>
              <div class="mt-4">
                <NuxtLink
                  :to="`/books/${book.id}`"
                  class="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  View details →
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const authStore = useAuthStore()
const { books, fetchBooks, fetchStats } = useBooks()

// State for dashboard data
const stats = ref({
  totalBooks: 0,
  totalGenres: 0,
  booksThisYear: 0,
  averageYear: 0
})

const recentBooks = ref([])

// Load dashboard data for authenticated users
onMounted(async () => {
  if (authStore.isAuthenticated) {
    try {
      // Load stats
      const statsData = await fetchStats()
      stats.value = statsData

      // Load recent books
      await fetchBooks({ limit: 6, sortBy: 'createdAt', sortOrder: 'DESC' })
      recentBooks.value = books.value
    } catch (error) {
      console.warn('Failed to load dashboard data:', error)
    }
  }
})

// Watch for authentication changes
watch(() => authStore.isAuthenticated, async (newValue) => {
  if (newValue) {
    try {
      const statsData = await fetchStats()
      stats.value = statsData
      
      await fetchBooks({ limit: 6, sortBy: 'createdAt', sortOrder: 'DESC' })
      recentBooks.value = books.value
    } catch (error) {
      console.warn('Failed to load dashboard data:', error)
    }
  } else {
    // Clear dashboard data when user logs out
    stats.value = { totalBooks: 0, totalGenres: 0, booksThisYear: 0, averageYear: 0 }
    recentBooks.value = []
  }
})

// SEO
useHead({
  title: 'BookManager - Your Digital Library',
  meta: [
    { 
      name: 'description', 
      content: 'Manage your personal book collection with BookManager. Add, organize, search, and track your books with ease.' 
    }
  ]
})
</script> 