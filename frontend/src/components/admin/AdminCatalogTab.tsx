import React from "react";
import {
  Package,
  Layers,
  Coins,
  AlertTriangle,
  Search,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Product } from "../../data/products";

interface AdminCatalogTabProps {
  products: Product[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage: number;
  onOpenEditForm: (product: Product) => void;
  onDeleteClick: (productId: string) => void;
  confirmDeleteId: string | null;
  setConfirmDeleteId: (val: string | null) => void;
  onConfirmDelete: () => void;
  resetForm: () => void;
}

export function AdminCatalogTab({
  products,
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  onOpenEditForm,
  onDeleteClick,
  confirmDeleteId,
  setConfirmDeleteId,
  onConfirmDelete,
  resetForm,
}: AdminCatalogTabProps) {
  // Calculations
  const totalProducts = products.length;
  const lowStockItems = products.filter((p) => p.stock <= 5);
  const totalCategories = Array.from(new Set(products.map((p) => p.category))).length;
  const averagePrice =
    products.length > 0
      ? Math.round(products.reduce((acc, p) => acc + p.price, 0) / products.length)
      : 0;

  // Filter products for listing
  const filteredList = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Paginated products
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  return (
    <div className="space-y-6 text-right">
      {/* KPI Widgets Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="admin-kpis">
        <div className="bg-black/40 border border-neutral-800/80 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-3 bg-purple-950/40 border border-purple-500/20 text-purple-400 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 font-bold">إجمالي المنتجات</div>
            <div className="text-xl font-black font-mono text-white">{totalProducts}</div>
          </div>
        </div>

        <div className="bg-black/40 border border-neutral-800/80 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-3 bg-lime-950/40 border border-lime-500/20 text-lime-400 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 font-bold">الأقسام الرئيسية</div>
            <div className="text-xl font-black font-mono text-white">{totalCategories}</div>
          </div>
        </div>

        <div className="bg-black/40 border border-neutral-800/80 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-3 bg-amber-950/40 border border-amber-500/20 text-amber-400 rounded-xl">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 font-bold">متوسط سعر المنتج</div>
            <div className="text-xl font-black font-mono text-lime-400">
              {averagePrice.toLocaleString()} ر.س
            </div>
          </div>
        </div>

        <div
          className={`border rounded-2xl p-4 flex items-center gap-3 transition-colors ${
            lowStockItems.length > 0
              ? "bg-red-950/20 border-red-500/20"
              : "bg-black/40 border-neutral-800/80"
          }`}
        >
          <div
            className={`p-3 rounded-xl ${
              lowStockItems.length > 0
                ? "bg-red-900/30 text-red-400 border border-red-500/30"
                : "bg-zinc-900 text-neutral-400"
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 font-bold">مخزون حرج (نفاد)</div>
            <div
              className={`text-xl font-black font-mono ${
                lowStockItems.length > 0 ? "text-red-400 animate-pulse" : "text-neutral-400"
              }`}
            >
              {lowStockItems.length} منتجات
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-black/60 border border-neutral-800/80 p-3 rounded-2xl">
        <div className="relative w-full md:w-80">
          <Search className="absolute right-3.5 top-3 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="البحث بالاسم، الوصف أو الرقم التعريفي..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-zinc-950 border border-neutral-800 focus:border-lime-400 rounded-xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-neutral-500 outline-none transition-all"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto scrollbar-none pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => {
              setCategoryFilter("all");
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer border ${
              categoryFilter === "all"
                ? "bg-white text-black border-white"
                : "bg-zinc-900 text-neutral-400 border-neutral-800 hover:border-neutral-700"
            }`}
          >
            الكل ({products.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setCategoryFilter("computers");
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer border ${
              categoryFilter === "computers"
                ? "bg-white text-black border-white"
                : "bg-zinc-900 text-neutral-400 border-neutral-800 hover:border-neutral-700"
            }`}
          >
            الحواسيب والألعاب
          </button>
          <button
            type="button"
            onClick={() => {
              setCategoryFilter("phones");
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer border ${
              categoryFilter === "phones"
                ? "bg-white text-black border-white"
                : "bg-zinc-900 text-neutral-400 border-neutral-800 hover:border-neutral-700"
            }`}
          >
            الهواتف الذكية
          </button>
          <button
            type="button"
            onClick={() => {
              setCategoryFilter("household");
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer border ${
              categoryFilter === "household"
                ? "bg-white text-black border-white"
                : "bg-zinc-900 text-neutral-400 border-neutral-800 hover:border-neutral-700"
            }`}
          >
            الأجهزة المنزلية
          </button>
        </div>
      </div>

      {/* Confirm Delete Banner */}
      {confirmDeleteId && (
        <div className="bg-red-950/30 border-2 border-red-500/40 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div>
              <h4 className="text-sm font-bold text-white">هل أنت متأكد تماماً من رغبتك في حذف هذا المنتج نهائياً؟</h4>
              <p className="text-xs text-neutral-400">لا يمكن التراجع عن هذه الخطوة وسيتم إزالة المنتج وتفاصيله من المتجر بشكل فوري.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmDeleteId(null)}
              className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-neutral-800 rounded-lg text-xs font-bold text-neutral-300 transition cursor-pointer"
            >
              إلغاء التراجع
            </button>
            <button
              type="button"
              onClick={onConfirmDelete}
              className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition cursor-pointer"
            >
              تأكيد الحذف النهائي
            </button>
          </div>
        </div>
      )}

      {/* Products List Table / Cards */}
      {filteredList.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-neutral-800 rounded-3xl space-y-3">
          <Package className="w-12 h-12 text-neutral-600 mx-auto" />
          <p className="text-sm text-neutral-400 font-bold">لم يتم العثور على أي منتج يطابق معايير البحث.</p>
          <button type="button" onClick={resetForm} className="text-xs text-lime-400 hover:underline">
            تصفير الفلاتر
          </button>
        </div>
      ) : (
        <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-black/30">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-zinc-950/80 text-neutral-400 text-xs font-bold border-b border-neutral-800">
                  <th className="p-4">المنتج والتعريف</th>
                  <th className="p-4">القسم</th>
                  <th className="p-4">السعر</th>
                  <th className="p-4">المخزون</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4 text-center">العمليات والإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-xs">
                {currentItems.map((product) => (
                  <tr key={product.id} className="hover:bg-neutral-900/40 transition">
                    {/* Title and Image */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-xl bg-zinc-900 border border-neutral-800 flex-shrink-0"
                        />
                        <div className="min-w-0 max-w-xs lg:max-w-md">
                          <div className="font-bold text-white truncate" title={product.name}>
                            {product.name}
                          </div>
                          <div className="text-[10px] text-neutral-500 font-mono mt-0.5">ID: {product.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <span className="px-2 py-1 bg-zinc-900 border border-neutral-800 rounded-md text-neutral-300">
                        {product.categoryAr}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="p-4">
                      <span className="font-bold font-mono text-lime-400 text-sm">
                        {product.price.toLocaleString()} ر.س
                      </span>
                    </td>

                    {/* Stock */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold text-sm ${product.stock <= 5 ? "text-red-400" : "text-white"}`}>
                          {product.stock}
                        </span>
                        {product.stock <= 5 && (
                          <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] px-1.5 py-0.5 rounded animate-pulse">
                            مخزون حرج!
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Tags */}
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {product.featured && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-purple-400 bg-purple-950/40 border border-purple-500/20 px-2 py-0.5 rounded w-max">
                            مميز نجمة
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded w-max">
                          نشط بالمعرض
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenEditForm(product)}
                          className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-neutral-800 hover:border-lime-400 hover:text-lime-400 rounded-lg text-neutral-300 transition cursor-pointer"
                          title="تعديل تفاصيل المنتج"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteClick(product.id)}
                          className="p-2 bg-zinc-900 hover:bg-red-950/40 border border-neutral-800 hover:border-red-500 hover:text-red-400 rounded-lg text-neutral-300 transition cursor-pointer"
                          title="حذف المنتج من المتجر"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="p-4 bg-zinc-950/40 border-t border-neutral-900 flex justify-between items-center text-xs text-neutral-400">
              <div>
                عرض <span className="font-bold text-white">{indexOfFirstItem + 1}</span> إلى{" "}
                <span className="font-bold text-white">
                  {Math.min(indexOfLastItem, filteredList.length)}
                </span>{" "}
                من أصل <span className="font-bold text-white">{filteredList.length}</span> منتج
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 bg-neutral-900 border border-neutral-800 rounded hover:border-neutral-700 disabled:opacity-40 disabled:hover:border-neutral-800 transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="font-bold font-mono text-white">
                  صفحة {currentPage} من {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 bg-neutral-900 border border-neutral-800 rounded hover:border-neutral-700 disabled:opacity-40 disabled:hover:border-neutral-800 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
