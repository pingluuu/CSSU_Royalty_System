import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ onScanSuccess, onClose }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      false
    );

    scanner.render(
      (decodedText) => {
        onScanSuccess(decodedText);
        scanner.clear().then(onClose).catch(console.error);
      },
      (error) => {
        console.warn('QR Scan error:', error);
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [onScanSuccess, onClose]);

  return <div id="reader" style={{ width: '100%' }} />;
};

export default QrScanner;
