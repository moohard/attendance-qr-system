<?php

namespace App\Http\Requests\Attendance;

use Illuminate\Foundation\Http\FormRequest;

class CheckInRequest extends FormRequest
{

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {

        return TRUE; // Izinkan semua pengguna yang terautentikasi untuk melakukan check-in
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {

        // Aturan ini diambil langsung dari method checkIn Anda
        return [
            'qr_content'         => 'required|string',
            'attendance_type_id' => 'nullable|exists:attendance_types,id',
            'latitude'           => 'nullable|numeric',
            'longitude'          => 'nullable|numeric',
            'notes'              => 'nullable|string|max:500',
        ];
    }

}
