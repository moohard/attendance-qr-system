<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SignatureEncryptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class SignatureController extends Controller
{

    protected $encryptionService;

    public function __construct(SignatureEncryptionService $encryptionService)
    {

        $this->encryptionService = $encryptionService;
    }

    public function saveSignature(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'signature_data' => 'required|string',
            'document_id'    => 'nullable|string|max:255',
            'description'    => 'nullable|string|max:500',
        ]);

        if ($validator->fails())
        {
            return response()->json($validator->errors(), 422);
        }

        try
        {
            $signatureData = $request->signature_data;

            // Save encrypted signature
            $filePath = $this->encryptionService->saveEncryptedSignature($signatureData);

            // Generate hash for integrity verification
            $signatureHash = $this->encryptionService->generateSignatureHash($signatureData);

            // Here you would typically save to database
            $signatureRecord = [
                'file_path'   => $filePath,
                'hash'        => $signatureHash,
                'document_id' => $request->document_id,
                'description' => $request->description,
                'user_id'     => auth()->id(),
                'created_at'  => now(),
            ];

            // In a real application, you'd save this to a database
            // Signature::create($signatureRecord);

            return response()->json([
                'success'      => TRUE,
                'signature_id' => basename($filePath, '.enc'),
                'file_path'    => $filePath,
                'hash'         => $signatureHash,
                'message'      => 'Signature saved successfully',
            ]);

        } catch (\Exception $e)
        {
            return response()->json([
                'success' => FALSE,
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function getSignature($signatureId)
    {

        try
        {
            $filePath = 'signatures/signature_' . $signatureId . '.enc';

            $signatureData = $this->encryptionService->loadEncryptedSignature($filePath);

            return response()->json([
                'success'        => TRUE,
                'signature_data' => $signatureData,
            ]);

        } catch (\Exception $e)
        {
            return response()->json([
                'success' => FALSE,
                'error'   => $e->getMessage(),
            ], 404);
        }
    }

    public function verifySignature(Request $request, $signatureId)
    {

        $validator = Validator::make($request->all(), [
            'expected_hash' => 'required|string|size:64',
        ]);

        if ($validator->fails())
        {
            return response()->json($validator->errors(), 422);
        }

        try
        {
            $filePath = 'signatures/signature_' . $signatureId . '.enc';

            $signatureData = $this->encryptionService->loadEncryptedSignature($filePath);

            $isValid = $this->encryptionService->validateSignatureIntegrity(
                $signatureData,
                $request->expected_hash,
            );

            return response()->json([
                'success'  => TRUE,
                'is_valid' => $isValid,
                'message'  => $isValid ? 'Signature is valid' : 'Signature has been tampered with',
            ]);

        } catch (\Exception $e)
        {
            return response()->json([
                'success' => FALSE,
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function deleteSignature($signatureId)
    {

        try
        {
            $filePath = 'signatures/signature_' . $signatureId . '.enc';

            $success = $this->encryptionService->deleteEncryptedSignature($filePath);

            return response()->json([
                'success' => $success,
                'message' => $success ? 'Signature deleted successfully' : 'Signature not found',
            ]);

        } catch (\Exception $e)
        {
            return response()->json([
                'success' => FALSE,
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function testSignature(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'signature_data' => 'required|string',
        ]);

        if ($validator->fails())
        {
            return response()->json($validator->errors(), 422);
        }

        try
        {
            $signatureData = $request->signature_data;

            // Test encryption/decryption roundtrip
            $encrypted = $this->encryptionService->encryptSignature($signatureData);
            $decrypted = $this->encryptionService->decryptSignature($encrypted);

            $isValid = $signatureData === $decrypted;
            $hash    = $this->encryptionService->generateSignatureHash($signatureData);

            return response()->json([
                'success'          => TRUE,
                'is_valid'         => $isValid,
                'hash'             => $hash,
                'original_length'  => strlen($signatureData),
                'encrypted_length' => strlen($encrypted),
                'message'          => $isValid ? 'Signature encryption test passed' : 'Signature encryption test failed',
            ]);

        } catch (\Exception $e)
        {
            return response()->json([
                'success' => FALSE,
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

}
