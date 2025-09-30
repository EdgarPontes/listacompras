'use client';

import { BrowserMultiFormatReader, NotFoundException } from '@zxing/browser';
import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';

interface BarcodeScannerProps {
  onScan: (result: string) => void;
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isScanning || !videoRef.current) return;

    const codeReader = new BrowserMultiFormatReader();
    let selectedDeviceId: string;

    const startScanner = async () => {
      try {
        const videoInputDevices = await codeReader.listVideoInputDevices();
        if (videoInputDevices.length === 0) {
          setError('No video input devices found');
          return;
        }
        selectedDeviceId = videoInputDevices[0].deviceId;

        codeReader.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (result, err) => {
          if (result) {
            onScan(result.getText());
            setIsScanning(false);
          }
          if (err && !(err instanceof NotFoundException)) {
            setError(err.message);
          }
        });
      } catch (err) {
        setError((err as Error).message);
      }
    };

    startScanner();

    return () => {
      codeReader.reset();
    };
  }, [isScanning, onScan]);

  return (
    <div>
      <Button onClick={() => setIsScanning(!isScanning)}>
        {isScanning ? 'Close Scanner' : 'Scan Barcode'}
      </Button>
      {isScanning && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <video ref={videoRef} className="w-full h-full" />
          <Button
            onClick={() => setIsScanning(false)}
            className="absolute top-4 right-4"
            variant="destructive"
          >
            Close
          </Button>
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
