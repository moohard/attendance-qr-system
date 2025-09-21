<?php

namespace Tests\Feature;

use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorAuthTest extends TestCase
{

    use RefreshDatabase;

    protected $user;

    protected $google2fa;

    protected function setUp(): void
    {

        parent::setUp();
        $this->google2fa = app(Google2FA::class); // ✅ Dependency injection

        $this->user = User::factory()->create([
            'email'    => 'test2fa@example.com',
            'password' => bcrypt('password123'),
        ]);

        $this->google2fa = new Google2FA();
    }

    public function test_enable_2fa()
    {

        Sanctum::actingAs($this->user); // ✅ Gunakan Sanctum::actingAs

        $response = $this->postJson('/api/2fa/enable');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'secret',
                'qr_code_url',
                'message',
            ]);

        // JANGAN panggil method langsung, refresh dari DB
        $this->user->refresh(); // ✅

        $this->assertNotNull($this->user->google2fa_secret);
        $this->assertTrue($this->user->google2fa_enabled);
    }

    // TwoFactorAuthTest.php
    public function test_verify_2fa_code()
    {

        Sanctum::actingAs($this->user);

        // Enable melalui API
        $enableResponse = $this->postJson('/api/2fa/enable');
        $secret         = $enableResponse->json('secret');

        $this->user->refresh();

        // Pastikan secret cukup panjang
        $this->assertGreaterThanOrEqual(16, strlen($this->user->google2fa_secret));

        $validCode = $this->google2fa->getCurrentOtp($secret);

        $response = $this->postJson('/api/2fa/verify', [
            'code' => $validCode,
        ]);

        $response->assertStatus(200)
            ->assertJson([ 'message' => '2FA verification successful' ]);
    }

    public function test_disable_2fa()
    {

        Sanctum::actingAs($this->user);

        // Enable melalui API
        $this->postJson('/api/2fa/enable');
        $this->user->refresh();

        $response = $this->postJson('/api/2fa/disable');

        $response->assertStatus(200)
            ->assertJson([ 'message' => '2FA disabled successfully' ]);

        $this->user->refresh();
        $this->assertFalse($this->user->google2fa_enabled);
        $this->assertNull($this->user->google2fa_secret);
    }

    public function test_verify_invalid_2fa_code()
    {

        Sanctum::actingAs($this->user); // ✅ Gunakan Sanctum::actingAs

        // Enable 2FA first
        $this->user->enableTwoFactorAuth();

        $response = $this->postJson('/api/2fa/verify', [
            'code' => '000000' // Invalid code
        ]);

        $response->assertStatus(400)
            ->assertJson([ 'error' => 'Invalid verification code' ]);
    }

    public function test_2fa_status()
    {

        Sanctum::actingAs($this->user); // ✅ Gunakan Sanctum::actingAs

        $response = $this->getJson('/api/2fa/status');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'enabled',
                'qr_code_url',
            ]);
    }

    public function test_login_with_2fa_required()
    {

        // Enable 2FA for user
        $user = User::factory()->create([
            'email'             => '2fauser@example.com',
            'password'          => bcrypt('password123'),
            'google2fa_enabled' => TRUE,
            'google2fa_secret'  => $this->google2fa->generateSecretKey(),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email'    => '2fauser@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'error'        => '2FA required',
                'requires_2fa' => TRUE,
            ]);
    }

    public function test_login_with_2fa_success()
    {

        // Enable 2FA for user
        $secret = $this->google2fa->generateSecretKey();
        $user   = User::factory()->create([
            'email'             => '2fauser@example.com',
            'password'          => bcrypt('password123'),
            'google2fa_enabled' => TRUE,
            'google2fa_secret'  => $secret,
        ]);

        $validCode = $this->google2fa->getCurrentOtp($secret);

        $response = $this->postJson('/api/auth/login', [
            'email'    => '2fauser@example.com',
            'password' => 'password123',
            'code'     => $validCode,
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'access_token',
                'token_type',
                'user',
            ]);
    }

}
