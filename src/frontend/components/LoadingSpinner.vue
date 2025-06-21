<template>
  <div :class="containerClass">
    <svg 
      :class="spinnerClass" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        class="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        stroke-width="4"
      ></circle>
      <path 
        class="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <p v-if="message" :class="messageClass">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'white' | 'gray'
  message?: string
  centered?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'blue',
  message: '',
  centered: false
})

const containerClass = computed(() => {
  const classes = []
  
  if (props.centered) {
    classes.push('flex flex-col items-center justify-center')
  } else {
    classes.push('flex items-center')
  }
  
  return classes.join(' ')
})

const spinnerClass = computed(() => {
  const classes = ['animate-spin']
  
  // Size classes
  switch (props.size) {
    case 'sm':
      classes.push('h-4 w-4')
      break
    case 'lg':
      classes.push('h-8 w-8')
      break
    default:
      classes.push('h-6 w-6')
  }
  
  // Color classes
  switch (props.color) {
    case 'white':
      classes.push('text-white')
      break
    case 'gray':
      classes.push('text-gray-600')
      break
    default:
      classes.push('text-blue-600')
  }
  
  return classes.join(' ')
})

const messageClass = computed(() => {
  const classes = ['text-sm']
  
  if (props.centered) {
    classes.push('mt-2 text-center')
  } else {
    classes.push('ml-2')
  }
  
  switch (props.color) {
    case 'white':
      classes.push('text-white')
      break
    case 'gray':
      classes.push('text-gray-600')
      break
    default:
      classes.push('text-gray-700')
  }
  
  return classes.join(' ')
})
</script> 