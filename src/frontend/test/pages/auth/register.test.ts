import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import RegisterPage from '~/pages/auth/register.vue'

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
    register: vi.fn(),
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

describe('Register Page', () => {
    let wrapper: any

    beforeEach(() => {
        setActivePinia(createPinia())
        vi.clearAllMocks()

        // Reset mock refs
        mockAuthStore.error.value = null
        mockAuthStore.loading.value = false

        wrapper = mount(RegisterPage, {
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

    it('renders the registration form correctly', () => {
        expect(wrapper.find('h2').text()).toContain('Create your account')
        expect(wrapper.find('input[name="username"]').exists()).toBe(true)
        expect(wrapper.find('input[name="password"]').exists()).toBe(true)
        expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
    })

    it('shows validation errors for empty fields', async () => {
        const form = wrapper.find('form')
        await form.trigger('submit.prevent')

        await wrapper.vm.$nextTick()

        // Should show validation errors
        const usernameError = wrapper.find('span.text-error')
        expect(usernameError.exists()).toBe(true)
    })

    it('validates username requirements', async () => {
        const usernameInput = wrapper.find('input[name="username"]')

        // Test short username
        await usernameInput.setValue('ab')
        await wrapper.find('form').trigger('submit.prevent')
        await wrapper.vm.$nextTick()

        expect(wrapper.vm.errors.username).toContain('at least 3 characters')

        // Test long username
        await usernameInput.setValue('a'.repeat(51))
        await wrapper.find('form').trigger('submit.prevent')
        await wrapper.vm.$nextTick()

        expect(wrapper.vm.errors.username).toContain('less than 50 characters')
    })

    it('validates password requirements', async () => {
        const passwordInput = wrapper.find('input[name="password"]')

        // Test short password
        await passwordInput.setValue('12345')
        await wrapper.find('form').trigger('submit.prevent')
        await wrapper.vm.$nextTick()

        expect(wrapper.vm.errors.password).toContain('at least 6 characters')
    })

    it('submits form with valid data', async () => {
        const usernameInput = wrapper.find('input[name="username"]')
        const passwordInput = wrapper.find('input[name="password"]')

        await usernameInput.setValue('testuser')
        await passwordInput.setValue('password123')

        mockAuthStore.register.mockResolvedValue({ user: { username: 'testuser' } })

        await wrapper.find('form').trigger('submit.prevent')
        await wrapper.vm.$nextTick()

        expect(mockAuthStore.register).toHaveBeenCalledWith({
            username: 'testuser',
            password: 'password123'
        })
    })

    it('displays error message on registration failure', async () => {
        const usernameInput = wrapper.find('input[name="username"]')
        const passwordInput = wrapper.find('input[name="password"]')

        await usernameInput.setValue('testuser')
        await passwordInput.setValue('password123')

        const errorMessage = 'Username already exists'
        mockAuthStore.register.mockRejectedValue(new Error(errorMessage))
        mockAuthStore.error.value = errorMessage

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
        expect(submitButton.text()).toContain('Creating Account...')
    })

    it('has navigation links', () => {
        const backLink = wrapper.find('a[href="/"]')
        const loginLink = wrapper.find('a[href="/auth/login"]')

        expect(backLink.exists()).toBe(true)
        expect(loginLink.exists()).toBe(true)
    })

    it('handles theme switching', async () => {
        const themeButtons = wrapper.findAll('.dropdown-content button')
        expect(themeButtons.length).toBeGreaterThan(0)

        if (themeButtons.length > 0) {
            await themeButtons[0].trigger('click')
            expect(wrapper.vm.currentTheme).toBeDefined()
        }
    })
}) 