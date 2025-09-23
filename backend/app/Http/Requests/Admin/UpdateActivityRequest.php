<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateActivityRequest extends FormRequest
{

    public function authorize(): bool
    {

        return $this->user()->role === 'admin';
    }

    public function rules(): array
    {

        return [
            'name'             => 'sometimes|required|string|max:255',
            'description'      => 'sometimes|nullable|string',
            'start_time'       => 'sometimes|required|date_format:H:i:s',
            'end_time'         => 'sometimes|required|date_format:H:i:s|after:start_time',
            'is_recurring'     => 'sometimes|required|boolean',
            'recurring_days'   => 'sometimes|nullable|required_if:is_recurring,true|array',
            'recurring_days.*' => 'integer|between:0,6',
            'valid_from'       => 'sometimes|nullable|required_if:is_recurring,false|date',
            'valid_to'         => 'sometimes|nullable|required_if:is_recurring,false|date|after_or_equal:valid_from',
            'is_active'        => 'sometimes|required|boolean',
        ];
    }

}
