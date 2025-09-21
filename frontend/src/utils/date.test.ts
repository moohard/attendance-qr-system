import { describe, it, expect } from 'vitest'
import { formatDate, formatTime, isToday } from './date'

describe('Date Utilities', () => {
    describe('formatDate', () => {
        it('should format date correctly', () => {
            const date = '2024-01-15T10:30:00Z'
            const formatted = formatDate(date)
            expect(formatted).toMatch(/Januari|January/) // Match month in Indonesian or English
        })

        it('should handle invalid date', () => {
            const formatted = formatDate('invalid-date')
            expect(formatted).toBe('Invalid Date')
        })
    })

    describe('formatTime', () => {
        it('should format time correctly', () => {
            const date = '2024-01-15T10:30:00Z'
            const formatted = formatTime(date)
            expect(formatted).toMatch(/\d{1,2}:\d{2}/) // Match time format
        })
    })

    describe('isToday', () => {
        it('should return true for today date', () => {
            const today = new Date().toISOString()
            expect(isToday(today)).toBe(true)
        })

        it('should return false for different date', () => {
            const pastDate = '2023-01-15T10:30:00Z'
            expect(isToday(pastDate)).toBe(false)
        })
    })
})