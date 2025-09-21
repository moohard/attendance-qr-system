import React, { useRef, useState, useCallback } from 'react';
import { Button } from '../ui/Button';

interface SignatureCanvasProps {
    onSave: (signatureData: string) => void;
    onCancel: () => void;
    width?: number;
    height?: number;
}

export const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
    onSave,
    onCancel,
    width = 400,
    height = 200,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);

    const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
        const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;

        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    }, []);

    const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
        const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;

        ctx.lineTo(x, y);
        ctx.stroke();
    }, [isDrawing]);

    const stopDrawing = useCallback(() => {
        setIsDrawing(false);
        setHasSignature(true);
    }, []);

    const clearCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
    }, []);

    const saveSignature = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dataUrl = canvas.toDataURL('image/svg+xml');
        onSave(dataUrl);
    }, [onSave]);

    // Initialize canvas
    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000';

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);
    }, [width, height]);

    return (
        <div className="signature-canvas">
            <div className="border-2 border-gray-300 rounded-lg mb-4">
                <canvas
                    ref={canvasRef}
                    width={width}
                    height={height}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="cursor-crosshair bg-white"
                    style={{ touchAction: 'none' }}
                />
            </div>

            <div className="flex space-x-3">
                <Button
                    variant="outline"
                    onClick={clearCanvas}
                    disabled={!hasSignature}
                >
                    Clear
                </Button>

                <Button
                    onClick={saveSignature}
                    disabled={!hasSignature}
                >
                    Save Signature
                </Button>

                <Button
                    variant="outline"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
            </div>

            <p className="text-sm text-gray-500 mt-2">
                Draw your signature in the box above
            </p>
        </div>
    );
};