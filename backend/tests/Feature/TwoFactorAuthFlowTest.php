<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorAuthFlowTest extends TestCase
{

    use RefreshDatabase;

    public function test_complete_2fa_flow()
    {

        $user = User::factory()->create([
            'email'    => 'testflow@example.com',
            'password' => bcrypt('password123'),
        ]);

        $google2fa = new Google2FA();

        // Step 1: Login without 2FA
        $response = $this->postJson('/api/auth/login', [
            'email'    => 'testflow@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200);
        $token = $response->json('access_token');

        // Step 2: Enable 2FA
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/2fa/enable');

        $response->assertStatus(200);
        $secret = $response->json('secret');

        // Step 3: Verify 2FA
        $code     = $google2fa->getCurrentOtp($secret);
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/2fa/verify', [
                    'code' => $code,
                ]);

        $response->assertStatus(200);

        // Step 4: Logout
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/auth/logout');

        $response->assertStatus(200);

        // Step 5: Try to login without 2FA code (should fail)
        $response = $this->postJson('/api/auth/login', [
            'email'    => 'testflow@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(401)
            ->assertJson([ 'requires_2fa' => TRUE ]);

        // Step 6: Login with 2FA code (should succeed)
        $code     = $google2fa->getCurrentOtp($secret);
        $response = $this->postJson('/api/auth/login', [
            'email'    => 'testflow@example.com',
            'password' => 'password123',
            'code'     => $code,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([ 'access_token' ]);
    }

}
