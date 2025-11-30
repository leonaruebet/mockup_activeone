/**
 * QR Code Display Component
 * Purpose: Display QR codes for Telegram authentication
 * Location: shared/ui/src/components/integration/qr_code_display.tsx
 */

'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Loader2, RefreshCw } from 'lucide-react';

interface QRCodeDisplayProps {
  data: string;
  size?: number;
  className?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

/**
 * QRCodeDisplay
 * Purpose: Render QR code from string data
 * @param data - QR code data string
 * @param size - Size in pixels (default: 256)
 * @param className - Additional CSS classes
 * @param onRefresh - Callback to refresh QR code
 * @param isRefreshing - Show refreshing state
 */
export function QRCodeDisplay({
  data,
  size = 256,
  className = '',
  onRefresh,
  isRefreshing = false,
}: QRCodeDisplayProps) {
  const [qr_image, set_qr_image] = useState<string>('');
  const [is_loading, set_is_loading] = useState(true);
  const [error, set_error] = useState<string | null>(null);

  useEffect(() => {
    if (!data) {
      set_is_loading(false);
      set_error('No QR code data provided');
      return;
    }

    set_is_loading(true);
    set_error(null);

    QRCode.toDataURL(data, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => {
        set_qr_image(url);
        set_is_loading(false);
      })
      .catch((err) => {
        console.error('QR code generation error:', err);
        set_error('Failed to generate QR code');
        set_is_loading(false);
      });
  }, [data, size]);

  if (is_loading || isRefreshing) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ width: size, height: size }}
      >
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-red-50 rounded-lg p-4 ${className}`}
        style={{ width: size, height: size }}
      >
        <p className="text-red-600 text-sm text-center">{error}</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="mt-2 text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <img
        src={qr_image}
        alt="QR Code"
        className="rounded-lg border-2 border-gray-200"
        style={{ width: size, height: size }}
      />
      {onRefresh && !isRefreshing && (
        <button
          onClick={onRefresh}
          className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
          title="Refresh QR Code"
        >
          <RefreshCw className="w-4 h-4 text-gray-600" />
        </button>
      )}
    </div>
  );
}

/**
 * QRCodeCard
 * Purpose: QR code with surrounding card UI and instructions
 */
interface QRCodeCardProps {
  data: string;
  title: string;
  instructions: string[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export function QRCodeCard({
  data,
  title,
  instructions,
  onRefresh,
  isRefreshing,
  className = '',
}: QRCodeCardProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>

      <div className="flex flex-col items-center">
        <QRCodeDisplay
          data={data}
          size={256}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          className="mb-4"
        />

        <div className="w-full max-w-md">
          <p className="text-sm font-medium text-gray-700 mb-2">How to scan:</p>
          <ol className="list-decimal list-inside space-y-1.5">
            {instructions.map((instruction, index) => (
              <li key={index} className="text-sm text-gray-600">
                {instruction}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
