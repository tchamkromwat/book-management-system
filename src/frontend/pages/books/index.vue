<template>
  <div class="px-4 sm:px-0">
    <!-- Header -->
    <div class="sm:flex sm:items-center sm:justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Books</h1>
        <p class="mt-2 text-sm text-gray-700">Manage your book collection</p>
      </div>
      <div class="mt-4 sm:mt-0">
        <NuxtLink 
          to="/books/create" 
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Add Book
        </NuxtLink>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            id="search"
            v-model="filters.search"
            type="text"
            placeholder="Search books..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @input="debouncedSearch"
          >
        </div>
        <div>
          <label for="genre" class="block text-sm font-medium text-gray-700 mb-1">Genre</label>
          <select
            id="genre"
            v-model="filters.genre"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @change="applyFilters"
          >
            <option value="">All Genres</option>
            <option v-for="genre in availableGenres" :key="genre" :value="genre">
              {{ genre }}
            </option>
          </select>
        </div>
        <div>
          <label for="sort" class="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <select
            id="sort"
            v-model="filters.sortBy"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @change="applyFilters"
          >
            <option value="title">Title</option>
            <option value="author">Author</option>
            <option value="published_year">Year</option>
            <option value="createdAt">Date Added</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <LoadingSpinner />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
      <div class="flex">
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error</h3>
          <p class="mt-1 text-sm text-red-700">{{ error }}</p>
          <button
            @click="loadBooks"
            class="mt-2 text-sm text-red-600 hover:text-red-500 underline"
          >
            Try again
          </button>
        </div>
      </div>
    </div>

    <!-- Books Grid -->
    <div v-else-if="books.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="book in books"
        :key="book.id"
        class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
      >
        <div class="p-6">
          <div class="flex justify-between items-start mb-2">
            <h3 class="text-lg font-medium text-gray-900 flex-1">{{ book.title }}</h3>
            <div class="flex space-x-2 ml-2">
              <NuxtLink
                :to="`/books/${book.id}`"
                class="text-blue-600 hover:text-blue-800"
                title="View Details"
              >
                👁️
              </NuxtLink>
              <button
                @click="handleDelete(book.id)"
                class="text-red-600 hover:text-red-800"
                title="Delete Book"
              >
                🗑️
              </button>
            </div>
          </div>
          <p class="text-sm text-gray-600">by {{ book.author }}</p>
          <div class="mt-2">
            <span
              v-if="book.genre"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
            >
              {{ book.genre }}
            </span>
            <span
              v-if="book.published_year"
              class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
            >
              {{ book.published_year }}
            </span>
          </div>

        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div class="mx-auto h-12 w-12 text-gray-400 text-4xl mb-4">📚</div>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No books found</h3>
      <p class="mt-1 text-sm text-gray-500">
        {{ filters.search || filters.genre ? 'No books match your search criteria.' : 'Get started by adding your first book.' }}
      </p>
      <div class="mt-6">
        <NuxtLink
          to="/books/create"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Add Book
        </NuxtLink>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="books.length > 0 && pagination.totalPages > 1" class="mt-8 flex justify-center">
      <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
        <button
          :disabled="pagination.page <= 1"
          @click="changePage(pagination.page - 1)"
          class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
          Page {{ pagination.page }} of {{ pagination.totalPages }}
        </span>
        <button
          :disabled="pagination.page >= pagination.totalPages"
          @click="changePage(pagination.page + 1)"
          class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

const { books, loading, error, pagination, fetchBooks, deleteBook, fetchGenres } = useBooks()

// Reactive filters
const filters = reactive({
  search: '',
  genre: '',
  sortBy: 'title',
  sortOrder: 'ASC',
  page: 1,
  limit: 12
})

const availableGenres = ref([])

// Debounced search
const debouncedSearch = useDebounceFn(() => {
  applyFilters()
}, 500)

// Load books with current filters
const loadBooks = async () => {
  const params = {
    ...filters,
    search: filters.search || undefined,
    genre: filters.genre || undefined,
  }
  
  await fetchBooks(params)
}

// Apply filters and reload
const applyFilters = () => {
  filters.page = 1 // Reset to first page when filtering
  loadBooks()
}

// Change page
const changePage = (newPage) => {
  filters.page = newPage
  loadBooks()
}

// Handle book deletion
const handleDelete = async (bookId) => {
  if (!confirm('Are you sure you want to delete this book?')) return
  
  try {
    await deleteBook(bookId)
    // Reload current page
    await loadBooks()
  } catch (err) {
    console.error('Failed to delete book:', err)
  }
}

// Load data on mount
onMounted(async () => {
  try {
    // Load genres for filter
    availableGenres.value = await fetchGenres()
  } catch (err) {
    console.warn('Failed to load genres:', err)
  }
  
  // Load books
  await loadBooks()
})

// Watch for route changes (in case of navigation)
watch(() => filters, () => {
  // Auto-apply filters when they change
}, { deep: true })
</script>

 