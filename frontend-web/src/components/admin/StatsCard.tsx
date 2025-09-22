import type { ReactNode } from 'react';
import { Card, CardContent } from '../ui/Card';
import { cn } from '../../utils/cn';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
}

export const StatsCard = ({ title, value, icon, trend, className }: StatsCardProps) => {
    return (
        <Card className={cn('hover:shadow-md transition-shadow', className)}>
            <CardContent className="p-6">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className="p-3 bg-primary-100 rounded-lg">
                            {icon}
                        </div>
                    </div>
                    <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                        {trend && (
                            <p className={cn(
                                'text-sm mt-1',
                                trend.isPositive ? 'text-green-600' : 'text-red-600'
                            )}>
                                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};