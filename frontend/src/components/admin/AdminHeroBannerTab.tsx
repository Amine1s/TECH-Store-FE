import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Zap,
  CheckCircle,
  Eye,
  RefreshCw,
  Image as ImageIcon,
  Save,
  RotateCcw,
  Search,
  Package,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { Product, HeroSettings, defaultHeroSettings } from "../../data/products";

interface AdminHeroBannerTabProps {
  products: Product[];
  heroSettings: HeroSettings;
  onSaveHeroSettings: (settings: HeroSettings) => void;
  setFormSuccess: (msg: string | null) => void;
}

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export function AdminHeroBannerTab({
  products,
  heroSettings = defaultHeroSettings,
  onSaveHeroSettings,
  setFormSuccess,
}: AdminHeroBannerTabProps) {
  const [formData, setFormData] = useState<HeroSettings>(heroSettings || defaultHeroSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");

  useEffect(() => {
    setFormData(heroSettings || defaultHeroSettings);
  }, [heroSettings]);

  // Selected product object
  const currentLinkedProduct = products.find((p) => p.id === (formData?.productId || "c-3")) || products[0];

  // Autofill fields from a selected product
  const handleSelectAndAutofill = (product: Product) => {
    setFormData({
      ...formData,
      productId: product.id,
      title: product.name.split(" ").slice(0, 4).join(" ") || product.name,
      titleHighlight: product.name.split(" ").slice(4).join(" ") || "الإصدار الأحدث",
      description: product.description,
      customImageUrl: product.image,
      customPrice: product.price,
      stockNotice: product.stock > 0 ? `متوفر ${product.stock} قطعة فقط بالمستودع` : "الكمية محدودة جداً",
      customBadgeSubtext: product.categoryAr || "الإصدار المطور",
      buttonText: "اكتشف المواصفات"
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Save locally
      onSaveHeroSettings(formData);

      // Sync to backend
      await fetch(`${API_BASE_URL}/api/hero-settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      setFormSuccess("تم حفظ ونشر إعدادات منتج الهيرو بنجاح على واجهة المتجر الرئيسية!");
    } catch (err) {
      console.error("Failed to sync hero settings with server:", err);
      // Fallback local notification
      setFormSuccess("تم حفظ وتحديث منتج الهيرو محلياً بنجاح!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm("هل أنت متأكد من رغبتك في استعادة الإعدادات الافتراضية لقسم الهيرو؟")) {
      setFormData(defaultHeroSettings);
      onSaveHeroSettings(defaultHeroSettings);
      setFormSuccess("تمت استعادة الإعدادات الافتراضية لمنتج الهيرو!");
    }
  };

  // Filter products for the quick picker
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === "all" || p.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Effective display values for preview
  const displayImage = formData.customImageUrl || currentLinkedProduct?.image || "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80";
  const displayPrice = formData.customPrice !== undefined ? formData.customPrice : (currentLinkedProduct?.price || 8499);

  return (
    <div className="space-y-8 text-right animate-fade-in" dir="rtl">
      
      {/* Header Info Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-zinc-950 to-lime-950/30 border border-purple-500/30 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 shadow-lg shadow-purple-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">تخصيص منتج وإعلانات الهيرو سيكشن (Hero Banner)</h3>
                <span className="bg-lime-400/20 text-lime-400 border border-lime-400/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
                  تحكم فوري مباشر
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                تحكم بالمنتج المميز الذي يظهر في واجهة المتجر الرئيسية، مع إمكانية اختيار أي منتج من الكتالوج أو تعديل النصوص والصور والأسعار فورياً.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-neutral-400 hover:text-white border border-neutral-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>استعادة الافتراضي</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Preview Box */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black text-lime-400">
            <Eye className="w-4 h-4" />
            <span>معاينة حية لشكل الهيرو سيكشن في الصفحة الرئيسية:</span>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">Live Interactive Preview</span>
        </div>

        <div className="glass-panel rounded-3xl overflow-hidden relative border-l-4 border-lime-400 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl bg-zinc-950/80 border border-neutral-800">
          <div className="space-y-3 max-w-xl text-right md:order-1 w-full">
            <span className="inline-flex items-center gap-1.5 text-xs font-black tracking-widest text-purple-400 bg-purple-950/50 px-3 py-1 rounded-full border border-purple-500/20">
              <Zap className="w-3.5 h-3.5 text-lime-400" />
              {formData.badge || "عرض الأسبوع الحصري"}
            </span>
            <h2 className="text-2xl md:text-4xl font-black leading-tight text-white">
              {formData.title || "جيل جديد من الحواسيب الخارقة"}{" "}
              <span className="text-lime-400">{formData.titleHighlight || "Pro-X الجيل العاشر"}</span>
            </h2>
            <p className="text-neutral-300 text-xs leading-relaxed hitespace-pre-line">
              {formData.description || "تغلب على الحدود الرقمية مع معالجات ثنائية النواة ونظام تبريد مائي مغلق..."}
            </p>
            
            <div className="flex flex-wrap gap-3 items-center pt-2">
              <div className="bg-lime-400 text-black px-5 py-2 rounded-xl font-bold text-xs shadow-lg shadow-lime-400/20 inline-flex items-center gap-1">
                <span>{formData.buttonText || "اكتشف المواصفات"}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping"></span>
                <span>{formData.stockNotice || "متوفر 12 قطعة فقط بالمستودع"}</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-72 flex-shrink-0 flex items-center justify-center relative md:order-2">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-lime-500/10 blur-3xl -z-10 rounded-full"></div>
            <div className="w-full max-w-[260px] h-44 bg-zinc-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl relative group">
              <img 
                src={displayImage} 
                alt="معاينة الهيرو" 
                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/70 to-transparent p-3 flex justify-between items-end">
                <div>
                  <div className="text-[10px] text-lime-400 font-bold uppercase tracking-wider">
                    {formData.customBadgeSubtext || "الإصدار المطور"}
                  </div>
                  <div className="text-white text-xs font-bold truncate max-w-[120px]">
                    {currentLinkedProduct?.name || formData.titleHighlight || "المنتج المميز"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-neutral-300 uppercase">سعر العرض</div>
                  <div className="text-lime-400 text-xs font-black font-mono">
                    {displayPrice.toLocaleString()} ر.س
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Inputs & Quick Product Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form Settings (7 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-7 bg-zinc-950 border border-neutral-800 rounded-3xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-900">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>إعدادات ونصوص قسم الهيرو</span>
            </h4>
            <span className="text-[10px] text-lime-400 bg-lime-400/10 border border-lime-400/20 px-2.5 py-0.5 rounded-full font-bold">
              المنتج المرتبط: {currentLinkedProduct?.name?.slice(0, 20)}...
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Badge Text */}
            <div>
              <label className="block text-[11px] font-bold text-neutral-300 mb-1">شارة البانر العلوية (Badge)</label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="مثال: عرض الأسبوع الحصري"
                className="w-full bg-zinc-900 border border-neutral-800 focus:border-lime-400 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
              />
            </div>

            {/* Stock / Warehouse Note */}
            <div>
              <label className="block text-[11px] font-bold text-neutral-300 mb-1">نص توفر المخزون / الحالة</label>
              <input
                type="text"
                value={formData.stockNotice}
                onChange={(e) => setFormData({ ...formData, stockNotice: e.target.value })}
                placeholder="مثال: متوفر 12 قطعة فقط بالمستودع"
                className="w-full bg-zinc-900 border border-neutral-800 focus:border-lime-400 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
              />
            </div>
          </div>

          {/* Main Title & Highlight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-neutral-300 mb-1">العنوان الرئيسي (الجزء الأبيض)</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="مثال: جيل جديد من الحواسيب الخارقة"
                className="w-full bg-zinc-900 border border-neutral-800 focus:border-lime-400 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-lime-400 mb-1">النص المميز (الملوّن بالليموني)</label>
              <input
                type="text"
                required
                value={formData.titleHighlight}
                onChange={(e) => setFormData({ ...formData, titleHighlight: e.target.value })}
                placeholder="مثال: Pro-X الجيل العاشر"
                className="w-full bg-zinc-900 border border-neutral-800 focus:border-lime-400 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-300 mb-1">الوصف الترويجي للهيرو</label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="اكتب وصفاً جذاباً يشرح مميزات المنتج المعروض..."
              className="w-full bg-zinc-900 border border-neutral-800 focus:border-lime-400 rounded-xl px-3 py-2.5 text-xs text-white outline-none resize-none leading-relaxed"
            ></textarea>
          </div>

          {/* Image URL & Button Text */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-neutral-300 mb-1">رابط صورة الهيرو (Custom Image)</label>
              <div className="relative">
                <input
                  type="url"
                  value={formData.customImageUrl || ""}
                  onChange={(e) => setFormData({ ...formData, customImageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-zinc-900 border border-neutral-800 focus:border-lime-400 rounded-xl pl-3 pr-8 py-2.5 text-xs text-white outline-none font-mono"
                  dir="ltr"
                />
                <ImageIcon className="w-4 h-4 text-neutral-500 absolute right-2.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-300 mb-1">نص زر التفاعل الرئيسي</label>
              <input
                type="text"
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                placeholder="مثال: اكتشف المواصفات"
                className="w-full bg-zinc-900 border border-neutral-800 focus:border-lime-400 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
              />
            </div>
          </div>

          {/* Price & Sub-Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-neutral-300 mb-1">السعر المعروض على بطاقة الصورة (ر.س)</label>
              <input
                type="number"
                value={formData.customPrice ?? ""}
                onChange={(e) => setFormData({ ...formData, customPrice: Number(e.target.value) })}
                placeholder="مثال: 8499"
                className="w-full bg-zinc-900 border border-neutral-800 focus:border-lime-400 rounded-xl px-3 py-2.5 text-xs font-mono text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-300 mb-1">شارة بطاقة الصورة المصغرة</label>
              <input
                type="text"
                value={formData.customBadgeSubtext || ""}
                onChange={(e) => setFormData({ ...formData, customBadgeSubtext: e.target.value })}
                placeholder="مثال: الإصدار المطور"
                className="w-full bg-zinc-900 border border-neutral-800 focus:border-lime-400 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3 border-t border-neutral-900 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-8 py-3 bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-black font-black text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-lime-400/10"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>حفظ وتحديث واجهة الهيرو سيكشن</span>
            </button>
          </div>
        </form>

        {/* Right Column: Fast Product Picker (5 cols) */}
        <div className="lg:col-span-5 bg-zinc-950 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-neutral-900">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-lime-400" />
                <span>اختر منتجاً لتعيينه في الهيرو بنقرة واحدة</span>
              </h4>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              انقر على أي منتج أدناه لملء كافة بيانات الهيرو بصورته وسعره ومواصفاته فورياً:
            </p>
          </div>

          {/* Search and Category Filter */}
          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="بحث في المنتجات بالاسم أو المعرف..."
                className="w-full bg-zinc-900 border border-neutral-800 focus:border-lime-400 rounded-xl pl-3 pr-8 py-2 text-xs text-white outline-none"
              />
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute right-2.5 top-2.5" />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 text-[10px]">
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter("all")}
                className={`px-2.5 py-1 rounded-lg border transition ${
                  selectedCategoryFilter === "all"
                    ? "bg-lime-400 text-black border-lime-400 font-bold"
                    : "bg-zinc-900 text-neutral-400 border-neutral-800 hover:text-white"
                }`}
              >
                الكل ({products.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter("computers")}
                className={`px-2.5 py-1 rounded-lg border transition ${
                  selectedCategoryFilter === "computers"
                    ? "bg-lime-400 text-black border-lime-400 font-bold"
                    : "bg-zinc-900 text-neutral-400 border-neutral-800 hover:text-white"
                }`}
              >
                حواسيب
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter("phones")}
                className={`px-2.5 py-1 rounded-lg border transition ${
                  selectedCategoryFilter === "phones"
                    ? "bg-lime-400 text-black border-lime-400 font-bold"
                    : "bg-zinc-900 text-neutral-400 border-neutral-800 hover:text-white"
                }`}
              >
                هواتف
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter("household")}
                className={`px-2.5 py-1 rounded-lg border transition ${
                  selectedCategoryFilter === "household"
                    ? "bg-lime-400 text-black border-lime-400 font-bold"
                    : "bg-zinc-900 text-neutral-400 border-neutral-800 hover:text-white"
                }`}
              >
                أجهزة منزلية
              </button>
            </div>
          </div>

          {/* Product Quick Cards List */}
          <div className="space-y-2 max-h-[380px] overflow-y-auto custom-scrollbar pr-1 flex-1">
            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-xs">
                لا توجد منتجات تطابق البحث.
              </div>
            ) : (
              filteredProducts.map((p) => {
                const isSelected = formData.productId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectAndAutofill(p)}
                    className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-lime-400/10 border-lime-400 shadow-md shadow-lime-400/10"
                        : "bg-zinc-900/60 border-neutral-800/80 hover:border-neutral-700 hover:bg-zinc-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-neutral-800 overflow-hidden shrink-0">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h5 className="text-xs font-bold text-white truncate max-w-[160px]">{p.name}</h5>
                          {isSelected && (
                            <span className="bg-lime-400 text-black text-[9px] font-black px-1.5 py-0.2 rounded shrink-0">
                              محدد للهيرو ⭐
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5 font-mono">
                          <span className="text-lime-400 font-bold">{p.price.toLocaleString()} ر.س</span>
                          <span>•</span>
                          <span className="text-neutral-500">{p.categoryAr}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black shrink-0 transition ${
                        isSelected
                          ? "bg-lime-400 text-black"
                          : "bg-zinc-800 hover:bg-lime-400 hover:text-black text-neutral-300"
                      }`}
                    >
                      {isSelected ? "مفعل" : "تعيين للهيرو"}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="bg-zinc-900/40 p-3 rounded-2xl border border-white/5 text-[10px] text-neutral-400 space-y-1">
            <span className="text-white font-bold block">💡 معلومة سريعة:</span>
            <p className="leading-relaxed">
              عند الضغط على "تعيين للهيرو"، يتم نسخ تفاصيل المنتج تلقائياً إلى حقول البانر. يمكنك بعد ذلك تعديل العنوان أو الشارة حسب رغبتك ثم الضغط على "حفظ وتحديث".
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
