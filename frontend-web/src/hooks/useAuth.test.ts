import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuth } from './useAuth'
import { authAPI } from '../services/api'

// Mock the API
vi.mock('../services/api', () => ({
    authAPI: {
        login: vi.fn(),
        logout: vi.fn(),
        getProfile: vi.fn(),
    },
}))

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('useAuth Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        localStorageMock.clear()
    })

    it('should initialize with no user', () => {
        localStorageMock.getItem.mockReturnValue(null)

        const { result } = renderHook(() => useAuth())

        expect(result.current.user).toBeNull()
        expect(result.current.isAuthenticated).toBe(false)
    })

    it('should login successfully', async () => {
        const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' }
        const mockResponse = { user: mockUser, access_token: 'test-token' }

        vi.mocked(authAPI.login).mockResolvedValue(mockResponse)

        const { result } = renderHook(() => useAuth())

        await act(async () => {
            const loginResult = await result.current.login('test@example.com', 'password')
            expect(loginResult.success).toBe(true)
        })

        expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'test-token')
        expect(localStorageMock.setItem).toHaveBeenCalledWith('user_data', JSON.stringify(mockUser))
        expect(result.current.user).toEqual(mockUser)
    })

    it('should handle login failure', async () => {
        vi.mocked(authAPI.login).mockRejectedValue(new Error('Login failed'))

        const { result } = renderHook(() => useAuth())

        await act(async () => {
            const loginResult = await result.current.login('test@example.com', 'wrong-password')
            expect(loginResult.success).toBe(false)
            expect(loginResult.error).toBe('Login failed')
        })

        expect(result.current.user).toBeNull()
    })
})