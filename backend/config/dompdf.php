<?php

return [
    'show_warnings' => FALSE,
    'orientation'   => 'portrait',
    'defines'       => [
        'font_dir'               => storage_path('fonts/'),
        'font_cache'             => storage_path('fonts/'),
        'temp_dir'               => storage_path('app/'),
        'chroot'                 => realpath(base_path()),
        'enable_font_subsetting' => FALSE,
        'pdf_backend'            => 'CPDF',
        'default_media_type'     => 'screen',
        'default_paper_size'     => 'a4',
        'default_font'           => 'serif',
        'dpi'                    => 96,
        'enable_php'             => FALSE,
        'enable_javascript'      => TRUE,
        'enable_remote'          => TRUE,
        'font_height_ratio'      => 1.1,
        'enable_html5_parser'    => FALSE,
    ],
];
