import type { ReactNode } from 'react';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Card, CardContent, CardHeader } from '../ui/Card';

export interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => ReactNode);
    className?: string;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    loading?: boolean;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    title?: string;
    actionText?: string;
    onAction?: () => void;
}

export function DataTable<T extends { id: number }>({
    columns,
    data,
    loading = false,
    onEdit,
    onDelete,
    title,
    actionText,
    onAction,
}: DataTableProps<T>) {
    const getValue = (item: T, accessor: Column<T>['accessor']) => {
        if (typeof accessor === 'function') {
            return accessor(item);
        }
        return item[accessor] as ReactNode;
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="py-12">
                    <div className="flex items-center justify-center">
                        <LoadingSpinner size="lg" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            {(title || actionText) && (
                <CardHeader className="flex flex-row items-center justify-between">
                    {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
                    {actionText && onAction && (
                        <Button onClick={onAction} size="sm">
                            {actionText}
                        </Button>
                    )}
                </CardHeader>
            )}
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {columns.map((column, index) => (
                                    <th
                                        key={index}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        {column.header}
                                    </th>
                                ))}
                                {(onEdit || onDelete) && (
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    {columns.map((column, colIndex) => (
                                        <td
                                            key={colIndex}
                                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                        >
                                            {getValue(item, column.accessor)}
                                        </td>
                                    ))}
                                    {(onEdit || onDelete) && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            {onEdit && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onEdit(item)}
                                                >
                                                    Edit
                                                </Button>
                                            )}
                                            {onDelete && (
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => onDelete(item)}
                                                >
                                                    Delete
                                                </Button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {data.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No data available</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}