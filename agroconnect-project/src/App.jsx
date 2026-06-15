import React, { useState, useMemo, useEffect } from "react";
import {
  Leaf,
  ShoppingCart,
  Store,
  Plus,
  Trash2,
  Tag,
  LogOut,
  Search,
  Package,
  Percent,
  X,
  Check,
} from "lucide-react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
} from "firebase/firestore";
import { auth, googleProvider, db } from "./firebase.js";

// ---------------------------------------------------------------------------
// Logo
// ---------------------------------------------------------------------------
function Logo({ size = 40 }) {
  return (
    <div
      className="flex items-center justify-center rounded-2xl shrink-0"
      style={{
        width: size,
        height: size,
        background: "#2F6B3C",
      }}
    >
      <svg
        width={size * 0.62}
        height={size * 0.62}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M14 36 L23 8 L26 8 L19 36 Z" fill="#F4E6C1" />
        <path
          d="M19 24 H23"
          stroke="#F4E6C1"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M40 16
             C40 12 36 9 32 9
             C26 9 22 14 22 22
             C22 30 26 35 32 35
             C36 35 40 32 40 28"
          stroke="#9FD893"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M33 9 C36 6 40 7 40 11 C36 11 33 12 33 9 Z"
          fill="#9FD893"
        />
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Kategori produk
// ---------------------------------------------------------------------------
const categories = [
  "Sayuran",
  "Buah-buahan",
  "Beras & Biji-bijian",
  "Peternakan",
  "Pupuk & Sarana",
  "Lainnya",
];

function formatRupiah(value) {
  return "Rp " + Math.round(value).toLocaleString("id-ID");
}

function discountedPrice(price, discount) {
  if (!discount) return price;
  return price - (price * discount) / 100;
}

// ---------------------------------------------------------------------------
// Auth / Onboarding screens
// ---------------------------------------------------------------------------
function GoogleButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-3 border border-stone-300 rounded-xl py-3 font-medium text-stone-700 hover:bg-stone-50 transition-colors bg-white"
    >
      <svg width="20" height="20" viewBox="0 0 48 48">
        <path
          fill="#FFC107"
          d="M43.6 20.5H42V20.5H24V27.5H35.3C33.7 31.9 29.5 35 24.5 35C18.1 35 13 29.9 13 23.5C13 17.1 18.1 12 24.5 12C27.5 12 30.2 13.1 32.3 14.9L37.6 9.6C34.2 6.5 29.6 4.5 24.5 4.5C13.7 4.5 5 13.2 5 24C5 34.8 13.7 43.5 24.5 43.5C34.7 43.5 44 35.8 44 24C44 22.8 43.9 21.6 43.6 20.5Z"
        />
        <path
          fill="#FF3D00"
          d="M6.3 14.7L12.7 19.4C14.4 15.1 18.6 12 24.5 12C27.5 12 30.2 13.1 32.3 14.9L37.6 9.6C34.2 6.5 29.6 4.5 24.5 4.5C16.6 4.5 9.8 9 6.3 14.7Z"
        />
        <path
          fill="#4CAF50"
          d="M24.5 43.5C29.5 43.5 33.6 41.5 36.4 38.5L30.6 33.6C28.9 34.8 26.8 35.5 24.5 35.5C19.5 35.5 15.3 32.4 13.7 28L7.2 32.9C10.7 38.7 17.1 43.5 24.5 43.5Z"
        />
        <path
          fill="#1976D2"
          d="M43.6 20.5H42V20.5H24V27.5H35.3C34.5 29.6 33.1 31.4 31.3 32.7L31.3 32.7L37.1 37.6C40.8 34.2 43.5 29.4 43.5 24C43.5 22.8 43.9 21.6 43.6 20.5Z"
        />
      </svg>
      {label}
    </button>
  );
}

function AuthScreen({ pendingUser, onChooseRole, authError }) {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4E6C1] px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-stone-200 p-8">
        <div className="flex flex-col items-center mb-8">
          <Logo size={56} />
          <h1 className="mt-4 text-2xl font-semibold text-stone-800">
            AgroConnect
          </h1>
          <p className="mt-1 text-sm text-stone-500 text-center">
            Pasar digital untuk petani dan pembeli hasil pertanian
          </p>
        </div>

        {!pendingUser && (
          <div className="space-y-4">
            <GoogleButton
              onClick={handleGoogleLogin}
              label={loading ? "Memproses..." : "Masuk dengan Google"}
            />
            {authError && (
              <p className="text-xs text-center text-red-500">{authError}</p>
            )}
            <p className="text-xs text-center text-stone-400">
              Dengan masuk, Anda menyetujui Ketentuan Layanan dan Kebijakan
              Privasi AgroConnect.
            </p>
          </div>
        )}

        {pendingUser && (
          <div className="space-y-4">
            <p className="text-sm text-stone-600 text-center mb-2">
              Pilih jenis akun Anda untuk melanjutkan
            </p>
            <button
              onClick={() => onChooseRole("buyer")}
              className="w-full flex items-center gap-4 border border-stone-200 rounded-2xl p-4 text-left hover:border-[#2F6B3C] hover:bg-[#F4E6C1]/40 transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-[#F4E6C1] flex items-center justify-center">
                <ShoppingCart size={22} className="text-[#2F6B3C]" />
              </div>
              <div>
                <p className="font-medium text-stone-800">Akun Pembeli</p>
                <p className="text-xs text-stone-500">
                  Jelajahi dan beli produk pertanian
                </p>
              </div>
            </button>
            <button
              onClick={() => onChooseRole("seller")}
              className="w-full flex items-center gap-4 border border-stone-200 rounded-2xl p-4 text-left hover:border-[#2F6B3C] hover:bg-[#F4E6C1]/40 transition-colors"
            >
              <div className="w-11 h-11 rounded-xl bg-[#F4E6C1] flex items-center justify-center">
                <Store size={22} className="text-[#2F6B3C]" />
              </div>
              <div>
                <p className="font-medium text-stone-800">Akun Penjual</p>
                <p className="text-xs text-stone-500">
                  Jual hasil pertanian dan kelola produk
                </p>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Top bar (shared)
// ---------------------------------------------------------------------------
function TopBar({ user, onLogout, cartCount, onCartClick }) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo size={36} />
          <span className="font-semibold text-stone-800 text-lg">
            AgroConnect
          </span>
        </div>

        <div className="flex items-center gap-3">
          {user.role === "buyer" && (
            <button
              onClick={onCartClick}
              className="relative w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center hover:bg-stone-50"
              aria-label="Keranjang"
            >
              <ShoppingCart size={18} className="text-stone-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#2F6B3C] text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-medium text-stone-800 leading-tight">
              {user.role === "seller" ? user.storeName : user.name}
            </span>
            <span className="text-xs text-stone-400 leading-tight">
              {user.role === "seller" ? "Akun Penjual" : "Akun Pembeli"}
            </span>
          </div>

          <div className="w-9 h-9 rounded-full bg-[#F4E6C1] flex items-center justify-center text-[#2F6B3C] font-medium text-sm">
            {(user.role === "seller" ? user.storeName : user.name)
              .charAt(0)
              .toUpperCase()}
          </div>

          <button
            onClick={onLogout}
            className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center hover:bg-stone-50"
            aria-label="Keluar"
          >
            <LogOut size={17} className="text-stone-500" />
          </button>
        </div>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Buyer dashboard
// ---------------------------------------------------------------------------
function ProductCard({ product, onAddToCart }) {
  const hasDiscount = product.discount > 0;
  const finalPrice = discountedPrice(product.price, product.discount);

  return (
    <div className="border border-stone-200 rounded-2xl p-4 bg-white flex flex-col">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-[#2F6B3C] bg-[#F4E6C1] px-2 py-1 rounded-lg">
          {product.category}
        </span>
        {hasDiscount && (
          <span className="text-xs font-medium text-[#9A3412] bg-[#FDE6DA] px-2 py-1 rounded-lg flex items-center gap-1">
            <Tag size={12} /> -{product.discount}%
          </span>
        )}
      </div>

      <h3 className="font-medium text-stone-800 mb-1">{product.name}</h3>
      <p className="text-xs text-stone-500 mb-3 flex-1">{product.desc}</p>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="font-semibold text-stone-800">
          {formatRupiah(finalPrice)}
        </span>
        {hasDiscount && (
          <span className="text-xs text-stone-400 line-through">
            {formatRupiah(product.price)}
          </span>
        )}
        <span className="text-xs text-stone-400">/ {product.unit}</span>
      </div>

      <p className="text-xs text-stone-400 mb-3">
        Stok: {product.stock} &middot; Penjual: {product.seller}
      </p>

      <button
        onClick={() => onAddToCart(product)}
        disabled={product.stock === 0}
        className="w-full flex items-center justify-center gap-2 bg-[#2F6B3C] text-white rounded-xl py-2.5 text-sm font-medium hover:bg-[#27572F] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ShoppingCart size={15} />
        {product.stock === 0 ? "Stok habis" : "Tambah ke keranjang"}
      </button>
    </div>
  );
}

function CartPanel({ cart, products, onClose, onCheckout, onUpdateQty }) {
  const items = cart.map((c) => {
    const p = products.find((p) => p.id === c.id);
    return { ...c, product: p };
  });

  const total = items.reduce((sum, item) => {
    if (!item.product) return sum;
    return (
      sum +
      discountedPrice(item.product.price, item.product.discount) * item.qty
    );
  }, 0);

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-end z-20">
      <div className="w-full max-w-md bg-white h-full p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-stone-800">
            Keranjang Belanja
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center hover:bg-stone-50"
          >
            <X size={16} />
          </button>
        </div>

        {items.length === 0 && (
          <p className="text-sm text-stone-500">Keranjang Anda masih kosong.</p>
        )}

        <div className="space-y-4">
          {items.map((item) =>
            item.product ? (
              <div
                key={item.id}
                className="flex items-center gap-3 border border-stone-200 rounded-2xl p-3"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm text-stone-800">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-stone-400">
                    {formatRupiah(
                      discountedPrice(item.product.price, item.product.discount)
                    )}{" "}
                    / {item.product.unit}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateQty(item.id, item.qty - 1)}
                    className="w-7 h-7 rounded-lg border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-50"
                  >
                    -
                  </button>
                  <span className="text-sm w-5 text-center">{item.qty}</span>
                  <button
                    onClick={() => onUpdateQty(item.id, item.qty + 1)}
                    className="w-7 h-7 rounded-lg border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-50"
                  >
                    +
                  </button>
                </div>
              </div>
            ) : null
          )}
        </div>

        {items.length > 0 && (
          <div className="mt-6 border-t border-stone-200 pt-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-stone-500">Total</span>
              <span className="font-semibold text-stone-800">
                {formatRupiah(total)}
              </span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-[#2F6B3C] text-white rounded-xl py-3 text-sm font-medium hover:bg-[#27572F] transition-colors"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function BuyerDashboard({ products, cart, setCart, showCart, setShowCart, buyerUid }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [checkoutMessage, setCheckoutMessage] = useState("");

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      activeCategory === "Semua" || p.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === product.id);
      if (existing) {
        return prev.map((c) =>
          c.id === product.id ? { ...c, qty: c.qty + 1 } : c
        );
      }
      return [...prev, { id: product.id, qty: 1 }];
    });
  };

  const updateQty = (id, qty) => {
    setCart((prev) => {
      if (qty <= 0) return prev.filter((c) => c.id !== id);
      return prev.map((c) => (c.id === id ? { ...c, qty } : c));
    });
  };

  const checkout = async () => {
    try {
      for (const item of cart) {
        const product = products.find((p) => p.id === item.id);
        if (!product) continue;
        const newStock = Math.max(0, product.stock - item.qty);
        await updateDoc(doc(db, "products", item.id), { stock: newStock });
      }
      await addDoc(collection(db, "orders"), {
        buyerUid,
        items: cart.map((item) => {
          const product = products.find((p) => p.id === item.id);
          return {
            productId: item.id,
            name: product?.name || "",
            qty: item.qty,
            price: product
              ? discountedPrice(product.price, product.discount)
              : 0,
          };
        }),
        createdAt: Date.now(),
      });
    } catch (err) {
      console.error("Gagal membuat pesanan:", err);
    }
    setCart([]);
    setShowCart(false);
    setCheckoutMessage("Pesanan berhasil dibuat. Terima kasih!");
    setTimeout(() => setCheckoutMessage(""), 3500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {checkoutMessage && (
        <div className="mb-4 flex items-center gap-2 bg-[#EAF3DE] text-[#27500A] text-sm rounded-xl px-4 py-3">
          <Check size={16} />
          {checkoutMessage}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-stone-800 mb-1">
          Jelajahi produk pertanian
        </h1>
        <p className="text-sm text-stone-500">
          Beli langsung dari petani dan penjual terpercaya.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F6B3C]/30"
          />
        </div>
        <select
          value={activeCategory}
          onChange={(e) => setActiveCategory(e.target.value)}
          className="rounded-xl border border-stone-200 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2F6B3C]/30"
        >
          <option>Semua</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-stone-400 py-16 border border-dashed border-stone-200 rounded-2xl">
          Tidak ada produk yang cocok dengan pencarian Anda.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
          ))}
        </div>
      )}

      {showCart && (
        <CartPanel
          cart={cart}
          products={products}
          onClose={() => setShowCart(false)}
          onCheckout={checkout}
          onUpdateQty={updateQty}
        />
      )}

      <button
        onClick={() => setShowCart(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#2F6B3C] text-white shadow-lg flex items-center justify-center sm:hidden"
        aria-label="Buka keranjang"
      >
        <ShoppingCart size={20} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Seller dashboard
// ---------------------------------------------------------------------------
function ProductFormModal({ onClose, onSave, storeName, sellerUid }) {
  const [form, setForm] = useState({
    name: "",
    category: categories[0],
    price: "",
    unit: "kg",
    stock: "",
    desc: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.stock) return;
    setSubmitting(true);
    await onSave({
      name: form.name,
      category: form.category,
      price: Number(form.price),
      unit: form.unit || "kg",
      stock: Number(form.stock),
      discount: 0,
      seller: storeName,
      sellerUid,
      desc: form.desc || "Tidak ada deskripsi.",
    });
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-20 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-stone-800">
            Tambah Produk
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center hover:bg-stone-50"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">
              Nama produk
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F6B3C]/30"
              placeholder="Contoh: Tomat Segar"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">
                Kategori
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F6B3C]/30"
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">
                Satuan
              </label>
              <input
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F6B3C]/30"
                placeholder="kg / ikat / karung"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">
                Harga (Rp)
              </label>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F6B3C]/30"
                placeholder="0"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">
                Stok
              </label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F6B3C]/30"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">
              Deskripsi
            </label>
            <textarea
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F6B3C]/30 resize-none"
              placeholder="Jelaskan kualitas, asal, atau keunggulan produk"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#2F6B3C] text-white rounded-xl py-3 text-sm font-medium hover:bg-[#27572F] transition-colors disabled:opacity-60"
          >
            {submitting ? "Menyimpan..." : "Simpan Produk"}
          </button>
        </form>
      </div>
    </div>
  );
}

function DiscountModal({ product, onClose, onSave }) {
  const [discount, setDiscount] = useState(product.discount || 0);

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-20 px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-stone-800">
            Atur Diskon
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center hover:bg-stone-50"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-sm text-stone-500 mb-4">{product.name}</p>

        <label className="block text-xs font-medium text-stone-500 mb-1">
          Diskon (%)
        </label>
        <input
          type="number"
          min="0"
          max="90"
          value={discount}
          onChange={(e) => setDiscount(Number(e.target.value))}
          className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#2F6B3C]/30"
        />

        <div className="flex items-center justify-between text-sm mb-5 bg-stone-50 rounded-xl px-3 py-2.5">
          <span className="text-stone-500">Harga setelah diskon</span>
          <span className="font-medium text-stone-800">
            {formatRupiah(discountedPrice(product.price, discount))}
          </span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onSave(product.id, 0)}
            className="flex-1 rounded-xl border border-stone-200 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50"
          >
            Hapus diskon
          </button>
          <button
            onClick={() => onSave(product.id, discount)}
            className="flex-1 rounded-xl bg-[#2F6B3C] text-white py-2.5 text-sm font-medium hover:bg-[#27572F]"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

function SellerDashboard({ products, storeName, sellerUid }) {
  const [showForm, setShowForm] = useState(false);
  const [discountTarget, setDiscountTarget] = useState(null);

  const myProducts = products.filter((p) => p.sellerUid === sellerUid);

  const addProduct = async (product) => {
    try {
      await addDoc(collection(db, "products"), product);
    } catch (err) {
      console.error("Gagal menambah produk:", err);
    }
  };

  const removeProduct = async (id) => {
    try {
      await deleteDoc(doc(db, "products", id));
    } catch (err) {
      console.error("Gagal menghapus produk:", err);
    }
  };

  const saveDiscount = async (id, discount) => {
    try {
      await updateDoc(doc(db, "products", id), { discount });
    } catch (err) {
      console.error("Gagal menyimpan diskon:", err);
    }
    setDiscountTarget(null);
  };

  const stats = useMemo(() => {
    const totalProducts = myProducts.length;
    const totalStock = myProducts.reduce((s, p) => s + p.stock, 0);
    const discounted = myProducts.filter((p) => p.discount > 0).length;
    return { totalProducts, totalStock, discounted };
  }, [myProducts]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-stone-800 mb-1">
            Toko: {storeName}
          </h1>
          <p className="text-sm text-stone-500">
            Kelola produk yang Anda jual dan atur diskon.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 bg-[#2F6B3C] text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-[#27572F] transition-colors"
        >
          <Plus size={16} />
          Tambah produk
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="border border-stone-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F4E6C1] flex items-center justify-center">
            <Package size={18} className="text-[#2F6B3C]" />
          </div>
          <div>
            <p className="text-xs text-stone-400">Total produk</p>
            <p className="font-semibold text-stone-800">
              {stats.totalProducts}
            </p>
          </div>
        </div>
        <div className="border border-stone-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F4E6C1] flex items-center justify-center">
            <Leaf size={18} className="text-[#2F6B3C]" />
          </div>
          <div>
            <p className="text-xs text-stone-400">Total stok</p>
            <p className="font-semibold text-stone-800">{stats.totalStock}</p>
          </div>
        </div>
        <div className="border border-stone-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F4E6C1] flex items-center justify-center">
            <Percent size={18} className="text-[#2F6B3C]" />
          </div>
          <div>
            <p className="text-xs text-stone-400">Produk diskon</p>
            <p className="font-semibold text-stone-800">{stats.discounted}</p>
          </div>
        </div>
      </div>

      {myProducts.length === 0 ? (
        <div className="text-center text-stone-400 py-16 border border-dashed border-stone-200 rounded-2xl">
          Anda belum menambahkan produk apa pun. Klik "Tambah produk" untuk
          mulai berjualan.
        </div>
      ) : (
        <div className="border border-stone-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 text-stone-500 text-left">
                <th className="px-4 py-3 font-medium">Produk</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">Harga</th>
                <th className="px-4 py-3 font-medium">Stok</th>
                <th className="px-4 py-3 font-medium">Diskon</th>
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {myProducts.map((p) => (
                <tr key={p.id} className="border-t border-stone-100">
                  <td className="px-4 py-3">
                    <p className="font-medium text-stone-800">{p.name}</p>
                    <p className="text-xs text-stone-400 max-w-xs truncate">
                      {p.desc}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-stone-500">{p.category}</td>
                  <td className="px-4 py-3">
                    {p.discount > 0 ? (
                      <div>
                        <span className="text-stone-800 font-medium">
                          {formatRupiah(discountedPrice(p.price, p.discount))}
                        </span>
                        <span className="text-xs text-stone-400 line-through ml-1">
                          {formatRupiah(p.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-stone-800 font-medium">
                        {formatRupiah(p.price)}
                      </span>
                    )}
                    <p className="text-xs text-stone-400">/ {p.unit}</p>
                  </td>
                  <td className="px-4 py-3 text-stone-500">{p.stock}</td>
                  <td className="px-4 py-3">
                    {p.discount > 0 ? (
                      <span className="text-xs font-medium text-[#9A3412] bg-[#FDE6DA] px-2 py-1 rounded-lg">
                        -{p.discount}%
                      </span>
                    ) : (
                      <span className="text-xs text-stone-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setDiscountTarget(p)}
                        className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center hover:bg-stone-50"
                        aria-label="Atur diskon"
                      >
                        <Tag size={14} className="text-stone-500" />
                      </button>
                      <button
                        onClick={() => removeProduct(p.id)}
                        className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center hover:bg-red-50"
                        aria-label="Hapus produk"
                      >
                        <Trash2 size={14} className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <ProductFormModal
          onClose={() => setShowForm(false)}
          onSave={addProduct}
          storeName={storeName}
          sellerUid={sellerUid}
        />
      )}

      {discountTarget && (
        <DiscountModal
          product={discountTarget}
          onClose={() => setDiscountTarget(null)}
          onSave={saveDiscount}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Root app
// ---------------------------------------------------------------------------
export default function AgroConnectApp() {
  const [authChecked, setAuthChecked] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null); // { name, email, role, storeName }
  const [profileChecked, setProfileChecked] = useState(false);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [authError, setAuthError] = useState("");

  // Listen for login/logout
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      setAuthChecked(true);

      if (!fbUser) {
        setProfile(null);
        setProfileChecked(true);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", fbUser.uid));
        if (snap.exists()) {
          setProfile(snap.data());
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("Gagal memuat profil:", err);
        setAuthError("Gagal memuat profil pengguna.");
      } finally {
        setProfileChecked(true);
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen for product list (real-time)
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "products")),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setProducts(items);
      },
      (err) => console.error("Gagal memuat produk:", err)
    );
    return () => unsubscribe();
  }, []);

  const handleChooseRole = async (role) => {
    if (!firebaseUser) return;
    const newProfile = {
      name: firebaseUser.displayName || "Pengguna",
      email: firebaseUser.email || "",
      role,
      storeName:
        role === "seller"
          ? `Toko ${firebaseUser.displayName || "Saya"}`
          : null,
    };
    try {
      await setDoc(doc(db, "users", firebaseUser.uid), newProfile);
      setProfile(newProfile);
    } catch (err) {
      console.error("Gagal menyimpan profil:", err);
      setAuthError("Gagal menyimpan profil. Coba lagi.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Gagal keluar:", err);
    }
    setCart([]);
    setShowCart(false);
  };

  // Loading state while checking auth/profile
  if (!authChecked || (firebaseUser && !profileChecked)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4E6C1]">
        <p className="text-sm text-stone-500">Memuat...</p>
      </div>
    );
  }

  // Not logged in, or logged in but hasn't picked a role yet
  if (!firebaseUser || !profile) {
    return (
      <AuthScreen
        pendingUser={firebaseUser}
        onChooseRole={handleChooseRole}
        authError={authError}
      />
    );
  }

  const user = {
    name: profile.name,
    email: profile.email,
    role: profile.role,
    storeName: profile.storeName,
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0]">
      <TopBar
        user={user}
        onLogout={handleLogout}
        cartCount={cart.reduce((s, c) => s + c.qty, 0)}
        onCartClick={() => setShowCart(true)}
      />

      {user.role === "buyer" ? (
        <BuyerDashboard
          products={products}
          cart={cart}
          setCart={setCart}
          showCart={showCart}
          setShowCart={setShowCart}
          buyerUid={firebaseUser.uid}
        />
      ) : (
        <SellerDashboard
          products={products}
          storeName={user.storeName}
          sellerUid={firebaseUser.uid}
        />
      )}
    </div>
  );
}
