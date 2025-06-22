<template>
  <div class="px-4 sm:px-0">
    <!-- Header -->
    <div class="sm:flex sm:items-center sm:justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-base-content">Books</h1>
        <p class="mt-2 text-sm text-base-content/70">Manage your book collection</p>
      </div>
      <div class="mt-4 sm:mt-0">
        <NuxtLink to="/books/create" class="btn btn-primary">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Book
        </NuxtLink>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="card bg-base-100 shadow-xl mb-6">
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="form-control">
            <label class="label" for="search">
              <span class="label-text">Search</span>
            </label>
            <input
              id="search"
              v-model="filters.search"
              type="text"
              placeholder="Search books..."
              class="input input-bordered w-full"
              @input="debouncedSearch"
            >
          </div>
          <div class="form-control">
            <label class="label" for="genre">
              <span class="label-text">Genre</span>
            </label>
            <select
              id="genre"
              v-model="filters.genre"
              :disabled="genresLoading"
              class="select select-bordered w-full"
              @change="applyFilters"
            >
              <option value="">{{ genresLoading ? 'Loading genres...' : 'All Genres' }}</option>
              <option v-for="genre in availableGenres" :key="genre" :value="genre">
                {{ genre }}
              </option>
            </select>
          </div>
          <div class="form-control">
            <label class="label" for="sort">
              <span class="label-text">Sort By</span>
            </label>
            <select
              id="sort"
              v-model="filters.sortBy"
              class="select select-bordered w-full"
              @change="applyFilters"
            >
              <option value="createdAt">Date Added (Newest First)</option>
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="published_year">Year</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <LoadingSpinner />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <h3 class="font-bold">Error</h3>
        <div class="text-xs">{{ error }}</div>
      </div>
      <button @click="loadBooks" class="btn btn-sm btn-outline">
        Try again
      </button>
    </div>

    <!-- Books Grid -->
    <div v-else-if="books.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="book in books"
        :key="book.id"
        class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
        @click="$router.push(`/books/${book.id}`)"
      >
        <div class="card-body">
          <div class="flex justify-between items-start mb-2">
            <h3 class="card-title text-base-content flex-1 hover:text-primary">{{ book.title }}</h3>
            <div class="flex gap-2 ml-2" @click.stop>
              <button
                v-if="canEditOrDelete(book)"
                @click="$router.push(`/books/${book.id}?edit=true`)"
                class="btn btn-sm btn-circle btn-ghost text-info"
                title="Edit Book"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                v-if="canEditOrDelete(book)"
                @click="handleDelete(book.id)"
                :disabled="deleteLoading"
                class="btn btn-sm btn-circle btn-ghost text-error"
                title="Delete Book"
              >
                <LoadingSpinner v-if="deleteLoading" size="sm" />
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          <p class="text-sm text-base-content/70">by {{ book.author }}</p>
          <div class="mt-2 flex flex-wrap gap-2">
            <span
              v-if="book.genre"
              class="badge badge-primary badge-outline"
            >
              {{ book.genre }}
            </span>
            <span
              v-if="book.published_year"
              class="badge badge-secondary"
            >
              {{ book.published_year }}
            </span>
          </div>
          <div v-if="book.createdByUser" class="mt-2 text-xs text-base-content/50">
            Added by {{ book.createdByUser.username }}
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="hero min-h-96">
      <div class="hero-content text-center">
        <div class="max-w-md">
          <div class="text-6xl mb-4">📚</div>
          <h3 class="text-2xl font-bold text-base-content">No books found</h3>
          <p class="py-6 text-base-content/70">
            {{ filters.search || filters.genre ? 'No books match your search criteria.' : 'Get started by adding your first book.' }}
          </p>
          <NuxtLink to="/books/create" class="btn btn-primary">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Book
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="books.length > 0 && pagination.totalPages > 1" class="mt-8 flex justify-center">
      <div class="join">
        <button
          :disabled="pagination.page <= 1"
          @click="changePage(pagination.page - 1)"
          class="join-item btn"
          :class="{ 'btn-disabled': pagination.page <= 1 }"
        >
          Previous
        </button>
        <button class="join-item btn btn-active">
          Page {{ pagination.page }} of {{ pagination.totalPages }}
        </button>
        <button
          :disabled="pagination.page >= pagination.totalPages"
          @click="changePage(pagination.page + 1)"
          class="join-item btn"
          :class="{ 'btn-disabled': pagination.page >= pagination.totalPages }"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

const { books, loading, error, pagination, fetchBooks, deleteBook, fetchGenres } = useBooks()
const authStore = useAuthStore()

// Reactive filters
const filters = reactive({
  search: '',
  genre: '',
  sortBy: 'createdAt',
  sortOrder: 'DESC',
  page: 1,
  limit: 12
})

const availableGenres = ref([])
const deleteLoading = ref(false)
const genresLoading = ref(false)

// Permission check function
const canEditOrDelete = (book) => {
  if (!authStore.user) return false
  
  // Librarians and admins can edit/delete all books
  if (authStore.user.role === 'librarian' || authStore.user.role === 'admin') return true
  
  // Users can only edit/delete their own books
  return book.createdByUser?.id === authStore.user.id
}

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
  
  // Auto-adjust sort order based on field
  if (filters.sortBy === 'createdAt') {
    filters.sortOrder = 'DESC' // Newest first for date
  } else {
    filters.sortOrder = 'ASC' // Alphabetical/ascending for other fields
  }
  
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
  
  deleteLoading.value = true
  try {
    await deleteBook(bookId)
    // Reload current page
    await loadBooks()
  } catch (err) {
    console.error('Failed to delete book:', err)
  } finally {
    deleteLoading.value = false
  }
}

// Load data on mount
onMounted(async () => {
  try {
    // Load genres for filter
    genresLoading.value = true
    availableGenres.value = await fetchGenres()
  } catch (err) {
    console.warn('Failed to load genres:', err)
  } finally {
    genresLoading.value = false
  }
  
  // Load books
  await loadBooks()
})

// Watch for route changes (in case of navigation)
watch(() => filters, () => {
  // Auto-apply filters when they change
}, { deep: true })
</script>

 