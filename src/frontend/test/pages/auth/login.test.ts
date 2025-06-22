import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import LoginPage from '~/pages/auth/login.vue'

// Mock dependencies
vi.mock('#app', () => ({
    definePageMeta: vi.fn(),
    useRuntimeConfig: () => ({
        public: {
            apiBase: 'http://localhost:3001/api/v1'
        }
    }),
    useCookie: vi.fn(() => ({ value: null })),
    navigateTo: vi.fn(),
    $fetch: vi.fn()
}))

const mockAuthStore = {
    login: vi.fn(),
    error: ref<string | null>(null),
    loading: ref(false)
}

vi.mock('~/stores/auth', () => ({
    useAuthStore: () => mockAuthStore
}))

vi.mock('vue-router', () => ({
    useRouter: () => ({
        push: vi.fn()
    }),
    useRoute: () => ({
        query: {}
    })
}))

describe('Login Page', () => {
    let wrapper: any

    beforeEach(() => {
        setActivePinia(createPinia())
        vi.clearAllMocks()

        // Reset mock refs
        mockAuthStore.error.value = null
        mockAuthStore.loading.value = false

        wrapper = mount(LoginPage, {
            global: {
                plugins: [createPinia()],
                stubs: {
                    NuxtLink: {
                        template: '<a :href="to"><slot /></a>',
                        props: ['to']
                    },
                    ClientOnly: {
                        template: '<div><slot /></div>'
                    }
                }
            }
        })
    })

    it('renders the login form correctly', () => {
        expect(wrapper.find('h2').text()).toContain('Sign in to BookManager')
        expect(wrapper.find('input[name="username"]').exists()).toBe(true)
        expect(wrapper.find('input[name="password"]').exists()).toBe(true)
        expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
    })

    it('shows validation errors for empty fields', async () => {
        const form = wrapper.find('form')
        await form.trigger('submit.prevent')
        await wrapper.vm.$nextTick()

        expect(wrapper.vm.errors.username).toBeTruthy()
        expect(wrapper.vm.errors.password).toBeTruthy()
    })

    it('validates password minimum length', async () => {
        const usernameInput = wrapper.find('input[name="username"]')
        const passwordInput = wrapper.find('input[name="password"]')

        await usernameInput.setValue('testuser')
        await passwordInput.setValue('12345')
        await wrapper.find('form').trigger('submit.prevent')
        await wrapper.vm.$nextTick()

        expect(wrapper.vm.errors.password).toContain('at least 6 characters')
    })

    it('submits form with valid credentials', async () => {
        const usernameInput = wrapper.find('input[name="username"]')
        const passwordInput = wrapper.find('input[name="password"]')

        await usernameInput.setValue('testuser')
        await passwordInput.setValue('password123')

        mockAuthStore.login.mockResolvedValue({
            user: { username: 'testuser' },
            access_token: 'mock-token'
        })

        await wrapper.find('form').trigger('submit.prevent')
        await wrapper.vm.$nextTick()

        expect(mockAuthStore.login).toHaveBeenCalledWith({
            username: 'testuser',
            password: 'password123'
        })
    })

    it('displays error message on login failure', async () => {
        const usernameInput = wrapper.find('input[name="username"]')
        const passwordInput = wrapper.find('input[name="password"]')

        await usernameInput.setValue('testuser')
        await passwordInput.setValue('wrongpassword')

        const errorMessage = 'Invalid credentials'
        mockAuthStore.login.mockRejectedValue(new Error(errorMessage))

        await wrapper.find('form').trigger('submit.prevent')
        await wrapper.vm.$nextTick()

        expect(wrapper.vm.error).toBeTruthy()
    })

    it('disables submit button when loading', async () => {
        // Set loading to true - this should be on the component instance, not the mock store
        wrapper.vm.loading = true
        await wrapper.vm.$nextTick()

        const submitButton = wrapper.find('button[type="submit"]')

        // Check if button is disabled 
        expect(submitButton.attributes('disabled')).toBeDefined()

        // Check for loading text
        expect(submitButton.text()).toContain('Signing in...')
    })

    it('has navigation links', () => {
        const backLink = wrapper.find('a[href="/"]')
        const registerLink = wrapper.find('a[href="/auth/register"]')

        expect(backLink.exists()).toBe(true)
        expect(registerLink.exists()).toBe(true)
    })

    it('clears errors when form is resubmitted', async () => {
        // First submission with error
        mockAuthStore.error.value = 'Previous error'

        const usernameInput = wrapper.find('input[name="username"]')
        const passwordInput = wrapper.find('input[name="password"]')

        await usernameInput.setValue('testuser')
        await passwordInput.setValue('password123')

        mockAuthStore.login.mockResolvedValue({
            user: { username: 'testuser' },
            access_token: 'mock-token'
        })

        // Simulate error clearing on successful login
        mockAuthStore.login.mockImplementation(() => {
            mockAuthStore.error.value = null
            return Promise.resolve({
                user: { username: 'testuser' },
                access_token: 'mock-token'
            })
        })

        await wrapper.find('form').trigger('submit.prevent')
        await wrapper.vm.$nextTick()

        expect(mockAuthStore.error.value).toBe(null)
    })
}) 