import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch
} from "firebase/firestore";
import { db } from "./firebase";
import { Product, HeroSettings, defaultHeroSettings, INITIAL_PRODUCTS } from "../data/products";

const PRODUCTS_COLLECTION = "products";
const SETTINGS_COLLECTION = "settings";
const ORDERS_COLLECTION = "orders";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

// 1. Subscribe to Real-time Products
export function subscribeToProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, PRODUCTS_COLLECTION);

  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty) {
        // Fetch from backend API
        try {
          const res = await fetch(`${API_BASE_URL}/api/products?limit=200`);
          if (res.ok) {
            const data = await res.json();
            if (data.products && data.products.length > 0) {
              onUpdate(data.products);
              return;
            }
          }
        } catch (e) {
          console.warn("Backend products fetch notice:", e);
        }
        onUpdate(INITIAL_PRODUCTS);
      } else {
        const prods: Product[] = [];
        snapshot.forEach((d) => {
          prods.push(d.data() as Product);
        });
        onUpdate(prods);
      }
    },
    async (error) => {
      console.warn("Firestore products live snapshot note (using API gateway):", error);
      try {
        const res = await fetch(`${API_BASE_URL}/api/products?limit=200`);
        if (res.ok) {
          const data = await res.json();
          if (data.products) onUpdate(data.products);
        }
      } catch (apiErr) {
        onUpdate(INITIAL_PRODUCTS);
      }
      if (onError) onError(error);
    }
  );
}

// 2. Add or Update Product via Secure Backend API & Firestore
export async function saveProductToFirestore(product: Product): Promise<void> {
  // First, proxy through secure Backend API
  try {
    await fetch(`${API_BASE_URL}/api/admin/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product)
    });
  } catch (err) {
    console.warn("Backend proxy save note, proceeding with direct sync:", err);
  }

  // Also sync with Firestore
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
    await setDoc(docRef, product, { merge: true });
  } catch (fsErr) {
    console.error("Firestore direct write error:", fsErr);
  }
}

// 3. Delete Product via Secure Backend API & Firestore
export async function deleteProductFromFirestore(productId: string): Promise<void> {
  // First, proxy through secure Backend API
  try {
    await fetch(`${API_BASE_URL}/api/admin/products/${productId}`, {
      method: "DELETE"
    });
  } catch (err) {
    console.warn("Backend proxy delete note:", err);
  }

  // Also sync with Firestore
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(docRef);
  } catch (fsErr) {
    console.error("Firestore direct delete error:", fsErr);
  }
}

// 4. Subscribe to Real-time Hero Banner Settings
export function subscribeToHeroSettings(
  onUpdate: (settings: HeroSettings) => void,
  onError?: (err: any) => void
) {
  const docRef = doc(db, SETTINGS_COLLECTION, "hero");

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as HeroSettings);
      } else {
        onUpdate(defaultHeroSettings);
      }
    },
    async (error) => {
      console.warn("Firestore hero snapshot note, fetching from backend:", error);
      try {
        const res = await fetch(`${API_BASE_URL}/api/hero-settings`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.title) onUpdate(data);
        }
      } catch (e) {
        onUpdate(defaultHeroSettings);
      }
      if (onError) onError(error);
    }
  );
}

// 5. Save Hero Settings via Secure Backend API & Firestore
export async function saveHeroSettingsToFirestore(settings: HeroSettings): Promise<void> {
  // Proxy to Backend API
  try {
    await fetch(`${API_BASE_URL}/api/hero-settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings)
    });
  } catch (err) {
    console.warn("Backend proxy hero save note:", err);
  }

  // Sync to Firestore
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, "hero");
    await setDoc(docRef, settings, { merge: true });
  } catch (e) {
    console.error("Firestore direct hero save error:", e);
  }
}

// 6. Subscribe to Real-time Orders
export function subscribeToOrders(
  onUpdate: (orders: any[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, ORDERS_COLLECTION);
  const q = query(colRef, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const ordersList: any[] = [];
      snapshot.forEach((d) => {
        ordersList.push({ id: d.id, ...d.data() });
      });
      onUpdate(ordersList);
    },
    async (error) => {
      console.warn("Firestore orders snapshot note, fetching from backend API:", error);
      try {
        const res = await fetch(`${API_BASE_URL}/api/orders`);
        if (res.ok) {
          const ordersList = await res.json();
          onUpdate(ordersList);
        }
      } catch (e) {
        console.warn("Orders fetch fallback failed:", e);
      }
      if (onError) onError(error);
    }
  );
}

// 7. Save New Order via Secure Backend API & Firestore
export async function saveOrderToFirestore(orderData: any): Promise<{ orderId: string; trackingId: string }> {
  const orderId = orderData.id || `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const payload = {
    ...orderData,
    id: orderId,
    orderNumber: orderData.orderNumber || orderId,
    createdAt: orderData.createdAt || new Date().toISOString(),
    status: orderData.status || "قيد المراجعة"
  };

  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await setDoc(docRef, payload);
  } catch (e) {
    console.warn("Direct Firestore order write note:", e);
  }

  return { orderId, trackingId: payload.orderNumber };
}
