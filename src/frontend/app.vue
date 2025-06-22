<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
// Initialize theme management globally
const { loadSavedTheme } = useTheme()

onMounted(() => {
  // Initialize theme
  loadSavedTheme()
})

// Also initialize theme for SSR/client hydration
if (process.client) {
  loadSavedTheme()
}
</script>
