<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-0">
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
      <button @click="loadBook" class="btn btn-outline btn-sm">
        Try again
      </button>
    </div>

    <!-- Book Details -->
    <div v-else-if="book" class="card bg-base-100 shadow-xl">
      <!-- Header -->
      <div class="card-body border-b border-base-300">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="card-title text-2xl text-base-content">{{ book.title }}</h1>
            <p class="mt-1 text-sm text-base-content/70">by {{ book.author }}</p>
          </div>
          <div v-if="canEditOrDelete" class="flex space-x-3">
            <button
              @click="toggleEditMode"
              class="btn btn-outline btn-sm"
            >
              {{ editMode ? 'Cancel' : 'Edit' }}
            </button>
            <button
              @click="handleDelete"
              class="btn btn-error btn-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Edit Form -->
      <div v-if="editMode && canEditOrDelete" class="card-body border-b border-base-300">
        <form @submit.prevent="handleUpdate" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Title -->
            <div class="form-control">
              <label for="title" class="label">
                <span class="label-text">Title</span>
              </label>
              <input
                id="title"
                v-model="editForm.title"
                type="text"
                required
                :disabled="updateLoading"
                class="input input-bordered w-full"
              >
            </div>

            <!-- Author -->
            <div class="form-control">
              <label for="author" class="label">
                <span class="label-text">Author</span>
              </label>
              <input
                id="author"
                v-model="editForm.author"
                type="text"
                required
                :disabled="updateLoading"
                class="input input-bordered w-full"
              >
            </div>

            <!-- Genre -->
            <GenreSelector
              v-model="editForm.genre"
              :disabled="updateLoading"
              label="Genre"
              placeholder="Search or create a genre..."
            />

            <!-- Published Year -->
            <div class="form-control">
              <label for="published_year" class="label">
                <span class="label-text">Published Year</span>
              </label>
              <input
                id="published_year"
                v-model.number="editForm.published_year"
                type="number"
                min="1000"
                :max="new Date().getFullYear()"
                :disabled="updateLoading"
                class="input input-bordered w-full"
              >
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="cancelEdit"
              :disabled="updateLoading"
              class="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="updateLoading"
              class="btn btn-primary"
            >
              <LoadingSpinner v-if="updateLoading" size="sm" color="white" />
              <span v-if="updateLoading" class="ml-2">Updating...</span>
              <span v-else>Update Book</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Book Information -->
      <div v-else class="card-body">
        <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
          <div v-if="book.genre">
            <dt class="text-sm font-medium text-base-content/70">Genre</dt>
            <dd class="mt-1">
              <span class="badge badge-primary">
                {{ book.genre }}
              </span>
            </dd>
          </div>

          <div v-if="book.published_year">
            <dt class="text-sm font-medium text-base-content/70">Published Year</dt>
            <dd class="mt-1 text-sm text-base-content">{{ book.published_year }}</dd>
          </div>

          <div>
            <dt class="text-sm font-medium text-base-content/70">Date Added</dt>
            <dd class="mt-1 text-sm text-base-content">{{ formatDate(book.createdAt) }}</dd>
          </div>

          <div>
            <dt class="text-sm font-medium text-base-content/70">Last Updated</dt>
            <dd class="mt-1 text-sm text-base-content">{{ formatDate(book.updatedAt) }}</dd>
          </div>
        </dl>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="hero min-h-96">
      <div class="hero-content text-center">
        <div class="max-w-md">
          <div class="text-6xl mb-4">📚</div>
          <h3 class="text-2xl font-bold text-base-content">Book not found</h3>
          <p class="py-6 text-base-content/70">The book you're looking for doesn't exist or has been removed.</p>
          <NuxtLink to="/books" class="btn btn-primary">
            Back to Books
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const { currentBook: book, loading, error, fetchBook, updateBook, deleteBook } = useBooks()

// Local state
const editMode = ref(false)
const updateLoading = ref(false)

// Edit form
const editForm = reactive({
  title: '',
  author: '',
  genre: '',
  published_year: undefined
})

// Permission check function
const canEditOrDelete = computed(() => {
  if (!authStore.user || !book.value) return false
  
  // Librarians and admins can edit/delete all books
  if (authStore.user.role === 'librarian' || authStore.user.role === 'admin') return true
  
  // Users can only edit/delete their own books
  return book.value.createdByUser?.id === authStore.user.id
})

// Load book data
const loadBook = async () => {
  const bookId = route.params.id
  if (bookId) {
    try {
      await fetchBook(bookId)
      // Populate edit form with current data
      if (book.value) {
        Object.assign(editForm, {
          title: book.value.title || '',
          author: book.value.author || '',
          genre: book.value.genre || '',
          published_year: book.value.published_year || undefined
        })
      }
    } catch (err) {
      console.error('Failed to load book:', err)
    }
  }
}

// Toggle edit mode and update URL
const toggleEditMode = () => {
  if (!canEditOrDelete.value) return // Extra security check
  
  if (editMode.value) {
    cancelEdit()
  } else {
    editMode.value = true
    router.push({ query: { ...route.query, edit: 'true' } })
  }
}

// Cancel edit mode and remove edit parameter from URL
const cancelEdit = () => {
  editMode.value = false
  const query = { ...route.query }
  delete query.edit
  router.push({ query })
}

// Handle book update
const handleUpdate = async () => {
  if (!canEditOrDelete.value) return // Extra security check
  
  updateLoading.value = true
  
  try {
    // Prepare data for API (remove empty strings and undefined values)
    const updateData = Object.fromEntries(
      Object.entries(editForm).filter(([_, value]) => value !== '' && value !== undefined)
    )
    
    await updateBook(route.params.id, updateData)
    cancelEdit() // This will exit edit mode and clean URL
  } catch (err) {
    console.error('Failed to update book:', err)
  } finally {
    updateLoading.value = false
  }
}

// Handle book deletion
const handleDelete = async () => {
  if (!canEditOrDelete.value) return // Extra security check
  
  if (!confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
    return
  }
  
  try {
    await deleteBook(route.params.id)
    router.push('/books')
  } catch (err) {
    console.error('Failed to delete book:', err)
  }
}

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Handle image error
const handleImageError = (event) => {
  event.target.style.display = 'none'
}

// Load book on mount
onMounted(() => {
  loadBook()
})

// Watch for route changes
watch(() => route.params.id, () => {
  if (route.params.id) {
    loadBook()
  }
})

// Watch for edit query parameter and permissions
watch([() => route.query.edit, canEditOrDelete], ([editQuery, hasPermission]) => {
  if (editQuery === 'true' && hasPermission) {
    editMode.value = true
  } else if (editQuery === 'true' && !hasPermission) {
    // If user tries to access edit mode without permission, remove the query param
    const query = { ...route.query }
    delete query.edit
    router.replace({ query })
  }
}, { immediate: true })

// Set page title
useHead({
  title: computed(() => book.value ? `${book.value.title} - BookManager` : 'Book Details - BookManager')
})
</script> 