<template>
  <div class="form-control w-full">
    <label v-if="label" class="label">
      <span class="label-text font-medium">{{ label }}</span>
    </label>
    
    <div class="dropdown dropdown-bottom dropdown-end w-full">
      <div tabindex="0" role="button" class="w-full">
        <input
          v-model="searchTerm"
          :placeholder="placeholder"
          class="input input-bordered w-full"
          :class="{ 'input-error': errorMessage }"
          @input="handleInput"
          @focus="handleFocus"
          @keydown.enter.prevent="selectOrCreate"
          @keydown.escape="closeDropdown"
          @keydown.arrow-down.prevent="highlightNext"
          @keydown.arrow-up.prevent="highlightPrevious"
          @keydown.tab="closeDropdown"
        />
      </div>
      
      <ul 
        v-if="isOpen && (filteredGenres.length > 0 || canCreateNew)" 
        tabindex="0"
        class="dropdown-content menu bg-base-100 rounded-box z-[1000] w-full shadow-xl border border-base-300 max-h-60 overflow-auto p-2"
      >
        <!-- Existing genres -->
        <template v-if="filteredGenres.length > 0">
          <li v-for="(genre, index) in filteredGenres" :key="genre">
            <a 
              :class="{ 'active': highlightedIndex === index }"
              @click="selectGenre(genre)"
              @mouseenter="highlightedIndex = index"
              class="justify-start"
            >
              {{ genre }}
            </a>
          </li>
        </template>
        
        <!-- Divider if we have existing genres and can create new -->
        <div v-if="filteredGenres.length > 0 && canCreateNew" class="divider my-1"></div>
        
        <!-- Create new genre option -->
        <li v-if="canCreateNew">
          <a 
            :class="{ 'active': highlightedIndex === filteredGenres.length }"
            @click="createNewGenre"
            @mouseenter="highlightedIndex = filteredGenres.length"
            class="justify-start text-primary flex-col items-start"
          >
            <span class="text-xs opacity-70">Create new genre:</span>
            <span class="font-medium">"{{ searchTerm }}"</span>
          </a>
        </li>
        
        <!-- No results message -->
        <li v-if="filteredGenres.length === 0 && !canCreateNew">
          <div class="text-base-content/70 text-sm cursor-default hover:bg-transparent">
            No genres found
          </div>
        </li>
      </ul>
    </div>
    
    <label v-if="errorMessage" class="label">
      <span class="label-text-alt text-error">{{ errorMessage }}</span>
    </label>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Search or create a genre...'
  },
  errorMessage: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

// State
const searchTerm = ref(props.modelValue)
const isOpen = ref(false)
const highlightedIndex = ref(-1)

// Available genres - expanded list with more common genres
const availableGenres = ref([
  'Fiction', 'Non-Fiction', 'Mystery', 'Thriller', 'Romance', 'Fantasy', 
  'Science Fiction', 'Biography', 'History', 'Self-Help', 'Children', 
  'Young Adult', 'Horror', 'Adventure', 'Drama', 'Comedy', 'Poetry',
  'Philosophy', 'Psychology', 'Religion', 'Health', 'Travel', 'Cookbook',
  'Art', 'Music', 'Sports', 'Business', 'Economics', 'Politics',
  'Technology', 'Science', 'Nature', 'True Crime', 'Memoir'
])

// Computed
const filteredGenres = computed(() => {
  if (!searchTerm.value.trim()) return availableGenres.value.slice(0, 10) // Show first 10 when empty
  
  const searchLower = searchTerm.value.toLowerCase()
  return availableGenres.value
    .filter(genre => genre.toLowerCase().includes(searchLower))
    .slice(0, 8) // Limit to 8 results for better UX
})

const canCreateNew = computed(() => {
  if (!searchTerm.value.trim()) return false
  
  const searchLower = searchTerm.value.toLowerCase()
  return !availableGenres.value.some(genre => 
    genre.toLowerCase() === searchLower
  ) && searchTerm.value.length <= 50 // Reasonable length limit
})

// Methods
const handleInput = () => {
  highlightedIndex.value = -1
  isOpen.value = true
  emit('update:modelValue', searchTerm.value)
}

const handleFocus = () => {
  isOpen.value = true
}

const closeDropdown = () => {
  isOpen.value = false
  highlightedIndex.value = -1
}

const selectGenre = (genre) => {
  searchTerm.value = genre
  emit('update:modelValue', genre)
  closeDropdown()
}

const createNewGenre = () => {
  const newGenre = searchTerm.value.trim()
  if (newGenre && newGenre.length <= 50) {
    // Add to available genres (sorted alphabetically)
    availableGenres.value.push(newGenre)
    availableGenres.value.sort()
    
    // Select the new genre
    searchTerm.value = newGenre
    emit('update:modelValue', newGenre)
    closeDropdown()
  }
}

const selectOrCreate = () => {
  if (highlightedIndex.value >= 0) {
    if (highlightedIndex.value < filteredGenres.value.length) {
      selectGenre(filteredGenres.value[highlightedIndex.value])
    } else if (canCreateNew.value) {
      createNewGenre()
    }
  } else if (canCreateNew.value) {
    createNewGenre()
  } else if (filteredGenres.value.length > 0) {
    selectGenre(filteredGenres.value[0])
  }
}

const highlightNext = () => {
  const maxIndex = filteredGenres.value.length + (canCreateNew.value ? 1 : 0) - 1
  if (maxIndex >= 0) {
    highlightedIndex.value = highlightedIndex.value < maxIndex ? highlightedIndex.value + 1 : 0
  }
}

const highlightPrevious = () => {
  const maxIndex = filteredGenres.value.length + (canCreateNew.value ? 1 : 0) - 1
  if (maxIndex >= 0) {
    highlightedIndex.value = highlightedIndex.value > 0 ? highlightedIndex.value - 1 : maxIndex
  }
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  searchTerm.value = newValue
}, { immediate: true })

// Close dropdown when clicking outside
onMounted(() => {
  const handleClickOutside = (event) => {
    const dropdown = event.target.closest('.dropdown')
    if (!dropdown && isOpen.value) {
      closeDropdown()
    }
  }
  
  document.addEventListener('click', handleClickOutside)
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})
</script> 