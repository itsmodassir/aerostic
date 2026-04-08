'use client';

import React from 'react';
import { Smartphone, Image as ImageIcon, Video, FileText, Check, ExternalLink, Phone, ArrowUpRight } from 'lucide-react';

interface TemplatePreviewProps {
  category: string;
  header?: { type: string; format: string; text?: string; handle?: string };
  body: string;
  footer?: string;
  buttons?: any[];
}

export default function TemplatePreview({ category, header, body, footer, buttons }: TemplatePreviewProps) {
  // Replace variables {{1}} etc with highlighted span or sample data
  const renderBody = (text: string) => {
    if (!text) return <span className="text-gray-300 italic">Message body goes here...</span>;
    
    const parts = text.split(/(\{\{\d+\}\})/g);
    return parts.map((part, i) => {
      if (part.match(/\{\{\d+\}\}/)) {
        return <span key={i} className="text-blue-600 font-bold bg-blue-50 px-1 rounded">{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col items-center gap-4 sticky top-6">
      <div className="relative w-[300px] h-[600px] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20" />
        
        {/* Status Bar */}
        <div className="h-8 bg-slate-800/50 flex items-center justify-between px-6 pt-2">
          <span className="text-[10px] text-white font-medium">9:41</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full border border-white/20" />
            <div className="w-3 h-3 rounded-full border border-white/20" />
          </div>
        </div>

        {/* Chat Background */}
        <div className="flex-1 bg-[#e5ddd5] relative p-3 overflow-y-auto custom-scrollbar pt-4">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }} />
          
          {/* Date Label */}
          <div className="flex justify-center mb-4">
            <span className="bg-white/80 backdrop-blur-sm text-[10px] text-gray-500 px-3 py-1 rounded-lg uppercase font-bold tracking-wider shadow-sm">Today</span>
          </div>

          {/* Message Bubble */}
          <div className="bg-white rounded-2xl rounded-tl-none shadow-sm max-w-[90%] relative animate-in fade-in slide-in-from-left-2 duration-300">
            {/* Header */}
            {header && header.type === 'HEADER' && (
              <div className="overflow-hidden rounded-t-2xl border-b border-gray-50">
                {header.format === 'TEXT' ? (
                  <div className="p-3 font-bold text-gray-900 border-b border-gray-50">{header.text || 'Header Text'}</div>
                ) : (
                  <div className="aspect-video bg-gray-100 flex items-center justify-center text-gray-400">
                    {header.format === 'IMAGE' && <ImageIcon className="h-10 w-10 opacity-20" />}
                    {header.format === 'VIDEO' && <Video className="h-10 w-10 opacity-20" />}
                    {header.format === 'DOCUMENT' && <FileText className="h-10 w-10 opacity-20" />}
                  </div>
                )}
              </div>
            )}

            {/* Body */}
            <div className="p-3">
              <div className="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">
                {renderBody(body)}
              </div>
              
              {/* Footer */}
              {footer && (
                <div className="mt-1 text-[10px] text-gray-400 font-medium">
                  {footer}
                </div>
              )}

              {/* Time and Tick */}
              <div className="flex justify-end items-center gap-1 mt-1">
                <span className="text-[9px] text-gray-400">09:41 AM</span>
                <Check className="h-3 w-3 text-blue-400" />
              </div>
            </div>

            {/* Buttons */}
            {buttons && buttons.length > 0 && (
              <div className="border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
                {buttons.map((btn, i) => (
                  <div key={i} className="flex items-center justify-center py-2.5 border-b border-gray-100 last:border-0 hover:bg-gray-100/50 cursor-default transition-colors">
                    <span className="text-xs font-semibold text-blue-500 flex items-center gap-2">
                       {btn.type === 'URL' && <ExternalLink className="h-3 w-3" />}
                       {btn.type === 'PHONE_NUMBER' && <Phone className="h-3 w-3" />}
                       {btn.type === 'QUICK_REPLY' && <ArrowUpRight className="h-3 w-3" />}
                       {btn.text || 'Button Text'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
        <Smartphone className="h-3 w-3" /> Live Preview
      </p>
    </div>
  );
}
