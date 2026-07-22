import React from "react";
import {
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Info,
  Plus,
  X,
  Layers,
  Upload,
  Check,
} from "lucide-react";
import { Product } from "../../data/products";

interface AdminProductFormTabProps {
  onSubmit: (e: React.FormEvent) => void;
  editingProduct: Product | null;
  formError: string | null;
  setFormError: (val: string | null) => void;
  formSuccess: string | null;
  formName: string;
  setFormName: (val: string) => void;
  formDescription: string;
  setFormDescription: (val: string) => void;
  formSpecs: string[];
  setFormSpecs: React.Dispatch<React.SetStateAction<string[]>>;
  formVariants: { name: string; options: string[] }[];
  setFormVariants: React.Dispatch<React.SetStateAction<{ name: string; options: string[] }[]>>;
  formCategory: "computers" | "phones" | "household";
  setFormCategory: (val: "computers" | "phones" | "household") => void;
  formPrice: number;
  setFormPrice: (val: number) => void;
  formStock: number;
  setFormStock: (val: number) => void;
  formOriginalPrice: number | "";
  setFormOriginalPrice: (val: number | "") => void;
  imageSourceType: "upload" | "url";
  setImageSourceType: (val: "upload" | "url") => void;
  formImageUrl: string;
  setFormImageUrl: (val: string) => void;
  formFeatured: boolean;
  setFormFeatured: (val: boolean) => void;
  isDragging: boolean;
  setIsDragging: (val: boolean) => void;
  onCancel: () => void;
}

export function AdminProductFormTab({
  onSubmit,
  editingProduct,
  formError,
  setFormError,
  formSuccess,
  formName,
  setFormName,
  formDescription,
  setFormDescription,
  formSpecs,
  setFormSpecs,
  formVariants,
  setFormVariants,
  formCategory,
  setFormCategory,
  formPrice,
  setFormPrice,
  formStock,
  setFormStock,
  formOriginalPrice,
  setFormOriginalPrice,
  imageSourceType,
  setImageSourceType,
  formImageUrl,
  setFormImageUrl,
  formFeatured,
  setFormFeatured,
  isDragging,
  setIsDragging,
  onCancel,
}: AdminProductFormTabProps) {
  // Specs helpers
  const handleAddSpec = () => {
    setFormSpecs((prev) => [...prev, ""]);
  };

  const handleRemoveSpec = (idx: number) => {
    setFormSpecs((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSpecChange = (idx: number, val: string) => {
    setFormSpecs((prev) => prev.map((item, i) => (i === idx ? val : item)));
  };

  // File Upload helpers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFormError("حجم الصورة كبير جداً! الحد الأقصى المسموح به هو 5 ميجابايت.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFormError("حجم الصورة كبير جداً! الحد الأقصى المسموح به هو 5 ميجابايت.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 text-right">
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-lime-400" />
          {editingProduct ? `تعديل المنتج: ${editingProduct.name}` : "إضافة منتج جديد لكتالوج المتجر"}
        </h3>
        <span className="text-xs text-neutral-500">* تشير الحقول المعلمة بالنجمة إلى حقول إلزامية</span>
      </div>

      {/* Form Banner notifications */}
      {formError && (
        <div className="p-3.5 bg-red-950/20 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {formSuccess && (
        <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{formSuccess}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Main Form Fields */}
        <div className="lg:col-span-2 space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">اسم المنتج الفاخر باللغة العربية *</label>
            <input
              type="text"
              required
              placeholder="مثال: شاشة تلفاز سوني Bravia XR OLED 4K مقاس 65 بوصة"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full bg-zinc-950 border border-neutral-800 focus:border-lime-400 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">وصف ومميزات المنتج التفصيلية *</label>
            <textarea
              required
              rows={4}
              placeholder="اكتب وصفاً جذاباً يشرح مزايا الجهاز، التكنولوجيا المستخدمة فيه وسيناريوهات الاستخدام اليومية لترغيب المشتري..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full bg-zinc-950 border border-neutral-800 focus:border-lime-400 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition resize-none leading-relaxed"
            ></textarea>
          </div>

          {/* Specifications List */}
          <div className="bg-zinc-950/40 border border-neutral-800/80 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white flex items-center gap-1">
                <Info className="w-4 h-4 text-purple-400" />
                جدول الخصائص والمواصفات التقنية
              </span>
              <button
                type="button"
                onClick={handleAddSpec}
                className="flex items-center gap-1 text-[10px] bg-zinc-900 hover:bg-zinc-800 text-lime-400 border border-neutral-800 hover:border-lime-400/50 px-2 py-1 rounded-lg transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                إضافة خاصية
              </button>
            </div>

            <p className="text-[10px] text-neutral-500">أضف تفاصيل محددة مثل: "الضمان: سنتين"، "المعالج: Intel Core i7"، "اللون: رمادي فضي".</p>

            <div className="space-y-2">
              {formSpecs.map((spec, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder={`مواصفة تقنية رقم ${index + 1}`}
                    value={spec}
                    onChange={(e) => handleSpecChange(index, e.target.value)}
                    className="flex-1 bg-zinc-950 border border-neutral-800 focus:border-lime-400 rounded-xl px-3 py-2 text-xs text-white outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(index)}
                    className="p-2 bg-neutral-900 hover:bg-red-950/50 border border-neutral-800 hover:border-red-500/50 text-neutral-400 hover:text-red-400 rounded-xl transition cursor-pointer"
                    title="إزالة المواصفة"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Product Variants Section (Sizes, Colors, Specs, etc.) */}
          <div className="bg-zinc-950/40 border border-neutral-800/80 rounded-2xl p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-lime-400" />
                نظام الخيارات المتعددة وبدائل المنتج (Variants)
              </span>
              <button
                type="button"
                onClick={() => {
                  setFormVariants([...formVariants, { name: "", options: [""] }]);
                }}
                className="flex items-center gap-1 text-[10px] bg-zinc-900 hover:bg-zinc-800 text-lime-400 border border-neutral-800 hover:border-lime-400/50 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                إضافة خيار (مثل: مقاس، لون)
              </button>
            </div>

            <p className="text-[10px] text-neutral-400 leading-relaxed">
              أضف خيارات للمنتج تتيح للعميل اختيارها قبل الشراء. مثال: الخيار "اللون" مع القيم "أحمر، أسود، أزرق".
            </p>

            {formVariants.length === 0 ? (
              <div className="text-center py-4 border border-dashed border-neutral-800 rounded-xl text-[11px] text-neutral-500">
                لا توجد خيارات مضافة حالياً. هذا المنتج يباع ببديل قياسي واحد.
              </div>
            ) : (
              <div className="space-y-4">
                {formVariants.map((variant, vIdx) => (
                  <div key={vIdx} className="p-3 bg-black/40 border border-neutral-800 rounded-xl space-y-2 relative">
                    <button
                      type="button"
                      onClick={() => {
                        setFormVariants(formVariants.filter((_, idx) => idx !== vIdx));
                      }}
                      className="absolute top-2.5 left-2.5 p-1 hover:bg-red-500/10 hover:text-red-400 text-neutral-500 rounded transition"
                      title="إزالة هذا الخيار بالكامل"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-1">
                        <label className="block text-[10px] text-neutral-400 mb-1">اسم الخيار (مثل: المقاس أو اللون) *</label>
                        <input
                          type="text"
                          required
                          placeholder="مثال: اللون"
                          value={variant.name}
                          onChange={(e) => {
                            const updated = [...formVariants];
                            updated[vIdx].name = e.target.value;
                            setFormVariants(updated);
                          }}
                          className="w-full bg-zinc-950 border border-neutral-800 focus:border-lime-400 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none transition"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1">
                        <label className="block text-[10px] text-neutral-400 mb-1">القيم المتاحة (افصل بينها بفاصلة أو انقر لإضافة قيم) *</label>
                        <div className="flex flex-col gap-1.5">
                          <input
                            type="text"
                            placeholder="مثال: أسود, أبيض, رمادي (افصل بفواصل)"
                            value={variant.options.join(", ")}
                            onChange={(e) => {
                              const updated = [...formVariants];
                              updated[vIdx].options = e.target.value.split(",").map((val) => val.trim());
                              setFormVariants(updated);
                            }}
                            className="w-full bg-zinc-950 border border-neutral-800 focus:border-lime-400 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none transition font-sans"
                          />
                          <div className="flex flex-wrap gap-1">
                            {variant.options.filter(Boolean).map((opt, oIdx) => (
                              <span key={oIdx} className="bg-lime-400/10 text-lime-400 text-[9px] font-semibold px-2 py-0.5 rounded border border-lime-400/20">
                                {opt}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Category, Price, Stock & Presets */}
        <div className="space-y-4">
          {/* Category Select */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">القسم الرئيسي للمنتج *</label>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value as any)}
              className="w-full bg-zinc-950 border border-neutral-800 focus:border-lime-400 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition cursor-pointer font-sans"
            >
              <option value="computers">حواسيب وألعاب (Computers)</option>
              <option value="phones">هواتف وأجهزة ذكية (Phones)</option>
              <option value="household">أجهزة إلكترونية منزلية (Household)</option>
            </select>
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">سعر البيع (ر.س) *</label>
              <input
                type="number"
                min="1"
                required
                placeholder="مثال: 2499"
                value={formPrice || ""}
                onChange={(e) => setFormPrice(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-neutral-800 focus:border-lime-400 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition font-mono text-left"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">المخزون بالمستودع *</label>
              <input
                type="number"
                min="0"
                required
                placeholder="مثال: 12"
                value={formStock}
                onChange={(e) => setFormStock(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-neutral-800 focus:border-lime-400 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition font-mono text-left"
                dir="ltr"
              />
            </div>
          </div>

          {/* Original Price (for Discount display) */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center justify-between">
              <span>
                السعر الأصلي قبل الخصم (ر.س){" "}
                <span className="text-[10px] text-neutral-500 font-sans font-normal">(اختياري)</span>
              </span>
              {formOriginalPrice && Number(formOriginalPrice) > formPrice && (
                <span className="text-[10px] text-rose-400 font-bold">
                  خصم {Math.round(((Number(formOriginalPrice) - formPrice) / Number(formOriginalPrice)) * 100)}% تلقائي مفعّل
                </span>
              )}
            </label>
            <input
              type="number"
              min="1"
              placeholder="مثال: 2999 (يجب أن يكون أكبر من سعر البيع)"
              value={formOriginalPrice || ""}
              onChange={(e) => setFormOriginalPrice(e.target.value ? Number(e.target.value) : "")}
              className="w-full bg-zinc-950 border border-neutral-800 focus:border-rose-400 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition font-mono text-left"
              dir="ltr"
            />
          </div>

          {/* Image Input Selection & Upload Area */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold text-neutral-300">صورة المنتج *</label>

              {/* Selector tabs */}
              <div className="flex bg-zinc-950 border border-neutral-800 rounded-lg p-0.5 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setImageSourceType("upload");
                    setFormError(null);
                  }}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    imageSourceType === "upload" ? "bg-lime-400 text-black shadow-md" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  رفع من الجهاز
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImageSourceType("url");
                    setFormError(null);
                  }}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    imageSourceType === "url" ? "bg-lime-400 text-black shadow-md" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  رابط صورة (URL)
                </button>
              </div>
            </div>

            {imageSourceType === "upload" ? (
              /* Drag & Drop Zone */
              <div className="space-y-2">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 relative overflow-hidden flex flex-col items-center justify-center min-h-[140px] cursor-pointer ${
                    isDragging
                      ? "border-lime-400 bg-lime-400/5 shadow-inner"
                      : formImageUrl && formImageUrl.startsWith("data:")
                      ? "border-neutral-800 bg-black/20"
                      : "border-neutral-800 hover:border-neutral-700 bg-zinc-950/20"
                  }`}
                  onClick={() => document.getElementById("product-image-file")?.click()}
                >
                  <input
                    type="file"
                    id="product-image-file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {formImageUrl && formImageUrl.startsWith("data:") ? (
                    /* Preview of uploaded image with option to clear/change */
                    <div className="relative group w-full flex flex-col items-center justify-center gap-3">
                      <img
                        src={formImageUrl}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded-xl border border-neutral-800 shadow-md"
                      />
                      <div className="space-y-1">
                        <p className="text-[10px] text-lime-400 font-bold">✓ تم اختيار الصورة بنجاح</p>
                        <p className="text-[9px] text-neutral-400 font-sans">اسحب صورة جديدة هنا أو انقر لتغييرها</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormImageUrl("");
                        }}
                        className="absolute top-0 right-0 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition cursor-pointer shadow-md"
                        title="إزالة الصورة"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    /* Empty state drop zone description */
                    <div className="space-y-2 flex flex-col items-center">
                      <div className="p-3 bg-zinc-900 border border-neutral-800 text-neutral-400 rounded-xl group-hover:scale-105 transition-transform">
                        <Upload className="w-5 h-5 text-lime-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">اسحب الصورة وأفلتها هنا</p>
                        <p className="text-[10px] text-neutral-400 mt-1 font-sans">أو اضغط لتصفح ملفات جهازك</p>
                      </div>
                      <p className="text-[9px] text-neutral-500 font-sans">الحد الأقصى للملف: 5 ميجابايت (PNG, JPG, WEBP)</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* External URL Input Box */
              <div className="space-y-3">
                <input
                  type="url"
                  placeholder="ضع رابط صورة (URL) تبدأ بـ https://"
                  value={formImageUrl.startsWith("data:") ? "" : formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-neutral-800 focus:border-lime-400 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition font-mono text-left"
                  dir="ltr"
                />

                {formImageUrl && !formImageUrl.startsWith("data:") && (
                  <div className="flex items-center gap-3 bg-zinc-950/40 border border-neutral-800 p-2.5 rounded-xl">
                    <img
                      src={formImageUrl}
                      alt="External Preview"
                      className="w-12 h-12 object-cover rounded-lg border border-neutral-800"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-lime-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        رابط صورة خارجي نشط
                      </p>
                      <p className="text-[9px] text-neutral-500 truncate mt-0.5">{formImageUrl}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormImageUrl("")}
                      className="p-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:text-red-400 rounded-lg transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Featured toggle */}
          <div className="flex items-center justify-between bg-zinc-950/40 border border-neutral-800/80 p-3 rounded-2xl">
            <div>
              <div className="text-xs font-bold text-white">تمييز المنتج بالنجمة (Featured)</div>
              <div className="text-[10px] text-neutral-500">سيتم عرضه أولاً كمنتج مميز في واجهة المتجر.</div>
            </div>
            <input
              type="checkbox"
              checked={formFeatured}
              onChange={(e) => setFormFeatured(e.target.checked)}
              className="w-4 h-4 text-lime-400 bg-zinc-950 border-neutral-800 rounded focus:ring-lime-400 focus:ring-2 cursor-pointer"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-neutral-800 text-neutral-300 py-3 rounded-xl text-xs font-semibold cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-[2] bg-lime-400 hover:bg-lime-300 text-black py-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1 cursor-pointer shadow-lg shadow-lime-400/10"
            >
              <Check className="w-4 h-4" />
              <span>{editingProduct ? "حفظ التعديلات" : "إضافة المنتج للمتجر"}</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
