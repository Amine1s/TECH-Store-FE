export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  category: "household" | "phones" | "computers";
  categoryAr: string;
  image: string;
  specs: string[];
  stock: number;
  featured?: boolean;
  originalPrice?: number;
  discountPercent?: number;
  variants?: { name: string; options: string[] }[];
}

export interface HeroSettings {
  badge: string;
  title: string;
  titleHighlight: string;
  description: string;
  buttonText: string;
  stockNotice: string;
  productId: string;
  customImageUrl?: string;
  customPrice?: number;
  customBadgeSubtext?: string;
}

export const defaultHeroSettings: HeroSettings = {
  badge: "عرض الأسبوع الحصري",
  title: "جيل جديد من الحواسيب الخارقة",
  titleHighlight: "Pro-X الجيل العاشر",
  description:
    "تغلب على الحدود الرقمية مع معالجات ثنائية النواة ونظام تبريد مائي مغلق. صمم خصيصاً للمبرمجين واللاعبين المحترفين الذين يطلبون الفخامة والسرعة الفائقة مع تشفير حماية متقدم.",
  buttonText: "اكتشف المواصفات",
  stockNotice: "متوفر 12 قطعة فقط بالمستودع",
  productId: "c-3",
  customImageUrl:
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
  customBadgeSubtext: "الإصدار المطور",
  customPrice: 8499,
};

// All default products removed - products are loaded dynamically from Firestore database
export const getProducts = (): Product[] => {
  return [];
};

export const INITIAL_PRODUCTS: Product[] = [];
