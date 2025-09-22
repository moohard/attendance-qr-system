import { useEffect, useState } from 'react';
import { Download, FileText, Calendar, Filter } from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';
import { DataTable } from '../../components/admin/DataTable';
import { ReportFilters } from '../../components/admin/ReportFilters';
import { ReportGenerationForm } from '../../components/admin/ReportGenerationForm';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { Report, ReportFilters as ReportFiltersType, ReportGenerationRequest } from '../../types';

export const ReportsManagementPage = () => {
    const { getReports, generateReport, downloadReport, isLoading } = useAdmin();
    const [reports, setReports] = useState<Report[]>([]);
    const [pagination, setPagination] = useState({ page: 1, perPage: 10, total: 0 });
    const [filters, setFilters] = useState<ReportFiltersType>({});
    const [showGenerateForm, setShowGenerateForm] = useState(false);

    useEffect(() => {
        loadReports();
    }, [pagination.page, filters]);

    const loadReports = async () => {
        try {
            const response = await getReports(pagination.page, pagination.perPage, filters);
            setReports(response.data);
            setPagination(prev => ({
                ...prev,
                total: response.total,
                from: response.from,
                to: response.to
            }));
        } catch (error) {
            console.error('Failed to load reports:', error);
        }
    };

    const handleGenerateReport = async (data: ReportGenerationRequest) => {
        await generateReport(data);
        setShowGenerateForm(false);
        await loadReports();
    };

    const handleDownloadReport = async (report: Report) => {
        try {
            const blob = await downloadReport(report.id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `report-${report.period}.${report.file_path?.includes('.pdf') ? 'pdf' : 'xlsx'}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download report:', error);
        }
    };

    const columns = [
        { header: 'Period', accessor: 'period' },
        {
            header: 'Type',
            accessor: (report: Report) => report.attendance_type?.name || 'All Types'
        },
        {
            header: 'Status',
            accessor: (report: Report) => (
                <span className={`px-2 py-1 rounded-full text-xs ${report.is_signed
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {report.is_signed ? 'Signed' : 'Pending'}
                </span>
            )
        },
        { header: 'Created', accessor: (report: Report) => new Date(report.created_at).toLocaleDateString() },
        {
            header: 'Actions',
            accessor: (report: Report) => (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadReport(report)}
                    disabled={!report.file_path}
                >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                </Button>
            )
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reports Management</h1>
                    <p className="text-gray-600">Generate and manage attendance reports</p>
                </div>
                <Button onClick={() => setShowGenerateForm(true)}>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                </Button>
            </div>

            {/* Filters */}
            <ReportFilters onFilter={setFilters} loading={isLoading} />

            {/* Generate Report Modal */}
            {showGenerateForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="max-w-md w-full">
                        <ReportGenerationForm
                            onSubmit={handleGenerateReport}
                            onCancel={() => setShowGenerateForm(false)}
                            loading={isLoading}
                        />
                    </div>
                </div>
            )}

            {/* Reports Table */}
            <DataTable
                columns={columns}
                data={reports}
                loading={isLoading}
                title={`Reports (${pagination.total})`}
            />

            {/* Pagination */}
            {pagination.total > 0 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">
                        Showing {pagination.from} to {pagination.to} of {pagination.total} results
                    </p>
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page === 1}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page * pagination.perPage >= pagination.total}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};