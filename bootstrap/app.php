<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->group('api', [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            \Illuminate\Routing\Middleware\ThrottleRequests::class.':60,1', // Simple rate limiting
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);

        $middleware->group('web', [
            \Illuminate\Cookie\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);

        $middleware->validateCsrfTokens(except: [
            'sanctum/csrf-cookie',
            'api/login',  // Add any other API routes that need CSRF exemption
            'api/logout',
            'api/register',
            'api/verify-email',
            'api/request-password-reset',
            'api/reset-password',
            'api/verify-reset-code'

        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->create();
