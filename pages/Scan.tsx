import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { useApp } from '../context/AppContext';
import { AppRoute } from '../types';
import { encryptData } from '../services/crypto';
import { ArrowLeft, Save, RefreshCw, Loader2 } from 'lucide-react';

const Scan: React.FC = () => {
  const { navigate, password } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const requestRef = useRef<number>();

  // Helper to immediately stop camera and animation frame
  const stopCamera = () => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = undefined;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    // Start camera stream
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Required for iOS to play video inline
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.play();
          requestRef.current = requestAnimationFrame(tick);
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        alert('无法访问摄像头，请确保已授予权限。');
        setIsScanning(false);
      }
    };

    if (isScanning) {
      startVideo();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScanning]);

  const tick = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // Attempt to decode QR code
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code) {
            stopCamera(); // Immediately stop camera hardware
            setScanResult(code.data);
            setIsScanning(false);
            // Stop scanning loop
            return;
          }
        }
      }
    }
    requestRef.current = requestAnimationFrame(tick);
  };

  const handleSave = async () => {
    if (!scanResult) return;
    setIsSaving(true);
    try {
      // 1. Encrypt
      const encryptedBase64 = await encryptData(scanResult, password);
      
      // 2. Create Blob
      // Using application/octet-stream forces a "Save" prompt on more devices, specifically iOS
      const blob = new Blob([encryptedBase64], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      
      // 3. Trigger Download
      const a = document.createElement('a');
      a.href = url;
      // Format timestamp for filename: YYYYMMDD_HHMMSS
      const now = new Date();
      const timestamp = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
      a.download = `secure_qr_${timestamp}.qrd`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      alert('保存失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRescan = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  const handleBack = () => {
    navigate(AppRoute.HOME);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white">
      {/* Header */}
      <div className="p-4 flex items-center bg-slate-800 shadow-md z-10">
        <button onClick={handleBack} className="p-2 rounded-full hover:bg-slate-700 transition">
          <ArrowLeft size={24} />
        </button>
        <h2 className="ml-4 text-lg font-semibold">
            {isScanning ? '扫描二维码' : '扫描结果'}
        </h2>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto relative flex flex-col">
        {isScanning ? (
          <div className="flex-1 relative bg-black flex flex-col justify-center overflow-hidden">
             {/* Camera View */}
             <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" />
             <canvas ref={canvasRef} className="hidden" />
             
             {/* Scanner Overlay */}
             <div className="absolute inset-0 border-[40px] border-black/50 z-10">
                <div className="w-full h-full border-2 border-brand-500 relative animate-pulse shadow-[0_0_20px_rgba(14,165,233,0.5)]">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-brand-500 -mt-1 -ml-1"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-brand-500 -mt-1 -mr-1"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-brand-500 -mb-1 -ml-1"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-brand-500 -mb-1 -mr-1"></div>
                </div>
             </div>
             <p className="absolute bottom-10 w-full text-center text-white/80 z-20 text-sm font-medium">
               将二维码对准扫描框
             </p>
          </div>
        ) : (
          /* Result View */
          <div className="flex-1 p-6 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-900/20">
                 <RefreshCw size={40} className="text-white" />
             </div>
             <h3 className="text-xl font-bold mb-4 text-brand-100">扫描成功</h3>
             
             <div className="w-full bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-inner max-h-[40vh] overflow-y-auto mb-6">
                <p className="text-slate-300 break-words font-mono text-sm">
                    {scanResult}
                </p>
             </div>

             <div className="w-full mt-auto space-y-4">
                 <button 
                   onClick={handleSave} 
                   disabled={isSaving}
                   className="w-full py-4 bg-brand-600 hover:bg-brand-500 active:bg-brand-700 rounded-xl font-bold flex items-center justify-center shadow-lg shadow-brand-900/50 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                 >
                    {isSaving ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2" />}
                    {isSaving ? '加密保存中...' : '加密并保存数据 (.qrd)'}
                 </button>

                 <button 
                   onClick={handleRescan} 
                   className="w-full py-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold flex items-center justify-center text-slate-200"
                 >
                    <RefreshCw className="mr-2" />
                    重新扫描
                 </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scan;