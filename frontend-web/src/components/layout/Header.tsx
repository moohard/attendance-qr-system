import { useAuth } from '../../context/AuthContext';
import { Menu } from 'lucide-react';

interface HeaderProps {
    toggleSidebar: () => void;
}

export const Header = ({ toggleSidebar }: HeaderProps) => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <button 
                            onClick={toggleSidebar} 
                            className="md:hidden mr-4 p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
                    </div>
                    <div className="flex items-center">
                        <span className="mr-4">Welcome, {user?.name}</span>
                        <button
                            onClick={logout}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};