import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { AppRoutes } from './routes/AppRoutes'; 

function App() {
  const { isLoading } = useAuth();

  // Tampilkan layar loading global sampai pengecekan auth selesai
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
        <span className="ml-4 text-gray-700">Memverifikasi sesi...</span>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <AppRoutes />
      </Router>
    </>
  );
}

export default App;