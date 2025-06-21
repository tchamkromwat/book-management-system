export default defineNuxtRouteMiddleware((to: any) => {
    const { isAuthenticated } = useAuthStore()

    // If user is already authenticated, redirect to books page
    if (isAuthenticated) {
        return navigateTo('/books')
    }
}) 