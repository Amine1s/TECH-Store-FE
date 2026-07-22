import React from "react";
import {
  Search,
  RefreshCw,
  ClipboardList,
  Activity,
  Truck,
  FileText,
  Printer,
  Mail,
  CheckCircle,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

interface AdminOrdersTabProps {
  adminOrders: any[];
  fetchAdminOrders: () => void;
  selectedAdminOrder: any;
  setSelectedAdminOrder: (val: any) => void;
  ordersSearch: string;
  setOrdersSearch: (val: string) => void;
  ordersStatusFilter: string;
  setOrdersStatusFilter: (val: string) => void;
  isUpdatingStatus: boolean;
  setIsUpdatingStatus: (val: boolean) => void;
  carrierInput: string;
  setCarrierInput: (val: string) => void;
  trackingNumberInput: string;
  setTrackingNumberInput: (val: string) => void;
  setFormSuccess: (val: string | null) => void;
}

export function AdminOrdersTab({
  adminOrders,
  fetchAdminOrders,
  selectedAdminOrder,
  setSelectedAdminOrder,
  ordersSearch,
  setOrdersSearch,
  ordersStatusFilter,
  setOrdersStatusFilter,
  isUpdatingStatus,
  setIsUpdatingStatus,
  carrierInput,
  setCarrierInput,
  trackingNumberInput,
  setTrackingNumberInput,
  setFormSuccess,
}: AdminOrdersTabProps) {
  // Filtered orders list
  const filteredOrders = adminOrders.filter((o) => {
    const matchSearch =
      o.id.toLowerCase().includes(ordersSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(ordersSearch.toLowerCase()) ||
      o.customerPhone.includes(ordersSearch);
    const matchStatus = ordersStatusFilter === "all" || o.status === ordersStatusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in text-right">
      {/* Metrics summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-950/40 p-4 rounded-3xl border border-neutral-900">
        <div className="p-3 bg-zinc-950 rounded-2xl border border-white/5">
          <span className="text-[10px] text-neutral-400 font-bold block">إجمالي الطلبات المستلمة</span>
          <span className="text-xl font-black text-white font-mono">{adminOrders.length}</span>
        </div>
        <div className="p-3 bg-zinc-950 rounded-2xl border border-white/5">
          <span className="text-[10px] text-neutral-400 font-bold block">تحت المراجعة والتدقيق</span>
          <span className="text-xl font-black text-purple-400 font-mono">
            {adminOrders.filter((o) => o.status === "under_review").length}
          </span>
        </div>
        <div className="p-3 bg-zinc-950 rounded-2xl border border-white/5">
          <span className="text-[10px] text-neutral-400 font-bold block">جاري شحنها وتتبعها</span>
          <span className="text-xl font-black text-amber-400 font-mono">
            {adminOrders.filter((o) => o.status === "shipping").length}
          </span>
        </div>
        <div className="p-3 bg-zinc-950 rounded-2xl border border-white/5">
          <span className="text-[10px] text-neutral-400 font-bold block">تم تسليمها للعميل</span>
          <span className="text-xl font-black text-emerald-400 font-mono">
            {adminOrders.filter((o) => o.status === "delivered").length}
          </span>
        </div>
      </div>

      {/* Search and filter toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-zinc-950/20 border border-neutral-900 p-4 rounded-3xl">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="ابحث برقم الطلب، اسم العميل، الهاتف..."
            value={ordersSearch}
            onChange={(e) => setOrdersSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-neutral-800 focus:border-lime-400 rounded-xl pr-9 pl-3 py-2 text-xs text-white outline-none transition"
          />
          <Search className="w-4 h-4 text-neutral-500 absolute top-2.5 right-3" />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={fetchAdminOrders}
            className="p-2 bg-zinc-900 border border-neutral-800 hover:border-lime-400 text-neutral-400 hover:text-white rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="تحديث قائمة الطلبات"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>تحديث</span>
          </button>

          <select
            value={ordersStatusFilter}
            onChange={(e) => setOrdersStatusFilter(e.target.value)}
            className="bg-zinc-950 border border-neutral-800 focus:border-lime-400 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer font-sans"
          >
            <option value="all">كل الحالات</option>
            <option value="under_review">تحت المراجعة (قيد المراجعة)</option>
            <option value="shipping">جاري الشحن</option>
            <option value="delivered">تم التوصيل</option>
            <option value="returned">مسترجع</option>
          </select>
        </div>
      </div>

      {/* Split Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Grid: Orders Queue List */}
        <div className="lg:col-span-5 bg-zinc-950/40 border border-neutral-900 rounded-3xl p-4 space-y-3 h-[600px] overflow-y-auto">
          <h3 className="text-xs font-bold text-neutral-400 pb-2 border-b border-neutral-900 flex justify-between">
            <span>طابور الطلبات الإلكترونية</span>
            <span className="font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.2 rounded-full">
              {adminOrders.length} طلب
            </span>
          </h3>

          {adminOrders.length === 0 ? (
            <div className="py-24 text-center text-neutral-500 space-y-3">
              <ClipboardList className="w-12 h-12 text-neutral-800 mx-auto" />
              <p className="text-xs">لا يوجد أي طلبات نشطة في المتجر حالياً.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredOrders.map((o) => {
                const isSelected = selectedAdminOrder?.id === o.id;
                let statusBadge = "bg-neutral-900 text-neutral-400 border-neutral-800";
                let statusText = "قيد المراجعة";
                if (o.status === "shipping") {
                  statusBadge = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                  statusText = "جاري الشحن";
                } else if (o.status === "delivered") {
                  statusBadge = "bg-green-500/10 text-green-400 border-green-500/20";
                  statusText = "تم التوصيل";
                } else if (o.status === "returned") {
                  statusBadge = "bg-rose-500/10 text-rose-400 border-rose-500/20";
                  statusText = "مسترجع";
                }

                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => {
                      setSelectedAdminOrder(o);
                      setCarrierInput(o.shippingProvider || "Aramex");
                      setTrackingNumberInput(o.trackingNumber || "");
                    }}
                    className={`w-full text-right p-4 rounded-2xl border transition duration-200 cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? "bg-purple-950/25 border-purple-500 shadow-md shadow-purple-500/5"
                        : "bg-zinc-950 border-white/5 hover:bg-neutral-900/40 hover:border-neutral-800"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-xs font-mono font-black text-white">{o.id}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusBadge}`}>
                        {statusText}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-neutral-200">{o.customerName}</div>
                    <div className="text-[10px] text-neutral-400 truncate w-full">
                      {o.cart.map((item: any) => `${item.product.name} (x${item.quantity})`).join("، ")}
                    </div>

                    <div className="flex justify-between items-center w-full pt-2 border-t border-neutral-900">
                      <span className="text-[10px] text-neutral-500">
                        {new Date(o.date).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" })}
                      </span>
                      <span className="text-xs font-black font-mono text-lime-400">{o.total.toLocaleString()} ر.س</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Grid: Interactive Workspace & Shipping Hub */}
        <div className="lg:col-span-7 bg-zinc-950/40 border border-neutral-900 rounded-3xl p-5 space-y-6 min-h-[600px]">
          {selectedAdminOrder ? (
            <div className="space-y-6">
              {/* Section A: Customer Details */}
              <div className="border-b border-neutral-900 pb-4 flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-bold bg-neutral-900 text-neutral-400 border border-neutral-800 px-2 py-0.5 rounded-full">
                    تفاصيل الطلب الآمن
                  </span>
                  <h4 className="text-base font-black text-white mt-1">العميل: {selectedAdminOrder.customerName}</h4>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    {selectedAdminOrder.customerCity} - {selectedAdminOrder.customerAddress} | هاتف:{" "}
                    {selectedAdminOrder.customerPhone}
                  </p>
                </div>

                <div className="text-left font-mono">
                  <span className="text-[10px] text-neutral-500 block">تاريخ الإجراء:</span>
                  <span className="text-xs text-neutral-300 font-bold">
                    {new Date(selectedAdminOrder.date).toLocaleDateString("ar-EG")}
                  </span>
                </div>
              </div>

              {/* Section B: Order Items Table */}
              <div className="bg-zinc-950 border border-neutral-900 rounded-2xl p-4 space-y-2">
                <div className="text-xs font-bold text-neutral-400 border-b border-neutral-900 pb-1.5 flex justify-between">
                  <span>الأجهزة المشتراة والمقاسات / الخيارات</span>
                  <span>الكمية والسعر</span>
                </div>
                {selectedAdminOrder.cart.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-xs py-1.5 border-b border-neutral-900/60 last:border-none"
                  >
                    <div>
                      <span className="font-bold text-white">{item.product.name}</span>
                      {item.selectedVariants && (
                        <span className="text-[9px] text-purple-400 block mt-0.5">
                          {Object.entries(item.selectedVariants)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(" | ")}
                        </span>
                      )}
                    </div>
                    <div className="text-left font-mono">
                      <span className="text-neutral-400">{item.quantity} × </span>
                      <span className="text-lime-400 font-bold">{item.product.price.toLocaleString()} ر.س</span>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2.5 text-xs">
                  <span className="font-bold text-neutral-300">القيمة الإجمالية شاملة الضريبة:</span>
                  <span className="text-lime-400 font-black font-mono text-sm">
                    {selectedAdminOrder.total.toLocaleString()} ر.س
                  </span>
                </div>
              </div>

              {/* Section C: Status Controller (Status Tracking) */}
              <div className="bg-zinc-950/80 border border-neutral-900 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-purple-400" />
                  تتبع الحالات وتغيير حالة الطلب والطرود
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    {
                      val: "under_review",
                      label: "قيد المراجعة",
                      color: "hover:bg-neutral-800",
                      active: "bg-neutral-800 text-white border-neutral-600",
                    },
                    {
                      val: "shipping",
                      label: "جاري الشحن",
                      color: "hover:bg-amber-500/10 hover:text-amber-400",
                      active: "bg-amber-500/10 text-amber-400 border-amber-500/30",
                    },
                    {
                      val: "delivered",
                      label: "تم التوصيل",
                      color: "hover:bg-emerald-500/10 hover:text-emerald-400",
                      active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
                    },
                    {
                      val: "returned",
                      label: "مسترجع",
                      color: "hover:bg-rose-500/10 hover:text-rose-400",
                      active: "bg-rose-500/10 text-rose-400 border-rose-500/30",
                    },
                  ].map((btn) => {
                    const isActive = selectedAdminOrder.status === btn.val;
                    return (
                      <button
                        key={btn.val}
                        type="button"
                        onClick={async () => {
                          setIsUpdatingStatus(true);
                          try {
                            const res = await fetch(`${API_BASE_URL}/api/orders/${selectedAdminOrder.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ status: btn.val }),
                            });
                            if (res.ok) {
                              const d = await res.json();
                              setSelectedAdminOrder(d.order);
                              setFormSuccess("تم تحديث حالة الطلب وإرسال التنبيه فوراً!");
                              fetchAdminOrders();
                              setTimeout(() => setFormSuccess(null), 3000);
                            }
                          } catch (err) {
                            console.error("Error status update:", err);
                          } finally {
                            setIsUpdatingStatus(false);
                          }
                        }}
                        disabled={isUpdatingStatus}
                        className={`px-3 py-2 border rounded-xl text-center text-xs font-black transition cursor-pointer ${
                          isActive ? btn.active : `bg-zinc-950 border-neutral-900 text-neutral-400 ${btn.color}`
                        }`}
                      >
                        {btn.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section D: Shipping Integration & Labels */}
              <div className="bg-zinc-950/80 border border-neutral-900 rounded-2xl p-4 space-y-4">
                <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-lime-400" />
                    الربط مع شركات الشحن وإصدار البوالص
                  </h4>
                  <span className="text-[9px] text-neutral-500">API INTEGRATION</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
                  <div>
                    <label className="block text-[10px] text-neutral-400 mb-1">شركة الشحن (Carrier)</label>
                    <select
                      value={carrierInput}
                      onChange={(e) => setCarrierInput(e.target.value)}
                      className="w-full bg-zinc-950 border border-neutral-800 focus:border-lime-400 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="Aramex">أرامكس (Aramex)</option>
                      <option value="SMSA">سمسا (SMSA Express)</option>
                      <option value="DHL">دي إتش إل (DHL)</option>
                      <option value="SPL">سبل الوطنية (SPL)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-400 mb-1">رقم التتبع (Tracking Number)</label>
                    <input
                      type="text"
                      value={trackingNumberInput}
                      onChange={(e) => setTrackingNumberInput(e.target.value)}
                      placeholder="ARM-xxxxxxx-SA"
                      className="w-full bg-zinc-950 border border-neutral-800 focus:border-lime-400 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none font-mono text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await fetch(`${API_BASE_URL}/api/orders/${selectedAdminOrder.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            shippingProvider: carrierInput,
                            trackingNumber:
                              trackingNumberInput ||
                              `${carrierInput.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}-KSA`,
                          }),
                        });
                        if (res.ok) {
                          const d = await res.json();
                          setSelectedAdminOrder(d.order);
                          setFormSuccess("تم ربط البيانات بمدخلات التتبع بنجاح!");
                          setTimeout(() => setFormSuccess(null), 3000);
                          fetchAdminOrders();
                        }
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-600 rounded-xl text-[11px] font-bold text-neutral-300 cursor-pointer"
                  >
                    ربط بيانات التتبع
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await fetch(`${API_BASE_URL}/api/orders/${selectedAdminOrder.id}/shipping-label`, {
                          method: "POST",
                        });
                        if (res.ok) {
                          const d = await res.json();
                          setSelectedAdminOrder(d.order);
                          setFormSuccess("تم إصدار بوليصة شحن باركود رسمية بنجاح!");
                          fetchAdminOrders();
                          setTimeout(() => setFormSuccess(null), 3000);
                        }
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="px-4 py-2 bg-lime-400 hover:bg-lime-300 text-black text-xs font-black rounded-xl cursor-pointer flex items-center gap-1 shadow-lg shadow-lime-400/10"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>إصدار بوليصة شحن معتمدة</span>
                  </button>
                </div>

                {/* Rendering issued shipping label */}
                {selectedAdminOrder.shippingLabelIssued && (
                  <div
                    className="bg-white text-black p-5 rounded-2xl space-y-4 border border-neutral-300 font-sans shadow-md"
                    id="shipping-waybill"
                  >
                    <div className="flex justify-between items-center border-b-2 border-black pb-2.5">
                      <div>
                        <span className="text-xs bg-black text-white px-2 py-0.5 rounded font-black">
                          {selectedAdminOrder.shippingProvider || "Aramex"}
                        </span>
                        <p className="text-[8px] text-neutral-500 font-mono mt-1">STANDARD DOMESTIC PARCEL</p>
                      </div>
                      <div className="text-left font-mono">
                        <span className="text-xs font-bold block">
                          WAYBILL: {selectedAdminOrder.trackingNumber || "PENDING"}
                        </span>
                        <span className="text-[8px] text-neutral-500">Weight: 1.8 KG | COD: 0.00 SAR</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-[10px] pb-3 border-b border-neutral-200">
                      <div>
                        <strong className="block text-[8px] text-neutral-500">SENDER / SHIP FROM:</strong>
                        <strong className="block text-neutral-900">TECHCORE Warehouse Hub 4</strong>
                        <span className="text-neutral-600 block">العليا، شارع المعذر، الرياض</span>
                        <span className="text-neutral-600 block">هاتف: 920002938</span>
                      </div>

                      <div>
                        <strong className="block text-[8px] text-neutral-500">RECIPIENT / SHIP TO:</strong>
                        <strong className="block text-neutral-900">{selectedAdminOrder.customerName}</strong>
                        <span className="text-neutral-600 block">
                          {selectedAdminOrder.customerCity} - {selectedAdminOrder.customerAddress}
                        </span>
                        <span className="text-neutral-600 block">هاتف: {selectedAdminOrder.customerPhone}</span>
                      </div>
                    </div>

                    {/* Barcode Mock */}
                    <div className="flex flex-col items-center py-2 space-y-1">
                      {/* CSS Barcode */}
                      <div className="w-64 h-10 flex gap-[2px]">
                        {Array.from({ length: 32 }).map((_, i) => {
                          const wClass = i % 3 === 0 ? "w-[1px]" : i % 5 === 1 ? "w-[4px]" : "w-[2px]";
                          const bgClass = i % 4 === 1 ? "bg-transparent" : "bg-black";
                          return <div key={i} className={`h-full ${wClass} ${bgClass}`} />;
                        })}
                      </div>
                      <span className="text-[10px] font-mono font-bold">*{selectedAdminOrder.trackingNumber}*</span>
                    </div>

                    <div className="flex justify-between items-center text-[9px] pt-1">
                      <span>بوابة الشحن والمستودعات والخدمات اللوجستية المتكاملة</span>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-3 py-1 bg-black text-white hover:bg-neutral-800 rounded text-[9px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3 h-3 text-lime-400" />
                        <span>طباعة بوليصة الشحن</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Section E: PDF Invoicing & Mail Send */}
              <div className="bg-zinc-950/80 border border-neutral-900 rounded-2xl p-4 space-y-4">
                <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-purple-400" />
                    نظام الفواتير التلقائية وإرسالها بالبريد الإلكتروني
                  </h4>
                  <span className="text-[9px] text-neutral-500">ZATCA INVOICES</span>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    {selectedAdminOrder.customerEmail ? (
                      <div className="text-xs text-neutral-300">
                        بريد العميل الإلكتروني:{" "}
                        <strong className="font-mono text-lime-400">{selectedAdminOrder.customerEmail}</strong>
                      </div>
                    ) : (
                      <div className="text-xs text-neutral-400">
                        ⚠️ تم الشراء كضيف (لم يحدد بريداً إلكترونياً). يمكنك تحديد بريد إرسال الفاتورة يدوياً.
                      </div>
                    )}
                    <p className="text-[9px] text-neutral-500 mt-1">
                      * يتم إرسال الفاتورة تلقائياً فقط في حالة قيام العميل بتسجيل دخوله مسبقاً قبل الشراء.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          let email = selectedAdminOrder.customerEmail;
                          if (!email) {
                            const guestMail = prompt("الرجاء إدخال البريد الإلكتروني للعميل الضيف لإرسال الفاتورة يدوياً:");
                            if (!guestMail) return;
                            if (!guestMail.includes("@")) {
                              alert("الرجاء كتابة بريد إلكتروني صحيح");
                              return;
                            }
                            email = guestMail;
                          }
                          const res = await fetch(`${API_BASE_URL}/api/orders/${selectedAdminOrder.id}/invoice-mail`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email }),
                          });
                          if (res.ok) {
                            const d = await res.json();
                            setSelectedAdminOrder(d.order);
                            setFormSuccess(`تم توليد فاتورة PDF احترافية بنجاح وإرسالها لـ ${email}!`);
                            fetchAdminOrders();
                            setTimeout(() => setFormSuccess(null), 3000);
                          }
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-xs font-black text-neutral-200 rounded-xl cursor-pointer flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5 text-purple-400" />
                      <span>توليد وإرسال الفاتورة بالبريد</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-4 py-2 bg-lime-400 hover:bg-lime-300 text-black text-xs font-black rounded-xl cursor-pointer flex items-center gap-1.5 shadow-lg shadow-lime-400/10"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>معاينة وطباعة الفاتورة</span>
                    </button>
                  </div>
                </div>

                {selectedAdminOrder.invoiceSent && (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>أوتوماتيكي: تم توليد وإرسال الفاتورة الضريبية بالبريد الإلكتروني للعميل بنجاح!</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-36">
              <div className="p-4 bg-zinc-900 border border-neutral-800 rounded-full text-neutral-600 animate-pulse">
                <Truck className="w-12 h-12" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">منصة إدارة الطلبات والخدمات اللوجستية</h4>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm">
                  الرجاء تحديد أحد الطلبات النشطة من القائمة الجانبية لإدارة حالته، إصدار بوليصة الشحن، وإدارة الفواتير التلقائية
                  المرسلة بالبريد.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
