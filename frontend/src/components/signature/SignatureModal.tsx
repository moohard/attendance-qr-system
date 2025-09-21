import React from 'react';
import { Modal } from '../ui/Modal';
import { SignatureCanvas } from './SignatureCanvas';

interface SignatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (signatureData: string) => void;
    title?: string;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
    isOpen,
    onClose,
    onSave,
    title = 'Sign Document',
}) => {
    const handleSave = (signatureData: string) => {
        onSave(signatureData);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="lg"
        >
            <div className="p-6">
                <SignatureCanvas
                    onSave={handleSave}
                    onCancel={onClose}
                    width={500}
                    height={200}
                />
            </div>
        </Modal>
    );
};