<template>
  <div class="min-h-screen py-8">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-base-content">Add New Book</h1>
        <p class="mt-2 text-sm text-base-content/70">
          Fill in the details below to add a new book to the library.
        </p>
      </div>

      <!-- Form Card -->
      <div class="bg-base-100 shadow-lg rounded-lg overflow-hidden">
        <div class="px-6 py-8">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Title -->
            <div class="form-control w-full">
              <label for="title" class="label">
                <span class="label-text font-medium">Title <span class="text-error">*</span></span>
              </label>
              <input
                id="title"
                v-model="form.title"
                type="text"
                required
                :disabled="loading"
                class="input input-bordered w-full"
                :class="{ 'input-error': errors.title }"
                placeholder="Enter book title"
              >
              <label v-if="errors.title" class="label">
                <span class="label-text-alt text-error">{{ errors.title }}</span>
              </label>
            </div>

            <!-- Author -->
            <div class="form-control w-full">
              <label for="author" class="label">
                <span class="label-text font-medium">Author <span class="text-error">*</span></span>
              </label>
              <input
                id="author"
                v-model="form.author"
                type="text"
                required
                :disabled="loading"
                class="input input-bordered w-full"
                :class="{ 'input-error': errors.author }"
                placeholder="Enter author name"
              >
              <label v-if="errors.author" class="label">
                <span class="label-text-alt text-error">{{ errors.author }}</span>
              </label>
            </div>

            <!-- Genre -->
            <div class="form-control w-full">
              <GenreSelector
                v-model="form.genre"
                :disabled="loading"
                label="Genre"
                placeholder="Search or create a genre..."
                :error-message="errors.genre"
              />
            </div>

            <!-- Published Year -->
            <div class="form-control w-full">
              <label for="published_year" class="label">
                <span class="label-text font-medium">Published Year</span>
              </label>
              <input
                id="published_year"
                v-model.number="form.published_year"
                type="number"
                min="1000"
                :max="currentYear"
                :disabled="loading"
                class="input input-bordered w-full"
                :class="{ 'input-error': errors.published_year }"
                placeholder="e.g., 2023"
              >
              <label v-if="errors.published_year" class="label">
                <span class="label-text-alt text-error">{{ errors.published_year }}</span>
              </label>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 class="font-bold">Error</h3>
                <div class="text-xs">{{ error }}</div>
              </div>
            </div>

            <!-- Success Message -->
            <div v-if="success" class="alert alert-success">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 class="font-bold">Success</h3>
                <div class="text-xs">Book has been created successfully!</div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end space-x-4 pt-6 border-t border-base-300">
              <NuxtLink
                to="/books"
                class="btn btn-outline"
              >
                Cancel
              </NuxtLink>
              <button
                type="submit"
                :disabled="loading"
                class="btn btn-primary"
              >
                <LoadingSpinner v-if="loading" size="sm" color="white" />
                <span v-if="loading" class="ml-2">Creating...</span>
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

  // Clear all existing errors first, then assign new ones
  Object.keys(errors).forEach(key => delete errors[key])
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