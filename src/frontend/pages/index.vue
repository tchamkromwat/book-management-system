<template>
  <div class="px-4 sm:px-0">
    <!-- Hero Section -->
    <div class="relative text-center mb-12 py-24 sm:py-32">
      <!-- Background Image -->
      <div 
        class="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style="background-image: url('/images/library.jpg')"
      ></div>
      
      <!-- Dark Overlay for better text readability -->
      <div class="absolute inset-0 bg-black bg-opacity-50"></div>
      
      <!-- Content -->
      <div class="relative z-10">
        <h1 class="text-4xl font-bold text-white sm:text-6xl">
          Welcome to InnovateAI BookManager
        </h1>
        <p class="mt-6 text-lg leading-8 text-gray-200">
          {{ authStore.isAuthenticated 
              ? `Hello ${authStore.fullName || 'there'}! Manage your digital book collection with ease.` 
              : 'Your digital library management solution. Organize, track, and discover books effortlessly.' 
          }}
        </p>
        <div class="mt-10 flex items-center justify-center gap-x-6">
          <NuxtLink
            v-if="!authStore.isAuthenticated"
            to="/auth/register"
            class="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Get started
          </NuxtLink>
          <NuxtLink
            :to="authStore.isAuthenticated ? '/books' : '/auth/login'"
            class="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {{ authStore.isAuthenticated ? 'View Your Books' : 'Sign In' }}
          </NuxtLink>
          <NuxtLink
            to="/books"
            class="text-sm font-semibold leading-6 text-gray-200 hover:text-white"
          >
            Browse collection <span aria-hidden="true">→</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Stats Section (for authenticated users) -->
    <div v-if="authStore.isAuthenticated" class="mb-12">
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Total Books -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="text-2xl">📚</div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Books</dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.totalBooks || 0 }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Total Genres -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="text-2xl">🎭</div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Genres</dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.totalGenres || 0 }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Books -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="text-2xl">📖</div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">This Year</dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.booksThisYear || 0 }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Average Year -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="text-2xl">📅</div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Avg. Year</dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.averageYear ? Math.round(stats.averageYear) : 'N/A' }}
                  </dd>
                </dl>
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