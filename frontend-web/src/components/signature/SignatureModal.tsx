import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { SignatureCanvas } from './SignatureCanvas';
import { Button } from '../ui/Button';
import { Download, RotateCcw } from 'lucide-react';

interface SignatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (signatureData: string) => Promise<void>;
    title?: string;
    description?: string;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
    isOpen,
    onClose,
    onSave,
    title = 'Sign Document',
    description = 'Please provide your signature below',
}) => {
    const [isSaving, setIsSaving] = useState(false);
    const [signatureData, setSignatureData] = useState<string | null>(null);

    const handleSave = async (data: string) => {
        try {
            setIsSaving(true);
            setSignatureData(data);
            await onSave(data);
            onClose();
        } catch (error) {
            console.error('Error saving signature:', error);
            alert('Failed to save signature. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        if (signatureData && !window.confirm('Are you sure you want to cancel? Your signature will be lost.')) {
            return;
        }
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={title}
            size="lg"
        >
            <div className="p-6">
                <div className="mb-4">
                    <p className="text-gray-600">{description}</p>
                </div>

                <SignatureCanvas
                    onSave={handleSave}
                    onCancel={handleClose}
                    width={500}
                    height={200}
                    penColor="#000000"
                    penWidth={2}
                />

                <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        Your signature will be encrypted and stored securely
                    </div>

                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => signatureData && handleSave(signatureData)}
                            disabled={!signatureData || isSaving}
                            loading={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Confirm Signature'}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};