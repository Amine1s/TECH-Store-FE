import React, { useState } from "react";
import { 
  X, 
  Sparkles, 
  CheckCircle, 
  ShoppingBag, 
  Zap, 
  Tag, 
  ShieldCheck
} from "lucide-react";
import { HeroSettings, Product } from "../data/products";

interface HeroSpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
  heroSettings: HeroSettings;
  linkedProduct: Product | null;
  onAddToCart: (product: Product, selectedVariants?: Record<string, string>) => void;
}

export const HeroSpecsModal: React.FC<HeroSpecsModalProps> = ({
  isOpen,
  onClose,
  heroSettings,
  linkedProduct,
  onAddToCart,
}) => {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
    if (linkedProduct && linkedProduct.variants && linkedProduct.variants.length > 0) {
      const initial: Record<string, string> = {};
      linkedProduct.variants.forEach(v => {
        if (v.options.length > 0) initial[v.name] = v.options[0];
      });
      return initial;
    }
    return {};
  });

  const [addedAnimation, setAddedAnimation] = useState(false);

  if (!isOpen) return null;

  const title = heroSettings.title || "جيل جديد من التكنولوجيا الفاخرة";
  const titleHighlight = heroSettings.titleHighlight || "";
  const imageUrl = heroSettings.customImageUrl || linkedProduct?.image || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80";
  const price = heroSettings.customPrice !== undefined ? heroSettings.customPrice : (linkedProduct?.price || 8499);
  const badge = heroSettings.badge || "عرض الأسبوع الحصري";
  const stockNotice = heroSettings.stockNotice || (linkedProduct?.stock ? `متوفر ${linkedProduct.stock} قطعة بالمستودع` : "متوفر في المستودع");

  const descriptionLines = (heroSettings.description || "")
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const formattedSpecs = descriptionLines.map((line, idx) => {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0 && colonIndex < 45) {
      return {
        id: idx,
        title: line.substring(0, colonIndex + 1).trim(),
        detail: line.substring(colonIndex + 1).trim(),
        hasColon: true
      };
    }
    return {
      id: idx,
      title: "",
      detail: line,
      hasColon: false
    };
  });

  const handleAdd = () => {
    const targetProduct: Product = linkedProduct || {
      id: heroSettings.productId || "hero-product",
      name: `${title} ${titleHighlight}`.trim(),
      description: heroSettings.description,
      price: price,
      rating: 5.0,
      category: "computers",
      categoryAr: heroSettings.customBadgeSubtext || "إلكترونيات فاخرة",
      image: imageUrl,
      specs: descriptionLines.slice(0, 5),
      stock: 10
    };

    onAddToCart(targetProduct, selectedVariants);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 900);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in"
      id="hero-specs-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      dir="rtl"
    >
      <div 
        className="glass-panel border border-neutral-800 rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl relative my-auto flex flex-col max-h-[90vh] text-right overflow-hidden bg-zinc-950/95"
        id="hero-specs-modal-content"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-800/80">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-400 bg-purple-950/40 px-2.5 py-0.5 rounded-full border border-purple-500/20">
              <Zap className="w-3 h-3 text-lime-400" />
              {badge}
            </span>
            <h3 className="text-lg sm:text-2xl font-black text-white leading-tight">
              {title} <span className="text-lime-400">{titleHighlight}</span>
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition cursor-pointer"
            aria-label="إغلاق النافذة"
            id="hero-specs-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto pr-1 sm:pr-2 py-4 space-y-5 flex-1 scrollbar-thin">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-zinc-900/60 border border-neutral-800/80 p-3.5 sm:p-4 rounded-2xl items-center">
            <div className="sm:col-span-1 aspect-video sm:aspect-square bg-zinc-950 rounded-xl overflow-hidden border border-neutral-800 relative">
              <img 
                src={imageUrl} 
                alt={title} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="sm:col-span-2 space-y-2 text-right">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-neutral-400 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-lime-400" />
                  {heroSettings.customBadgeSubtext || linkedProduct?.categoryAr || "الإصدار المطور"}
                </span>
                <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 rounded-full font-semibold">
                  {stockNotice}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white font-mono">
                  {price.toLocaleString()}
                </span>
                <span className="text-xs text-lime-400 font-bold">ر.س (شامل الضريبة)</span>
              </div>

              <p className="text-neutral-400 text-xs leading-relaxed">
                جميع القطع والإصدارات أصلية 100% مع ضمان رسمي وسرعة توصيل لكافة المناطق.
              </p>
            </div>
          </div>

          {linkedProduct && linkedProduct.variants && linkedProduct.variants.length > 0 && (
            <div className="bg-zinc-900/40 border border-neutral-800/80 p-3.5 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>الخيارات والموديلات المتاحة:</span>
              </h4>
              <div className="space-y-2.5">
                {linkedProduct.variants.map((v) => (
                  <div key={v.name} className="flex flex-col gap-1.5">
                    <span className="text-[11px] text-neutral-300 font-semibold">{v.name}:</span>
                    <div className="flex flex-wrap gap-2">
                      {v.options.map((opt) => {
                        const isSelected = selectedVariants[v.name] === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setSelectedVariants(prev => ({ ...prev, [v.name]: opt }))}
                            className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition duration-200 cursor-pointer ${
                              isSelected
                                ? "bg-purple-600/30 text-purple-200 border-purple-400 shadow-sm"
                                : "bg-zinc-950 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-neutral-200"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-lime-400" />
              <h4 className="text-sm font-black text-white">المواصفات التقنية والمميزات الكاملة:</h4>
            </div>

            {formattedSpecs.length > 0 ? (
              <div className="grid grid-cols-1 gap-2.5">
                {formattedSpecs.map((spec) => (
                  <div 
                    key={spec.id}
                    className="bg-zinc-900/70 border border-neutral-800/90 hover:border-neutral-700/80 p-3 rounded-xl flex items-start gap-2.5 transition"
                  >
                    <CheckCircle className="w-4 h-4 text-lime-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs leading-relaxed">
                      {spec.hasColon ? (
                        <>
                          <span className="font-bold text-white block mb-0.5">{spec.title}</span>
                          <span className="text-neutral-300 font-normal">{spec.detail}</span>
                        </>
                      ) : (
                        <span className="text-neutral-200 font-medium">{spec.detail}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400 leading-relaxed bg-zinc-900/40 p-4 rounded-xl border border-neutral-800">
                {heroSettings.description || "لا توجد مواصفات إضافية متوفرة حالياً."}
              </p>
            )}

            {linkedProduct && linkedProduct.specs && linkedProduct.specs.length > 0 && (
              <div className="pt-2">
                <div className="text-xs font-bold text-neutral-400 mb-2">مواصفات قياسية إضافية:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {linkedProduct.specs.map((spec, i) => (
                    <div key={i} className="bg-zinc-950/60 border border-neutral-900 p-2.5 rounded-lg flex items-center gap-2 text-[11px] text-neutral-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0"></span>
                      <span className="truncate">{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 bg-neutral-950/80 border border-neutral-900 p-3 rounded-xl text-[11px] text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-lime-400 flex-shrink-0" />
            <span>ضمان رسمي معتمد لمدة سنتين مع إمكانية الإرجاع والاستبدال خلال 14 يوماً.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-950">
          <div className="text-right w-full sm:w-auto">
            <span className="text-[10px] text-neutral-500 block">السعر الإجمالي</span>
            <div className="text-xl font-black text-lime-400 font-mono">
              {price.toLocaleString()} <span className="text-xs font-sans">ر.س</span>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-neutral-300 rounded-xl text-xs font-semibold cursor-pointer border border-neutral-800 transition"
            >
              إغلاق
            </button>
            <button
              onClick={handleAdd}
              disabled={addedAnimation}
              className={`flex-2 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-lime-400/20 ${
                addedAnimation 
                  ? "bg-green-500 text-white" 
                  : "bg-lime-400 hover:bg-lime-300 text-black"
              }`}
            >
              {addedAnimation ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>تمت الإضافة للسلة!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>إضافة لسلة المشتريات</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
