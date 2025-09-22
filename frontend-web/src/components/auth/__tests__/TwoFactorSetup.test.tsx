import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TwoFactorSetup } from '../TwoFactorSetup';
import { useAuth } from '../../../hooks/useAuth';

// Mock the useAuth hook
vi.mock('../../../hooks/useAuth');

describe('TwoFactorSetup', () => {
    const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        is_honorer: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as any).mockReturnValue({
            user: mockUser,
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
        });
    });

    it('renders 2FA setup component', () => {
        render(<TwoFactorSetup />);
        expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
    });

    it('shows enable button when 2FA is disabled', () => {
        render(<TwoFactorSetup />);
        expect(screen.getByText('Enable 2FA')).toBeInTheDocument();
    });

    it('shows QR code after enabling 2FA', async () => {
        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                secret: 'TEST_SECRET',
                qr_code_url: 'data:image/png;base64,test',
                message: '2FA enabled successfully',
            }),
        });

        render(<TwoFactorSetup />);

        fireEvent.click(screen.getByText('Enable 2FA'));

        await waitFor(() => {
            expect(screen.getByAltText('QR Code')).toBeInTheDocument();
        });
    });

    it('shows error when enabling 2FA fails', async () => {
        global.fetch = vi.fn().mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: 'Enable failed' }),
        });

        render(<TwoFactorSetup />);

        fireEvent.click(screen.getByText('Enable 2FA'));

        await waitFor(() => {
            expect(screen.getByText('Enable failed')).toBeInTheDocument();
        });
    });
});