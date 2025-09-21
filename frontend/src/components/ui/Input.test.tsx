import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'

describe('Input Component', () => {
    it('should render input with label', () => {
        render(<Input label="Test Input" />)
        expect(screen.getByLabelText('Test Input')).toBeInTheDocument()
    })

    it('should handle input changes', async () => {
        const user = userEvent.setup()
        const handleChange = vi.fn()

        render(<Input label="Test Input" onChange={handleChange} />)
        const input = screen.getByLabelText('Test Input')

        await user.type(input, 'Hello World')
        expect(input).toHaveValue('Hello World')
        expect(handleChange).toHaveBeenCalledTimes(11) // Called for each key press
    })

    it('should show error message', () => {
        render(<Input label="Test Input" error="This field is required" />)
        expect(screen.getByText('This field is required')).toBeInTheDocument()
        expect(screen.getByLabelText('Test Input')).toHaveClass('border-red-500')
    })

    it('should forward ref', () => {
        const ref = vi.fn()
        render(<Input label="Test Input" ref={ref} />)
        expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement))
    })
})