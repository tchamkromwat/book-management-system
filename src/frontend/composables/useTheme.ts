export const useTheme = () => {
    const currentTheme = ref('light')

    const setTheme = (theme: string) => {
        currentTheme.value = theme
        if (typeof window !== 'undefined') {
            // Set theme on both html and body elements for better compatibility
            document.documentElement.setAttribute('data-theme', theme)
            document.body.setAttribute('data-theme', theme)

            // Also add theme class for additional CSS support if needed
            document.documentElement.className = theme

            // Save to localStorage
            localStorage.setItem('bookmanager-theme', theme)
        }
    }

    const loadSavedTheme = () => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('bookmanager-theme') || 'light'
            setTheme(savedTheme)
        }
    }

    const toggleTheme = () => {
        const newTheme = currentTheme.value === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
    }

    // Available themes
    const themes = [
        { name: 'light', label: 'Light', emoji: '🌞' },
        { name: 'dark', label: 'Dark', emoji: '🌙' },
    ]

    // Initialize theme on first load
    if (typeof window !== 'undefined') {
        // Check if theme is already set, if not load from storage
        const currentDataTheme = document.documentElement.getAttribute('data-theme')
        if (!currentDataTheme) {
            loadSavedTheme()
        } else {
            currentTheme.value = currentDataTheme
        }
    }

    return {
        currentTheme: readonly(currentTheme),
        setTheme,
        loadSavedTheme,
        toggleTheme,
        themes
    }
} 