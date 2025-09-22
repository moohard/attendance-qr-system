<?php

namespace Tests;

trait TestCaseHelper
{

    protected function debugResponse($response, $message = '')
    {

        if ($response->getStatusCode() >= 400)
        {
            dump("=== DEBUG: {$message} ===");
            dump("Status: " . $response->getStatusCode());
            dump("Response: " . $response->getContent());
            dump("=== END DEBUG ===");
        }
    }

    protected function createValidQrCode($userId, $attendanceTypeId, $type = 'user_checkin')
    {

        return [
            'type'               => $type,
            'user_id'            => $userId,
            'timestamp'          => now()->toISOString(),
            'expires_at'         => now()->addMinutes(5)->toISOString(),
            'attendance_type_id' => $attendanceTypeId,
            'version'            => 'v1',
        ];
    }

}
