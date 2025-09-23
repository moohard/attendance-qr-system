import { NavLink } from 'react-router-dom';
import {
    Home,
    Clock,
    BarChart3,
    User,
    Users,
    Settings,
    Calendar,
    ClipboardList
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const userNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Attendance', href: '/attendance', icon: Clock },
    { name: 'Activities', href: '/activities', icon: Calendar },
    { name: 'Profile', href: '/profile', icon: User },
];

const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin', icon: Home },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Activity Management', href: '/admin/activities', icon: ClipboardList },
    { name: 'Attendance Management', href: '/admin/attendance', icon: Clock },
    { name: 'Reports Management', href: '/admin/reports', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export const Sidebar = () => {
    const { user } = useAuth();
    const navigation = user?.role === 'admin' ? adminNavigation : userNavigation;

    return (
        <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
            <nav className="p-4">
                <div className="space-y-1">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            end
                            className={({ isActive }) =>
                                `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                                    ? 'bg-blue-100 text-blue-700'
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

