<?php

use Laravel\Sanctum\Sanctum;

return [
    'stateful' => [
        'localhost:3000',
        'localhost:8000',
        '127.0.0.1:3000',
        '127.0.0.1:8000',
    ],

    'guard' => ['web'],

    'expiration' => null,

    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    'middleware' => [
        'verify_csrf_token' => \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class,
        'encrypt_cookies' => \Illuminate\Cookie\Middleware\EncryptCookies::class,
    ],
];
