import { useRef, useEffect, useState, useCallback } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Modal } from '../ui/Modal';
import QrScanner from 'qr-scanner';

interface QrScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  title?: string;
}

export const QrScannerComponent = ({ onScan, onClose, title = 'Scan QR Code' }: QrScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isManualInputOpen, setIsManualInputOpen] = useState(false);
  const [manualQr, setManualQr] = useState('');
  const [scanner, setScanner] = useState<QrScanner | null>(null);
  const [cameraError, setCameraError] = useState('');

  const handleScanResult = useCallback((result: QrScanner.ScanResult) => {
    scanner?.stop();
    console.log('decoded qr code:', result);
    onScan(result.data);
  }, [onScan, scanner]);

  const handleActivateCamera = () => {
    if (videoRef.current) {
      const newScanner = new QrScanner(
        videoRef.current,
        handleScanResult,
        {
          onDecodeError: error => console.warn(error),
          highlightScanRegion: true,
          highlightCodeOutline: true,
        },
      );

      setScanner(newScanner);

      newScanner.start().then(() => {
        setHasPermission(true);
        setCameraError(''); // Clear any previous error
      }).catch(err => {
        console.error("Camera start failed:", err);
        setHasPermission(false);
        if (err.name === 'NotAllowedError') {
            setCameraError('Camera access was denied. Please check your browser permissions for this site.');
        } else if (err.name === 'NotFoundError') {
            setCameraError('No camera was found on this device.');
        } else {
            setCameraError('Could not start the camera. Please ensure it is not being used by another application.');
        }
      });
    } else {
      console.error("Video element ref not found.");
    }
  };

  useEffect(() => {
    // Cleanup scanner on component unmount
    return () => {
      scanner?.destroy();
    };
  }, [scanner]);

  const handleManualSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (manualQr) {
      onScan(manualQr);
      setIsManualInputOpen(false);
      setManualQr('');
    }
  };

  const ManualInputModal = () => (
    <Modal
      isOpen={isManualInputOpen}
      onClose={() => setIsManualInputOpen(false)}
      title="Enter QR Code Manually"
    >
      <form onSubmit={handleManualSubmit} className="p-6 space-y-4">
        <Input
          label="QR Code Content"
          value={manualQr}
          onChange={(e) => setManualQr(e.target.value)}
          placeholder="Paste QR content here"
          required
        />
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => setIsManualInputOpen(false)}>
            Cancel
          </Button>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Modal>
  );

  const renderInitialView = () => (
    <div className="text-center py-8">
      <p className="mb-4">Camera access is required to scan QR codes.</p>
      <Button onClick={handleActivateCamera}>
        Activate Camera
      </Button>
    </div>
  );

  const renderPermissionDeniedView = () => (
    <div className="text-center py-8">
      <p className="text-red-600 mb-4">{cameraError || 'Camera access was denied. Please enable it in your browser settings.'}</p>
      <Button onClick={() => setIsManualInputOpen(true)}>
        Enter QR Code Manually
      </Button>
    </div>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Video element is always rendered but hidden initially */}
            <video
              ref={videoRef}
              className="w-full h-64 object-cover rounded-lg bg-gray-200"
            />
            
            {/* Overlay for the scanning region */}
            {hasPermission === true && <div className="absolute inset-0 border-4 border-primary-500 rounded-lg pointer-events-none animate-pulse" />} 

            {/* Conditional content based on permission status */}
            {hasPermission === null && renderInitialView()}
            {hasPermission === false && renderPermissionDeniedView()}
          </div>

          <div className="mt-4 flex space-x-3">
            <Button onClick={() => setIsManualInputOpen(true)} variant="outline">
              Manual Input
            </Button>
            <Button onClick={onClose} variant="secondary">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
      <ManualInputModal />
    </>
  );
};



