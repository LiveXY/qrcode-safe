
import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

interface ScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string>('');
  const requestRef = useRef<number>();

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        const constraints = {
          video: { facingMode: 'environment' }
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Required for iOS to play video inline
          videoRef.current.setAttribute("playsinline", "true"); 
          videoRef.current.play();
          requestRef.current = requestAnimationFrame(tick);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("无法访问相机。请确保已授予权限。");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tick = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code && code.data) {
            onScan(code.data);
            return; // Stop loop on success
          }
        }
      }
    }
    requestRef.current = requestAnimationFrame(tick);
  };

  return (
    <div className="flex flex-col h-full bg-black relative">
      {/* Header / Back */}
      <div className="absolute top-0 left-0 w-full p-4 z-10 bg-gradient-to-b from-black/80 to-transparent">
        <button 
          onClick={onClose}
          className="text-white bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm"
        >
          关闭相机
        </button>
      </div>

      {/* Video Viewport */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {error ? (
          <div className="text-red-500 text-center px-6">{error}</div>
        ) : (
          <>
             {/* Hidden canvas for processing */}
            <canvas ref={canvasRef} className="hidden" />
            <video 
              ref={videoRef} 
              className="absolute w-full h-full object-cover" 
              muted 
            />
            {/* Scanning Overlay UI */}
            <div className="absolute inset-0 border-[50px] border-black/50 z-0 pointer-events-none">
              <div className="w-full h-full border-2 border-green-400 relative opacity-70 animate-pulse">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500 shadow-[0_0_10px_rgba(255,0,0,0.8)]" />
              </div>
            </div>
            <p className="absolute bottom-10 text-white bg-black/50 px-4 py-1 rounded-full text-sm font-mono z-10">
              正在扫描...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Scanner;
