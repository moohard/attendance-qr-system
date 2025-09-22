<?php

namespace App\Providers;

use App\Http\Kernel;
use Illuminate\Support\ServiceProvider;
use App\Http\Middleware\ValidateApiInput;

class AppServiceProvider extends ServiceProvider
{

    /**
     * Register any application services.
     */
    public function register(): void
    {

        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {

        $kernel = $this->app->make(Kernel::class);
    }

}
