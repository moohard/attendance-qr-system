import { NavLink } from 'react-router-dom';
import {
    Home,
    Clock,
    BarChart3,
    User,
    Users,
    Settings
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const userNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Attendance', href: '/attendance', icon: Clock },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Profile', href: '/profile', icon: User },
];

const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin', icon: Home },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Attendance Management', href: '/admin/attendance', icon: Clock },
    { name: 'Reports Management', href: '/admin/reports', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export const Sidebar = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const navigation = isAdmin ? adminNavigation : userNavigation;

    return (
        <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
            <nav className="p-4">
                <div className="space-y-1">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }) =>
                                `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.name}
                        </NavLink>
                    ))}
                </div>
            </nav>
        </aside>
    );
};