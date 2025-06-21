import type { AuthResponse, LoginDto, RegisterDto, User } from '~/types'

export const useAuthStore = defineStore('auth', () => {
    // State
    const user = ref<User | null>(null)
    const token = ref<string | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    // Getters
    const isAuthenticated = computed(() => !!token.value)
    const fullName = computed(() => {
        if (!user.value) return ''
        const firstName = user.value.first_name || ''
        const lastName = user.value.last_name || ''
        if (!firstName && !lastName) return user.value.username
        return `${firstName} ${lastName}`.trim()
    })

    // Actions
    const setAuth = (authData: AuthResponse) => {
        user.value = authData.user
        token.value = authData.access_token

        // Store token in cookie
        const tokenCookie = useCookie('auth-token', {
            default: () => null,
            maxAge: 60 * 60 * 24 * 7, // 7 days
            httpOnly: false,
            secure: true,
            sameSite: 'strict'
        })
        tokenCookie.value = authData.access_token

        error.value = null
    }

    const clearAuth = () => {
        user.value = null
        token.value = null

        // Clear token cookie
        const tokenCookie = useCookie('auth-token')
        tokenCookie.value = null

        error.value = null
    }

    const login = async (credentials: LoginDto) => {
        loading.value = true
        error.value = null

        try {
            const config = useRuntimeConfig()
            const response = await $fetch<AuthResponse>(`${config.public.apiBase}/auth/login`, {
                method: 'POST',
                body: credentials
            })
            setAuth(response)
            return response
        } catch (err: any) {
            error.value = err.data?.message || 'Login failed'
            throw err
        } finally {
            loading.value = false
        }
    }

    const register = async (userData: RegisterDto) => {
        loading.value = true
        error.value = null

        try {
            const config = useRuntimeConfig()
            const response = await $fetch<AuthResponse>(`${config.public.apiBase}/auth/register`, {
                method: 'POST',
                body: userData
            })
            setAuth(response)
            return response
        } catch (err: any) {
            error.value = err.data?.message || 'Registration failed'
            throw err
        } finally {
            loading.value = false
        }
    }

    const logout = async () => {
        clearAuth()
        await navigateTo('/auth/login')
    }

    const fetchProfile = async () => {
        if (!token.value) return

        try {
            const { get } = useApi()
            const response = await get<User>('/auth/profile')
            user.value = response.data
        } catch (err: any) {
            // If profile fetch fails, likely token is invalid
            clearAuth()
            throw err
        }
    }

    const initAuth = () => {
        // Initialize auth from cookie
        const tokenCookie = useCookie('auth-token')
        if (tokenCookie.value) {
            token.value = tokenCookie.value
            // Fetch profile to validate token
            fetchProfile().catch(() => {
                // Token is invalid, clear auth
                clearAuth()
            })
        }
    }

    return {
        // State
        user: readonly(user),
        token: readonly(token),
        loading: readonly(loading),
        error: readonly(error),

        // Getters
        isAuthenticated,
        fullName,

        // Actions
        login,
        register,
        logout,
        fetchProfile,
        initAuth,
        setAuth,
        clearAuth
    }
}) 