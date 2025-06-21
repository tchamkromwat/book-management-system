import type { ApiResponse, Book, BookQueryParams, CreateBookDto, PaginationMeta, UpdateBookDto } from '~/types'

export const useBooks = () => {
    const { api } = useApi()

    // State
    const books = ref<Book[]>([])
    const currentBook = ref<Book | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const pagination = ref<PaginationMeta>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    })

    // Fetch all books with optional filtering
    const fetchBooks = async (params?: BookQueryParams) => {
        loading.value = true
        error.value = null

        try {
            const response = await api<ApiResponse<Book[]>>('/books', {
                method: 'GET',
                params
            })

            books.value = response.data
            if (response.meta) {
                pagination.value = response.meta
            }

            return response
        } catch (err: any) {
            error.value = err.data?.message || 'Failed to fetch books'
            throw err
        } finally {
            loading.value = false
        }
    }

    // Fetch single book by ID
    const fetchBook = async (id: number | string) => {
        loading.value = true
        error.value = null

        try {
            const response = await api<ApiResponse<Book>>(`/books/${id}`)
            currentBook.value = response.data
            return response.data
        } catch (err: any) {
            error.value = err.data?.message || 'Failed to fetch book'
            throw err
        } finally {
            loading.value = false
        }
    }

    // Create new book
    const createBook = async (bookData: CreateBookDto) => {
        loading.value = true
        error.value = null

        try {
            const response = await api<ApiResponse<Book>>('/books', {
                method: 'POST',
                body: bookData
            })

            // Add to local books array
            books.value.unshift(response.data)

            return response.data
        } catch (err: any) {
            error.value = err.data?.message || 'Failed to create book'
            throw err
        } finally {
            loading.value = false
        }
    }

    // Update existing book
    const updateBook = async (id: number | string, bookData: UpdateBookDto) => {
        loading.value = true
        error.value = null

        try {
            const response = await api<ApiResponse<Book>>(`/books/${id}`, {
                method: 'PATCH',
                body: bookData
            })

            // Update local books array
            const index = books.value.findIndex(book => book.id === Number(id))
            if (index !== -1) {
                books.value[index] = response.data
            }

            // Update current book if it's the same
            if (currentBook.value?.id === Number(id)) {
                currentBook.value = response.data
            }

            return response.data
        } catch (err: any) {
            error.value = err.data?.message || 'Failed to update book'
            throw err
        } finally {
            loading.value = false
        }
    }

    // Delete book
    const deleteBook = async (id: number | string) => {
        loading.value = true
        error.value = null

        try {
            await api<ApiResponse<void>>(`/books/${id}`, {
                method: 'DELETE'
            })

            // Remove from local books array
            books.value = books.value.filter(book => book.id !== Number(id))

            // Clear current book if it's the same
            if (currentBook.value?.id === Number(id)) {
                currentBook.value = null
            }

            return true
        } catch (err: any) {
            error.value = err.data?.message || 'Failed to delete book'
            throw err
        } finally {
            loading.value = false
        }
    }

    // Get available genres
    const fetchGenres = async () => {
        try {
            const response = await api<ApiResponse<string[]>>('/books/genres')
            return response.data
        } catch (err: any) {
            error.value = err.data?.message || 'Failed to fetch genres'
            throw err
        }
    }

    // Get book statistics
    const fetchStats = async () => {
        try {
            const response = await api<ApiResponse<any>>('/books/stats')
            return response.data
        } catch (err: any) {
            error.value = err.data?.message || 'Failed to fetch stats'
            throw err
        }
    }

    return {
        // State
        books: readonly(books),
        currentBook: readonly(currentBook),
        loading: readonly(loading),
        error: readonly(error),
        pagination: readonly(pagination),

        // Actions
        fetchBooks,
        fetchBook,
        createBook,
        updateBook,
        deleteBook,
        fetchGenres,
        fetchStats
    }
} 