<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Add New Book</h1>
        <p class="mt-2 text-sm text-gray-600">
          Fill in the details below to add a new book to the library.
        </p>
      </div>

      <!-- Form Card -->
      <div class="bg-white shadow-lg rounded-lg overflow-hidden">
        <div class="px-6 py-8">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Basic Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Title -->
              <div>
                <label for="title" class="block text-sm font-medium text-gray-700">
                  Title <span class="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  v-model="form.title"
                  type="text"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-300': errors.title }"
                  placeholder="Enter book title"
                >
                <p v-if="errors.title" class="mt-1 text-sm text-red-600">{{ errors.title }}</p>
              </div>

              <!-- Author -->
              <div>
                <label for="author" class="block text-sm font-medium text-gray-700">
                  Author <span class="text-red-500">*</span>
                </label>
                <input
                  id="author"
                  v-model="form.author"
                  type="text"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-300': errors.author }"
                  placeholder="Enter author name"
                >
                <p v-if="errors.author" class="mt-1 text-sm text-red-600">{{ errors.author }}</p>
              </div>
            </div>

            <!-- Genre and Year -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Genre -->
              <div>
                <label for="genre" class="block text-sm font-medium text-gray-700">Genre</label>
                <input
                  id="genre"
                  v-model="form.genre"
                  type="text"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-300': errors.genre }"
                  placeholder="e.g., Fiction, Science Fiction, Romance"
                >
                <p v-if="errors.genre" class="mt-1 text-sm text-red-600">{{ errors.genre }}</p>
              </div>

              <!-- Published Year -->
              <div>
                <label for="published_year" class="block text-sm font-medium text-gray-700">Published Year</label>
                <input
                  id="published_year"
                  v-model.number="form.published_year"
                  type="number"
                  min="1000"
                  :max="currentYear"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  :class="{ 'border-red-300': errors.published_year }"
                  placeholder="e.g., 2023"
                >
                <p v-if="errors.published_year" class="mt-1 text-sm text-red-600">{{ errors.published_year }}</p>
              </div>


            </div>



            <!-- Error Message -->
            <div v-if="error" class="rounded-md bg-red-50 p-4">
              <div class="flex">
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">Error</h3>
                  <p class="mt-1 text-sm text-red-700">{{ error }}</p>
                </div>
              </div>
            </div>

            <!-- Success Message -->
            <div v-if="success" class="rounded-md bg-green-50 p-4">
              <div class="flex">
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-green-800">Success</h3>
                  <p class="mt-1 text-sm text-green-700">Book has been created successfully!</p>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <NuxtLink
                to="/books"
                class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </NuxtLink>
              <button
                type="submit"
                :disabled="loading"
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="loading" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
                <span v-else>Create Book</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useBooks } from '../../composables/useBooks'

const { createBook, loading, error } = useBooks()

// Set page meta
definePageMeta({
  title: 'Add New Book',
  middleware: 'auth'
})

// Current year for validation
const currentYear = new Date().getFullYear()

// Form state - only fields from original specification
const form = reactive({
  title: '',
  author: '',
  genre: '',
  published_year: undefined
})

const errors = reactive({})
const success = ref(false)

// Validation rules - only for required fields
const validateForm = () => {
  const newErrors = {}
  
  // Required fields
  if (!form.title?.trim()) {
    newErrors.title = 'Title is required'
  } else if (form.title.length > 255) {
    newErrors.title = 'Title must be less than 255 characters'
  }
  
  if (!form.author?.trim()) {
    newErrors.author = 'Author is required'
  } else if (form.author.length > 255) {
    newErrors.author = 'Author must be less than 255 characters'
  }
  
  // Optional field validations
  if (form.genre && form.genre.length > 100) {
    newErrors.genre = 'Genre must be less than 100 characters'
  }
  
  if (form.published_year) {
    if (form.published_year < 1000 || form.published_year > currentYear) {
      newErrors.published_year = `Year must be between 1000 and ${currentYear}`
    }
  }


  
  Object.assign(errors, newErrors)
  return Object.keys(newErrors).length === 0
}

// Handle form submission
const handleSubmit = async () => {
  // Clear previous errors and success
  Object.keys(errors).forEach(key => delete errors[key])
  success.value = false
  
  if (!validateForm()) return
  
  try {
    // Prepare data for API (remove empty strings and undefined values)
    const bookData = Object.fromEntries(
      Object.entries(form).filter(([_, value]) => value !== '' && value !== undefined)
    )
    
    await createBook(bookData)
    
    // Show success and immediately reset form
    success.value = true
    
    // Reset form immediately
    Object.assign(form, {
      title: '',
      author: '',
      genre: '',
      published_year: undefined
    })
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      success.value = false
    }, 3000)
    
  } catch (err) {
    console.error('Error creating book:', err)
  }
}
</script> 