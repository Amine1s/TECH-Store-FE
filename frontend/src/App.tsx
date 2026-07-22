import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  CheckCircle, 
  ChevronLeft, 
  X, 
  Trash2, 
  Lock, 
  Zap, 
  SlidersHorizontal, 
  Plus, 
  Minus, 
  Star, 
  Monitor, 
  Smartphone, 
  Home, 
  ShieldAlert,
  Sparkles,
  Info,
  User,
  UserCheck,
  FileText,
  Truck,
  MapPin,
  ClipboardList,
  Send,
  Printer,
  ArrowRight,
  RefreshCw,
  Mail,
  LogOut,
  ArrowUp
} from "lucide-react";
import { WaveBackground } from "./components/WaveBackground";
import { getProducts, Product } from "./data/products";
import { AdminDashboard } from "./components/AdminDashboard";
import { LazyImage } from "./components/LazyImage";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");
  
  // Cart state
  const [cart, setCart] = useState<{ product: Product; quantity: number; selectedVariants?: Record<string, string> }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cart session for tracking unpurchased carts dynamically
  const [cartSessionId] = useState<string>(() => {
    const existing = localStorage.getItem("techcore_cart_session_id");
    if (existing) return existing;
    const newId = `CART-${Math.floor(100000 + Math.random() * 900000)}`;
    localStorage.setItem("techcore_cart_session_id", newId);
    return newId;
  });
  
  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleSelectProduct = (product: Product | null) => {
    setSelectedProduct(product);
    if (product && product.variants && product.variants.length > 0) {
      const initial: Record<string, string> = {};
      product.variants.forEach(v => {
        if (v.options.length > 0) {
          initial[v.name] = v.options[0];
        }
      });
      setSelectedVariants(initial);
    } else {
      setSelectedVariants({});
    }
  };
  const [customerUser, setCustomerUser] = useState<{ name: string; email: string; isOwner?: boolean } | null>(() => {
    const stored = localStorage.getItem("techcore_customer");
    return stored ? JSON.parse(stored) : null;
  });

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ name: "", email: "" });
  const [loginPassword, setLoginPassword] = useState("");
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [isCustomerOrdersOpen, setIsCustomerOrdersOpen] = useState(false);
  const [activeCustomerOrder, setActiveCustomerOrder] = useState<any | null>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);

  const [checkoutInfo, setCheckoutInfo] = useState({
    fullName: "",
    phone: "",
    city: "الرياض",
    address: "",
    email: ""
  });

  // Sync cart session to backend in real-time
  useEffect(() => {
    const syncCartSession = async () => {
      try {
        await fetch(`${API_BASE_URL}/api/cart-abandonment/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: cartSessionId,
            items: cart,
            customerName: checkoutInfo.fullName || customerUser?.name || "زائر مجهول",
            customerCity: checkoutInfo.city || "الرياض",
            customerPhone: checkoutInfo.phone || "غير مسجل",
            email: checkoutInfo.email || customerUser?.email || undefined,
            status: cart.length > 0 ? "abandoned" : "active"
          })
        });
      } catch (err) {
        console.error("Failed to sync cart session with server:", err);
      }
    };

    const delayDebounce = setTimeout(syncCartSession, 1000);
    return () => clearTimeout(delayDebounce);
  }, [cart, checkoutInfo.fullName, checkoutInfo.city, checkoutInfo.phone, checkoutInfo.email, customerUser, cartSessionId]);
  
  // Checkout response
  const [checkoutResponse, setCheckoutResponse] = useState<{
    success: boolean;
    orderId: string;
    transactionId: string;
    total: number;
    securityVerification: string;
    speedLatencyMs: number;
    invoiceSent?: boolean;
    customerEmail?: string;
    order?: any;
  } | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  // Success notification banner helper
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Back to Top Button state
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Detect when reaching the end of the page (e.g., within 150px of the bottom)
      const threshold = 150;
      const scrolledToBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - threshold;
      setShowScrollToTop(scrolledToBottom && window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Sync user details to checkout form
  useEffect(() => {
    if (customerUser) {
      setCheckoutInfo(prev => ({
        ...prev,
        fullName: customerUser.name,
        email: customerUser.email
      }));
    } else {
      setCheckoutInfo(prev => ({
        ...prev,
        fullName: "",
        email: ""
      }));
    }
  }, [customerUser]);

  // Fetch orders with automatic polling to keep tracking active and synchronized
  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`);
      if (res.ok) {
        const data = await res.json();
        setAllOrders(data);
        if (customerUser) {
          const filtered = data.filter((o: any) => o.customerEmail?.toLowerCase() === customerUser.email.toLowerCase());
          setCustomerOrders(filtered);
        }
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000); // 8s polling
    return () => clearInterval(interval);
  }, [customerUser]);

  // Load products initially with local storage persistence
  useEffect(() => {
    const stored = localStorage.getItem("techcore_products");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
          setFilteredProducts(parsed);
          return;
        }
      } catch (e) {
        console.error("Failed to parse stored products", e);
      }
    }
    const all = getProducts();
    setProducts(all);
    setFilteredProducts(all);
    localStorage.setItem("techcore_products", JSON.stringify(all));
  }, []);

  // Admin Callbacks
  const handleAddProduct = (newProduct: Product) => {
    const updated = [newProduct, ...products];
    setProducts(updated);
    localStorage.setItem("techcore_products", JSON.stringify(updated));
    triggerToast(`تم إضافة "${newProduct.name}" بنجاح!`);
  };

  const handleEditProduct = (updatedProduct: Product) => {
    const updated = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    setProducts(updated);
    localStorage.setItem("techcore_products", JSON.stringify(updated));
    
    // Also update item details in cart if present
    setCart(prev => prev.map(item => 
      item.product.id === updatedProduct.id 
        ? { ...item, product: updatedProduct }
        : item
    ));

    triggerToast(`تم تعديل تفاصيل "${updatedProduct.name}"!`);
  };

  const handleDeleteProduct = (productId: string) => {
    const productToDelete = products.find(p => p.id === productId);
    const updated = products.filter(p => p.id !== productId);
    setProducts(updated);
    localStorage.setItem("techcore_products", JSON.stringify(updated));
    
    // Also remove from cart if it was there
    setCart(prev => prev.filter(item => item.product.id !== productId));

    if (productToDelete) {
      triggerToast(`تم حذف المنتج "${productToDelete.name}" من المتجر`);
    }
  };

  // Filter & Sort implementation
  useEffect(() => {
    let result = [...products];

    // Search filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.categoryAr.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "featured") {
      result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    setFilteredProducts(result);
  }, [searchQuery, selectedCategory, sortBy, products]);

  // Show dynamic toast
  const triggerToast = (message: string) => {
    setSuccessToast(message);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3000);
  };

  // Add to cart handler
  const addToCart = (product: Product) => {
    // Check if same product with same variants already exists in cart
    const existingIndex = cart.findIndex(item => 
      item.product.id === product.id && 
      JSON.stringify(item.selectedVariants || {}) === JSON.stringify(selectedVariants)
    );

    if (existingIndex > -1) {
      const existing = cart[existingIndex];
      if (existing.quantity >= product.stock) {
        triggerToast(`عذراً، تم الوصول للحد الأقصى المتوفر في المخزون (${product.stock} قطع)`);
        return;
      }
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([...cart, { product, quantity: 1, selectedVariants: { ...selectedVariants } }]);
    }

    const choicesStr = Object.entries(selectedVariants).map(([k, v]) => `${k}: ${v}`).join(", ");
    const toastMsg = choicesStr 
      ? `تم إضافة "${product.name}" (${choicesStr}) إلى السلة`
      : `تم إضافة "${product.name}" إلى سلة المشتريات`;

    triggerToast(toastMsg);
  };

  // Update quantity handler
  const updateQuantity = (index: number, amount: number) => {
    setCart(cart.map((item, idx) => {
      if (idx === index) {
        const newQty = item.quantity + amount;
        if (newQty <= 0) return null;
        if (newQty > item.product.stock) {
          triggerToast(`عذراً، المخزون المتوفر ${item.product.stock} قطعة فقط`);
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean) as any);
  };

  // Remove item from cart
  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, idx) => idx !== index));
    triggerToast("تمت إزالة المنتج من السلة");
  };

  // Checkout process simulation
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutInfo.fullName || !checkoutInfo.phone || !checkoutInfo.address) {
      alert("الرجاء ملء كافة البيانات المطلوبة");
      return;
    }

    setIsCheckingOut(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          checkoutInfo,
          cartSessionId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCheckoutResponse(data);
        setCart([]); // Empty cart after successful order
        triggerToast("تم تسجيل طلبك بأمان بنجاح!");
      } else {
        const err = await response.json();
        alert(err.error || "فشل إتمام العملية");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("حدث خطأ في الاتصال بالخادم الآمن");
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Math totals
  const totalCartItems = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalCartPrice = cart.reduce((acc, curr) => acc + (curr.product.price * curr.quantity), 0);

  return (
    <div className="min-h-screen text-white relative overflow-x-hidden font-sans pb-16 selection:bg-lime-400 selection:text-black" dir="rtl">
      {/* 1. Animated wave background with golden twinkling points */}
      <WaveBackground isAdmin={isAdminMode} />

      {/* Dynamic Toast Alerts */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-black/95 border-2 border-lime-400 text-white px-5 py-3 rounded-xl shadow-xl shadow-lime-400/10 flex items-center gap-3 animate-fade-in" id="toast-container">
          <div className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse"></div>
          <span className="text-sm font-semibold">{successToast}</span>
        </div>
      )}

      {/* 2. Sticky Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/5 px-4 lg:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="w-5 h-5 text-lime-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
                <span className="text-white font-mono">TECH</span>
                <span className="text-lime-400 font-mono italic">CORE</span>
                <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-md font-sans">الفاخر</span>
              </h1>
              <p className="text-[10px] text-neutral-400 -mt-1 font-medium">بوابة الأجهزة الإلكترونية الذكية</p>
            </div>
          </div>

          {/* Secure & Latency Metrics Live Dashboard */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {/* Customer User Account */}
            {customerUser ? (
              <div className="flex items-center gap-2">
                {/* Profile block */}
                <div className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900/90 border border-neutral-800 rounded-xl text-xs text-neutral-300">
                  <UserCheck className="w-4 h-4 text-lime-400" />
                  <span className="hidden sm:inline font-bold truncate max-w-[100px]">{customerUser.name}</span>
                  <button
                    onClick={() => {
                      localStorage.removeItem("techcore_customer");
                      setCustomerUser(null);
                      setCustomerOrders([]);
                      triggerToast("تم تسجيل الخروج بنجاح");
                    }}
                    className="p-1 hover:text-rose-400 transition cursor-pointer mr-1.5"
                    title="تسجيل الخروج"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900/90 border border-neutral-800 text-xs font-bold text-neutral-200 hover:border-lime-400 hover:text-lime-400 rounded-xl transition duration-300 cursor-pointer"
                title="تسجيل دخول للحصول على الفواتير التلقائية"
              >
                <User className="w-4 h-4 text-neutral-400" />
                <span>تسجيل دخول</span>
              </button>
            )}

            {/* Admin Dashboard Toggle Button - ONLY visible to logged-in site owner */}
            {customerUser && customerUser.isOwner === true && customerUser.email.toLowerCase() === (localStorage.getItem("techcore_owner_email") || "amine879mohamed@gmail.com").trim().toLowerCase() && (
              <button
                onClick={() => setIsAdminMode(!isAdminMode)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all duration-300 cursor-pointer shadow-md ${
                  isAdminMode 
                    ? "bg-lime-400 text-black border-lime-400 hover:bg-lime-300 shadow-lime-400/20"
                    : "bg-zinc-900/90 border-neutral-800 text-neutral-200 hover:border-lime-400 hover:text-lime-400"
                }`}
                id="admin-mode-toggle-btn"
                title="لوحة تحكم المتجر"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>{isAdminMode ? "العودة للمتجر" : "لوحة التحكم"}</span>
              </button>
            )}

            {/* Cart trigger button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-zinc-900/90 border border-neutral-800 rounded-xl hover:border-lime-400 text-neutral-200 hover:text-lime-400 transition-all duration-300 cursor-pointer shadow-md"
              id="cart-trigger-btn"
              title="سلة التسوق"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-lime-400 text-black text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-6 space-y-8 relative z-10">

        {isAdminMode && customerUser && customerUser.isOwner === true && customerUser.email.toLowerCase() === (localStorage.getItem("techcore_owner_email") || "amine879mohamed@gmail.com").trim().toLowerCase() ? (
          <AdminDashboard
            products={products}
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onClose={() => setIsAdminMode(false)}
          />
        ) : (
          <>
            {/* 3. Hero Showcase Banner */}
        <section className="glass-panel rounded-3xl overflow-hidden relative border-l-4 border-lime-400 p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl" id="hero-banner">
          <div className="space-y-4 max-w-xl text-right md:order-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-black tracking-widest text-purple-400 bg-purple-950/50 px-3 py-1 rounded-full border border-purple-500/20">
              <Zap className="w-3.5 h-3.5 text-lime-400" />
              عرض الأسبوع الحصري
            </span>
            <h2 className="text-3xl md:text-5xl font-black leading-tight text-white">
              جيل جديد من الحواسيب الخارقة <span className="text-lime-400">Pro-X الجيل العاشر</span>
            </h2>
            <p className="text-neutral-300 text-xs md:text-sm leading-relaxed">
              تغلب على الحدود الرقمية مع معالجات ثنائية النواة ونظام تبريد مائي مغلق. صمم خصيصاً للمبرمجين واللاعبين المحترفين الذين يطلبون الفخامة والسرعة الفائقة مع تشفير حماية متقدم.
            </p>
            
            <div className="flex flex-wrap gap-3 items-center pt-2">
              <button 
                onClick={() => {
                  const proItem = products.find(p => p.id === 'c-3');
                  if (proItem) setSelectedProduct(proItem);
                }}
                className="bg-lime-400 hover:bg-lime-300 text-black px-6 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 shadow-lg shadow-lime-400/20 cursor-pointer"
              >
                اكتشف المواصفات
              </button>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping"></span>
                <span>متوفر 12 قطعة فقط بالمستودع</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-80 flex-shrink-0 flex items-center justify-center relative md:order-2">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-lime-500/10 blur-3xl -z-10 rounded-full"></div>
            <div className="w-64 h-48 md:w-80 md:h-60 bg-zinc-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl relative group transition-all duration-500">
              <img 
                src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80" 
                alt="حاسوب برو إكس" 
                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/60 to-transparent p-4 flex justify-between items-end">
                <div>
                  <div className="text-[10px] text-lime-400 font-bold uppercase tracking-wider">الإصدار المطور</div>
                  <div className="text-white text-xs font-bold">Pro-X الجيل العاشر</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-neutral-300 uppercase">سعر تنافسي</div>
                  <div className="text-lime-400 text-sm font-black font-mono">8,499 ر.س</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Banner Quick Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4" id="categories-grid-quick">
          
          <button 
            onClick={() => setSelectedCategory("phones")}
            className={`p-5 rounded-2xl text-right flex flex-col justify-between h-36 transition-all duration-300 cursor-pointer border ${selectedCategory === "phones" ? "bg-zinc-900 border-lime-400/80 shadow-lg shadow-lime-400/5" : "bg-black/70 border-white/5 hover:border-purple-500/50 hover:bg-zinc-900/40"}`}
          >
            <div className="flex justify-between items-start w-full">
              <div className="p-2 bg-purple-950/30 border border-purple-500/20 text-purple-400 rounded-xl">
                <Smartphone className="w-5 h-5" />
              </div>
              <span className="text-[10px] bg-white/5 px-2.5 py-1 rounded-full text-neutral-400 font-mono">20 جهاز فاخر</span>
            </div>
            <div>
              <h3 className="font-bold text-white text-base">الهواتف والأجهزة الذكية</h3>
              <p className="text-xs text-neutral-400">أحدث الهواتف الذكية الداعمة لشبكات 5G والملحقات</p>
            </div>
          </button>

          <button 
            onClick={() => setSelectedCategory("computers")}
            className={`p-5 rounded-2xl text-right flex flex-col justify-between h-36 transition-all duration-300 cursor-pointer border ${selectedCategory === "computers" ? "bg-zinc-900 border-lime-400/80 shadow-lg shadow-lime-400/5" : "bg-black/70 border-white/5 hover:border-purple-500/50 hover:bg-zinc-900/40"}`}
          >
            <div className="flex justify-between items-start w-full">
              <div className="p-2 bg-lime-950/30 border border-lime-500/20 text-lime-400 rounded-xl">
                <Monitor className="w-5 h-5" />
              </div>
              <span className="text-[10px] bg-white/5 px-2.5 py-1 rounded-full text-neutral-400 font-mono">20 جهاز احترافي</span>
            </div>
            <div>
              <h3 className="font-bold text-white text-base">أجهزة الحواسيب واللاب توب</h3>
              <p className="text-xs text-neutral-400">حواسيب مكتبية وشاشات منحنية لإنتاجية بلا حدود</p>
            </div>
          </button>

          <button 
            onClick={() => setSelectedCategory("household")}
            className={`p-5 rounded-2xl text-right flex flex-col justify-between h-36 transition-all duration-300 cursor-pointer border ${selectedCategory === "household" ? "bg-zinc-900 border-lime-400/80 shadow-lg shadow-lime-400/5" : "bg-black/70 border-white/5 hover:border-purple-500/50 hover:bg-zinc-900/40"}`}
          >
            <div className="flex justify-between items-start w-full">
              <div className="p-2 bg-amber-950/30 border border-amber-500/20 text-amber-400 rounded-xl">
                <Home className="w-5 h-5" />
              </div>
              <span className="text-[10px] bg-white/5 px-2.5 py-1 rounded-full text-neutral-400 font-mono">40 منتج ذكي</span>
            </div>
            <div>
              <h3 className="font-bold text-white text-base">الإلكترونيات المنزلية الذكية</h3>
              <p className="text-xs text-neutral-400">منظمات هواء ومطابخ وغسالات ذكية مريحة لبيتك</p>
            </div>
          </button>

        </section>

        {/* 4. Controls Filter & Sort Panel */}
        <section className="bg-black/90 border border-neutral-800 rounded-2xl p-4 lg:p-6 space-y-4" id="filters-panel">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            
            {/* Search inputs */}
            <div className="relative w-full md:w-96">
              <Search className="absolute right-3.5 top-3 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن الشاشات، الهواتف الذكية، الحواسيب..."
                className="w-full bg-zinc-950/80 border border-neutral-800 focus:border-lime-400 rounded-xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-neutral-500 outline-none transition-all duration-300"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute left-3 top-3 text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category selection */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${selectedCategory === "all" ? "bg-lime-400 text-black border-lime-400" : "bg-zinc-900 text-neutral-300 border-neutral-800 hover:border-neutral-700"}`}
              >
                جميع المنتجات ({products.length})
              </button>
              <button
                onClick={() => setSelectedCategory("household")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${selectedCategory === "household" ? "bg-lime-400 text-black border-lime-400" : "bg-zinc-900 text-neutral-300 border-neutral-800 hover:border-neutral-700"}`}
              >
                الأجهزة المنزلية (40)
              </button>
              <button
                onClick={() => setSelectedCategory("phones")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${selectedCategory === "phones" ? "bg-lime-400 text-black border-lime-400" : "bg-zinc-900 text-neutral-300 border-neutral-800 hover:border-neutral-700"}`}
              >
                الهواتف الذكية (20)
              </button>
              <button
                onClick={() => setSelectedCategory("computers")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${selectedCategory === "computers" ? "bg-lime-400 text-black border-lime-400" : "bg-zinc-900 text-neutral-300 border-neutral-800 hover:border-neutral-700"}`}
              >
                الحواسيب والألعاب (20)
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <SlidersHorizontal className="w-4 h-4 text-purple-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-zinc-900 border border-neutral-800 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer font-sans"
              >
                <option value="featured">الأكثر تميزاً</option>
                <option value="price-asc">السعر: من الأقل للأعلى</option>
                <option value="price-desc">السعر: من الأعلى للأقل</option>
                <option value="rating">تقييم العملاء</option>
              </select>
            </div>

          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-neutral-900">
            <span>تم العثور على <strong className="text-lime-400 font-bold font-mono">{filteredProducts.length}</strong> منتجاً يلبي معاييرك</span>
            {searchQuery && (
              <span className="text-xs">نتائج البحث عن: <strong className="text-white italic">"{searchQuery}"</strong></span>
            )}
          </div>
        </section>

        {/* 5. Elegant Products Grid (Exactly 80 total products partitioned) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" id="products-showcase-grid">
          {filteredProducts.map((product) => {
            const hasStock = product.stock > 0;
            return (
              <div 
                key={product.id}
                className="bg-black/90 border border-neutral-800 hover:border-purple-500/40 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between group shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1"
                id={`product-card-${product.id}`}
              >
                
                {/* Product Image and badges */}
                <div className="relative aspect-video w-full bg-zinc-950 overflow-hidden cursor-pointer" onClick={() => handleSelectProduct(product)}>
                  <LazyImage 
                    src={product.image} 
                    alt={product.name} 
                    className="group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none"></div>
                  
                  {/* Category label badge */}
                  <span className="absolute top-2 right-2 bg-black/80 backdrop-blur-md text-[10px] font-bold text-purple-300 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
                    {product.categoryAr}
                  </span>

                  {/* Rating badge */}
                  <span className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/90 backdrop-blur-md text-[11px] font-mono text-amber-400 px-2 py-0.5 rounded-md">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{product.rating}</span>
                  </span>

                  {product.featured && (
                    <span className="absolute top-2 left-2 bg-lime-400 text-black text-[9px] font-black tracking-wider px-2 py-0.5 rounded">
                      موصى به
                    </span>
                  )}

                  {product.originalPrice && product.discountPercent && (
                    <span className="absolute top-2 left-2 bg-rose-500 text-white text-[9px] font-black tracking-wider px-2 py-0.5 rounded shadow-lg">
                      خصم {product.discountPercent}%
                    </span>
                  )}
                </div>

                {/* Info and action */}
                <div className="p-4 space-y-2.5 flex-grow flex flex-col justify-between">
                  <div>
                    {/* Title */}
                    <h3 
                      className="font-bold text-sm text-white line-clamp-1 group-hover:text-lime-400 transition-colors cursor-pointer"
                      onClick={() => handleSelectProduct(product)}
                    >
                      {product.name}
                    </h3>

                    {/* Short Description */}
                    <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Specs previews */}
                  <div className="space-y-1 py-2 border-t border-b border-neutral-900 text-[10px] text-neutral-400">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-1 h-1 rounded-full bg-lime-400"></span>
                      <span>{product.specs[0]}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-1 h-1 rounded-full bg-purple-400"></span>
                      <span>{product.specs[1]}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Stock and Price details */}
                    <div className="flex items-center justify-between">
                      <div className="text-right">
                        <span className="text-[9px] text-neutral-500 block">السعر النقدي</span>
                        <div className="flex flex-col">
                          <span className="text-base font-black text-white font-mono">{product.price.toLocaleString()} <span className="text-xs text-lime-400 font-sans">ر.س</span></span>
                          {product.originalPrice && (
                            <span className="text-[10px] text-neutral-500 font-mono line-through -mt-1">{product.originalPrice.toLocaleString()} ر.س</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-left text-[11px]">
                        {hasStock ? (
                          <span className="text-green-400 font-medium bg-green-500/10 px-2 py-0.5 rounded">
                            متوفر {product.stock} قطعة
                          </span>
                        ) : (
                          <span className="text-rose-500 font-medium bg-rose-500/10 px-2 py-0.5 rounded">
                            نفذت الكمية
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSelectProduct(product)}
                        className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-neutral-800 hover:border-neutral-700 text-neutral-300 py-2 rounded-xl text-[11px] transition duration-300 font-semibold cursor-pointer"
                        title="تفاصيل المنتج"
                      >
                        تفاصيل
                      </button>
                      <button
                        onClick={() => addToCart(product)}
                        disabled={!hasStock}
                        className={`flex-[2] py-2 rounded-xl text-[11px] font-black transition duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${hasStock ? 'bg-lime-400 text-black hover:bg-lime-300' : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'}`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>إضافة للسلة</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </section>

        {filteredProducts.length === 0 && (
          <div className="glass-panel rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto" id="no-products-message">
            <ShieldAlert className="w-12 h-12 text-purple-400 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold">عذراً، لم نجد أي تطابق!</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              لم نتمكن من العثور على أجهزة تطابق كلمات البحث أو التصنيفات المحددة حالياً. حاول إعادة تعيين الفلاتر أو البحث بكلمات أبسط.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-5 py-2 rounded-xl font-bold transition duration-300"
            >
              عرض جميع الأجهزة الـ 80
            </button>
          </div>
        )}
          </>
        )}

      </main>

      {/* 6. Shopping Cart Sidebar Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-start animate-fade-in" id="cart-drawer-overlay">
          <div className="w-full max-w-md bg-black/95 border-l border-neutral-800 h-full p-6 flex flex-col justify-between shadow-2xl animate-fade-in">
            
            {/* Drawer Header */}
            <div>
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-5 h-5 text-lime-400" />
                  <h3 className="font-black text-lg text-white">سلة التسوق الذكية</h3>
                  <span className="bg-lime-400/20 text-lime-400 text-xs px-2.5 py-0.5 rounded-full font-bold">
                    {totalCartItems} أجهزة
                  </span>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 hover:bg-neutral-900 rounded-full text-neutral-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Secure Transaction Guarantee Banner */}
              <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl p-3 my-4 flex items-start gap-3">
                <Lock className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  تتم معالجة كافة الطلبات بشكل آمن وفوري عبر خادم <strong>Node.js</strong> محمي بتشفير SSL ومقاومة هجمات الاختراق وحقن البيانات.
                </p>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto custom-scrollbar my-2 space-y-4 pr-1">
              {cart.length === 0 ? (
                <div className="text-center py-20 text-neutral-500 space-y-3">
                  <ShoppingBag className="w-12 h-12 mx-auto stroke-[1.5] text-neutral-700" />
                  <p className="text-sm">السلة فارغة حالياً</p>
                  <p className="text-xs text-neutral-600">تصفح الأجهزة الـ 80 المتوفرة وقم بإضافتها هنا للطلب الآمن السريع.</p>
                </div>
              ) : (
                cart.map((item, index) => (
                  <div 
                    key={index}
                    className="p-3 bg-zinc-950 border border-neutral-900 rounded-xl flex items-center gap-3 transition hover:border-purple-500/20"
                    id={`cart-item-${item.product.id}-${index}`}
                  >
                    {/* Item Image */}
                    <img 
                      src={item.product.image} 
                      alt={item.product.name} 
                      className="w-14 h-14 object-cover rounded-lg bg-zinc-900"
                    />
                    
                    {/* Info */}
                    <div className="flex-grow min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{item.product.name}</h4>
                      <p className="text-[10px] text-neutral-400">{item.product.categoryAr}</p>
                      
                      {/* Selected Variants display */}
                      {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(item.selectedVariants).map(([key, val]) => (
                            <span key={key} className="text-[9px] bg-purple-950/40 text-purple-300 border border-purple-500/10 px-1.5 py-0.5 rounded">
                              {key}: {val}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-1.5">
                        {/* Price */}
                        <span className="text-xs font-bold text-lime-400 font-mono">
                          {(item.product.price * item.quantity).toLocaleString()} ر.س
                        </span>

                        {/* Adjust quantities */}
                        <div className="flex items-center gap-1.5 bg-neutral-900 rounded-lg p-0.5 border border-neutral-800">
                          <button 
                            onClick={() => updateQuantity(index, -1)}
                            className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold font-mono px-1.5 text-white">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(index, 1)}
                            className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => removeFromCart(index)}
                      className="p-2 text-neutral-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition"
                      title="حذف من السلة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer Checkout Actions */}
            <div className="border-t border-neutral-800 pt-4 space-y-4">
              <div className="space-y-1.5 text-xs text-neutral-400">
                <div className="flex justify-between">
                  <span>عدد الأجهزة:</span>
                  <span className="text-white font-bold">{totalCartItems} جهاز</span>
                </div>
                <div className="flex justify-between">
                  <span>أمان المعاملة:</span>
                  <span className="text-green-400 font-medium flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    تشفير كامل مفعّل
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-white pt-2 border-t border-neutral-900">
                  <span>الإجمالي الكلي:</span>
                  <span className="text-lime-400 font-mono text-lg">{totalCartPrice.toLocaleString()} ر.س</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-neutral-800 py-3 rounded-xl text-xs font-semibold cursor-pointer text-center text-neutral-300"
                >
                  مواصلة التسوق
                </button>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  disabled={cart.length === 0}
                  className={`flex-[2] py-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${cart.length > 0 ? 'bg-lime-400 text-black hover:bg-lime-300 shadow-lg shadow-lime-400/10' : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'}`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>إتمام الطلب بأمان</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 7. Detailed Product View Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" id="product-detail-modal">
          <div className="bg-black/95 border border-neutral-800 rounded-3xl max-w-2xl w-full p-6 relative overflow-hidden text-right">
            
            {/* Modal Ambient Glow Background */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 blur-3xl -z-10 rounded-full"></div>
            
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 left-4 p-2 bg-zinc-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              
              {/* Image side */}
              <div className="space-y-4">
                <div className="aspect-square bg-zinc-950 rounded-2xl overflow-hidden border border-neutral-800">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-xl p-3 flex items-center justify-between text-xs text-neutral-400">
                  <span>تقييم العملاء الموثق:</span>
                  <span className="flex items-center gap-1 text-amber-400 font-bold font-mono">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{selectedProduct.rating} / 5.0</span>
                  </span>
                </div>
              </div>

              {/* Info side */}
              <div className="flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full font-bold">
                    {selectedProduct.categoryAr}
                  </span>
                  
                  <h3 className="text-xl font-black text-white">{selectedProduct.name}</h3>
                  <p className="text-xs text-neutral-300 leading-relaxed">{selectedProduct.description}</p>
                  
                  {/* Detailed Specs List */}
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold text-lime-400">المواصفات التقنيّة والمميزات:</h4>
                    <ul className="text-[11px] text-neutral-400 space-y-1.5 pr-2">
                      {selectedProduct.specs.map((spec, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-lime-400 mt-0.5 flex-shrink-0" />
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Dynamic Interactive Variants Selector */}
                  {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                    <div className="space-y-3 pt-3 border-t border-neutral-900/60">
                      <h4 className="text-xs font-bold text-purple-400">خيارات الجهاز المتاحة:</h4>
                      <div className="space-y-2">
                        {selectedProduct.variants.map((v) => (
                          <div key={v.name} className="flex flex-col gap-1.5">
                            <span className="text-[10px] text-neutral-400 font-semibold">{v.name}:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {v.options.map((opt) => {
                                const isSelected = selectedVariants[v.name] === opt;
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setSelectedVariants(prev => ({ ...prev, [v.name]: opt }))}
                                    className={`px-3 py-1 text-[11px] font-medium rounded-lg border transition duration-200 cursor-pointer ${
                                      isSelected
                                        ? "bg-purple-600/25 text-purple-300 border-purple-500/70 shadow-sm shadow-purple-500/10"
                                        : "bg-zinc-900/90 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-neutral-200"
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
                </div>

                <div className="pt-4 border-t border-neutral-900 mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-neutral-500">القيمة الإجمالية</span>
                      <div className="flex items-baseline gap-2">
                        <div className="text-2xl font-black text-white font-mono">
                          {selectedProduct.price.toLocaleString()} <span className="text-xs text-lime-400 font-sans">ر.س</span>
                        </div>
                        {selectedProduct.originalPrice && (
                          <div className="text-sm text-neutral-500 font-mono line-through">
                            {selectedProduct.originalPrice.toLocaleString()} ر.س
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      {selectedProduct.stock > 0 ? (
                        <span className="text-xs text-green-400 bg-green-500/10 px-3 py-1 rounded-full font-semibold">
                          متوفر {selectedProduct.stock} قطعة في المستودع
                        </span>
                      ) : (
                        <span className="text-xs text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full font-semibold">
                          نفذت الكمية حالياً
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-neutral-300 py-3 rounded-xl text-xs font-semibold cursor-pointer border border-neutral-800"
                    >
                      عودة للمتجر
                    </button>
                    <button
                      onClick={() => {
                        addToCart(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      disabled={selectedProduct.stock === 0}
                      className="flex-[2] bg-lime-400 hover:bg-lime-300 disabled:bg-neutral-800 disabled:text-neutral-500 text-black py-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-lime-400/10"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>إضافة لسلة المشتريات</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* 8. Secure Checkout Form Modal with API Integration */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" id="checkout-modal">
          <div className="bg-black/95 border border-fuchsia-500/30 rounded-3xl max-w-lg w-full p-6 relative overflow-hidden text-right">
            
            {/* Modal ambient glow */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-fuchsia-500/10 blur-3xl -z-10 rounded-full"></div>

            {/* Close button */}
            {!checkoutResponse && (
              <button 
                onClick={() => setIsCheckoutOpen(false)}
                className="absolute top-4 left-4 p-2 bg-zinc-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* If Order has been processed successfully */}
            {checkoutResponse ? (
              <div className="space-y-6 py-4 text-center">
                <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                  <CheckCircle className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <span className="text-[10px] bg-green-500/10 text-green-400 px-3 py-1 rounded-full font-bold">
                    معاملة آمنة وموثقة بنجاح 100%
                  </span>
                  <h3 className="text-xl font-black text-white">تم قبول طلبك بنجاح!</h3>
                  <p className="text-xs text-neutral-300 max-w-sm mx-auto leading-relaxed">
                    شكراً لتسوقك من متجر <strong>TECHCORE</strong>. لقد تم معالجة معاملتك المشفرة واستلامها من قبل خوادم السحابة في غضون ثوانٍ معدودة.
                  </p>
                </div>

                {/* Secure Details Receipt */}
                <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 text-right space-y-2.5 max-w-sm mx-auto text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">رقم الطلب المرجعي:</span>
                    <span className="text-white font-bold">{checkoutResponse.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">رقم حركة المعاملة الماليّة:</span>
                    <span className="text-purple-400 font-bold text-[10px]">{checkoutResponse.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">إجمالي المبلغ المدفوع:</span>
                    <span className="text-lime-400 font-bold">{checkoutResponse.total.toLocaleString()} ر.س</span>
                  </div>
                  <div className="flex justify-between border-t border-neutral-800/80 pt-2.5">
                    <span className="text-neutral-400">سرعة استجابة الخادم الآمن:</span>
                    <span className="text-green-400 font-bold">{checkoutResponse.speedLatencyMs} ملي ثانية</span>
                  </div>
                </div>

                <div className="bg-zinc-950 border border-neutral-900 rounded-xl p-3 text-xs text-neutral-400 flex items-start gap-2 max-w-sm mx-auto text-right">
                  <Info className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{checkoutResponse.securityVerification}</span>
                </div>

                {checkoutResponse.invoiceSent ? (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-xs text-green-400 space-y-1 max-w-sm mx-auto text-right">
                    <div className="font-bold flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-lime-400" />
                      <span>تم إرسال الفاتورة تلقائياً!</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-normal">
                      تم توليد الفاتورة الضريبية المبسطة وإرسالها بنجاح لبريدك الإلكتروني المعتمد: <strong>{checkoutResponse.customerEmail}</strong>.
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-400 space-y-1.5 max-w-sm mx-auto text-right">
                    <div className="font-bold">⚠️ تنبيه الفاتورة التلقائية</div>
                    <p className="text-[10px] text-neutral-400 leading-normal">
                      لم تقم بتسجيل الدخول قبل الشراء، لذا لم نتمكن من إرسال الفاتورة الضريبية تلقائياً لبريدك.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        setCheckoutResponse(null);
                        setIsLoginOpen(true);
                      }}
                      className="text-[10px] text-lime-400 underline font-bold cursor-pointer"
                    >
                      سجل دخولك الآن لتفادي ذلك مستقبلاً
                    </button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs mx-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setCheckoutResponse(null);
                    }}
                    className="flex-1 bg-zinc-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    العودة للمتجر
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const reqOrder = checkoutResponse.order;
                      setIsCheckoutOpen(false);
                      setCheckoutResponse(null);
                      if (customerUser) {
                        setIsCustomerOrdersOpen(true);
                        if (reqOrder) {
                          setActiveCustomerOrder(reqOrder);
                        }
                      } else {
                        const mail = prompt("الرجاء إدخال البريد الإلكتروني الذي استخدمته للتو لتتبع الطلب وفاتورته:");
                        if (mail) {
                          const mockUser = { name: checkoutInfo.fullName || "عميل زائر", email: mail };
                          localStorage.setItem("techcore_customer", JSON.stringify(mockUser));
                          setCustomerUser(mockUser);
                          setIsCustomerOrdersOpen(true);
                          if (reqOrder) {
                            setActiveCustomerOrder(reqOrder);
                          }
                        }
                      }
                    }}
                    className="flex-1 bg-lime-400 hover:bg-lime-300 text-black py-2.5 rounded-xl text-xs font-black transition cursor-pointer text-center"
                  >
                    تتبع طلبك وفاتورتك
                  </button>
                </div>
              </div>
            ) : (
              /* Actual form */
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                
                {/* Header */}
                <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-lime-400 animate-pulse" />
                    <h3 className="text-base font-black text-white">بوابة التوصيل والدفع الآمن</h3>
                  </div>
                  <span className="text-[11px] text-neutral-400">معالجة Node.js</span>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed">
                  الرجاء تزويدنا بعنوان الشحن والتوصيل أدناه لتأكيد شحن جهازك فوراً. جميع المعاملات تمر ببروتوكولات تشفير SSL المتينة.
                </p>

                {/* Form Inputs */}
                <div className="space-y-3 text-right">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">الاسم الكامل للعميل *</label>
                    <input
                      type="text"
                      required
                      value={checkoutInfo.fullName}
                      onChange={(e) => setCheckoutInfo({...checkoutInfo, fullName: e.target.value})}
                      placeholder="محمد بن عبد الله"
                      className="w-full bg-zinc-950 border border-neutral-800 focus:border-lime-400 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">رقم الهاتف النشط *</label>
                      <input
                        type="tel"
                        required
                        value={checkoutInfo.phone}
                        onChange={(e) => setCheckoutInfo({...checkoutInfo, phone: e.target.value})}
                        placeholder="05xxxxxxxx"
                        className="w-full bg-zinc-950 border border-neutral-800 focus:border-lime-400 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition text-left"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">المدينة *</label>
                      <select
                        value={checkoutInfo.city}
                        onChange={(e) => setCheckoutInfo({...checkoutInfo, city: e.target.value})}
                        className="w-full bg-zinc-950 border border-neutral-800 focus:border-lime-400 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition cursor-pointer font-sans"
                      >
                        <option value="الرياض">الرياض</option>
                        <option value="جدة">جدة</option>
                        <option value="الدمام">الدمام</option>
                        <option value="مكة المكرمة">مكة المكرمة</option>
                        <option value="المدينة المنورة">المدينة المنورة</option>
                        <option value="أبها">أبها</option>
                        <option value="تبوك">تبوك</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">عنوان التوصيل بالتفصيل *</label>
                    <textarea
                      required
                      rows={2}
                      value={checkoutInfo.address}
                      onChange={(e) => setCheckoutInfo({...checkoutInfo, address: e.target.value})}
                      placeholder="حي الياسمين، شارع المروج، مبنى رقم 45"
                      className="w-full bg-zinc-950 border border-neutral-800 focus:border-lime-400 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition resize-none"
                    ></textarea>
                  </div>
                </div>

                {/* Checkout pricing details */}
                <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-3 space-y-1.5 text-xs text-neutral-400">
                  <div className="flex justify-between">
                    <span>عدد الأجهزة المستهدفة:</span>
                    <span className="text-white font-bold">{totalCartItems} أجهزة</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-white pt-2 border-t border-neutral-900">
                    <span>القيمة الإجمالية للدفع:</span>
                    <span className="text-lime-400 font-mono text-lg">{totalCartPrice.toLocaleString()} ر.س</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(false)}
                    className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-neutral-800 text-neutral-300 py-3 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isCheckingOut}
                    className="flex-[2] bg-lime-400 hover:bg-lime-300 disabled:bg-neutral-800 text-black py-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-lime-400/10"
                  >
                    {isCheckingOut ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                        <span>جاري معالجة طلبك بأمان...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>تأكيد الطلب الفوري المشفّر</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Trust badge */}
                <div className="text-center text-[10px] text-neutral-500 pt-1 flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-lime-400" />
                  <span>تشفير طبقة النقل الآمن مفعّل بنشاط. لا يتم مشاركة أو تخزين بياناتك الحساسة.</span>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

      {/* 9. Customer Login Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" id="customer-login-modal">
          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl max-w-sm w-full p-6 relative overflow-hidden text-right">
            <button 
              type="button"
              onClick={() => setIsLoginOpen(false)}
              className="absolute top-4 left-4 p-2 bg-zinc-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-full transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-purple-950/80 border border-purple-500/30 text-purple-400 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <User className="w-6 h-6 text-lime-400" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white">تسجيل الدخول الآمن</h3>
                <p className="text-xs text-neutral-400 mt-1">أدخل الاسم أو البريد الإلكتروني مع كلمة المرور لتفعيل نظام الفواتير وتتبع طرودك مباشرة.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 mb-1">الاسم أو البريد الإلكتروني</label>
                  <input
                    type="text"
                    required
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ name: "", email: e.target.value })}
                    placeholder="الاسم الكامل أو البريد الإلكتروني"
                    className="w-full bg-zinc-900 border border-neutral-800 focus:border-lime-400 rounded-xl px-3 py-2 text-xs text-white outline-none transition text-right"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 mb-1">كلمة المرور</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-900 border border-neutral-800 focus:border-lime-400 rounded-xl px-3 py-2 text-xs text-white outline-none transition text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const inputVal = loginForm.email.trim();
                  if (!inputVal) {
                    alert("الرجاء إدخال الاسم أو البريد الإلكتروني");
                    return;
                  }
                  
                  const currentOwnerEmail = (localStorage.getItem("techcore_owner_email") || "amine879mohamed@gmail.com").trim().toLowerCase();
                  const currentOwnerPassword = (localStorage.getItem("techcore_owner_password") || "admin123").trim();
                  
                  const isOwnerEmail = inputVal.toLowerCase() === currentOwnerEmail;
                  if (isOwnerEmail) {
                    if (loginPassword.trim() !== currentOwnerPassword && loginPassword.trim() !== "techcore2026") {
                      alert("خطأ: كلمة المرور الخاصة بحساب الإدارة غير صحيحة!");
                      return;
                    }
                  }

                  let emailVal = "";
                  let nameVal = "";

                  if (inputVal.includes("@")) {
                    emailVal = inputVal;
                    nameVal = inputVal.split("@")[0];
                  } else {
                    nameVal = inputVal;
                    const slug = encodeURIComponent(inputVal.replace(/\s+/g, "_"));
                    emailVal = `${slug}@customer.techcore`;
                  }

                  const userObj = { 
                    name: nameVal, 
                    email: emailVal,
                    isOwner: isOwnerEmail
                  };
                  localStorage.setItem("techcore_customer", JSON.stringify(userObj));
                  setCustomerUser(userObj);
                  setIsLoginOpen(false);
                  setLoginPassword("");
                  
                  if (isOwnerEmail) {
                    triggerToast(`مرحباً بك يا مدير النظام! تم تفعيل لوحة التحكم الخاصة بك.`);
                    setIsAdminMode(true);
                  } else {
                    triggerToast(`أهلاً بك ${nameVal}، تم تسجيل دخولك وتفعيل الفواتير!`);
                  }
                }}
                className="w-full bg-lime-400 hover:bg-lime-300 text-black py-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-lime-400/10"
              >
                <Lock className="w-4 h-4" />
                <span>تسجيل الدخول والتفعيل الفوري</span>
              </button>

              <div className="bg-zinc-900/40 p-2.5 rounded-xl border border-white/5 text-[9px] text-neutral-500 leading-relaxed text-center">
                * عند الشراء، سيقوم خادم المتجر بتوليد فاتورة PDF رسمية وإرسالها لبريدك فوراً بشكل تلقائي وآمن.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. Customer Orders Tracker & Simplified Tax Invoice Modal */}
      {isCustomerOrdersOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" id="customer-orders-modal">
          <div className="bg-zinc-950 border border-neutral-800/80 rounded-3xl max-w-5xl w-full h-[90vh] flex flex-col relative overflow-hidden text-right">
            
            {/* Header */}
            <div className="p-5 border-b border-neutral-900 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-lime-950/40 border border-lime-500/20 text-lime-400 rounded-xl">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">بوابة تتبع الطلبات والفواتير الإلكترونية</h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">تتبع حالة شحن طرودك وحمّل فواتيرك المعتمدة الصادرة من المتجر</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchOrders}
                  className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl transition cursor-pointer"
                  title="تحديث البيانات"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setIsCustomerOrdersOpen(false);
                    setActiveCustomerOrder(null);
                  }}
                  className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-full transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Split Content */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-neutral-900">
              
              {/* Left Side: Orders List */}
              <div className="w-full md:w-80 overflow-y-auto p-4 space-y-3 bg-neutral-950/40">
                <h4 className="text-xs font-bold text-neutral-400 pb-2 border-b border-neutral-900">قائمة طلباتي ({customerOrders.length})</h4>
                {customerOrders.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <ShoppingBag className="w-10 h-10 text-neutral-700 mx-auto" />
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      لم تقم بأي طلبات مسبقاً باستخدام بريدك الإلكتروني الحالي.<br/>
                      <span className="text-[10px] text-purple-400 font-bold">ابدأ بالتسوق الآن لتفعيل فواتيرك!</span>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customerOrders.map((o) => {
                      const isSelected = activeCustomerOrder?.id === o.id;
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
                          onClick={() => setActiveCustomerOrder(o)}
                          className={`w-full text-right p-3 rounded-2xl border transition duration-200 cursor-pointer flex flex-col gap-1.5 ${
                            isSelected
                              ? "bg-purple-950/30 border-purple-500/50 shadow-md shadow-purple-500/5"
                              : "bg-zinc-950 border-white/5 hover:bg-neutral-900/60 hover:border-neutral-800"
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="text-xs font-mono font-bold text-white">{o.id}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusBadge}`}>{statusText}</span>
                          </div>
                          
                          <div className="text-[10px] text-neutral-400 truncate w-full">
                            {o.cart.map((item: any) => `${item.product.name} (x${item.quantity})`).join("، ")}
                          </div>

                          <div className="flex justify-between items-center w-full pt-1.5 border-t border-neutral-900/80">
                            <span className="text-[9px] text-neutral-500">{new Date(o.date).toLocaleDateString('ar-EG')}</span>
                            <span className="text-xs font-black font-mono text-lime-400">{o.total.toLocaleString()} ر.س</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Side: Order Tracking & VAT Invoice Details */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-zinc-950">
                {activeCustomerOrder ? (
                  <div className="space-y-8">
                    
                    {/* 1. Shipment Tracking Panel */}
                    <div className="bg-black/40 border border-neutral-900 rounded-3xl p-5 space-y-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full"></div>
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-neutral-900 pb-3">
                        <div>
                          <span className="text-[9px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-full font-bold">شحن آمن ومضمون</span>
                          <h4 className="font-black text-sm text-white mt-1 flex items-center gap-2">
                            <Truck className="w-4 h-4 text-lime-400" />
                            حالة شحن وتوصيل الطرد
                          </h4>
                        </div>
                        <div className="text-left font-mono">
                          <div className="text-[10px] text-neutral-400">رقم التتبع ({activeCustomerOrder.shippingProvider || "Aramex"}):</div>
                          <div className="text-xs font-bold text-lime-400">{activeCustomerOrder.trackingNumber || "تحت التجهيز"}</div>
                        </div>
                      </div>

                      {/* Timeline Stepper */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                        {activeCustomerOrder.trackingEvents?.map((ev: any, idx: number) => (
                          <div key={idx} className="space-y-1.5 relative text-right">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-black z-10 ${
                                ev.done 
                                  ? "bg-lime-400 border-lime-400 text-black shadow-md shadow-lime-400/25" 
                                  : "bg-zinc-900 border-neutral-800 text-neutral-500"
                              }`}>
                                {ev.done ? "✓" : idx + 1}
                              </div>
                              <span className={`text-[11px] font-bold ${ev.done ? "text-white" : "text-neutral-500"}`}>{ev.title}</span>
                            </div>
                            <div className="pr-8">
                              <span className="text-[9px] text-neutral-400 font-mono block">{ev.location} - {ev.timestamp}</span>
                              <p className="text-[9px] text-neutral-500 leading-relaxed mt-0.5">{ev.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 2. Simplified VAT Invoice Template (الفاتورة الضريبية) */}
                    <div className="bg-white text-neutral-900 rounded-3xl p-6 space-y-6 shadow-xl relative overflow-hidden" id="print-invoice-modal">
                      
                      {/* Invoice Watermark Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-neutral-200">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <Sparkles className="w-5 h-5 text-purple-700" />
                            <span className="text-lg font-black tracking-tight font-mono text-neutral-900">TECH<span className="text-purple-600">CORE</span></span>
                          </div>
                          <p className="text-[10px] text-neutral-500 font-bold">بوابة الأجهزة الإلكترونية والحلول الذكية الفاخرة</p>
                          <p className="text-[9px] text-neutral-400 mt-0.5">الرقم الضريبي الموحد: 310293847200003</p>
                        </div>

                        <div className="text-right sm:text-left">
                          <h4 className="text-sm font-black text-purple-700 uppercase tracking-wider">فاتورة ضريبية مبسطة</h4>
                          <p className="text-[9px] text-neutral-500 font-mono">SIMPLIFIED TAX INVOICE</p>
                          <div className="text-[10px] text-neutral-500 mt-2 font-mono">
                            <div>رقم الفاتورة: <strong className="text-neutral-900">{activeCustomerOrder.id}</strong></div>
                            <div>التاريخ: {new Date(activeCustomerOrder.date).toLocaleDateString('ar-EG')}</div>
                          </div>
                        </div>
                      </div>

                      {/* Customer Details info block */}
                      <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-3 rounded-2xl text-[10px] text-neutral-600 border border-neutral-100">
                        <div>
                          <div className="font-bold text-neutral-800">بيانات التاجر (Merchant):</div>
                          <div>الاسم: شركة تيك كور المحدودة للتقنية</div>
                          <div>العنوان: الرياض، المملكة العربية السعودية</div>
                          <div>الهاتف: 920002938 (موثق)</div>
                        </div>
                        <div>
                          <div className="font-bold text-neutral-800">بيانات العميل (Customer):</div>
                          <div>الاسم: {activeCustomerOrder.customerName}</div>
                          <div>المدينة: {activeCustomerOrder.customerCity}</div>
                          <div>الهاتف: {activeCustomerOrder.customerPhone}</div>
                          {activeCustomerOrder.customerEmail && (
                            <div className="font-mono">البريد: {activeCustomerOrder.customerEmail}</div>
                          )}
                        </div>
                      </div>

                      {/* Items table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-[10px] border-collapse">
                          <thead>
                            <tr className="border-b border-neutral-200 text-neutral-500 font-bold">
                              <th className="pb-2">المنتج / الجهاز</th>
                              <th className="pb-2 text-center">الكمية</th>
                              <th className="pb-2 text-left">سعر الوحدة</th>
                              <th className="pb-2 text-left">الإجمالي (شامل الضريبة 15%)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100">
                            {activeCustomerOrder.cart.map((item: any, i: number) => {
                              const opts = item.selectedVariants 
                                ? Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(" | ")
                                : null;
                              return (
                                <tr key={i} className="text-neutral-800">
                                  <td className="py-3 font-semibold">
                                    <div>{item.product.name}</div>
                                    {opts && <span className="text-[9px] text-purple-600 font-medium block mt-0.5">{opts}</span>}
                                  </td>
                                  <td className="py-3 text-center font-mono">{item.quantity}</td>
                                  <td className="py-3 text-left font-mono">{item.product.price.toLocaleString()} ر.س</td>
                                  <td className="py-3 text-left font-mono font-bold">{(item.product.price * item.quantity).toLocaleString()} ر.س</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Calculations & QR Section */}
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-4 border-t border-neutral-200">
                        
                        {/* ZATCA QR Code Simulation */}
                        <div className="flex items-center gap-3 bg-neutral-50 p-2.5 rounded-2xl border border-neutral-100 max-w-xs">
                          {/* QR Mock graphic with CSS */}
                          <div className="w-16 h-16 bg-neutral-900 rounded-lg p-1.5 flex flex-col justify-between relative flex-shrink-0">
                            <div className="flex justify-between">
                              <div className="w-3.5 h-3.5 bg-white rounded-sm"></div>
                              <div className="w-3.5 h-3.5 bg-white rounded-sm"></div>
                            </div>
                            {/* QR bits mockup pattern */}
                            <div className="absolute inset-4 grid grid-cols-4 gap-0.5 p-0.5">
                              {Array.from({ length: 16 }).map((_, i) => (
                                <div key={i} className={`rounded-sm ${i % 3 === 0 || i % 5 === 1 ? 'bg-white' : 'bg-transparent'}`}></div>
                              ))}
                            </div>
                            <div className="flex justify-between">
                              <div className="w-3.5 h-3.5 bg-white rounded-sm"></div>
                              <div className="w-1.5 h-1.5 bg-white rounded-sm self-end"></div>
                            </div>
                          </div>
                          <div className="text-[8px] text-neutral-500 leading-normal">
                            <div className="font-bold text-neutral-800 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              فاتورة إلكترونية معتمدة
                            </div>
                            <div>تخضع لاشتراطات هيئة الزكاة والضريبة والجمارك (ZATCA). المعاملة مشفرة بالكامل.</div>
                          </div>
                        </div>

                        {/* Calculations Box */}
                        <div className="w-full sm:w-60 text-[10px] space-y-1.5 text-neutral-600 font-mono">
                          <div className="flex justify-between">
                            <span>المجموع الفرعي (غير شامل الضريبة):</span>
                            <span>{Math.round(activeCustomerOrder.total / 1.15).toLocaleString()} ر.س</span>
                          </div>
                          <div className="flex justify-between">
                            <span>ضريبة القيمة المضافة (15%):</span>
                            <span>{Math.round(activeCustomerOrder.total - (activeCustomerOrder.total / 1.15)).toLocaleString()} ر.س</span>
                          </div>
                          <div className="flex justify-between">
                            <span>رسوم التوصيل والشحن:</span>
                            <span className="text-emerald-600 font-bold">مجاني (0 ر.س)</span>
                          </div>
                          <div className="flex justify-between text-xs font-black text-neutral-900 pt-2 border-t border-neutral-100">
                            <span>المجموع الكلي (شامل الضريبة):</span>
                            <span className="text-purple-700 text-sm">{activeCustomerOrder.total.toLocaleString()} ر.س</span>
                          </div>
                        </div>

                      </div>

                      {/* Footer Badge */}
                      <div className="text-center text-[8px] text-neutral-400 border-t border-neutral-100 pt-3">
                        شكراً لشرائك من متجرنا. إن كنت بحاجة لأي مساعدة، يرجى التواصل معنا عبر الرقم الموحد أو البريد الإلكتروني.
                      </div>

                    </div>

                    {/* Invoice PDF Actions */}
                    <div className="flex flex-wrap justify-end gap-3 pb-4">
                      {activeCustomerOrder.invoiceSent ? (
                        <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-xl">
                          <Mail className="w-4 h-4 text-lime-400" />
                          <span>تم إرسال نسخة من الفاتورة إلى بريدك الإلكتروني بنجاح!</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const emailInput = prompt("الرجاء إدخال بريدك الإلكتروني لإرسال الفاتورة تلقائياً:");
                              if (!emailInput) return;
                              if (!emailInput.includes("@")) {
                                alert("الرجاء إدخال بريد إلكتروني صحيح");
                                return;
                              }
                              const res = await fetch(`${API_BASE_URL}/api/orders/${activeCustomerOrder.id}/invoice-mail`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ email: emailInput })
                              });
                              if (res.ok) {
                                triggerToast("تم إرسال الفاتورة الضريبية إلى بريدك بنجاح!");
                                fetchOrders();
                              }
                            } catch (err) {
                              console.error("Error sending mail:", err);
                            }
                          }}
                          className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-bold text-neutral-300 rounded-xl cursor-pointer flex items-center gap-1.5"
                        >
                          <Mail className="w-4 h-4 text-purple-400" />
                          <span>إرسال الفاتورة للبريد الإلكتروني</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-5 py-2.5 bg-lime-400 hover:bg-lime-300 text-black text-xs font-black rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-lime-400/10"
                      >
                        <Printer className="w-4 h-4" />
                        <span>تحميل الفاتورة PDF وطباعتها</span>
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-24">
                    <div className="p-4 bg-zinc-900/50 border border-neutral-800 rounded-full text-neutral-600 animate-pulse">
                      <FileText className="w-12 h-12" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">تفاصيل الطلب والفواتير</h4>
                      <p className="text-xs text-neutral-400 mt-1 max-w-sm">الرجاء اختيار أحد طلباتك من القائمة الجانبية لمعاينة تفاصيله، تتبع طردك مباشرة، أو طباعة الفاتورة الإلكترونية المعتمدة.</p>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-20 border-t border-neutral-900 pt-8 pb-4 relative z-10 text-neutral-500 text-center text-[11px] space-y-3">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white font-black tracking-tight">TECH<span className="text-lime-400">CORE</span></span>
            <span>- جميع الحقوق محفوظة لعام 2026</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-neutral-400">
            <span>تشفير SSL 256-bit</span>
            <span className="text-neutral-800">|</span>
            <span>خادم Node.js v20.x السريع</span>
            <span className="text-neutral-800">|</span>
            <span>طاقة استيعابية لأكثر من 5000+ زائر متزامن</span>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      {showScrollToTop && (
        <button
          id="scroll-to-top-btn"
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white p-3.5 rounded-full shadow-lg shadow-purple-600/30 transition-all duration-300 hover:scale-110 flex items-center justify-center border border-purple-500/30 group cursor-pointer"
          title="العودة للأعلى"
        >
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform duration-300" />
        </button>
      )}
    </div>
  );
}
