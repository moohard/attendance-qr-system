import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '../ui/Button';

interface SignatureCanvasProps {
    onSave: (signatureData: string) => void;
    onCancel: () => void;
    width?: number;
    height?: number;
    penColor?: string;
    penWidth?: number;
}

export const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
    onSave,
    onCancel,
    width = 400,
    height = 200,
    penColor = '#000000',
    penWidth = 2,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Setup drawing style
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = penWidth;
        ctx.strokeStyle = penColor;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        setContext(ctx);
    }, [width, height, penColor, penWidth]);

    const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!context) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        let x: number, y: number;

        if ('touches' in e) {
            // Touch event
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            // Mouse event
            x = e.nativeEvent.offsetX;
            y = e.nativeEvent.offsetY;
        }

        context.beginPath();
        context.moveTo(x, y);
        setIsDrawing(true);
    }, [context]);

    const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !context) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        let x: number, y: number;

        if ('touches' in e) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.nativeEvent.offsetX;
            y = e.nativeEvent.offsetY;
        }

        context.lineTo(x, y);
        context.stroke();
    }, [isDrawing, context]);

    const stopDrawing = useCallback(() => {
        setIsDrawing(false);
        setHasSignature(true);
    }, []);

    const clearCanvas = useCallback(() => {
        if (!context) return;

        context.clearRect(0, 0, width, height);
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, width, height);
        context.fillStyle = '#000000'; // Reset fill style
        setHasSignature(false);
    }, [context, width, height]);

    const saveSignature = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dataUrl = canvas.toDataURL('image/png');
        onSave(dataUrl);
    }, [onSave]);

    // Handle mouse/touch events
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        startDrawing(e);
    }, [startDrawing]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        e.preventDefault();
        startDrawing(e);
    }, [startDrawing]);

    return (
        <div className="signature-canvas-container">
            <div className="border-2 border-gray-300 rounded-lg mb-4 bg-white">
                <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={handleTouchStart}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="cursor-crosshair block"
                    style={{
                        width: `${width}px`,
                        height: `${height}px`,
                        touchAction: 'none'
                    }}
                />
            </div>

            <div className="flex flex-wrap gap-3">
                <Button
                    variant="outline"
                    onClick={clearCanvas}
                    disabled={!hasSignature}
                    size="sm"
                >
                    🗑️ Clear
                </Button>

                <Button
                    onClick={saveSignature}
                    disabled={!hasSignature}
                    size="sm"
                >
                    💾 Save Signature
                </Button>

                <Button
                    variant="outline"
                    onClick={onCancel}
                    size="sm"
                >
                    ❌ Cancel
                </Button>
            </div>

            <p className="text-sm text-gray-500 mt-2">
                Draw your signature in the box above
            </p>

            <style jsx>{`
        .signature-canvas-container {
          max-width: 100%;
          overflow: hidden;
        }
        canvas {
          border: 1px solid #ddd;
          border-radius: 4px;
        }
      `}</style>
        </div>
    );
};