import React, { Component  } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { Button } from '../ui/Button';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    }

    public render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-red-50">
                    <div className="max-w-md w-full text-center p-8 bg-white shadow-lg rounded-lg">
                        <h1 className="text-2xl font-bold text-red-600">Oops! Terjadi Kesalahan</h1>
                        <p className="mt-2 text-gray-600">
                            Maaf, aplikasi mengalami masalah yang tidak terduga.
                        </p>
                        {this.state.error && (
                            <pre className="mt-4 p-2 text-left bg-gray-100 text-xs text-red-700 rounded overflow-auto">
                                {this.state.error.toString()}
                            </pre>
                        )}
                        <Button onClick={this.handleReload} className="mt-6">
                            Muat Ulang Halaman
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
