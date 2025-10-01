'use client';

import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { NotFoundException } from '@zxing/library';
import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';

interface BarcodeScannerProps {
  onScan: (result: string) => void;
  scanFiscalCoupon?: boolean;
  onClose?: () => void; // New prop
}

export function BarcodeScanner({ onScan, scanFiscalCoupon, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef(new BrowserMultiFormatReader());
  const controlsRef = useRef<IScannerControls | undefined>();
  const [isScanningInternal, setIsScanningInternal] = useState(false); // Internal state for regular barcode scanning
  const [error, setError] = useState<string | null>(null);

  // Determine if the scanner should be active based on props and internal state
  const isScannerActive = isScanningInternal || (scanFiscalCoupon ?? false);

  useEffect(() => {
    const codeReader = codeReaderRef.current;

    if (!isScannerActive) {
      // If scanner is not active, stop any ongoing scanning and clear controls
      if (controlsRef.current) {
        controlsRef.current.stop();
        controlsRef.current = undefined;
      }
      return;
    }

    if (!videoRef.current) return;

    let selectedDeviceId: string;

    const startScanner = async () => {
      try {
        const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
        if (videoInputDevices.length === 0) {
          setError('No video input devices found');
          return;
        }
        selectedDeviceId = videoInputDevices[0].deviceId;

        controlsRef.current = await codeReader.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (result, err) => {
          if (result) {
            onScan(result.getText());
            // If it's a regular barcode scan, stop the internal scanning state
            if (!scanFiscalCoupon) {
              setIsScanningInternal(false);
            }
            // For fiscal coupon, parent component will handle closing via onClose prop
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

    // Cleanup function: stop the scanner when component unmounts or dependencies change
    return () => {
      if (controlsRef.current) {
        controlsRef.current.stop();
        controlsRef.current = undefined;
      }
    };
  }, [isScannerActive, onScan, scanFiscalCoupon]); // Depend on isScannerActive to trigger start/stop

  return (
    <div>
      {!scanFiscalCoupon && (
        <Button onClick={() => setIsScanningInternal(!isScanningInternal)}>
          {isScanningInternal ? 'Close Scanner' : 'Scan Barcode'}
        </Button>
      )}
      {isScannerActive && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <video ref={videoRef} className="w-full h-full" />
          <Button
            onClick={() => {
              setIsScanningInternal(false); // Always reset internal state
              if (onClose) {
                onClose(); // Notify parent to close fiscal coupon scanner
              }
            }}
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
