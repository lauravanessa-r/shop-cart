/**
 * app.js
 * Store interface: product grid, search, category filter, sorting,
 * cart drawer, discount code and demo checkout.
 */

// ---------- State ----------
const state = {
  search: "",
  category: "All",
  sort: "featured",
  cart: Cart.load(PRODUCTS),
};

// ---------- DOM helpers ----------
const $ = (id) => document.getElementById(id);

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === "text") node.textContent = value;
    else if (key === "className") node.className = value;
    else if (key === "html") node.innerHTML = value; // only used for the static SVG icons
    else node.setAttribute(key, value);
  });
  children.forEach((child) => node.append(child));
  return node;
}

const findProduct = (id) => PRODUCTS.find((p) => p.id === id);

// ---------- Catalog ----------
function renderCategories() {
  const categories = ["All", ...new Set(PRODUCTS.map((p) => p.category))];
  const container = $("categories");
  container.innerHTML = "";
  categories.forEach((category) => {
    const chip = el("button", {
      type: "button",
      className: "chip",
      text: category,
      "aria-pressed": String(category === state.category),
    });
    chip.addEventListener("click", () => {
      state.category = category;
      renderCategories();
      renderProducts();
    });
    container.append(chip);
  });
}

/** Applies search, category and sorting to the catalog. */
function visibleProducts() {
  const term = state.search.trim().toLowerCase();
  const list = PRODUCTS.filter((p) => {
    const matchesCategory = state.category === "All" || p.category === state.category;
    const matchesSearch = !term || `${p.name} ${p.description} ${p.category}`.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

  const sorters = {
    featured: (a, b) => a.featured - b.featured,
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    name: (a, b) => a.name.localeCompare(b.name),
    rating: (a, b) => b.rating - a.rating,
  };
  return list.sort(sorters[state.sort]);
}

function renderProducts() {
  const grid = $("product-grid");
  const products = visibleProducts();
  grid.innerHTML = "";

  products.forEach((product) => grid.append(productCard(product)));

  $("no-results").hidden = products.length > 0;
  $("results-count").textContent = `${products.length} ${products.length === 1 ? "product" : "products"}`;
}

function productCard(product) {
  const inCart = state.cart.items[product.id] || 0;
  const soldOut = product.stock === 0;
  const maxReached = !soldOut && inCart >= product.stock;

  const image = el("div", { className: "product__image", html: productIconSvg(product.icon) });
  image.style.background = product.color;
  if (soldOut) image.append(el("span", { className: "product__badge product__badge--out", text: "Sold out" }));
  else if (product.stock <= 5) image.append(el("span", { className: "product__badge", text: `Only ${product.stock} left` }));

  let label = "Add to cart";
  if (soldOut) label = "Sold out";
  else if (maxReached) label = "Max. in cart";

  const button = el("button", {
    type: "button",
    className: "btn btn--primary btn--block",
    text: label,
    "aria-label": `Add ${product.name} to cart`,
  });
  button.disabled = soldOut || maxReached;
  button.addEventListener("click", () => addToCart(product));

  return el("article", { className: "product" }, [
    image,
    el("div", { className: "product__body" }, [
      el("span", { className: "product__category", text: product.category }),
      el("h3", { className: "product__name", text: product.name }),
      el("p", { className: "product__desc", text: product.description }),
      el("div", { className: "product__meta" }, [
        el("span", { className: "product__price", text: formatPrice(product.price) }),
        el("span", { className: "product__rating", text: `★ ${product.rating.toFixed(1)}`, "aria-label": `Rated ${product.rating} out of 5` }),
      ]),
      button,
    ]),
  ]);
}

// ---------- Cart actions ----------
function addToCart(product) {
  const before = state.cart.items[product.id] || 0;
  const after = Cart.add(state.cart, product, 1);
  if (after === before) {
    showToast(`No more stock available for ${product.name}`);
    return;
  }
  updateCart();
  showToast(`${product.name} added to cart`);
  const badge = $("cart-count");
  badge.classList.remove("bump");
  void badge.offsetWidth; // restarts the animation
  badge.classList.add("bump");
}

function changeQuantity(productId, delta) {
  const product = findProduct(productId);
  Cart.setQuantity(state.cart, product, (state.cart.items[productId] || 0) + delta);
  updateCart();
}

function removeFromCart(productId) {
  Cart.remove(state.cart, productId);
  updateCart();
}

/** Saves the cart and refreshes every part of the page that depends on it. */
function updateCart() {
  if (Cart.count(state.cart) === 0) state.cart.discountCode = "";
  Cart.save(state.cart);
  renderCart();
  renderProducts();
}

// ---------- Cart drawer ----------
function renderCart() {
  const lines = Cart.lines(state.cart, PRODUCTS);
  const totals = Cart.totals(state.cart, PRODUCTS);
  const count = Cart.count(state.cart);

  $("cart-count").textContent = count;
  $("cart-open").setAttribute("aria-label", `Open cart, ${count} ${count === 1 ? "item" : "items"}`);
  $("cart-empty").hidden = lines.length > 0;
  $("cart-foot").hidden = lines.length === 0;

  const list = $("cart-items");
  list.innerHTML = "";
  lines.forEach(({ product, quantity, lineTotal }) => {
    const thumb = el("div", { className: "cart-item__thumb", html: productIconSvg(product.icon) });
    thumb.style.background = product.color;

    const minus = el("button", { type: "button", className: "icon-btn", text: "−", "aria-label": `Decrease ${product.name}` });
    const plus = el("button", { type: "button", className: "icon-btn", text: "+", "aria-label": `Increase ${product.name}` });
    plus.disabled = quantity >= product.stock;
    minus.addEventListener("click", () => changeQuantity(product.id, -1));
    plus.addEventListener("click", () => changeQuantity(product.id, 1));

    const remove = el("button", { type: "button", className: "link-btn", text: "Remove" });
    remove.addEventListener("click", () => removeFromCart(product.id));

    list.append(
      el("li", { className: "cart-item" }, [
        thumb,
        el("div", {}, [
          el("p", { className: "cart-item__name", text: product.name }),
          el("p", { className: "cart-item__price", text: `${formatPrice(product.price)} each` }),
          el("div", { className: "qty" }, [minus, el("span", { className: "qty__value", text: String(quantity) }), plus]),
        ]),
        el("div", {}, [el("div", { className: "cart-item__total", text: formatPrice(lineTotal) }), remove]),
      ])
    );
  });

  // Totals
  $("t-subtotal").textContent = formatPrice(totals.subtotal);
  $("row-discount").hidden = totals.discount === 0;
  $("t-discount").textContent = `−${formatPrice(totals.discount)}`;
  $("t-shipping").textContent = totals.shipping === 0 ? "Free" : formatPrice(totals.shipping);
  $("t-total").textContent = formatPrice(totals.total);

  // Free shipping progress
  const reached = totals.missingForFreeShipping === 0;
  const progress = reached ? 100 : ((FREE_SHIPPING_FROM - totals.missingForFreeShipping) / FREE_SHIPPING_FROM) * 100;
  $("shipping-text").textContent = reached
    ? "🎉 You have free shipping!"
    : `Add ${formatPrice(totals.missingForFreeShipping)} more for free shipping`;
  $("shipping-fill").style.width = `${progress}%`;

  // Discount message
  const msg = $("discount-msg");
  if (state.cart.discountCode) {
    msg.textContent = `Code ${state.cart.discountCode} applied (${DISCOUNT_CODES[state.cart.discountCode] * 100}% off)`;
    msg.className = "discount__msg ok";
  } else if (!msg.classList.contains("error")) {
    msg.textContent = "";
  }
}

let lastFocused = null;

function openCart() {
  lastFocused = document.activeElement;
  $("cart").classList.add("is-open");
  $("cart").setAttribute("aria-hidden", "false");
  $("cart").inert = false; // the closed drawer is inert so keyboard users cannot tab into it
  $("overlay").hidden = false;
  document.body.classList.add("no-scroll");
  $("cart-close").focus();
}

function closeCart() {
  $("cart").classList.remove("is-open");
  $("cart").setAttribute("aria-hidden", "true");
  $("cart").inert = true;
  $("overlay").hidden = true;
  document.body.classList.remove("no-scroll");
  if (lastFocused) lastFocused.focus();
}

// ---------- Discount and checkout ----------
function applyDiscount(event) {
  event.preventDefault();
  const input = $("discount-input");
  const msg = $("discount-msg");
  const code = input.value.trim();

  if (!code) {
    msg.textContent = "Enter a discount code.";
    msg.className = "discount__msg error";
    return;
  }
  if (Cart.applyDiscount(state.cart, code)) {
    input.value = "";
    msg.className = "discount__msg";
    Cart.save(state.cart);
    renderCart();
  } else {
    msg.textContent = `"${code.toUpperCase()}" is not a valid code.`;
    msg.className = "discount__msg error";
  }
}

function checkout() {
  const totals = Cart.totals(state.cart, PRODUCTS);
  if (totals.subtotal === 0) return;

  // Demo only: stock is reduced in memory so the catalog reflects the purchase until the page reloads.
  Cart.lines(state.cart, PRODUCTS).forEach(({ product, quantity }) => {
    product.stock -= quantity;
  });

  $("order-number").textContent = `RS-${Date.now().toString().slice(-6)}`;
  $("order-total").textContent = formatPrice(totals.total);
  Cart.clear(state.cart);
  $("discount-msg").className = "discount__msg";
  updateCart();
  closeCart();
  $("order-modal").showModal();
}

// ---------- Toast ----------
let toastTimer;
function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

// ---------- Events ----------
$("search").addEventListener("input", (e) => {
  state.search = e.target.value;
  renderProducts();
});
$("sort").addEventListener("change", (e) => {
  state.sort = e.target.value;
  renderProducts();
});
$("cart-open").addEventListener("click", openCart);
$("cart-close").addEventListener("click", closeCart);
$("overlay").addEventListener("click", closeCart);
$("discount-form").addEventListener("submit", applyDiscount);
$("checkout").addEventListener("click", checkout);
$("modal-close").addEventListener("click", () => $("order-modal").close());
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && $("cart").classList.contains("is-open")) closeCart();
});

// ---------- Start ----------
renderCategories();
renderProducts();
renderCart();
