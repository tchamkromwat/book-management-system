import type { ApiResponse } from '~/types'

export const useApi = () => {
    const config = useRuntimeConfig()

    const api = $fetch.create({
        baseURL: config.public.apiBase,
        headers: {
            'Content-Type': 'application/json',
        },
        onRequest({ options }: { options: any }) {
            // Add auth token to requests
            const token = useCookie('auth-token')
            if (token.value) {
                options.headers = {
                    ...options.headers,
                    Authorization: `Bearer ${token.value}`,
                }
            }
        },
        onResponseError({ response }: { response: any }) {
            // Handle global error responses
            if (response.status === 401) {
                // Clear auth and redirect to login
                navigateTo('/auth/login')
            }
        }
    })

    return {
        api,
        // Helper methods
        get: <T>(url: string, params?: any): Promise<ApiResponse<T>> => {
            return api(url, { method: 'GET', params })
        },
        post: <T>(url: string, body?: any): Promise<ApiResponse<T>> => {
            return api(url, { method: 'POST', body })
        },
        put: <T>(url: string, body?: any): Promise<ApiResponse<T>> => {
            return api(url, { method: 'PUT', body })
        },
        patch: <T>(url: string, body?: any): Promise<ApiResponse<T>> => {
            return api(url, { method: 'PATCH', body })
        },
        delete: <T>(url: string): Promise<ApiResponse<T>> => {
            return api(url, { method: 'DELETE' })
        }
    }
} 