import React from "react";
import {
  Coins,
  TrendingUp,
  ShoppingCart,
  ShoppingBag,
  Users,
  Smartphone,
  Laptop,
  Layers,
  Globe,
  Bell,
  Mail,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Product } from "../../data/products";

interface AdminAnalyticsTabProps {
  products: Product[];
  cartStats: {
    count: number;
    potentialRevenueLost: number;
    abandonmentRate: number;
    activeUsersAddingToCart: number;
  };
  abandonedCarts: any[];
  isRecoveringId: string | null;
  recoveryDiscount: number;
  setRecoveryDiscount: (val: number) => void;
  handleRecoverCart: (sessionId: string) => void;
  ownerEmail: string;
  setOwnerEmail: (val: string) => void;
  emailEditMode: boolean;
  setEmailEditMode: (val: boolean) => void;
  alertList: { id: string; productId: string; productName: string; stockLeft: number; date: string; emailSentTo: string }[];
  setAlertList: React.Dispatch<React.SetStateAction<{ id: string; productId: string; productName: string; stockLeft: number; date: string; emailSentTo: string }[]>>;
  setFormSuccess: (val: string | null) => void;
}

export function AdminAnalyticsTab({
  products,
  cartStats,
  abandonedCarts,
  isRecoveringId,
  recoveryDiscount,
  setRecoveryDiscount,
  handleRecoverCart,
  ownerEmail,
  setOwnerEmail,
  emailEditMode,
  setEmailEditMode,
  alertList,
  setAlertList,
  setFormSuccess,
}: AdminAnalyticsTabProps) {
  const [ownerPassword, setOwnerPassword] = React.useState(
    () => localStorage.getItem("techcore_owner_password") || "admin123"
  );
  const [passwordEditMode, setPasswordEditMode] = React.useState(false);

  // Calculations
  const totalProducts = products.length;
  const lowStockItems = products.filter((p) => p.stock <= 5);
  const totalCategories = Array.from(new Set(products.map((p) => p.category))).length;
  const averagePrice =
    products.length > 0
      ? Math.round(products.reduce((acc, p) => acc + p.price, 0) / products.length)
      : 0;

  return (
    <div className="space-y-8 animate-fade-in text-right">
      {/* KPIs Header Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Daily Sales Card */}
        <div className="bg-gradient-to-br from-neutral-950 to-zinc-900 border border-white/5 p-6 rounded-3xl relative overflow-hidden shadow-xl group hover:border-lime-400/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-lime-400/5 blur-2xl rounded-full"></div>
          <div className="flex justify-between items-start">
            <div className="p-3 bg-lime-950/40 border border-lime-500/20 text-lime-400 rounded-2xl">
              <Coins className="w-6 h-6" />
            </div>
            <span className="text-[10px] bg-lime-400/10 text-lime-400 border border-lime-500/20 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +12.4% اليوم
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-xs text-neutral-400 font-bold">حجم المبيعات اليومية</span>
            <div className="text-3xl font-black text-white font-mono">
              45,850 <span className="text-sm font-sans text-lime-400">ر.س</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-500">
            <span>المبيعات المتوقعة لليوم</span>
            <span className="font-mono text-white font-bold">52,000 ر.س</span>
          </div>
        </div>

        {/* Profits Card */}
        <div className="bg-gradient-to-br from-neutral-950 to-zinc-900 border border-white/5 p-6 rounded-3xl relative overflow-hidden shadow-xl group hover:border-purple-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-2xl rounded-full"></div>
          <div className="flex justify-between items-start">
            <div className="p-3 bg-purple-950/40 border border-purple-500/20 text-purple-400 rounded-2xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-[10px] bg-purple-400/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-full font-bold">
              هامش الربح 30%
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-xs text-neutral-400 font-bold">الأرباح اليومية الصافية</span>
            <div className="text-3xl font-black text-lime-400 font-mono">
              13,755 <span className="text-sm font-sans text-neutral-300">ر.س</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-500">
            <span>الأرباح المباشرة الموثقة</span>
            <span className="text-neutral-300 font-bold">مع تشفير SSL كامل</span>
          </div>
        </div>

        {/* Current Orders Card */}
        <div className="bg-gradient-to-br from-neutral-950 to-zinc-900 border border-white/5 p-6 rounded-3xl relative overflow-hidden shadow-xl group hover:border-amber-400/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/5 blur-2xl rounded-full"></div>
          <div className="flex justify-between items-start">
            <div className="p-3 bg-amber-950/40 border border-amber-500/20 text-amber-400 rounded-2xl">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center gap-1.5 text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full font-bold animate-pulse">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              نشط الآن
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-xs text-neutral-400 font-bold">عدد الطلبات الحالية</span>
            <div className="text-3xl font-black text-white font-mono">
              8 <span className="text-sm font-sans text-neutral-400">طلبات نشطة</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-500">
            <span>حالة التوصيل والمعالجة</span>
            <span className="text-green-400 font-bold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              من خلال خادم Node.js
            </span>
          </div>
        </div>

        {/* Abandoned Carts KPI Card */}
        <div className="bg-gradient-to-br from-neutral-950 to-zinc-900 border border-white/5 p-6 rounded-3xl relative overflow-hidden shadow-xl group hover:border-red-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-2xl rounded-full"></div>
          <div className="flex justify-between items-start">
            <div className="p-3 bg-red-950/40 border border-red-500/20 text-rose-400 rounded-2xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="text-[10px] bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2.5 py-1 rounded-full font-bold">
              هجر السلة: {cartStats.abandonmentRate}%
            </span>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-xs text-neutral-400 font-bold">سلات تسوق متروكة</span>
            <div className="text-3xl font-black text-white font-mono">
              {cartStats.count} <span className="text-sm font-sans text-neutral-400">سلات حية</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-500">
            <span>قيمة السلات المتروكة</span>
            <span className="text-rose-400 font-black font-mono">
              {cartStats.potentialRevenueLost.toLocaleString()} ر.س
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: Cart Abandonment Recovery and Live Session Details */}
        <div className="bg-gradient-to-br from-neutral-950 to-zinc-950 border border-neutral-900 rounded-3xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/5 pb-3">
            <div>
              <h4 className="font-black text-sm text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-rose-400" />
                استعادة سلات التسوق المتروكة (Abandonment Recovery)
              </h4>
              <p className="text-[10px] text-neutral-400 mt-1">تتبع العملاء الذين لم يكملوا الشراء وأرسل كوبونات خصم آلية لتحفيزهم.</p>
            </div>
            <div className="flex items-center gap-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-1 rounded-lg text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
              {abandonedCarts.length} سلة معلقة
            </div>
          </div>

          {/* Recovery discount configuration panel */}
          <div className="bg-zinc-950/80 border border-neutral-900 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h5 className="text-xs font-bold text-white mb-1">تحديد الخصم الترويجي للاستعادة</h5>
              <p className="text-[10px] text-neutral-500">سيتم توليد كود خصم مخصص وإرساله إلى بريد العميل آلياً.</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {[10, 15, 20].map((disc) => (
                <button
                  key={disc}
                  type="button"
                  onClick={() => setRecoveryDiscount(disc)}
                  className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition border ${
                    recoveryDiscount === disc
                      ? "bg-rose-500 text-white border-rose-500"
                      : "bg-black text-neutral-400 border-neutral-800 hover:text-white"
                  }`}
                >
                  {disc}% خصم
                </button>
              ))}
            </div>
          </div>

          {/* List of abandoned carts */}
          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
            {abandonedCarts.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-500 border border-dashed border-neutral-800 rounded-2xl">
                لا توجد سلات متروكة معلقة حالياً في المتجر. مبيعاتك مكتملة بنسبة ممتازة!
              </div>
            ) : (
              abandonedCarts.map((cart: any) => (
                <div
                  key={cart.sessionId}
                  className="p-4 bg-zinc-950/60 border border-white/5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-rose-500/20 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white">{cart.customerName || "عميل زائر ضيف"}</span>
                      {cart.customerEmail && (
                        <span className="text-[9px] font-mono bg-zinc-900 border border-neutral-800 text-neutral-400 px-1.5 py-0.2 rounded">
                          {cart.customerEmail}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      محتويات السلة:{" "}
                      <span className="text-neutral-200">
                        {cart.items.map((item: any) => `${item.name} (x${item.quantity})`).join("، ")}
                      </span>
                    </div>
                    <div className="text-[9px] text-neutral-500 font-mono">
                      آخر نشاط بالصفحة: {new Date(cart.lastActive).toLocaleTimeString()} | القيمة: {cart.total.toLocaleString()} ر.س
                    </div>
                  </div>

                  <div className="w-full sm:w-auto">
                    <button
                      type="button"
                      disabled={isRecoveringId === cart.sessionId}
                      onClick={() => handleRecoverCart(cart.sessionId)}
                      className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600 disabled:bg-rose-900/50 disabled:text-neutral-500 text-white text-[10px] font-black py-2 px-3.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950/30"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {isRecoveringId === cart.sessionId ? "جاري الإرسال..." : "إرسال كوبون استعادة"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Visitor Behavior & Traffic Sources */}
        <div className="space-y-6">
          {/* Visitor Behavior */}
          <div className="bg-black/50 border border-white/5 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h4 className="font-black text-sm text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                تحليل سلوك زوار المتجر
              </h4>
              <span className="text-[10px] text-neutral-500">تحديث فوري نشط</span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-zinc-950/60 p-3 rounded-2xl border border-white/5">
                <div className="text-[10px] text-neutral-400">زيارات اليوم الكلية</div>
                <div className="text-lg font-black font-mono text-white mt-1">1,842</div>
              </div>
              <div className="bg-zinc-950/60 p-3 rounded-2xl border border-white/5">
                <div className="text-[10px] text-neutral-400">معدل الارتداد</div>
                <div className="text-lg font-black font-mono text-green-400 mt-1">22.4%</div>
              </div>
              <div className="bg-zinc-950/60 p-3 rounded-2xl border border-white/5">
                <div className="text-[10px] text-neutral-400">متوسط مدة الجلسة</div>
                <div className="text-lg font-black font-mono text-white mt-1">4د و35ث</div>
              </div>
            </div>

            {/* Device Distribution Progress */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold text-neutral-300">توزيع الزيارات حسب نوع الأجهزة:</div>

              {/* Mobile (68%) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1 text-white">
                    <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                    الجوالات الذكية
                  </span>
                  <span className="font-mono font-bold">68% (1,252 زيارة)</span>
                </div>
                <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full transition-all duration-1000" style={{ width: "68%" }}></div>
                </div>
              </div>

              {/* Desktop (27%) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1 text-white">
                    <Laptop className="w-3.5 h-3.5 text-lime-400" />
                    أجهزة الحاسوب والمكتبية
                  </span>
                  <span className="font-mono font-bold">27% (497 زيارة)</span>
                </div>
                <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-lime-400 h-full rounded-full transition-all duration-1000" style={{ width: "27%" }}></div>
                </div>
              </div>

              {/* Tablet (5%) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1 text-white">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    الأجهزة اللوحية (Tablet)
                  </span>
                  <span className="font-mono font-bold">5% (93 زيارة)</span>
                </div>
                <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full transition-all duration-1000" style={{ width: "5%" }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-black/50 border border-white/5 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h4 className="font-black text-sm text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-lime-400" />
                مصادر حركة المرور (Traffic Channels)
              </h4>
              <span className="text-[10px] text-neutral-500">إحصائيات قنوات الاكتساب</span>
            </div>

            <div className="space-y-3.5">
              {/* Search Engines */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-950/40 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">42%</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs font-semibold text-white mb-1">
                    <span>محركات البحث (سيو العضوي - Google SEO)</span>
                    <span className="font-mono">42%</span>
                  </div>
                  <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: "42%" }}></div>
                  </div>
                </div>
              </div>

              {/* Direct */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-lime-950/40 border border-lime-500/20 text-lime-400 flex items-center justify-center font-bold text-xs">35%</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs font-semibold text-white mb-1">
                    <span>زيارات مباشرة (Direct Url / Bookmarks)</span>
                    <span className="font-mono">35%</span>
                  </div>
                  <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-lime-400 h-full rounded-full" style={{ width: "35%" }}></div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-950/40 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">18%</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs font-semibold text-white mb-1">
                    <span>شبكات التواصل الاجتماعي (تويتر / فيسبوك)</span>
                    <span className="font-mono">18%</span>
                  </div>
                  <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: "18%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Automatic Alerts and Settings Module */}
      <div className="bg-gradient-to-br from-neutral-950 to-zinc-950 border border-neutral-900 rounded-3xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
          <div>
            <h4 className="font-black text-sm text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-lime-400" />
              نظام الإنذار المبكر ومخزون المنتجات الحرج
            </h4>
            <p className="text-xs text-neutral-400 mt-0.5">سيقوم المتجر بإرسال تنبيهات تلقائية إلى بريدك الإلكتروني بمجرد وصول مخزون أي منتج إلى 5 قطع أو أقل.</p>
          </div>

          {/* Owner Credentials & Email Configuration Card */}
          <div className="bg-zinc-950/80 border border-white/5 p-4 rounded-2xl flex flex-col gap-3 min-w-[320px]">
            <div className="border-b border-white/5 pb-2">
              <span className="text-[10px] font-black text-lime-400">بوابة الأمان والتحكم لمالك الموقع</span>
            </div>
            
            {/* Email Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-neutral-400 font-bold">
                <span>البريد الإلكتروني للمالك:</span>
                <span className="text-green-400 font-normal">نشط لتلقي التنبيهات</span>
              </div>

              {emailEditMode ? (
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    className="bg-black border border-neutral-800 text-xs text-white px-2.5 py-1.5 rounded-lg focus:border-lime-400 outline-none flex-1 font-mono"
                    placeholder="email@example.com"
                  />
                  <button
                    onClick={() => {
                      if (!ownerEmail.includes("@")) {
                        alert("الرجاء إدخال بريد إلكتروني صحيح");
                        return;
                      }
                      localStorage.setItem("techcore_owner_email", ownerEmail);
                      setEmailEditMode(false);
                      setFormSuccess("تم تحديث البريد الإلكتروني للمالك بنجاح وتأكيد الاشتراك!");
                      setTimeout(() => setFormSuccess(null), 4000);
                    }}
                    className="bg-lime-400 text-black text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-lime-300 transition"
                  >
                    حفظ
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center bg-black/40 border border-neutral-900 px-3 py-1.5 rounded-lg">
                  <span className="text-xs text-white font-mono">{ownerEmail}</span>
                  <button onClick={() => setEmailEditMode(true)} className="text-[10px] text-lime-400 hover:underline">
                    تعديل
                  </button>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-neutral-400 font-bold">
                <span>كلمة مرور المدير:</span>
              </div>

              {passwordEditMode ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={ownerPassword}
                    onChange={(e) => setOwnerPassword(e.target.value)}
                    className="bg-black border border-neutral-800 text-xs text-white px-2.5 py-1.5 rounded-lg focus:border-lime-400 outline-none flex-1 font-mono"
                    placeholder="كلمة مرور جديدة"
                  />
                  <button
                    onClick={() => {
                      if (!ownerPassword.trim()) {
                        alert("الرجاء إدخال كلمة مرور صالحة");
                        return;
                      }
                      localStorage.setItem("techcore_owner_password", ownerPassword.trim());
                      setPasswordEditMode(false);
                      setFormSuccess("تم تحديث كلمة المرور للمالك بنجاح!");
                      setTimeout(() => setFormSuccess(null), 4000);
                    }}
                    className="bg-lime-400 text-black text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-lime-300 transition"
                  >
                    حفظ
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center bg-black/40 border border-neutral-900 px-3 py-1.5 rounded-lg">
                  <span className="text-xs text-white font-mono">••••••••</span>
                  <button onClick={() => setPasswordEditMode(true)} className="text-[10px] text-lime-400 hover:underline">
                    تعديل
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Simulated Email Sending and Alert History */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alert Logs & History */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-lime-400" />
                سجل التنبيهات المرسلة تلقائياً (Notification Logs)
              </h5>
              <span className="text-[10px] text-neutral-500 font-mono">العدد: {alertList.length}</span>
            </div>

            {alertList.length === 0 ? (
              <div className="border border-dashed border-neutral-800 rounded-2xl py-8 text-center text-xs text-neutral-500">
                لا توجد تنبيهات مخزون مرسلة بعد. جميع المنتجات تفوق الحد الأدنى الآمن (أكثر من 5 قطع).
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {alertList.map((alert) => (
                  <div key={alert.id} className="p-3 bg-zinc-950/60 border border-white/5 rounded-xl flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                      <div>
                        <span className="font-bold text-white block">مخزون حرج: {alert.productName}</span>
                        <span className="text-[10px] text-neutral-500 block mt-0.5 font-mono">ID: {alert.productId}</span>
                      </div>
                    </div>

                    <div className="text-left">
                      <span className="text-[10px] bg-red-950/50 text-red-400 border border-red-500/10 px-2 py-0.5 rounded font-bold font-mono">
                        المخزون المتبقي: {alert.stockLeft}
                      </span>
                      <span className="text-[9px] text-neutral-400 block mt-1 font-mono">تم الإرسال لـ: {alert.emailSentTo}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Direct Simulation Actions */}
          <div className="bg-zinc-950/40 border border-neutral-800/80 p-4 rounded-2xl flex flex-col justify-between space-y-4">
            <div>
              <h5 className="text-xs font-bold text-white mb-1.5">🔬 محاكاة نظام تنبيهات المخزون</h5>
              <p className="text-[10px] text-neutral-400 leading-relaxed">
                يمكنك تجربة إرسال بريد إلكتروني تجريبي لمحاكاة ما يتم إرساله للمالك تلقائياً عندما يقترب منتج من النفاد.
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  const demoAlert = {
                    id: `ALT-DEMO-${Date.now()}`,
                    productId: "c-101",
                    productName: "حاسوب الألعاب الخارق Core-i9",
                    stockLeft: 3,
                    date: new Date().toISOString(),
                    emailSentTo: ownerEmail,
                    opened: false,
                  };
                  const alerts = JSON.parse(localStorage.getItem("techcore_stock_alerts") || "[]");
                  const updatedAlerts = [demoAlert, ...alerts];
                  localStorage.setItem("techcore_stock_alerts", JSON.stringify(updatedAlerts));
                  setAlertList(updatedAlerts);

                  setFormSuccess(`📬 تم إرسال بريد إلكتروني تجريبي بنجاح إلى: ${ownerEmail} ينبه بنفاد حاسوب الألعاب الخارق!`);
                  setTimeout(() => setFormSuccess(null), 5000);
                }}
                className="w-full bg-lime-400 hover:bg-lime-300 text-black text-[11px] font-black py-2.5 px-4 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-lime-400/10"
              >
                <Mail className="w-4 h-4" />
                إرسال بريد إلكتروني تجريبي الآن
              </button>

              <div className="text-[9px] text-neutral-500 leading-relaxed text-center">
                * يتم الإرسال آلياً عبر خادم المتجر بمجرد الضغط على الحفظ في نموذج المنتجات أو عند إتمام عملية الشراء من المتجر.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
