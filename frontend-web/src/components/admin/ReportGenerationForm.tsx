import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import type { ReportGenerationRequest } from '../../types';

interface ReportGenerationFormProps {
    onSubmit: (data: ReportGenerationRequest) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

export const ReportGenerationForm = ({ onSubmit, onCancel, loading }: ReportGenerationFormProps) => {
    const [error, setError] = useState('');
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ReportGenerationRequest>();

    const handleFormSubmit = async (data: ReportGenerationRequest) => {
        try {
            setError('');
            await onSubmit(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7);

    return (
        <Card>
            <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Generate Report</h3>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Period (Month)
                        </label>
                        <input
                            type="month"
                            defaultValue={currentMonth}
                            {...register('period', { required: 'Period is required' })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        {errors.period && (
                            <p className="text-sm text-red-600 mt-1">{errors.period.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Format
                        </label>
                        <select
                            {...register('format')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="pdf">PDF</option>
                            <option value="excel">Excel</option>
                        </select>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <Button type="submit" loading={loading} disabled={loading}>
                            Generate Report
                        </Button>
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};