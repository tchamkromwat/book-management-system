import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LoadingSpinner from '~/components/LoadingSpinner.vue'

describe('LoadingSpinner', () => {
    it('renders properly', () => {
        const wrapper = mount(LoadingSpinner)
        expect(wrapper.exists()).toBe(true)
    })

    it('displays loading message when provided', () => {
        const message = 'Loading books...'
        const wrapper = mount(LoadingSpinner, {
            props: { message }
        })
        expect(wrapper.text()).toContain(message)
    })
}) 