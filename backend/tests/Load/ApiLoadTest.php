<?php

namespace Tests\Load;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ApiLoadTest extends TestCase
{

    use RefreshDatabase;

    public function test_high_concurrency_login_requests()
    {

        User::factory()->create([
            'email'    => 'loadtest@example.com',
            'password' => bcrypt('password123'),
        ]);

        $concurrentRequests = 50;
        $successfulRequests = 0;
        $failedRequests     = 0;

        $requests = [];

        for ($i = 0; $i < $concurrentRequests; $i++)
        {
            $requests[] = function () use (&$successfulRequests, &$failedRequests)
            {
                try
                {
                    $response = $this->postJson('/api/auth/login', [
                        'email'    => 'loadtest@example.com',
                        'password' => 'password123',
                    ]);

                    if ($response->getStatusCode() === 200)
                    {
                        $successfulRequests++;
                    } else
                    {
                        $failedRequests++;
                    }
                } catch (\Exception $e)
                {
                    $failedRequests++;
                }
            };
        }

        // Execute concurrent requests
        foreach ($requests as $request)
        {
            $request();
        }

        $successRate = ($successfulRequests / $concurrentRequests) * 100;

        $this->assertGreaterThan(
            90,
            $successRate,
            "Success rate too low: {$successRate}% (Successful: {$successfulRequests}, Failed: {$failedRequests})",
        );
    }

    public function test_database_performance_under_load()
    {

        // Create large dataset
        User::factory()->count(10000)->create();

        $startTime = microtime(TRUE);

        // Test complex query under load
        for ($i = 0; $i < 100; $i++)
        {
            $users = User::where('role', 'user')
                ->where('is_active', TRUE)
                ->withCount([
                    'attendances' => function ($query)
                    {
                        $query->whereDate('check_in', today());
                    }
                ])
                ->orderBy('name')
                ->paginate(25);
        }

        $endTime     = microtime(TRUE);
        $averageTime = ($endTime - $startTime) / 100;

        $this->assertLessThan(
            0.1,
            $averageTime,
            "Average query time too slow: {$averageTime}s",
        );
    }

}
