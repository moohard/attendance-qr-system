import { useState, useCallback } from 'react';
import { api } from '../services/api';

export const useSignature = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const saveSignature = useCallback(async (signatureData: string, documentId?: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await api.post('/signatures/save', {
                signature_data: signatureData,
                document_id: documentId,
            });

            return response.data;
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.message || 'Failed to save signature';
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const verifySignature = useCallback(async (signatureId: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await api.get(`/signatures/${signatureId}/verify`);
            return response.data;
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.message || 'Failed to verify signature';
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getSignature = useCallback(async (signatureId: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await api.get(`/signatures/${signatureId}`);
            return response.data;
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.message || 'Failed to get signature';
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        isLoading,
        error,
        saveSignature,
        verifySignature,
        getSignature,
    };
};