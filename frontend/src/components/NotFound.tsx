import React from "react";
import { ArrowRight, Compass, ShieldAlert, Sparkles } from "lucide-react";

interface NotFoundProps {
  onReturnToStore: () => void;
}

export function NotFound({ onReturnToStore }: NotFoundProps) {
  return (
    <div 
      className="min-h-screen bg-black text-slate-200 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden font-sans selection:bg-slate-300 selection:text-black"
      dir="rtl"
      id="page-not-found"
    >
      {/* Subtle silver/metallic ambient glow layers on pure black */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-slate-500/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-slate-300/5 rounded-full blur-[90px] pointer-events-none -z-10"></div>

      {/* Background silver wireframe aesthetic accents */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(203,213,225,0.04)_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none"></div>

      <div className="max-w-xl w-full text-center space-y-8 relative z-10">
        
        {/* Silver metallic icon badge */}
        <div className="inline-flex items-center justify-center">
          <div className="relative p-5 rounded-3xl bg-gradient-to-b from-neutral-900 via-zinc-950 to-black border border-slate-700/60 shadow-[0_0_35px_rgba(203,213,225,0.08)]">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-slate-400/10 via-transparent to-slate-200/10 pointer-events-none"></div>
            <Compass className="w-12 h-12 text-slate-300 animate-pulse stroke-[1.5]" />
          </div>
        </div>

        {/* 404 Large Display in Silver metallic typography */}
        <div className="space-y-3">
          <div className="text-8xl sm:text-9xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-slate-100 via-slate-300 to-slate-500 drop-shadow-[0_2px_15px_rgba(255,255,255,0.1)] select-none">
            404
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900/90 border border-slate-700/50 text-slate-300 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            <span>الصفحة المطلوبة غير متوفرة</span>
          </div>
        </div>

        {/* Informative text in refined silver tones */}
        <div className="space-y-2 max-w-md mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
            عذراً، لم نتمكن من العثور على هذا المسار
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            قد يكون الرابط الذي اتبعته غير صحيح، أو تم نقل الصفحة أو إزالتها من المتجر. يمكنك العودة فوراً وتصفح المنتجات المتوفرة.
          </p>
        </div>

        {/* Single action button: Return to store in sleek silver metallic style */}
        <div className="pt-4 flex justify-center">
          <button
            onClick={onReturnToStore}
            id="return-to-store-btn"
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl bg-gradient-to-b from-slate-100 via-slate-200 to-slate-300 text-black font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(203,213,225,0.2)] hover:shadow-[0_0_35px_rgba(255,255,255,0.35)] hover:from-white hover:to-slate-200 transition-all duration-300 cursor-pointer active:scale-98"
          >
            <span>العودة للمتجر</span>
            <ArrowRight className="w-4 h-4 text-black group-hover:-translate-x-1 transition-transform duration-300" />
          </button>
        </div>

        {/* Subtle Brand watermark in silver */}
        <div className="pt-8 text-slate-600 text-xs flex items-center justify-center gap-1.5 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-slate-500" />
          <span>TECHCORE &bull; جميع الحقوق محفوظة</span>
        </div>

      </div>
    </div>
  );
}
