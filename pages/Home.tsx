import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppRoute } from '../types';
import { AppIcon } from '../components/Icon';
import { Eye, EyeOff, ScanLine, FileText, AlertCircle } from 'lucide-react';

const Home: React.FC = () => {
  const { password, setPassword, navigate } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleScanClick = () => {
    if (!password.trim()) {
      setError('请输入密码以继续');
      return;
    }
    setError('');
    navigate(AppRoute.SCAN);
  };

  const handleReadClick = () => {
    if (!password.trim()) {
      setError('请输入密码以继续');
      return;
    }
    setError('');
    navigate(AppRoute.READ);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white relative">
      {/* Top 3/5: Icon Area */}
      <div className="h-[60%] flex flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-800 to-slate-900 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
           <div className="absolute top-10 left-10 w-32 h-32 border border-brand-500 rounded-full"></div>
           <div className="absolute bottom-20 right-10 w-48 h-48 border border-white rounded-full"></div>
        </div>
        
        <AppIcon size={140} />
        <h1 className="mt-8 text-3xl font-bold tracking-wider text-brand-100">安全密盾</h1>
        <p className="text-slate-400 text-sm mt-2 tracking-widest">SECURE QR VAULT</p>
      </div>

      {/* Bottom 2/5: Controls Area */}
      <div className="h-[40%] flex flex-col justify-start px-8 pt-8 pb-12 bg-slate-900 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-10 border-t border-slate-700">
        
        {/* Password Input */}
        <div className="relative mb-6">
          <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
             加密/解密 密码
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if(error) setError('');
              }}
              placeholder="请输入安全密码"
              className="w-full bg-slate-800 border border-slate-600 rounded-xl py-4 pl-4 pr-12 text-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-brand-500 transition-colors"
            >
              {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
            </button>
          </div>
          {error && (
            <div className="absolute -bottom-6 left-0 flex items-center text-red-400 text-xs mt-1 animate-pulse">
               <AlertCircle size={12} className="mr-1"/> {error}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mt-auto">
          <button
            onClick={handleScanClick}
            className="flex flex-col items-center justify-center p-4 bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white rounded-2xl transition-all shadow-lg shadow-brand-900/50"
          >
            <ScanLine size={32} className="mb-2" />
            <span className="font-semibold">扫描二维码</span>
          </button>
          
          <button
            onClick={handleReadClick}
            className="flex flex-col items-center justify-center p-4 bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-white rounded-2xl transition-all border border-slate-600"
          >
            <FileText size={32} className="mb-2" />
            <span className="font-semibold">读取本地文件</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
