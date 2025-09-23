<?php

namespace App\Services;

use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SignatureEncryptionService
{

    public function sign(array $payload): string
    {

        try
        {
            // Convert payload to JSON string
            $payloadString = json_encode($payload);

            // Generate signature hash
            $signature = $this->generateSignatureHash($payloadString);

            return $signature;

        } catch (\Exception $e)
        {
            throw new \Exception('Signature generation failed: ' . $e->getMessage());
        }
    }

    public function verify(array $payload, string $signature): bool
    {

        try
        {
            $payloadString     = json_encode($payload);
            $expectedSignature = $this->generateSignatureHash($payloadString);

            return hash_equals($expectedSignature, $signature);

        } catch (\Exception $e)
        {
            throw new \Exception('Signature verification failed: ' . $e->getMessage());
        }
    }

    public function encryptSignature(string $signatureData): string
    {

        try
        {
            // Validate signature data (basic validation)
            if (!$this->isValidSignature($signatureData))
            {
                throw new \Exception('Invalid signature data format');
            }

            // Encrypt the signature data
            $encryptedData = Crypt::encrypt($signatureData);

            return $encryptedData;

        } catch (\Exception $e)
        {
            throw new \Exception('Signature encryption failed: ' . $e->getMessage());
        }
    }

    public function decryptSignature(string $encryptedData): string
    {

        try
        {
            $decryptedData = Crypt::decrypt($encryptedData);

            if (!$this->isValidSignature($decryptedData))
            {
                throw new \Exception('Decrypted data is not a valid signature');
            }

            return $decryptedData;

        } catch (\Exception $e)
        {
            throw new \Exception('Signature decryption failed: ' . $e->getMessage());
        }
    }

    public function saveEncryptedSignature(string $signatureData, string $filename = NULL): string
    {

        try
        {
            $encryptedData = $this->encryptSignature($signatureData);

            $filename = $filename ?? 'signature_' . Str::uuid() . '.enc';
            $filePath = 'signatures/' . $filename;

            Storage::disk('local')->put($filePath, $encryptedData);

            return $filePath;

        } catch (\Exception $e)
        {
            throw new \Exception('Failed to save encrypted signature: ' . $e->getMessage());
        }
    }

    public function loadEncryptedSignature(string $filePath): string
    {

        try
        {
            if (!Storage::disk('local')->exists($filePath))
            {
                throw new \Exception('Signature file not found');
            }

            $encryptedData = Storage::disk('local')->get($filePath);
            return $this->decryptSignature($encryptedData);

        } catch (\Exception $e)
        {
            throw new \Exception('Failed to load encrypted signature: ' . $e->getMessage());
        }
    }

    public function deleteEncryptedSignature(string $filePath): bool
    {

        try
        {
            if (Storage::disk('local')->exists($filePath))
            {
                return Storage::disk('local')->delete($filePath);
            }
            return TRUE;
        } catch (\Exception $e)
        {
            throw new \Exception('Failed to delete signature: ' . $e->getMessage());
        }
    }

    protected function isValidSignature(string $signatureData): bool
    {

        // Basic validation - check if it's a data URL format
        if (empty($signatureData))
        {
            return FALSE;
        }

        // Check if it's a data URL (image data)
        if (strpos($signatureData, 'data:image/') === 0)
        {
            return TRUE;
        }

        // Check if it's SVG format
        if (strpos($signatureData, '<svg') === 0)
        {
            return TRUE;
        }

        return FALSE;
    }

    public function generateSignatureHash(string $signatureData): string
    {

        return hash('sha256', $signatureData);
    }

    public function validateSignatureIntegrity(string $signatureData, string $expectedHash): bool
    {

        $actualHash = $this->generateSignatureHash($signatureData);
        return hash_equals($expectedHash, $actualHash);
    }

}
