<template>
  <!-- Page Loading Overlay -->
  <div v-if="pageLoading" class="fixed inset-0 bg-base-100/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <LoadingSpinner size="lg" message="Loading homepage..." centered />
  </div>

  <!-- Full-Screen Hero Section (outside of layout container) -->
  <div class="relative min-h-[94vh] flex items-center justify-center">
    <!-- Full-Screen Background Image -->
    <div 
      class="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
      style="background-image: url('/images/library.jpg')"
    ></div>
    
    <!-- Gradient Overlay for better text readability -->
    <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
    
    <!-- Hero Content -->
    <div class="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col justify-center">
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
          class="btn btn-primary btn-lg text-lg px-8 py-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Get Started Free
        </NuxtLink>
        
        <NuxtLink
          :to="authStore.isAuthenticated ? '/books' : '/auth/login'" 
          class="btn btn-secondary btn-lg text-lg px-8 py-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          {{ authStore.isAuthenticated ? 'View Your Library' : 'Sign In' }}
        </NuxtLink>
        
        <NuxtLink
          to="/books" 
          class="btn btn-outline btn-lg text-lg px-6 py-3 text-white hover:text-blue-500 transition-colors duration-300 border-white/20 hover:border-blue-300/40"
        >
          <span>Browse Collection</span>
          <svg class="w-4 h-4 ml-2 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </NuxtLink>
      </div>
      

    </div>
          <!-- Scroll indicator -->
          <div class="absolute bottom-8 transform -translate-x-1/2 animate-bounce">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
  </div>

  <!-- Content Container -->
  <div class="relative">
    <!-- Stats Section (for authenticated users) -->
    <div v-if="authStore.isAuthenticated" class="py-16 bg-base-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-base-content mb-4">Your Library at a Glance</h2>
          <p class="text-lg text-base-content/70">Track your reading journey with these insights</p>
        </div>
        
        <!-- Loading State for Stats -->
        <div v-if="statsLoading" class="flex justify-center py-12">
          <LoadingSpinner size="lg" message="Loading your library statistics..." centered />
        </div>
        
        <!-- Error State for Stats -->
        <div v-else-if="statsError" class="text-center py-12">
          <div class="alert alert-error max-w-md mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 class="font-bold">Error</h3>
              <div class="text-xs">{{ statsError }}</div>
            </div>
            <button @click="loadDashboardStats" class="btn btn-sm btn-outline">
              Try again
            </button>
          </div>
        </div>
        
        <!-- Stats Grid -->
        <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <!-- Total Books -->
          <div class="bg-base-100 overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">📚</div>
                </div>
                <div class="ml-4 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-base-content/70 truncate">Total Books</dt>
                    <dd class="text-2xl font-bold text-base-content">
                      {{ stats.totalBooks || 0 }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <!-- Total Genres -->
          <div class="bg-base-100 overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xl">🎭</div>
                </div>
                <div class="ml-4 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-base-content/70 truncate">Genres</dt>
                    <dd class="text-2xl font-bold text-base-content">
                      {{ stats.totalGenres || 0 }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Books -->
          <div class="bg-base-100 overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl">📖</div>
                </div>
                <div class="ml-4 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-base-content/70 truncate">This Year</dt>
                    <dd class="text-2xl font-bold text-base-content">
                      {{ stats.booksThisYear || 0 }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <!-- Average Year -->
          <div class="bg-base-100 overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xl">📅</div>
                </div>
                <div class="ml-4 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-base-content/70 truncate">Avg. Year</dt>
                    <dd class="text-2xl font-bold text-base-content">
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
    <div class="py-24 sm:py-32 bg-base-100">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-2xl lg:text-center">
          <h2 class="text-base font-semibold leading-7 text-primary">Everything you need</h2>
          <p class="mt-2 text-3xl font-bold tracking-tight text-base-content sm:text-4xl">
            Manage your books like a pro
          </p>
          <p class="mt-6 text-lg leading-8 text-base-content/70">
            BookManager provides all the tools you need to organize, track, and manage your personal book collection.
          </p>
        </div>
        <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div class="flex flex-col">
              <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-base-content">
                <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-primary text-primary-content text-xl">
                  📚
                </div>
                Complete Book Management
              </dt>
              <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-base-content/70">
                <p class="flex-auto">Add, edit, and organize your books with detailed information including author, genre, publication year, and more.</p>
              </dd>
            </div>
            <div class="flex flex-col">
              <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-base-content">
                <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-primary text-primary-content text-xl">
                  🔍
                </div>
                Advanced Search & Filtering
              </dt>
              <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-base-content/70">
                <p class="flex-auto">Find books quickly with powerful search and filtering options by title, author, genre, or publication year.</p>
              </dd>
            </div>
            <div class="flex flex-col">
              <dt class="flex items-center gap-x-3 text-base font-semibold leading-7 text-base-content">
                <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-primary text-primary-content text-xl">
                  📊
                </div>
                Analytics & Statistics
              </dt>
              <dd class="mt-4 flex flex-auto flex-col text-base leading-7 text-base-content/70">
                <p class="flex-auto">Track your collection with detailed statistics and insights about your reading preferences.</p>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>

    <!-- Recent Books Section (for authenticated users) -->
    <div v-if="authStore.isAuthenticated" class="mb-12 bg-base-200 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="sm:flex sm:items-center sm:justify-between mb-6">
          <h2 class="text-2xl font-bold text-base-content">Recently Added Books</h2>
          <NuxtLink
            to="/books"
            class="mt-4 sm:mt-0 text-sm font-medium text-primary hover:text-primary/80"
          >
            View all books →
          </NuxtLink>
        </div>
        
        <!-- Loading State for Recent Books -->
        <div v-if="recentBooksLoading" class="flex justify-center py-12">
          <LoadingSpinner size="md" message="Loading recent books..." centered />
        </div>
        
        <!-- Error State for Recent Books -->
        <div v-else-if="recentBooksError" class="text-center py-12">
          <div class="alert alert-error max-w-md mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 class="font-bold">Error</h3>
              <div class="text-xs">{{ recentBooksError }}</div>
            </div>
            <button @click="loadRecentBooks" class="btn btn-sm btn-outline">
              Try again
            </button>
          </div>
        </div>
        
        <!-- Recent Books Grid -->
        <div v-else-if="recentBooks.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="book in recentBooks.slice(0, 3)"
            :key="book.id"
            class="bg-base-100 overflow-hidden shadow rounded-lg hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105"
            @click="navigateToBook(book.id)"
          >
            <div class="p-6">
              <h3 class="text-lg font-medium text-base-content line-clamp-2">{{ book.title }}</h3>
              <p class="text-sm text-base-content/70 mt-1">by {{ book.author }}</p>
              <div class="mt-3 flex items-center gap-2 flex-wrap">
                <span
                  v-if="book.genre"
                  class="badge badge-primary badge-sm"
                >
                  {{ book.genre }}
                </span>
                <span
                  v-if="book.published_year"
                  class="badge badge-outline badge-sm"
                >
                  {{ book.published_year }}
                </span>
              </div>
              <div class="mt-4 flex items-center justify-between">
                <span class="text-sm text-base-content/60">
                  {{ formatDate(book.createdAt) }}
                </span>
                <div class="text-sm font-medium text-primary flex items-center">
                  View details
                  <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Empty State for Recent Books -->
        <div v-else class="text-center py-12">
          <div class="text-6xl mb-4">📚</div>
          <h3 class="text-xl font-bold text-base-content mb-2">No books yet</h3>
          <p class="text-base-content/70 mb-6">
            Start building your library by adding your first book!
          </p>
          <NuxtLink to="/books/create" class="btn btn-primary">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Your First Book
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const authStore = useAuthStore()
const router = useRouter()
const { books, fetchBooks, fetchStats } = useBooks()

// Add loading states for stats and data fetching
const stats = ref({
  totalBooks: 0,
  totalGenres: 0,
  booksThisYear: 0,
  averageYear: null
})
const statsLoading = ref(false)
const statsError = ref(null)

const recentBooks = ref([])
const recentBooksLoading = ref(false)
const recentBooksError = ref(null)

// Add page-level loading for initial authentication check
const pageLoading = ref(true)

// Navigation function
const navigateToBook = (bookId) => {
  router.push(`/books/${bookId}`)
}

// Date formatting utility
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Fetch stats for authenticated users
const loadDashboardStats = async () => {
  if (!authStore.isAuthenticated) return
  
  statsLoading.value = true
  statsError.value = null
  
  try {
    const data = await fetchStats()
    stats.value = data
  } catch (err) {
    statsError.value = 'Failed to load statistics'
    console.error('Error fetching stats:', err)
  } finally {
    statsLoading.value = false
  }
}

// Fetch recent books for authenticated users
const loadRecentBooks = async () => {
  if (!authStore.isAuthenticated) return
  
  recentBooksLoading.value = true
  recentBooksError.value = null
  
  try {
    await fetchBooks({ limit: 6, sortBy: 'createdAt', sortOrder: 'DESC' })
    recentBooks.value = books.value || []
  } catch (err) {
    recentBooksError.value = 'Failed to load recent books'
    console.error('Error fetching recent books:', err)
  } finally {
    recentBooksLoading.value = false
  }
}

// Fetch data when component mounts (if authenticated)
onMounted(async () => {
  try {
    if (authStore.isAuthenticated) {
      // Load dashboard data in parallel
      await Promise.all([
        loadDashboardStats(),
        loadRecentBooks()
      ])
    } else {
      // If not authenticated, just wait a brief moment for smooth UX
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  } catch (err) {
    console.error('Error loading dashboard data:', err)
  } finally {
    pageLoading.value = false
  }
})

// Watch for authentication changes to fetch data
watch(() => authStore.isAuthenticated, async (isAuth) => {
  if (isAuth) {
    // Load dashboard data when user logs in
    await Promise.all([
      loadDashboardStats(),
      loadRecentBooks()
    ])
  } else {
    // Clear data when user logs out
    stats.value = {
      totalBooks: 0,
      totalGenres: 0,
      booksThisYear: 0,
      averageYear: null
    }
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