<?php

namespace Database\Factories;

use App\Models\Attendance;
use App\Models\User;
use App\Models\AttendanceType;
use Illuminate\Database\Eloquent\Factories\Factory;

class AttendanceFactory extends Factory
{

    protected $model = Attendance::class;

    public function definition()
    {

        $checkIn  = $this->faker->dateTimeBetween('-1 month', 'now');
        $checkOut = $this->faker->optional(0.7)->dateTimeBetween($checkIn, '+8 hours');

        // 70% chance memiliki check-out

        return [
            'user_id'            => User::factory(),
            'attendance_type_id' => AttendanceType::factory(),
            'check_in'           => $checkIn,
            'check_out'          => $checkOut,
            'latitude'           => $this->faker->optional()->latitude,
            'longitude'          => $this->faker->optional()->longitude,
            'notes'              => $this->faker->optional()->sentence,
            'is_late'            => $this->faker->boolean(20), // 20% chance late
            'is_early'           => $checkOut ? $this->faker->boolean(15) : FALSE, // 15% chance early checkout
        ];
    }

    public function checkedIn()
    {

        return $this->state(fn(array $attributes) => [
            'check_out' => NULL,
            'is_early'  => FALSE,
        ]);
    }

    public function checkedOut()
    {

        return $this->state(fn(array $attributes) => [
            'check_out' => $attributes['check_in']->modify('+8 hours'),
        ]);
    }

    public function late()
    {

        return $this->state(fn(array $attributes) => [
            'check_in' => $attributes['check_in']->modify('+1 hour'), // 1 jam terlambat
            'is_late'  => TRUE,
        ]);
    }

    public function early()
    {

        return $this->state(fn(array $attributes) => [
            'check_out' => $attributes['check_in']->modify('+6 hours'), // 2 jam lebih awal
            'is_early'  => TRUE,
        ]);
    }

}
