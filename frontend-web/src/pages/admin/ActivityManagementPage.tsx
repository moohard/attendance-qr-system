import { useEffect, useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ActivityForm } from '../../components/admin/ActivityForm';
import { ActivityList } from '../../components/activity/ActivityList';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { Activity } from '../../types';

export const ActivityManagementPage = () => {
    const {
        activities,
        isLoading,
        loadAllActivities,
        deleteActivity,
        generateActivityQrCode
    } = useAppStore();

    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

    // --- State baru untuk modal QR ---
    const [isQrModalOpen, setQrModalOpen] = useState(false);
    const [qrCodeData, setQrCodeData] = useState<{ svg: string; expires: string; name: string } | null>(null);


    useEffect(() => {
        loadAllActivities();
    }, [loadAllActivities]);

    const handleEdit = (activity: Activity) => {
        setSelectedActivity(activity);
        setModalOpen(true);
    };

    const handleAddNew = () => {
        setSelectedActivity(null);
        setModalOpen(true);
    };

    const handleDelete = async (activityId: number) => {
        // Gunakan confirm() bawaan browser untuk kesederhanaan
        if (confirm('Apakah Anda yakin ingin menghapus kegiatan ini?')) {
            await deleteActivity(activityId);
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedActivity(null);
    }

    // --- Fungsi baru untuk menangani pembuatan QR ---
    const handleGenerateQr = async (activity: Activity) => {
        const data = await generateActivityQrCode(activity.id);
        if (data) {
            setQrCodeData({
                svg: data.qr_code_svg,
                expires: new Date(data.expires_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                name: activity.name,
            });
            setQrModalOpen(true);
        }
    };

    const handlePrint = () => {
        if (!qrCodeData) return;
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow?.document.write(`
            <html>
                <head><title>Cetak QR Code</title></head>
                <body style="text-align: center; font-family: sans-serif;">
                    <h2>${qrCodeData.name}</h2>
                    <img src="data:image/svg+xml;base64,${qrCodeData.svg}" style="width: 80%; max-width: 400px; height: auto; margin: 0 auto;" />
                    <p>Berlaku sampai pukul ${qrCodeData.expires}</p>
                </body>
            </html>
        `);
        printWindow?.document.close();
        printWindow?.focus();
        printWindow?.print();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manajemen Kegiatan</h1>
                    <p className="text-gray-600">Buat, ubah, atau hapus kegiatan absensi.</p>
                </div>
                <Button onClick={handleAddNew}>Tambah Kegiatan Baru</Button>
            </div>

            {isLoading && activities.length === 0 ? (
                <div className="flex justify-center py-8">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <ActivityList
                    activities={activities}
                    title="Semua Kegiatan"
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onGenerateQr={(activityId) => {
                        const activity = activities.find(a => a.id === activityId);
                        if (activity) handleGenerateQr(activity);
                    }}
                    isAdmin={true}
                />
            )}

            {/* Modal untuk Form */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={selectedActivity ? 'Ubah Kegiatan' : 'Buat Kegiatan Baru'}>
                <div className="p-6">
                    <ActivityForm
                        activity={selectedActivity}
                        onSuccess={closeModal}
                    />
                </div>
            </Modal>

            {/* Modal untuk menampilkan QR Code */}
            <Modal
                isOpen={isQrModalOpen}
                onClose={() => setQrModalOpen(false)}
                title="Activity QR Code"
            >
                <div className="p-6 text-center">
                    {qrCodeData ? (
                        <>
                            <h3 className="text-lg font-medium mb-2">{qrCodeData.name}</h3>
                            <img
                                src={`data:image/svg+xml;base64,${qrCodeData.svg}`}
                                alt="Activity QR Code"
                                className="w-64 h-64 mx-auto"
                            />
                            <p className="mt-4 text-sm text-gray-600">
                                Kode ini akan kedaluwarsa pada pukul {qrCodeData.expires}.
                            </p>
                            <Button onClick={handlePrint} className="mt-4">
                                Cetak
                            </Button>
                        </>
                    ) : <LoadingSpinner />}
                </div>
            </Modal>
        </div>
    );
};