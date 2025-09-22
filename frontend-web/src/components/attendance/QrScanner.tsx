import { useRef, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Modal } from '../ui/Modal'; // 1. Import Modal
import QrScanner from 'qr-scanner';

interface QrScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  title?: string;
}

export const QrScannerComponent = ({ onScan, onClose, title = 'Scan QR Code' }: QrScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isManualInputOpen, setIsManualInputOpen] = useState(false); // 2. State untuk mengontrol modal
  const [manualQr, setManualQr] = useState('');

  useEffect(() => {
    let scanner: QrScanner | null = null;
    if (videoRef.current && hasPermission !== false) {
      scanner = new QrScanner(
        videoRef.current,
        result => {
          console.log('decoded qr code:', result);
          onScan(result.data);
        },
        {
          onDecodeError: error => {
            console.warn(error);
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
        },
      );

      scanner.start().then(() => {
        setHasPermission(true);
      }).catch(err => {
        console.error("Camera start failed:", err);
        setHasPermission(false);
      });
    }

    return () => {
      scanner?.destroy();
    };
  }, [onScan, hasPermission]);


  const handleManualSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (manualQr) {
      onScan(manualQr);
      setIsManualInputOpen(false);
      setManualQr('');
    }
  };

  // Komponen Modal untuk input manual
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

  // Tampilan jika izin kamera ditolak
  if (hasPermission === false) {
    return (
      <>
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">Camera access is required or was denied.</p>
              <Button onClick={() => setIsManualInputOpen(true)}>
                Enter QR Code Manually
              </Button>
            </div>
          </CardContent>
        </Card>
        <ManualInputModal />
      </>
    );
  }

  // Tampilan utama pemindai
  return (
    <>
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full h-64 object-cover rounded-lg bg-gray-200"
            />
            {hasPermission && <div className="absolute inset-0 border-4 border-primary-500 rounded-lg pointer-events-none animate-pulse" />}
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

