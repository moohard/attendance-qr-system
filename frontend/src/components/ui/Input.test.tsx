import { describe, it, expect } from 'vitest'
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
        render(<Input label="Test Input" />)

        const input = screen.getByLabelText('Test Input')
        await user.type(input, 'Hello World')

        expect(input).toHaveValue('Hello World')
    })

    it('should show error message', () => {
        render(<Input label="Test Input" error="This field is required" />)
        expect(screen.getByText('This field is required')).toBeInTheDocument()
    })
})