<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
// Initialize authentication on app startup
const authStore = useAuthStore()

onMounted(() => {
  authStore.initAuth()
})
</script>
