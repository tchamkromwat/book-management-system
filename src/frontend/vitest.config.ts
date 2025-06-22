import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
    test: {
        environment: 'happy-dom',
        globals: true,
        include: [
            'test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
            '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
        ]
    }
}) 