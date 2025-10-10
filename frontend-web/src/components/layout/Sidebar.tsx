import { NavLink } from 'react-router-dom';
import {
    Home,
    Clock,
    BarChart3,
    User,
    Users,
    Settings,
    Calendar,
    ClipboardList,
    X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
}

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

export const Sidebar = ({ isSidebarOpen, toggleSidebar }: SidebarProps) => {
    const { user } = useAuth();
    const navigation = user?.role === 'admin' ? adminNavigation : userNavigation;

    return (
        <>
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 bg-gray-600 bg-opacity-75 z-30 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={toggleSidebar}></div>
            <aside
                className={`fixed top-0 left-0 w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen z-40 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}
            >
                <div className="flex justify-between items-center p-4 border-b md:hidden">
                    <h2 className="text-lg font-semibold">Menu</h2>
                    <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-gray-100">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <nav className="p-4">
                    <div className="space-y-1">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                end
                                onClick={toggleSidebar} // Close sidebar on link click in mobile
                                className={({ isActive }) =>
                                    `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        isActive
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
        </>
    );
};

