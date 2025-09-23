<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreActivityRequest extends FormRequest
{

    public function authorize(): bool
    {

        return $this->user()->role === 'admin';
    }

    public function rules(): array
    {

        return [
            'name'             => 'required|string|max:255',
            'description'      => 'nullable|string',
            'start_time'       => 'required|date_format:H:i:s',
            'end_time'         => 'required|date_format:H:i:s|after:start_time',
            'is_recurring'     => 'required|boolean',
            'recurring_days'   => 'nullable|required_if:is_recurring,true|array',
            'recurring_days.*' => 'integer|between:0,6',
            'valid_from'       => 'nullable|required_if:is_recurring,false|date',
            'valid_to'         => 'nullable|required_if:is_recurring,false|date|after_or_equal:valid_from',
            'is_active'        => 'required|boolean',
        ];
    }

}
