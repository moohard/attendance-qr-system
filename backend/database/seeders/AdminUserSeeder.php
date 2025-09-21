<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{

    public function run()
    {

        $admin = User::create([
            'name'       => 'Administrator',
            'email'      => 'admin@attendance.com',
            'password'   => Hash::make('password123'),
            'role'       => 'admin',
            'is_honorer' => FALSE,
        ]);

        $admin->generateQRCode();

        $this->command->info('Admin user created successfully!');
        $this->command->info('Email: admin@attendance.com');
        $this->command->info('Password: password123');
    }

}
