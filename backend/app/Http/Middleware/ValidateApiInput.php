<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ValidateApiInput
{

    public function handle(Request $request, Closure $next)
    {

        // Skip validation for GET requests
        if ($request->isMethod('get'))
        {
            return $next($request);
        }

        $rules = $this->getValidationRules($request);

        if (!empty($rules))
        {
            $validator = Validator::make($request->all(), $rules);

            if ($validator->fails())
            {
                return response()->json([
                    'error'   => 'Validation failed',
                    'errors'  => $validator->errors(),
                    'message' => 'Please check your input data',
                ], 422);
            }

            // Sanitize input data
            $this->sanitizeInput($request);
        }

        return $next($request);
    }

    protected function getValidationRules(Request $request): array
    {

        $path   = $request->path();
        $method = $request->method();

        // Define validation rules based on route and method
        $rules = [];

        if (Str::contains($path, 'auth/login'))
        {
            $rules = [
                'email'    => 'required|email|max:255',
                'password' => 'required|string|min:6|max:255',
                'code'     => 'sometimes|string|size:6',
            ];
        } elseif (Str::contains($path, 'auth/register'))
        {
            $rules = [
                'name'       => 'required|string|max:255',
                'email'      => 'required|email|unique:users,email|max:255',
                'password'   => 'required|string|min:6|confirmed|max:255',
                'role'       => 'sometimes|in:admin,user',
                'is_honorer' => 'sometimes|boolean',
            ];
        } elseif (Str::contains($path, 'attendance/check-in'))
        {
            $rules = [
                'qr_content'         => 'required|string|max:1000',
                'attendance_type_id' => 'required|exists:attendance_types,id',
                'latitude'           => 'sometimes|numeric|between:-90,90',
                'longitude'          => 'sometimes|numeric|between:-180,180',
                'notes'              => 'sometimes|string|max:500',
            ];
        } elseif (Str::contains($path, 'signatures/save'))
        {
            $rules = [
                'signature_data' => 'required|string|max:10000',
                'document_id'    => 'sometimes|string|max:255',
                'description'    => 'sometimes|string|max:500',
            ];
        }

        return $rules;
    }

    protected function sanitizeInput(Request $request)
    {

        $input = $request->all();

        foreach ($input as $key => $value)
        {
            if (is_string($value))
            {
                // Basic XSS protection
                $input[$key] = htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');

                // Remove excessive whitespace
                $input[$key] = preg_replace('/\s+/', ' ', $input[$key]);
            }
        }

        $request->replace($input);
    }

}
