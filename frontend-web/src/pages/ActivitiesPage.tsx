import { useEffect, useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { useAuth } from '../context/AuthContext';
import { ActivityList } from '../components/activity/ActivityList';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';


export const ActivitiesPage = () => {
    const { user } = useAuth();
    const { activities, isLoading, loadAllActivities, generateActivityQrCode } = useAppStore();

    const [isQrModalOpen, setQrModalOpen] = useState(false);
    const [qrCodeData, setQrCodeData] = useState<{ svg: string; expires: string } | null>(null);

    useEffect(() => {
        loadAllActivities();
    }, [loadAllActivities]);

    const handleGenerateQr = async (activityId: number) => {

        const data = await generateActivityQrCode(activityId);
        if (data) {
            setQrCodeData({
                svg: data.qr_code_svg,
                expires: new Date(data.expires_at).toLocaleTimeString('id-ID')
            });
            setQrModalOpen(true);
        }
    };
    const handlePrint = () => {
        if (!qrCodeData) return;
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow?.document.write('<html><head><title>Print QR Code</title>');
        printWindow?.document.write('</head><body >');
        printWindow?.document.write('<img src="data:image/svg+xml;base64,' + qrCodeData.svg + '" style="width: 100%; height: auto;" />');
        printWindow?.document.write('</body></html>');
        printWindow?.document.close();
        printWindow?.print();
    };
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Daftar Kegiatan</h1>
                <p className="text-gray-600">Berikut adalah daftar kegiatan yang tersedia untuk absensi.</p>
            </div>

            {isLoading && !activities.length ? (
                <div className="flex justify-center py-8">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <ActivityList
                    activities={activities}
                    title="Kegiatan Aktif"
                    onGenerateQr={handleGenerateQr}
                    isAdmin={user?.role === 'admin'}
                />
            )}

            {/* Modal untuk menampilkan QR Code */}
            <Modal

                isOpen={isQrModalOpen}
                onClose={() => setQrModalOpen(false)}
                title="Activity QR Code"
            >
                <div className="p-6 text-center">
                    {qrCodeData ? (
                        <>
                            <img
                                src={`data:image/svg+xml;base64,${qrCodeData.svg}`}
                                alt="Activity QR Code"
                                className="w-64 h-64 mx-auto"
                            />
                            <p className="mt-4 text-sm text-gray-600">
                                Kode ini akan kedaluwarsa pada pukul {qrCodeData.expires}.
                            </p>

                        </>
                    ) : <LoadingSpinner />}
                </div>
                <Button
                    onClick={handlePrint}
                    disabled={!qrCodeData}
                >Print
                </Button>.
            </Modal>
        </div>
    );
};
