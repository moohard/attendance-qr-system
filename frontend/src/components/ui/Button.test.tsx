import { describe, it, expect, vi } from 'vitest' // ✅ Import vi
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button Component', () => {
    it('should render button with text', () => {
        render(<Button>Click me</Button>)
        expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('should handle click events', async () => {
        const handleClick = vi.fn()
        const user = userEvent.setup()

        render(<Button onClick={handleClick}>Click me</Button>)

        await user.click(screen.getByText('Click me'))
        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should be disabled when loading', () => {
        render(<Button loading>Click me</Button>)
        expect(screen.getByText('Click me')).toBeDisabled()
    })

    it('should show loading spinner when loading', () => {
        render(<Button loading>Click me</Button>)
        expect(screen.getByRole('status')).toBeInTheDocument()
    })
})