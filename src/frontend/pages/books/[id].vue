<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-0">
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
            @click="loadBook"
            class="mt-2 text-sm text-red-600 hover:text-red-500 underline"
          >
            Try again
          </button>
        </div>
      </div>
    </div>

    <!-- Book Details -->
    <div v-else-if="book" class="bg-white shadow overflow-hidden sm:rounded-lg">
      <!-- Header -->
      <div class="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ book.title }}</h1>
            <p class="mt-1 text-sm text-gray-500">by {{ book.author }}</p>
          </div>
          <div class="flex space-x-3">
            <button
              @click="editMode = !editMode"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {{ editMode ? 'Cancel' : 'Edit' }}
            </button>
            <button
              @click="handleDelete"
              class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Edit Form -->
      <div v-if="editMode" class="p-6 border-b border-gray-200">
        <form @submit.prevent="handleUpdate" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Title -->
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
              <input
                id="title"
                v-model="editForm.title"
                type="text"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
            </div>

            <!-- Author -->
            <div>
              <label for="author" class="block text-sm font-medium text-gray-700">Author</label>
              <input
                id="author"
                v-model="editForm.author"
                type="text"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
            </div>

            <!-- Genre -->
            <div>
              <label for="genre" class="block text-sm font-medium text-gray-700">Genre</label>
              <input
                id="genre"
                v-model="editForm.genre"
                type="text"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
            </div>

            <!-- Published Year -->
            <div>
              <label for="published_year" class="block text-sm font-medium text-gray-700">Published Year</label>
              <input
                id="published_year"
                v-model.number="editForm.published_year"
                type="number"
                min="1000"
                :max="new Date().getFullYear()"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
            </div>

          </div>

          <!-- Form Actions -->
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="editMode = false"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="updateLoading"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ updateLoading ? 'Updating...' : 'Update Book' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Book Information -->
      <div v-else class="px-4 py-5 sm:p-6">
        <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
          <div v-if="book.genre">
            <dt class="text-sm font-medium text-gray-500">Genre</dt>
            <dd class="mt-1 text-sm text-gray-900">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {{ book.genre }}
              </span>
            </dd>
          </div>

          <div v-if="book.published_year">
            <dt class="text-sm font-medium text-gray-500">Published Year</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ book.published_year }}</dd>
          </div>



          <div>
            <dt class="text-sm font-medium text-gray-500">Date Added</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ formatDate(book.createdAt) }}</dd>
          </div>

          <div>
            <dt class="text-sm font-medium text-gray-500">Last Updated</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ formatDate(book.updatedAt) }}</dd>
          </div>


        </dl>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="text-center py-12">
      <div class="mx-auto h-12 w-12 text-gray-400 text-4xl mb-4">📚</div>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Book not found</h3>
      <p class="mt-1 text-sm text-gray-500">The book you're looking for doesn't exist or has been removed.</p>
      <div class="mt-6">
        <NuxtLink
          to="/books"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Back to Books
        </NuxtLink>
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

// Handle book update
const handleUpdate = async () => {
  updateLoading.value = true
  
  try {
    // Prepare data for API (remove empty strings and undefined values)
    const updateData = Object.fromEntries(
      Object.entries(editForm).filter(([_, value]) => value !== '' && value !== undefined)
    )
    
    await updateBook(route.params.id, updateData)
    editMode.value = false
  } catch (err) {
    console.error('Failed to update book:', err)
  } finally {
    updateLoading.value = false
  }
}

// Handle book deletion
const handleDelete = async () => {
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

// Set page title
useHead({
  title: computed(() => book.value ? `${book.value.title} - BookManager` : 'Book Details - BookManager')
})
</script> 