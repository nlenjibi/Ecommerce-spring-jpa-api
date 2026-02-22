/**
 * Base API Response types
 */

export interface StandardResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
    errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    last: boolean;
    first: boolean;
    empty: boolean;
}
