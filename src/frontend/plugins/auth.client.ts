export default defineNuxtPlugin(async () => {
    const authStore = useAuthStore()

    // Initialize auth state from cookies if available
    await authStore.initAuth()
}) 