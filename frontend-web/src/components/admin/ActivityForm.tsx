import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useEffect } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { Activity } from '../../types';

// Tipe data untuk form, tanpa ID
type ActivityFormData = Omit<Activity, 'id' | 'created_by'>;

interface ActivityFormProps {
    activity: Activity | null;
    onSuccess: () => void;
}

const dayOptions = [
    { value: 0, label: 'Minggu' },
    { value: 1, label: 'Senin' },
    { value: 2, label: 'Selasa' },
    { value: 3, label: 'Rabu' },
    { value: 4, label: 'Kamis' },
    { value: 5, label: 'Jumat' },
    { value: 6, label: 'Sabtu' },
];

export const ActivityForm = ({ activity, onSuccess }: ActivityFormProps) => {
    const { createActivity, updateActivity, isLoading } = useAppStore();
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<ActivityFormData>();

    const isRecurring = watch('is_recurring');

    // Reset form jika data 'activity' berubah
    useEffect(() => {
        if (activity) {
            reset({
                ...activity,
                // Pastikan format tanggal dan waktu sesuai untuk input
                valid_from: activity.valid_from ? new Date(activity.valid_from).toISOString().split('T')[0] : '',
                valid_to: activity.valid_to ? new Date(activity.valid_to).toISOString().split('T')[0] : '',
            });
        } else {
            reset({
                name: '',
                description: '',
                start_time: '08:00:00',
                end_time: '17:00:00',
                is_recurring: false,
                recurring_days: [],
                valid_from: '',
                valid_to: '',
                is_active: true,
            });
        }
    }, [activity, reset]);

    const onSubmit: SubmitHandler<ActivityFormData> = async (data) => {
        const payload = {
            ...data,
            recurring_days: data.is_recurring ? data.recurring_days.map(Number) : [],
        };

        if (activity) {
            await updateActivity(activity.id, payload);
        } else {
            await createActivity(payload);
        }
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Nama Kegiatan" {...register('name', { required: 'Nama wajib diisi' })} error={errors.name?.message} />
            <Input label="Deskripsi" {...register('description')} />

            <div className="grid grid-cols-2 gap-4">
                <Input label="Waktu Mulai" type="time" step="1" {...register('start_time', { required: true })} />
                <Input label="Waktu Selesai" type="time" step="1" {...register('end_time', { required: true })} />
            </div>

            <div className="flex items-center space-x-2">
                <input type="checkbox" {...register('is_recurring')} id="is_recurring" />
                <label htmlFor="is_recurring">Kegiatan Berulang?</label>
            </div>

            {isRecurring ? (
                <div>
                    <label className="block text-sm font-medium text-gray-700">Pilih Hari</label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                        {dayOptions.map(day => (
                            <div key={day.value} className="flex items-center">
                                <input type="checkbox" value={day.value} {...register('recurring_days')} id={`day-${day.value}`} />
                                <label htmlFor={`day-${day.value}`} className="ml-2 text-sm">{day.label}</label>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Berlaku Dari" type="date" {...register('valid_from')} />
                    <Input label="Berlaku Sampai" type="date" {...register('valid_to')} />
                </div>
            )}
            <div className="flex items-center space-x-2">
                <input type="checkbox" {...register('is_active')} id="is_active" defaultChecked />
                <label htmlFor="is_active">Aktifkan Kegiatan</label>
            </div>

            <Button type="submit" loading={isLoading}>
                {activity ? 'Simpan Perubahan' : 'Buat Kegiatan'}
            </Button>
        </form>
    );
};