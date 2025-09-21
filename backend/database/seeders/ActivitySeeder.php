<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Activity;
use App\Models\User;
use Carbon\Carbon;

class ActivitySeeder extends Seeder
{

    public function run()
    {

        $admin = User::where('email', 'admin@attendance.com')->first();

        if (!$admin)
        {
            $this->command->error('Admin user not found. Please run AdminUserSeeder first.');

            return;
        }

        $activities = [
            [
                'name'           => 'Apel Pagi',
                'description'    => 'Apel pagi seluruh staff',
                'start_time'     => '07:30:00',
                'end_time'       => '08:00:00',
                'is_recurring'   => TRUE,
                'recurring_days' => [ 1, 2, 3, 4, 5 ], // Senin-Jumat
                'valid_from'     => NULL,
                'valid_to'       => NULL,
                'is_active'      => TRUE,
                'created_by'     => $admin->id,
            ],
            [
                'name'           => 'Rapat Mingguan',
                'description'    => 'Rapat koordinasi mingguan',
                'start_time'     => '14:00:00',
                'end_time'       => '16:00:00',
                'is_recurring'   => TRUE,
                'recurring_days' => [ 1 ], // Senin saja
                'valid_from'     => NULL,
                'valid_to'       => NULL,
                'is_active'      => TRUE,
                'created_by'     => $admin->id,
            ],
            [
                'name'           => 'Briefing Harian',
                'description'    => 'Briefing divisi setiap hari',
                'start_time'     => '08:30:00',
                'end_time'       => '09:00:00',
                'is_recurring'   => TRUE,
                'recurring_days' => [ 1, 2, 3, 4, 5 ],
                'valid_from'     => NULL,
                'valid_to'       => NULL,
                'is_active'      => TRUE,
                'created_by'     => $admin->id,
            ],
            [
                'name'           => 'Training K3',
                'description'    => 'Training keselamatan dan kesehatan kerja',
                'start_time'     => '09:00:00',
                'end_time'       => '12:00:00',
                'is_recurring'   => FALSE,
                'recurring_days' => NULL,
                'valid_from'     => '2024-02-01',
                'valid_to'       => '2024-02-28',
                'is_active'      => TRUE,
                'created_by'     => $admin->id,
            ],
        ];

        foreach ($activities as $activity)
        {
            Activity::create($activity);
        }

        $this->command->info('Activities seeded successfully!');
    }

}
