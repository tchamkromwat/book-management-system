// API Response Types
export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    meta?: PaginationMeta;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

// Book Types
export interface Book {
    id: number;
    title: string;
    author: string;
    published_year?: number;
    genre?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBookDto {
    title: string;
    author: string;
    published_year?: number;
    genre?: string;
}

export interface UpdateBookDto extends Partial<CreateBookDto> { }

export interface BookQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    genre?: string;
    year?: number;
    sortBy?: 'title' | 'author' | 'published_year' | 'createdAt';
    sortOrder?: 'ASC' | 'DESC';
}

// User Types
export interface User {
    id: number;
    username: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    role: string;
    is_active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface RegisterDto {
    username: string;
    password: string;
}

export interface LoginDto {
    username: string;
    password: string;
}

// Auth Types
export interface AuthResponse {
    user: User;
    access_token: string;
}

// Backend API Response wrapper (from TransformInterceptor)
export interface BackendResponse<T> {
    success: boolean;
    message: string;
    data: T;
    meta?: PaginationMeta;
}

// Form Types
export interface FormState {
    loading: boolean;
    error: string | null;
    success: boolean;
}

// Filter Types
export interface BookFilters {
    search: string;
    genre: string;
    year: number | null;
    sortBy: string;
    sortOrder: string;
}

// Stats Types
export interface BookStats {
    totalBooks: number;
    totalGenres: number;
    booksThisYear: number;
    averageYear: number;
}

// Error Types
export interface ApiError {
    message: string;
    statusCode: number;
    error?: string;
} 