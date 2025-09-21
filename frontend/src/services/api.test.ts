// api.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, handleApiError } from './api'

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
}

// Set global localStorage mock
Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true,
})

// Mock axios
vi.mock('axios', () => {
    return {
        default: {
            create: vi.fn(() => ({
                interceptors: {
                    request: {
                        use: vi.fn((callback) => {
                            // Simulate request interceptor
                            callback({ headers: {} })
                        }),
                        eject: vi.fn()
                    },
                    response: { use: vi.fn(), eject: vi.fn() },
                },
                get: vi.fn(),
                post: vi.fn(),
                put: vi.fn(),
                delete: vi.fn(),
            })),
        },
    }
})

describe('API Service', () => {
    describe('handleApiError', () => {
        it('should handle Error instance', () => {
            const error = new Error('Test error')
            const result = handleApiError(error)
            expect(result).toBe('Test error')
        })

        it('should handle string error', () => {
            const result = handleApiError('Test error')
            expect(result).toBe('Test error') // ✅ Sekarang akan pass
        })

        it('should handle unknown error', () => {
            const result = handleApiError({})
            expect(result).toBe('An unexpected error occurred')
        })
    })

    describe('API Interceptors', () => {
        beforeEach(() => {
            vi.clearAllMocks()
            localStorageMock.clear()
        })

        it('should add authorization header when token exists', async () => {
            // Mock localStorage untuk return token
            localStorageMock.getItem.mockReturnValue('test-token')

            // Test interceptor request
            const requestConfig = { headers: {} }
            const interceptor = api.interceptors.request.use
            const callback = interceptor.mock.calls[0][0] // Get the callback

            const result = callback(requestConfig)

            expect(result.headers.Authorization).toBe('Bearer test-token')
            expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_token')
        })

        it('should not add authorization header when no token exists', async () => {
            localStorageMock.getItem.mockReturnValue(null)

            const requestConfig = { headers: {} }
            const interceptor = api.interceptors.request.use
            const callback = interceptor.mock.calls[0][0]

            const result = callback(requestConfig)

            expect(result.headers.Authorization).toBeUndefined()
        })
    })
})