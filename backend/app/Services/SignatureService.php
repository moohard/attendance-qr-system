<?php

namespace App\Services;

use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;

class SignatureService
{

    public function saveSignature(string $signatureData, string $fileName = NULL)
    {

        try
        {
            // Encrypt signature data
            $encryptedData = Crypt::encrypt($signatureData);

            // Generate filename if not provided
            $fileName = $fileName ?? 'signature_' . time() . '.dat';
            $filePath = 'signatures/' . $fileName;

            // Save encrypted signature to storage
            Storage::disk('local')->put($filePath, $encryptedData);

            return $filePath;

        } catch (\Exception $e)
        {
            throw new \Exception('Failed to save signature: ' . $e->getMessage());
        }
    }

    public function getSignature(string $filePath)
    {

        try
        {
            if (!Storage::disk('local')->exists($filePath))
            {
                throw new \Exception('Signature file not found');
            }

            $encryptedData = Storage::disk('local')->get($filePath);
            return Crypt::decrypt($encryptedData);

        } catch (\Exception $e)
        {
            throw new \Exception('Failed to retrieve signature: ' . $e->getMessage());
        }
    }

    public function validateSignature(string $signatureData): bool
    {

        // Basic validation - bisa ditambah dengan logic yang lebih complex
        if (empty($signatureData))
        {
            return FALSE;
        }

        // Check if it's a valid SVG format (untuk signature drawing)
        if (strpos($signatureData, '<svg') === FALSE)
        {
            return FALSE;
        }

        // Additional validation logic bisa ditambah di sini
        return TRUE;
    }

    public function deleteSignature(string $filePath): bool
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

}
