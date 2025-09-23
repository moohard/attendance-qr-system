<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        using: function (\Illuminate\Routing\Router $router)
        {
            $router->middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));
            $router->middleware([ 'api', 'auth:sanctum', 'role:admin' ])
                ->prefix('api/admin')
                ->group(base_path('routes/admin.php'));
        },
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void
    {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void
    {
        //
    })->create();
