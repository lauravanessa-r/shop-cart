/**
 * products.js
 * Product catalog for the demo store. Rose’s Store is a fictional brand.
 * Images are simple inline SVG icons, so the project has no external image dependencies.
 */

const ICONS = {
  mug: '<rect x="14" y="20" width="28" height="32" rx="5"/><path d="M42 27h4a7 7 0 0 1 0 14h-4"/><path d="M22 8v6M29 8v6M36 8v6"/>',
  backpack: '<rect x="16" y="18" width="32" height="38" rx="9"/><path d="M24 18v-3a8 8 0 0 1 16 0v3"/><rect x="22" y="36" width="20" height="12" rx="3"/>',
  notebook: '<rect x="16" y="8" width="32" height="48" rx="3"/><path d="M23 8v48M29 20h13M29 28h13M29 36h8"/>',
  lamp: '<path d="M20 30 28 10h8l8 20z"/><path d="M32 30v20M22 54h20"/>',
  plant: '<path d="M20 38h24l-3 18H23z"/><path d="M32 38V24"/><path d="M32 28c-9 0-14-6-14-14 8 0 14 5 14 14z"/><path d="M32 32c8 0 12-5 12-12-7 0-12 4-12 12z"/>',
  headphones: '<path d="M14 42v-8a18 18 0 0 1 36 0v8"/><rect x="10" y="38" width="10" height="16" rx="3"/><rect x="44" y="38" width="10" height="16" rx="3"/>',
  bottle: '<rect x="22" y="18" width="20" height="40" rx="6"/><rect x="26" y="8" width="12" height="10" rx="2"/><path d="M22 30h20"/>',
  candle: '<rect x="22" y="30" width="20" height="26" rx="3"/><path d="M32 24c-4-3-3-9 0-14 3 5 4 11 0 14z"/><path d="M32 24v6"/>',
  sunglasses: '<rect x="8" y="26" width="20" height="14" rx="6"/><rect x="36" y="26" width="20" height="14" rx="6"/><path d="M28 31h8M8 29l-2-7M56 29l2-7"/>',
  pen: '<path d="m44 10 10 10-28 28-12 2 2-12z"/><path d="m39 15 10 10"/>',
  board: '<rect x="10" y="14" width="36" height="40" rx="6"/><path d="M46 28h6a4 4 0 0 1 0 8h-6"/><circle cx="18" cy="22" r="2"/>',
  tote: '<path d="M14 24h36l-3 32H17z"/><path d="M24 24v-4a8 8 0 0 1 16 0v4"/>',
};

const PRODUCTS = [
  { id: "p01", name: "Ceramic Coffee Mug", category: "Kitchen", price: 14.0, stock: 12, rating: 4.7, icon: "mug", color: "#f3d9c4", featured: 1, description: "350 ml handmade mug, dishwasher safe." },
  { id: "p02", name: "Everyday Backpack", category: "Accessories", price: 49.0, stock: 6, rating: 4.5, icon: "backpack", color: "#cfe0f5", featured: 2, description: "Water-resistant backpack with laptop sleeve." },
  { id: "p03", name: "Dotted Notebook A5", category: "Stationery", price: 9.5, stock: 25, rating: 4.8, icon: "notebook", color: "#e4dcf5", featured: 3, description: "120 pages of 100 g dotted paper." },
  { id: "p04", name: "Desk Lamp", category: "Home", price: 32.0, stock: 8, rating: 4.4, icon: "lamp", color: "#f6ebc2", featured: 4, description: "LED lamp with three light temperatures." },
  { id: "p05", name: "Succulent in Pot", category: "Home", price: 12.0, stock: 15, rating: 4.6, icon: "plant", color: "#d3eedb", featured: 5, description: "Low-maintenance plant in a ceramic pot." },
  { id: "p06", name: "Wireless Headphones", category: "Accessories", price: 59.0, stock: 4, rating: 4.3, icon: "headphones", color: "#d7d9e0", featured: 6, description: "Over-ear headphones with 30 h battery." },
  { id: "p07", name: "Steel Water Bottle", category: "Kitchen", price: 18.0, stock: 20, rating: 4.6, icon: "bottle", color: "#cdeeee", featured: 7, description: "750 ml bottle, keeps drinks cold for 24 h." },
  { id: "p08", name: "Soy Wax Candle", category: "Home", price: 11.0, stock: 18, rating: 4.9, icon: "candle", color: "#f5d6dc", featured: 8, description: "Vanilla scent, 40 hours of burn time." },
  { id: "p09", name: "Classic Sunglasses", category: "Accessories", price: 24.0, stock: 10, rating: 4.2, icon: "sunglasses", color: "#e0e0e0", featured: 9, description: "UV400 protection with a light frame." },
  { id: "p10", name: "Gel Pen Set", category: "Stationery", price: 7.5, stock: 30, rating: 4.5, icon: "pen", color: "#dcecc8", featured: 10, description: "Set of 6 pens, 0.5 mm tip." },
  { id: "p11", name: "Bamboo Cutting Board", category: "Kitchen", price: 21.0, stock: 9, rating: 4.7, icon: "board", color: "#efe0c6", featured: 11, description: "Durable board with juice groove." },
  { id: "p12", name: "Canvas Tote Bag", category: "Accessories", price: 16.0, stock: 0, rating: 4.1, icon: "tote", color: "#f2d4c2", featured: 12, description: "Reusable bag in organic cotton canvas." },
];

/** Returns the SVG markup for a product icon. The icon data is static, defined above. */
function productIconSvg(iconName) {
  return `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[iconName] || ""}</svg>`;
}
