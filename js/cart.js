/**
 * cart.js
 * Cart logic, separated from the interface so it is easy to read and test.
 * The cart is a plain object: { items: { productId: quantity }, discountCode: "" }
 */

const FREE_SHIPPING_FROM = 50; // free shipping when the subtotal (after discount) reaches this amount
const SHIPPING_COST = 5;
const DISCOUNT_CODES = { WELCOME10: 0.1 }; // code -> percentage off the subtotal
const CART_KEY = "roses-store:cart";

const Cart = {
  create() {
    return { items: {}, discountCode: "" };
  },

  /** Adds units of a product without going over the available stock. Returns the new quantity. */
  add(cart, product, quantity = 1) {
    const current = cart.items[product.id] || 0;
    const next = Math.min(current + quantity, product.stock);
    if (next > 0) cart.items[product.id] = next;
    return next;
  },

  /** Sets an exact quantity (between 0 and stock). 0 removes the product. */
  setQuantity(cart, product, quantity) {
    const safe = Math.max(0, Math.min(Math.floor(quantity) || 0, product.stock));
    if (safe === 0) delete cart.items[product.id];
    else cart.items[product.id] = safe;
    return safe;
  },

  remove(cart, productId) {
    delete cart.items[productId];
  },

  clear(cart) {
    cart.items = {};
    cart.discountCode = "";
  },

  /** Total number of units in the cart (used for the badge). */
  count(cart) {
    return Object.values(cart.items).reduce((sum, qty) => sum + qty, 0);
  },

  /** Returns the cart lines with product data and the line total. */
  lines(cart, products) {
    return Object.entries(cart.items)
      .map(([id, quantity]) => {
        const product = products.find((p) => p.id === id);
        return product ? { product, quantity, lineTotal: round(product.price * quantity) } : null;
      })
      .filter(Boolean);
  },

  /** Validates and applies a discount code. Returns true if the code exists. */
  applyDiscount(cart, code) {
    const normalized = String(code).trim().toUpperCase();
    if (!DISCOUNT_CODES[normalized]) return false;
    cart.discountCode = normalized;
    return true;
  },

  /** Calculates subtotal, discount, shipping and total. */
  totals(cart, products) {
    const subtotal = round(Cart.lines(cart, products).reduce((sum, line) => sum + line.lineTotal, 0));
    const rate = DISCOUNT_CODES[cart.discountCode] || 0;
    const discount = round(subtotal * rate);
    const afterDiscount = subtotal - discount;
    const shipping = subtotal === 0 || afterDiscount >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST;
    const missingForFreeShipping = shipping > 0 ? round(FREE_SHIPPING_FROM - afterDiscount) : 0;
    return { subtotal, discount, shipping, total: round(afterDiscount + shipping), missingForFreeShipping };
  },

  save(cart) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* Storage is optional: the cart still works in memory. */
    }
  },

  /** Loads the saved cart and drops products that no longer exist or exceed the stock. */
  load(products) {
    const cart = Cart.create();
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY));
      if (saved && saved.items) {
        Object.entries(saved.items).forEach(([id, qty]) => {
          const product = products.find((p) => p.id === id);
          if (product) Cart.setQuantity(cart, product, qty);
        });
        if (DISCOUNT_CODES[saved.discountCode]) cart.discountCode = saved.discountCode;
      }
    } catch {
      /* Ignore corrupted or unavailable storage. */
    }
    return cart;
  },
};

/** Rounds to 2 decimals to avoid floating point errors such as 0.1 + 0.2 = 0.30000000000000004. */
function round(value) {
  return Math.round(value * 100) / 100;
}

function formatPrice(value) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
