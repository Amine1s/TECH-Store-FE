import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Package,
  Plus,
  Truck,
  Activity,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Product } from "../data/products";
import { AdminAnalyticsTab } from "./admin/AdminAnalyticsTab";
import { AdminCatalogTab } from "./admin/AdminCatalogTab";
import { AdminProductFormTab } from "./admin/AdminProductFormTab";
import { AdminOrdersTab } from "./admin/AdminOrdersTab";

interface AdminDashboardProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onClose: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export function AdminDashboard({
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onClose,
}: AdminDashboardProps) {
  // Navigation & Search States
  const [activeTab, setActiveTab] = useState<"analytics" | "list" | "form" | "orders">("analytics");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Orders & Shipping Management states
  const [adminOrders, setAdminOrders] = useState<any[]>([]);
  const [ordersSearch, setOrdersSearch] = useState("");
  const [ordersStatusFilter, setOrdersStatusFilter] = useState<string>("all");
  const [selectedAdminOrder, setSelectedAdminOrder] = useState<any | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [carrierInput, setCarrierInput] = useState("");
  const [trackingNumberInput, setTrackingNumberInput] = useState("");

  const fetchAdminOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`);
      if (res.ok) {
        const data = await res.json();
        setAdminOrders(data);
        if (selectedAdminOrder) {
          const fresh = data.find((o: any) => o.id === selectedAdminOrder.id);
          if (fresh) {
            setSelectedAdminOrder(fresh);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching admin orders:", err);
    }
  };

  // Cart Abandonment dynamic tracking states
  const [abandonedCarts, setAbandonedCarts] = useState<any[]>([]);
  const [cartStats, setCartStats] = useState({
    count: 0,
    potentialRevenueLost: 0,
    abandonmentRate: 74,
    activeUsersAddingToCart: 0,
  });
  const [isRecoveringId, setIsRecoveringId] = useState<string | null>(null);
  const [recoveryDiscount, setRecoveryDiscount] = useState<number>(15);

  const fetchCartAbandonmentData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/cart-abandonment`);
      if (res.ok) {
        const data = await res.json();
        setAbandonedCarts(data.abandonedCarts || []);
        if (data.stats) {
          setCartStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Error fetching cart abandonment data:", err);
    }
  };

  const handleRecoverCart = async (sessionId: string) => {
    setIsRecoveringId(sessionId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/cart-abandonment/recover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, discount: recoveryDiscount }),
      });
      if (res.ok) {
        const data = await res.json();
        setFormSuccess(data.message);
        setTimeout(() => setFormSuccess(null), 6000);
        fetchCartAbandonmentData();
      }
    } catch (err) {
      console.error("Error recovering cart:", err);
    } finally {
      setIsRecoveringId(null);
    }
  };

  useEffect(() => {
    fetchAdminOrders();
    fetchCartAbandonmentData();
    const interval = setInterval(() => {
      fetchAdminOrders();
      fetchCartAbandonmentData();
    }, 6000); // 6s polling
    return () => clearInterval(interval);
  }, [selectedAdminOrder]);

  // Form states
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formCategory, setFormCategory] = useState<"household" | "phones" | "computers">("computers");
  const [formStock, setFormStock] = useState<number>(10);
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formSpecs, setFormSpecs] = useState<string[]>([""]);
  const [formFeatured, setFormFeatured] = useState(false);
  const [formOriginalPrice, setFormOriginalPrice] = useState<number | "">("");
  const [formVariants, setFormVariants] = useState<{ name: string; options: string[] }[]>([]);

  // Image upload and source state
  const [imageSourceType, setImageSourceType] = useState<"upload" | "url">("upload");
  const [isDragging, setIsDragging] = useState(false);

  // Confirmation modals / indicators
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Owner Email & Stock Alerts state & effect
  const [ownerEmail, setOwnerEmail] = useState(
    () => localStorage.getItem("techcore_owner_email") || "amine879mohamed@gmail.com"
  );
  const [emailEditMode, setEmailEditMode] = useState(false);
  const [alertList, setAlertList] = useState<
    { id: string; productName: string; stockLeft: number; date: string; emailSentTo: string }[]
  >([]);

  useEffect(() => {
    const alerts = JSON.parse(localStorage.getItem("techcore_stock_alerts") || "[]");
    setAlertList(alerts);

    const handleAlert = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setAlertList((prev) => [customEvent.detail, ...prev]);
      }
    };
    window.addEventListener("techcore_stock_alert_triggered", handleAlert);
    return () => window.removeEventListener("techcore_stock_alert_triggered", handleAlert);
  }, []);

  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setFormPrice(0);
    setFormCategory("computers");
    setFormStock(10);
    setFormImageUrl("");
    setFormSpecs([""]);
    setFormFeatured(false);
    setFormOriginalPrice("");
    setFormVariants([]);
    setEditingProduct(null);
    setFormError(null);
    setImageSourceType("upload");
  };

  const handleOpenEditForm = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormDescription(product.description);
    setFormPrice(product.price);
    setFormCategory(product.category);
    setFormStock(product.stock);
    setFormImageUrl(product.image);
    setFormSpecs(product.specs && product.specs.length > 0 ? [...product.specs] : [""]);
    setFormFeatured(!!product.featured);
    setFormOriginalPrice(product.originalPrice !== undefined ? product.originalPrice : "");
    setFormVariants(
      product.variants && product.variants.length > 0 ? JSON.parse(JSON.stringify(product.variants)) : []
    );
    setFormError(null);
    setFormSuccess(null);
    setImageSourceType(product.image && product.image.startsWith("data:") ? "upload" : "url");
    setActiveTab("form");
  };

  const checkAndTriggerStockAlert = (productId: string, productName: string, newStock: number) => {
    if (newStock <= 5) {
      const alerts = JSON.parse(localStorage.getItem("techcore_stock_alerts") || "[]");
      const currentOwnerEmail = localStorage.getItem("techcore_owner_email") || "amine879mohamed@gmail.com";

      const alreadyAlerted = alerts.some((a: any) => a.productId === productId && a.stockLeft === newStock);
      if (!alreadyAlerted) {
        const newAlert = {
          id: `ALT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          productId,
          productName,
          stockLeft: newStock,
          date: new Date().toISOString(),
          emailSentTo: currentOwnerEmail,
          opened: false,
        };
        const updatedAlerts = [newAlert, ...alerts];
        localStorage.setItem("techcore_stock_alerts", JSON.stringify(updatedAlerts));
        localStorage.setItem("techcore_last_email_sent", JSON.stringify(newAlert));
        // Dispatches a custom event to notify App.tsx if mounted
        window.dispatchEvent(new CustomEvent("techcore_stock_alert_triggered", { detail: newAlert }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // Basic Validation
    if (!formName.trim()) {
      setFormError("الرجاء إدخال اسم المنتج");
      return;
    }
    if (!formDescription.trim()) {
      setFormError("الرجاء إضافة وصف توضيحي للمنتج");
      return;
    }
    if (formPrice <= 0) {
      setFormError("الرجاء تحديد سعر أكبر من صفر");
      return;
    }
    if (formStock < 0) {
      setFormError("المخزون لا يمكن أن يكون سالباً");
      return;
    }
    if (!formImageUrl.trim()) {
      setFormError("الرجاء إدخال رابط الصورة أو رفع ملف صورة من جهازك");
      return;
    }

    const cleanedSpecs = formSpecs.map((s) => s.trim()).filter(Boolean);

    let categoryAr = "أجهزة منزلية";
    if (formCategory === "phones") categoryAr = "الهواتف والأجهزة الذكية";
    else if (formCategory === "computers") categoryAr = "أجهزة حواسب ولاب توب";

    const originalPriceNum =
      formOriginalPrice && Number(formOriginalPrice) > formPrice ? Number(formOriginalPrice) : undefined;
    const discountPercentNum = originalPriceNum
      ? Math.round(((originalPriceNum - formPrice) / originalPriceNum) * 100)
      : undefined;

    const cleanedVariants = formVariants
      .map((v) => ({
        name: v.name.trim(),
        options: v.options.map((o) => o.trim()).filter(Boolean),
      }))
      .filter((v) => v.name && v.options.length > 0);

    if (editingProduct) {
      // Edit mode
      const updated: Product = {
        ...editingProduct,
        name: formName.trim(),
        description: formDescription.trim(),
        price: formPrice,
        category: formCategory,
        categoryAr,
        stock: formStock,
        image: formImageUrl.trim(),
        specs: cleanedSpecs,
        featured: formFeatured,
        originalPrice: originalPriceNum,
        discountPercent: discountPercentNum,
        variants: cleanedVariants,
      };
      onEditProduct(updated);
      checkAndTriggerStockAlert(updated.id, updated.name, updated.stock);
      setFormSuccess("تم تعديل المنتج بنجاح!");
      setTimeout(() => {
        setActiveTab("list");
        resetForm();
      }, 1000);
    } else {
      // Create mode
      const newId = `${formCategory.charAt(0)}-${Date.now()}`;
      const newProduct: Product = {
        id: newId,
        name: formName.trim(),
        description: formDescription.trim(),
        price: formPrice,
        category: formCategory,
        categoryAr,
        rating: 4.8, // Default rating for new products
        stock: formStock,
        image: formImageUrl.trim(),
        specs: cleanedSpecs,
        featured: formFeatured,
        originalPrice: originalPriceNum,
        discountPercent: discountPercentNum,
        variants: cleanedVariants,
      };
      onAddProduct(newProduct);
      checkAndTriggerStockAlert(newProduct.id, newProduct.name, newProduct.stock);
      setFormSuccess("تم إضافة المنتج الجديد بنجاح للمتجر!");
      setTimeout(() => {
        setActiveTab("list");
        resetForm();
      }, 1000);
    }
  };

  const handleDeleteClick = (productId: string) => {
    setConfirmDeleteId(productId);
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteId) {
      onDeleteProduct(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div
      className="glass-panel rounded-3xl border border-white/5 p-4 lg:p-8 space-y-6 text-right relative overflow-hidden shadow-2xl animate-fade-in"
      id="admin-dashboard-container"
    >
      {/* Visual background decor */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-lime-400/5 blur-3xl rounded-full -z-10"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 blur-3xl rounded-full -z-10"></div>

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/5">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-widest text-lime-400 bg-lime-950/40 px-3 py-1 rounded-full border border-lime-500/20 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse"></span>
            نظام الإدارة والتحليلات الآمن (ADMIN PANEL & ANALYTICS)
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
            <Activity className="w-7 h-7 text-lime-400" />
            إدارة البيانات والإحصائيات والكتالوج
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            تتبع المبيعات اليومية، سلوك الزوار، السلات المتروكة، وأضف أو عدّل المنتجات بكفاءة تامة.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-300 transition cursor-pointer"
          >
            الخروج من لوحة التحكم
          </button>
        </div>
      </div>

      {/* Dynamic Tab Navigation Bar */}
      <div className="flex flex-wrap border-b border-white/5 pb-4 gap-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
            activeTab === "analytics"
              ? "bg-lime-400 text-black border-lime-400 shadow-lg shadow-lime-400/10"
              : "bg-neutral-950/40 text-neutral-400 border-neutral-800 hover:text-white hover:bg-neutral-900"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>إدارة البيانات والإحصائيات (Dashboard)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("list")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
            activeTab === "list"
              ? "bg-lime-400 text-black border-lime-400 shadow-lg shadow-lime-400/10"
              : "bg-neutral-950/40 text-neutral-400 border-neutral-800 hover:text-white hover:bg-neutral-900"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>كتالوج المنتجات والمخزون</span>
        </button>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setActiveTab("form");
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
            activeTab === "form"
              ? "bg-lime-400 text-black border-lime-400 shadow-lg shadow-lime-400/10"
              : "bg-neutral-950/40 text-neutral-400 border-neutral-800 hover:text-white hover:bg-neutral-900"
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>إضافة منتج جديد</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("orders");
            fetchAdminOrders();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
            activeTab === "orders"
              ? "bg-lime-400 text-black border-lime-400 shadow-lg shadow-lime-400/10"
              : "bg-neutral-950/40 text-neutral-400 border-neutral-800 hover:text-white hover:bg-neutral-900"
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>إدارة الطلبات والشحن</span>
          {adminOrders.length > 0 && (
            <span className="bg-lime-400 text-black text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
              {adminOrders.length}
            </span>
          )}
        </button>
      </div>

      {/* Global Alerts inside Admin Dashboard */}
      {formSuccess && activeTab !== "form" && (
        <div className="p-4 bg-emerald-950/20 border-2 border-emerald-500/30 text-emerald-400 text-xs rounded-2xl flex items-center gap-2.5 animate-fade-in shadow-lg shadow-emerald-950/20">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-bold">{formSuccess}</span>
        </div>
      )}

      {formError && activeTab !== "form" && (
        <div className="p-4 bg-red-950/20 border-2 border-red-500/30 text-red-400 text-xs rounded-2xl flex items-center gap-2.5 animate-fade-in shadow-lg shadow-red-950/20">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="font-bold">{formError}</span>
        </div>
      )}

      {/* TAB Content Rendering */}
      {activeTab === "analytics" && (
        <AdminAnalyticsTab
          products={products}
          cartStats={cartStats}
          abandonedCarts={abandonedCarts}
          isRecoveringId={isRecoveringId}
          recoveryDiscount={recoveryDiscount}
          setRecoveryDiscount={setRecoveryDiscount}
          handleRecoverCart={handleRecoverCart}
          ownerEmail={ownerEmail}
          setOwnerEmail={setOwnerEmail}
          emailEditMode={emailEditMode}
          setEmailEditMode={setEmailEditMode}
          alertList={alertList}
          setAlertList={setAlertList}
          setFormSuccess={setFormSuccess}
        />
      )}

      {activeTab === "list" && (
        <AdminCatalogTab
          products={products}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onOpenEditForm={handleOpenEditForm}
          onDeleteClick={handleDeleteClick}
          confirmDeleteId={confirmDeleteId}
          setConfirmDeleteId={setConfirmDeleteId}
          onConfirmDelete={handleConfirmDelete}
          resetForm={resetForm}
        />
      )}

      {activeTab === "form" && (
        <AdminProductFormTab
          onSubmit={handleSubmit}
          editingProduct={editingProduct}
          formError={formError}
          setFormError={setFormError}
          formSuccess={formSuccess}
          formName={formName}
          setFormName={setFormName}
          formDescription={formDescription}
          setFormDescription={setFormDescription}
          formSpecs={formSpecs}
          setFormSpecs={setFormSpecs}
          formVariants={formVariants}
          setFormVariants={setFormVariants}
          formCategory={formCategory}
          setFormCategory={setFormCategory}
          formPrice={formPrice}
          setFormPrice={setFormPrice}
          formStock={formStock}
          setFormStock={setFormStock}
          formOriginalPrice={formOriginalPrice}
          setFormOriginalPrice={setFormOriginalPrice}
          imageSourceType={imageSourceType}
          setImageSourceType={setImageSourceType}
          formImageUrl={formImageUrl}
          setFormImageUrl={setFormImageUrl}
          formFeatured={formFeatured}
          setFormFeatured={setFormFeatured}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
          onCancel={() => {
            setActiveTab("list");
            resetForm();
          }}
        />
      )}

      {activeTab === "orders" && (
        <AdminOrdersTab
          adminOrders={adminOrders}
          fetchAdminOrders={fetchAdminOrders}
          selectedAdminOrder={selectedAdminOrder}
          setSelectedAdminOrder={setSelectedAdminOrder}
          ordersSearch={ordersSearch}
          setOrdersSearch={setOrdersSearch}
          ordersStatusFilter={ordersStatusFilter}
          setOrdersStatusFilter={setOrdersStatusFilter}
          isUpdatingStatus={isUpdatingStatus}
          setIsUpdatingStatus={setIsUpdatingStatus}
          carrierInput={carrierInput}
          setCarrierInput={setCarrierInput}
          trackingNumberInput={trackingNumberInput}
          setTrackingNumberInput={setTrackingNumberInput}
          setFormSuccess={setFormSuccess}
        />
      )}
    </div>
  );
}
