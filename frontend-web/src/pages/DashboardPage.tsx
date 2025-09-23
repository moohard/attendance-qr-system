import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppStore } from '../stores/useAppStore'; // 1. Import store
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { AttendanceList } from '../components/attendance/AttendanceList';
import { QrScannerComponent } from '../components/attendance/QrScanner';
import { formatDate } from '../utils/date';
import type { Attendance } from '../types';
import toast from 'react-hot-toast';

export const DashboardPage = () => {
    const { user } = useAuth();
    // 2. Ambil state dan actions dari store Zustand
    const {
        attendances,
        attendanceTypes,
        loadActiveAttendances,
        loadAttendanceTypes,
        checkIn,
        checkOut,
    } = useAppStore();

    const [showScanner, setShowScanner] = useState(false);
    const [scannerMode, setScannerMode] = useState<'checkin' | 'checkout'>('checkin');
    const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);

    useEffect(() => {
        // 3. Panggil actions untuk memuat data saat komponen pertama kali render
        loadActiveAttendances();
        loadAttendanceTypes();
    }, [loadActiveAttendances, loadAttendanceTypes]);

    const handleCheckIn = async (qrContent: string) => {
        try {
            const qrData = JSON.parse(qrContent);
            const result = await checkIn({
                qr_content: qrContent,
                attendance_type_id: qrData.attendance_type_id || 1
            });

            if (result.success) {
                setShowScanner(false);
                // Tidak perlu panggil loadActiveAttendances() lagi, sudah dihandle di store
            }
        } catch (error) {
            console.error("Invalid QR Content", error);
            toast.error("Invalid QR Code format.");
        }
    };

    const handleCheckOut = (attendance: Attendance) => {
        setSelectedAttendance(attendance);
        setScannerMode('checkout');
        setShowScanner(true);
    };

    const handleCheckOutScan = async () => {
        if (selectedAttendance) {
            const result = await checkOut(selectedAttendance.id, {});
            if (result.success) {
                setShowScanner(false);
                setSelectedAttendance(null);
            }
        }
    };

    const activeAttendances = attendances.filter(att => !att.check_out);
    const todayAttendances = attendances.filter(att =>
        new Date(att.check_in).toDateString() === new Date().toDateString()
    );

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.name}!</p>
                <p className="text-sm text-gray-500">{formatDate(new Date().toISOString())}</p>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                </CardHeader>
                <CardContent>
                    <div className="flex space-x-4">
                        <Button onClick={() => { setScannerMode('checkin'); setShowScanner(true); }}>
                            Check In
                        </Button>
                        {activeAttendances.length > 0 && (
                            <Button variant="outline" onClick={loadActiveAttendances}>
                                Refresh
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* QR Scanner Modal */}
            {showScanner && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="max-w-md w-full">
                        <QrScannerComponent
                            onScan={scannerMode === 'checkin' ? handleCheckIn : handleCheckOutScan}
                            onClose={() => setShowScanner(false)}
                            title={scannerMode === 'checkin' ? 'Scan QR Code to Check In' : 'Scan QR Code to Check Out'}
                        />
                    </div>
                </div>
            )}

            {/* Active Attendances */}
            {activeAttendances.length > 0 && (
                <AttendanceList
                    attendances={activeAttendances}
                    title="Active Check-ins"
                    onCheckOut={handleCheckOut}
                    showCheckOut={true}
                />
            )}

            {/* Today's Attendances */}
            {todayAttendances.length > 0 && (
                <AttendanceList
                    attendances={todayAttendances}
                    title="Today's Attendance"
                />
            )}

            {/* Attendance Types */}
            {attendanceTypes.length > 0 && (
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900">Available Shifts</h3>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {attendanceTypes.map((type) => (
                                <div key={type.id} className="p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-medium text-gray-900">{type.name}</h4>
                                    <p className="text-sm text-gray-600">
                                        {type.start_time} - {type.end_time}
                                    </p>
                                    {type.description && (
                                        <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

