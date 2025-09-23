<?php

return [
    'driver'          => env('SESSION_DRIVER', 'file'),
    'lifetime'        => env('SESSION_LIFETIME', 120),
    'expire_on_close' => FALSE,
    'encrypt'         => FALSE,
    'files'           => storage_path('framework/sessions'),
    'connection'      => env('SESSION_CONNECTION'),
    'table'           => 'sessions',
    'store'           => env('SESSION_STORE'),
    'lottery'         => [ 2, 100 ],
    'cookie'          => env('SESSION_COOKIE', 'laravel_session'),
    'path'            => '/',
    'domain'          => env('SESSION_DOMAIN', NULL),
    'secure'          => env('SESSION_SECURE_COOKIE', FALSE),
    'http_only'       => TRUE,
    'same_site'       => 'lax', // atau 'none' jika menggunakan HTTPS
];
