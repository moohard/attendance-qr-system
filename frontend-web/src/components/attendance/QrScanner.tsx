import { useRef, useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';

interface QrScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  title?: string;
}

export const QrScanner = ({ onScan, onClose, title = 'Scan QR Code' }: QrScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    initCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
      }
    } catch (error) {
      setHasPermission(false);
      console.error('Camera access denied:', error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleManualInput = () => {
    const qrContent = prompt('Enter QR code content manually:');
    if (qrContent) {
      onScan(qrContent);
    }
  };

  if (hasPermission === false) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Camera access is required to scan QR codes</p>
            <Button onClick={handleManualInput}>
              Enter QR Code Manually
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-64 object-cover rounded-lg"
          />
          <div className="absolute inset-0 border-4 border-primary-500 rounded-lg pointer-events-none" />
        </div>
        
        <div className="mt-4 flex space-x-3">
          <Button onClick={handleManualInput} variant="outline">
            Manual Input
          </Button>
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};