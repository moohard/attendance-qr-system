import { useEffect, useState } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { DataTable } from '../../components/admin/DataTable';
import { UserForm } from '../../components/admin/UserForm';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { User, PaginatedResponse } from '../../types';
import type { Column } from '../../components/admin/DataTable';


export const UserManagementPage = () => {
    const { getUsers, createUser, updateUser, deleteUser, isLoading } = useAdmin();
    const [users, setUsers] = useState<User[]>([]);
    const [pagination, setPagination] = useState({ page: 1, perPage: 10, total: 0 });
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadUsers();
    }, [pagination.page, searchTerm]);

    const loadUsers = async () => {
        try {
            const response: PaginatedResponse<User> = await getUsers(
                pagination.page,
                pagination.perPage,
                searchTerm
            );
            setUsers(response.data);
            setPagination(prev => ({
                ...prev,
                total: response.total,
                from: response.from,
                to: response.to
            }));
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    };
    function isUserData(data: unknown): data is Partial<User> {
        return (
            typeof data === 'object' &&
            data !== null &&
            ('name' in data || 'email' in data || 'Role' in data)
        );
    }
    const handleCreateUser = async (userData: unknown) => {
        if (isUserData(userData)) {
            await createUser(userData);
            setShowForm(false);
            await loadUsers();
        } else {
            console.error('Invalid user data structure');
        }
    };

    const handleUpdateUser = async (userData: unknown) => {
        if (editingUser) {
            if (isUserData(userData)) {
                await updateUser(editingUser.id, userData);
                setEditingUser(null);
                await loadUsers();
            } else {
                console.error('Invalid user data structure');
            }
        }
    };

    const handleDeleteUser = async (user: User) => {
        if (confirm(`Are you sure you want to delete ${user.name}?`)) {
            await deleteUser(user.id);
            await loadUsers();
        }
    };

    const columns: Column<User>[] = [
        { header: 'Name', accessor: 'name' },
        { header: 'Email', accessor: 'email' },
        { header: 'Role', accessor: 'role' },
        {
            header: 'Status',
            accessor: (user: User) => (
                <span className={`px-2 py-1 rounded-full text-xs ${user.is_honorer
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                    }`}>
                    {user.is_honorer ? 'Honorer' : 'Regular'}
                </span>
            )
        },
        { header: 'QR Code', accessor: 'qr_code' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-600">Manage system users and permissions</p>
                </div>
                <Button onClick={() => setShowForm(true)}>
                    Add New User
                </Button>
            </div>

            {/* Search Bar */}
            <div className="flex gap-4">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
            </div>

            {/* User Form Modal */}
            {(showForm || editingUser) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="max-w-md w-full">
                        <UserForm
                            user={editingUser || undefined}
                            onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
                            onCancel={() => {
                                setShowForm(false);
                                setEditingUser(null);
                            }}
                            loading={isLoading}
                        />
                    </div>
                </div>
            )}

            {/* Users Table */}
            <DataTable
                columns={columns}
                data={users}
                loading={isLoading}
                onEdit={setEditingUser}
                onDelete={handleDeleteUser}
                title={`Users (${pagination.total})`}
            />

            {/* Pagination */}
            {pagination.total > 0 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">
                        Showing {pagination.page} to {pagination.perPage} of {pagination.total} results
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