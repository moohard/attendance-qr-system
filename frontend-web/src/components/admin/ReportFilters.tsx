import { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import type { ReportFilters } from '../../types';

interface ReportFiltersProps {
    onFilter: (filters: ReportFilters) => void;
    loading?: boolean;
}

export const ReportFilters = ({ onFilter, loading }: ReportFiltersProps) => {
    const [filters, setFilters] = useState<ReportFilters>({});
    const [showFilters, setShowFilters] = useState(false);

    const handleFilterChange = (key: keyof ReportFilters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleApplyFilters = () => {
        onFilter(filters);
    };

    const handleClearFilters = () => {
        const clearedFilters = {};
        setFilters(clearedFilters);
        onFilter(clearedFilters);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Report Filters</h3>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </Button>
                </div>
            </CardHeader>

            {showFilters && (
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Period
                            </label>
                            <input
                                type="month"
                                value={filters.period || ''}
                                onChange={(e) => handleFilterChange('period', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                value={filters.is_signed?.toString() || ''}
                                onChange={(e) => handleFilterChange('is_signed', e.target.value === 'true')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">All Status</option>
                                <option value="true">Signed</option>
                                <option value="false">Unsigned</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={filters.start_date || ''}
                                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={filters.end_date || ''}
                                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    <div className="flex space-x-3 mt-4">
                        <Button onClick={handleApplyFilters} loading={loading}>
                            Apply Filters
                        </Button>
                        <Button variant="outline" onClick={handleClearFilters}>
                            Clear Filters
                        </Button>
                    </div>
                </CardContent>
            )}
        </Card>
    );
};