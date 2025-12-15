import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppRoute } from '../types';
import { decryptData } from '../services/crypto';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Upload, QrCode, X, LockOpen, FileText } from 'lucide-react';

const Read: React.FC = () => {
  const { navigate, password } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [fileName, setFileName] = useState<string>('');

  const handleBack = () => {
    navigate(AppRoute.HOME);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate extension (relaxed for mobile which might not have extensions)
    if (!file.name.endsWith('.qrd') && !file.type.includes('text') && !file.type.includes('octet-stream')) {
      // Just a warning, but we still try to read it if user insists on some devices
      // For this app, strict validation is safer to avoid confusion
      if(!file.name.endsWith('.qrd')) {
          setError('警告: 文件名未使用 .qrd 后缀，可能无法识别');
      }
    }

    setFileName(file.name);
    setError(null);
    setDecryptedContent(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const encryptedContent = event.target?.result as string;
      if (encryptedContent) {
        try {
          // Robustly trim the content to remove potential BOM or trailing newlines
          const content = await decryptData(encryptedContent.trim(), password);
          setDecryptedContent(content);
        } catch (err) {
          setError(err instanceof Error ? err.message : '解密失败');
        }
      }
    };
    reader.onerror = () => {
      setError('读取文件失败');
    };
    reader.readAsText(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white relative">
      {/* Header */}
      <div className="p-4 flex items-center bg-slate-800 shadow-md z-10">
        <button onClick={handleBack} className="p-2 rounded-full hover:bg-slate-700 transition">
          <ArrowLeft size={24} />
        </button>
        <h2 className="ml-4 text-lg font-semibold">读取本地文件</h2>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center overflow-y-auto">
        
        {/* File Selection Area */}
        <div 
          onClick={triggerFileSelect}
          className="w-full py-8 border-2 border-dashed border-slate-600 rounded-2xl flex flex-col items-center justify-center bg-slate-800/50 hover:bg-slate-800 hover:border-brand-500 transition-all cursor-pointer mb-8 group"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            // Allow .qrd, generic text, and any file (*) to ensure iOS Files app lets user select it
            accept=".qrd,text/plain,application/octet-stream,*" 
            className="hidden" 
          />
          <div className="p-4 bg-slate-700 rounded-full mb-3 group-hover:scale-110 transition-transform">
             <Upload size={32} className="text-brand-400" />
          </div>
          <p className="text-slate-300 font-medium">点击选择 .qrd 文件</p>
          <p className="text-xs text-slate-500 mt-1">支持扩展名: .qrd</p>
        </div>

        {/* Status / Error Message */}
        {fileName && (
           <div className="w-full flex items-center justify-between bg-slate-800 p-3 rounded-lg mb-4">
             <div className="flex items-center truncate">
               <FileText size={16} className="mr-2 text-slate-400 shrink-0"/>
               <span className="text-sm text-slate-300 truncate">{fileName}</span>
             </div>
           </div>
        )}

        {error && (
          <div className="w-full p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-200 text-sm flex items-center mb-6">
             <div className="mr-3 text-red-500">✕</div>
             {error}
          </div>
        )}

        {/* Decrypted Content Display */}
        {decryptedContent && (
          <div className="w-full flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center mb-2 text-green-400">
               <LockOpen size={18} className="mr-2"/>
               <span className="font-bold text-sm">解密成功</span>
            </div>
            
            <div className="w-full bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-inner flex-1 max-h-[40vh] overflow-y-auto mb-6">
                <p className="text-slate-300 break-words font-mono text-sm whitespace-pre-wrap">
                    {decryptedContent}
                </p>
            </div>

            <button 
              onClick={() => setShowQRModal(true)}
              className="w-full py-4 bg-brand-600 hover:bg-brand-500 active:bg-brand-700 rounded-xl font-bold flex items-center justify-center shadow-lg shadow-brand-900/50 text-white mt-auto transition-all"
            >
              <QrCode className="mr-2" />
              生成二维码
            </button>
          </div>
        )}
      </div>

      {/* QR Code Modal (Semi-transparent overlay) */}
      {showQRModal && decryptedContent && (
        <div 
          className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200"
          onClick={() => setShowQRModal(false)}
        >
          <div 
            className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center relative max-w-sm w-full"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content
          >
             <button 
               onClick={() => setShowQRModal(false)}
               className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
             >
               <X size={24} />
             </button>
             
             <h3 className="text-slate-900 font-bold text-lg mb-6">数据二维码</h3>
             
             <div className="p-2 border-4 border-slate-100 rounded-xl">
               <QRCodeSVG 
                 value={decryptedContent} 
                 size={240}
                 level={"M"}
                 includeMargin={true}
               />
             </div>
             
             <p className="mt-6 text-slate-500 text-xs text-center">
               点击空白区域关闭
             </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Read;