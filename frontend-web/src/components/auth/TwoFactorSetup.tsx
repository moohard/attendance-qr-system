import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { useAuth } from '../../hooks/useAuth';

interface TwoFactorStatus {
    enabled: boolean;
    // qr_code_url?: string;
    // secret?: string;
    // recovery_codes?: string[];
}

export const TwoFactorSetup: React.FC = () => {
    const [code, setCode] = useState('');
    const [isEnabling, setIsEnabling] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [secret, setSecret] = useState('');
    const [status, setStatus] = useState<TwoFactorStatus | null>(null);
    const { user } = useAuth();
    const [enableError, setEnableError] = useState('');
    const [verifyError, setVerifyError] = useState('');

    const enable2FA = async () => {
        try {
            setIsEnabling(true);
            setEnableError('');
            const response = await fetch('/api/2fa/enable', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to enable 2FA');
            }

            const data = await response.json();
            setQrCodeUrl(data.qr_code_url);
            setSecret(data.secret);
        } catch (error) {
            console.error('Error enabling 2FA:', error);
            setEnableError(error instanceof Error ? error.message : 'Failed to enable 2FA');
        } finally {
            setIsEnabling(false);
        }
    };

    const verify2FA = async () => {
        try {
            setIsVerifying(true);
            setVerifyError('');

            const response = await fetch('/api/2fa/verify', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
            });

            if (!response.ok) {
                throw new Error('Invalid verification code');
            }

            alert('2FA enabled successfully!');
            setCode('');
            setQrCodeUrl('');
            loadStatus();
        } catch (error) {
            console.error('Error verifying 2FA:', error);
            setVerifyError(error instanceof Error ? error.message : 'Invalid verification code');
        } finally {
            setIsVerifying(false);
        }
    };

    const disable2FA = async () => {
        if (!confirm('Are you sure you want to disable 2FA?')) {
            return;
        }

        try {
            const response = await fetch('/api/2fa/disable', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to disable 2FA');
            }

            alert('2FA disabled successfully!');
            loadStatus();
        } catch (error) {
            console.error('Error disabling 2FA:', error);
        }
    };

    const loadStatus = async () => {
        try {
            const response = await fetch('/api/2fa/status', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setStatus(data);
            }
        } catch (error) {
            console.error('Error loading 2FA status:', error);
        }
    };

    React.useEffect(() => {
        loadStatus();
    }, []);

    if (!user) return null;

    return (
        <Card>
            <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {enableError && (
                        <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{enableError}</p>
                        </div>
                    )}

                    {verifyError && (
                        <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{verifyError}</p>
                        </div>
                    )}
                    {status?.enabled ? (
                        <div>
                            <p className="text-green-600 mb-4">✓ 2FA is enabled for your account</p>
                            <Button variant="danger" onClick={disable2FA}>
                                Disable 2FA
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {!qrCodeUrl ? (
                                <div>
                                    <p className="text-gray-600 mb-4">
                                        Add an extra layer of security to your account by enabling two-factor authentication.
                                    </p>
                                    <Button onClick={enable2FA} loading={isEnabling}>
                                        Enable 2FA
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            Scan this QR code with your authenticator app:
                                        </p>
                                        {qrCodeUrl && (
                                            <img
                                                src={qrCodeUrl}
                                                alt="QR Code"
                                                className="w-48 h-48 mx-auto mb-4"
                                            />
                                        )}
                                        <p className="text-sm text-gray-600 mb-2">
                                            Or enter this secret key manually:
                                        </p>
                                        <code className="block p-2 bg-gray-100 rounded text-sm mb-4">
                                            {secret}
                                        </code>
                                    </div>

                                    <div>
                                        <Input
                                            label="Verification Code"
                                            placeholder="Enter 6-digit code"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                            maxLength={6}
                                        />
                                        <Button
                                            onClick={verify2FA}
                                            loading={isVerifying}
                                            disabled={code.length !== 6}
                                            className="mt-2"
                                        >
                                            Verify & Enable
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};