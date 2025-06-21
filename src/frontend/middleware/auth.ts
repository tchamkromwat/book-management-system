export default defineNuxtRouteMiddleware((to: any) => {
    const { isAuthenticated } = useAuthStore()

    // If user is not authenticated, redirect to login
    if (!isAuthenticated) {
        return navigateTo('/auth/login')
    }
}) 