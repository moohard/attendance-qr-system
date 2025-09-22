import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';
import type { User } from '../../types';

interface UserFormProps {
    user?: User;
    onSubmit: (data: UserFormData) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

interface UserFormData {
    name: string;
    email: string;
    password?: string;
    password_confirmation?: string;
    role: 'admin' | 'user';
    is_honorer: boolean;
}

export const UserForm = ({ user, onSubmit, onCancel, loading }: UserFormProps) => {
    const [error, setError] = useState('');
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<UserFormData>({
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            role: user?.role || 'user',
            is_honorer: user?.is_honorer || false,
        },
    });

    const password = watch('password');

    const handleFormSubmit = async (data: UserFormData) => {
        try {
            setError('');
            await onSubmit(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    return (
        <Card>
            <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">
                    {user ? 'Edit User' : 'Create New User'}
                </h3>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <Input
                        label="Full Name"
                        {...register('name', { required: 'Name is required' })}
                        error={errors.name?.message}
                    />

                    <Input
                        label="Email"
                        type="email"
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address',
                            },
                        })}
                        error={errors.email?.message}
                    />

                    {!user && (
                        <>
                            <Input
                                label="Password"
                                type="password"
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 6,
                                        message: 'Password must be at least 6 characters',
                                    },
                                })}
                                error={errors.password?.message}
                            />

                            <Input
                                label="Confirm Password"
                                type="password"
                                {...register('password_confirmation', {
                                    validate: value =>
                                        value === password || 'Passwords do not match',
                                })}
                                error={errors.password_confirmation?.message}
                            />
                        </>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Role
                            </label>
                            <select
                                {...register('role', { required: 'Role is required' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                            {errors.role && (
                                <p className="text-sm text-red-600 mt-1">{errors.role.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    {...register('is_honorer')}
                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Honorer</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <Button type="submit" loading={loading} disabled={loading}>
                            {user ? 'Update User' : 'Create User'}
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