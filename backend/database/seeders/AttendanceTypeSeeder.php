<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AttendanceType;
use Carbon\Carbon;

class AttendanceTypeSeeder extends Seeder
{

    public function run()
    {

        $types = [
            [
                'name'        => 'Shift Pagi',
                'start_time'  => '07:00:00',
                'end_time'    => '16:00:00',
                'description' => 'Shift kerja pagi',
            ],
            [
                'name'        => 'Shift Siang',
                'start_time'  => '13:00:00',
                'end_time'    => '22:00:00',
                'description' => 'Shift kerja siang',
            ],
            [
                'name'        => 'Full Day',
                'start_time'  => '08:00:00',
                'end_time'    => '17:00:00',
                'description' => 'Shift kerja full day',
            ],
        ];

        foreach ($types as $type)
        {
            AttendanceType::create($type);
        }

        $this->command->info('Attendance types seeded successfully!');
    }

}
