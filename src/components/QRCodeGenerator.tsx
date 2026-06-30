import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  className?: string;
}

export default function QRCodeGenerator({ value, size = 150, className = "" }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: size,
          margin: 1,
          color: {
            dark: '#3d4234', // Moss/olive palette dark color
            light: '#f5f5f0', // Cream palette light background
          },
        },
        (error) => {
          if (error) console.error('QR Code Generation Error:', error);
        }
      );
    }
  }, [value, size]);

  return (
    <div className="flex flex-col items-center justify-center p-2 bg-[#f5f5f0] rounded-2xl border border-[#e5e5dc]">
      <canvas 
        ref={canvasRef} 
        className={`rounded-xl ${className}`}
        style={{ width: size, height: size }}
      />
    </div>
  );
}
