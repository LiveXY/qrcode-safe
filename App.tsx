import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  QrCode, 
  FileLock, 
  Save, 
  ArrowLeft, 
  Lock, 
  Unlock, 
  Download,
  KeyRound,
  Eye,
  X
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Scanner from './components/Scanner';
import { AppScreen, SecurityContext, QRDFile } from './types';
import { 
  generateSecurityContext, 
  encryptData, 
  decryptData, 
  generateEnvContent 
} from './utils/security';

const App: React.FC = () => {
  // Navigation State
  const [screen, setScreen] = useState<AppScreen>(AppScreen.HOME);
  
  // Data State
  const [scannedData, setScannedData] = useState<string>('');
  const [readData, setReadData] = useState<string>('');
  const [securityContext, setSecurityContext] = useState<SecurityContext | null>(null);
  
  // UI State
  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Initialize Security Context on Mount
  useEffect(() => {
    // In a real scenario, this might come from local storage, 
    // but the requirement says "randomly initialize". 
    // We will generate it, but allow the user to see/save it.
    const ctx = generateSecurityContext();
    setSecurityContext(ctx);
  }, []);

  // Helper to trigger file download
  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification(`已下载 ${filename}`);
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // --- Handlers ---

  const handleScanSuccess = (data: string) => {
    setScannedData(data);
    setScreen(AppScreen.SCAN_RESULT);
  };

  const handleSaveEncrypted = () => {
    if (!securityContext || !scannedData) return;

    // Encrypt
    const encrypted = encryptData(scannedData, securityContext);
    
    const fileContent: QRDFile = {
      version: "1.0",
      data: encrypted
    };

    // Save .qrd
    downloadFile(`secure_data_${Date.now()}.qrd`, JSON.stringify(fileContent, null, 2), 'application/json');

    // Save .env (as per requirement)
    const envContent = generateEnvContent(securityContext);
    downloadFile('.env', envContent, 'text/plain');
  };

  const handleFileRead = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed: QRDFile = JSON.parse(content);
        
        if (!parsed.data) throw new Error("Invalid format");
        
        // Decrypt using current context
        // NOTE: In a real app, we might need to ask the user for the .env key file 
        // if it differs from the current session key. 
        // For this demo, we assume the user is in the same session or we can add a key importer.
        // If decryption fails, it usually returns empty string or garbage.
        if (securityContext) {
           const decrypted = decryptData(parsed.data, securityContext);
           if (!decrypted) {
             alert("解密失败。请确保使用了正确的密钥/IV。");
             return;
           }
           setReadData(decrypted);
           setScreen(AppScreen.READ_RESULT);
        }
      } catch (err) {
        alert("无法读取 .qrd 文件。文件可能已损坏。");
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  // --- Renderers ---

  const renderHome = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      {/* Top Section - Icon (60%) */}
      <div className="h-[60%] flex flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-800 to-slate-900 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -top-20 -left-20 animate-pulse"></div>
        <div className="absolute w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl bottom-10 right-10"></div>
        
        <div className="z-10 bg-slate-800/80 p-8 rounded-3xl border border-slate-700 shadow-2xl backdrop-blur-md">
           <ShieldCheck size={120} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
        </div>
        <h1 className="mt-8 text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
          安全二维码
        </h1>
        <p className="text-slate-400 text-sm mt-2 font-mono">AES-256 加密保险箱</p>
        
        {/* Key Info (Small) */}
        <div className="absolute top-4 right-4 cursor-pointer opacity-50 hover:opacity-100 transition-opacity" onClick={() => {
            if(securityContext) downloadFile('current_session.env', generateEnvContent(securityContext), 'text/plain');
        }}>
           <KeyRound size={20} className="text-slate-400" />
        </div>
      </div>

      {/* Bottom Section - Buttons (40%) */}
      <div className="h-[40%] flex flex-col justify-center px-6 gap-6 bg-slate-950 pb-8 rounded-t-3xl -mt-6 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-slate-800">
        
        <button 
          onClick={() => setScreen(AppScreen.SCAN_QR)}
          className="group relative flex items-center justify-center gap-4 w-full bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-semibold py-5 rounded-2xl border border-slate-700 transition-all shadow-lg overflow-hidden"
        >
          <div className="absolute inset-0 bg-emerald-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <QrCode size={28} className="text-emerald-400" />
          <span className="text-lg tracking-wide z-10">扫描二维码</span>
        </button>

        <label className="group relative flex items-center justify-center gap-4 w-full bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white font-semibold py-5 rounded-2xl border border-slate-700 transition-all shadow-lg overflow-hidden cursor-pointer">
          <div className="absolute inset-0 bg-blue-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <FileLock size={28} className="text-blue-400" />
          <span className="text-lg tracking-wide z-10">读取本地文件</span>
          <input 
            type="file" 
            accept=".qrd" 
            onChange={handleFileRead}
            className="hidden" 
          />
        </label>
      </div>
    </div>
  );

  const renderScanResult = () => (
    <div className="flex flex-col h-full bg-slate-950 p-6 pt-12">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setScreen(AppScreen.HOME)} className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white">扫描结果</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl mb-6">
          <h3 className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-4">解码内容</h3>
          <p className="text-emerald-300 font-mono break-all text-lg leading-relaxed">
            {scannedData}
          </p>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/50">
          <div className="flex items-start gap-3">
             <Lock size={20} className="text-yellow-500 mt-1 shrink-0" />
             <div>
               <h4 className="text-slate-200 font-semibold text-sm">准备加密</h4>
               <p className="text-slate-500 text-xs mt-1">
                 数据将在保存前使用 AES-256 进行加密。密钥将导出到 .env 文件。
               </p>
             </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button 
          onClick={handleSaveEncrypted}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
        >
          <Save size={24} />
          保存加密数据 (.qrd)
        </button>
      </div>
    </div>
  );

  const renderReadResult = () => (
    <div className="flex flex-col h-full bg-slate-950 p-6 pt-12">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setScreen(AppScreen.HOME)} className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white">解密文件</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-20">
            <Unlock size={80} className="text-blue-500" />
          </div>
          <h3 className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-4">明文内容</h3>
          <p className="text-blue-300 font-mono break-all text-lg leading-relaxed">
            {readData}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <button 
          onClick={() => setShowQRModal(true)}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
        >
          <QrCode size={24} />
          生成二维码
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full max-w-md mx-auto relative shadow-2xl overflow-hidden bg-black">
      {/* Notifications */}
      {notification && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-6 py-3 rounded-full shadow-xl border border-slate-700 animate-fade-in-down flex items-center gap-2">
           <Download size={18} className="text-emerald-400"/>
           <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Screens */}
      {screen === AppScreen.HOME && renderHome()}
      {screen === AppScreen.SCAN_QR && (
        <Scanner 
          onScan={handleScanSuccess} 
          onClose={() => setScreen(AppScreen.HOME)} 
        />
      )}
      {screen === AppScreen.SCAN_RESULT && renderScanResult()}
      {screen === AppScreen.READ_RESULT && renderReadResult()}

      {/* QR Code Modal (Overlay) */}
      {showQRModal && (
        <div 
          className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setShowQRModal(false)}
        >
          <div 
            className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()} // Prevent close on content click
          >
            <div className="w-full flex justify-between items-center text-slate-500 mb-2">
              <span className="text-sm font-bold uppercase tracking-wider">生成的二维码</span>
              <button onClick={() => setShowQRModal(false)} className="p-1 hover:bg-slate-100 rounded-full">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-4 border-2 border-slate-100 rounded-xl">
              <QRCodeSVG 
                value={readData} 
                size={250}
                level="H"
                includeMargin={true}
              />
            </div>
            
            <p className="text-center text-slate-500 text-sm">
              点击外部区域关闭
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;