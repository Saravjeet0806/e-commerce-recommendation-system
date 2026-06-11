const fallbackProducts = [
  { id: 1, name: "Wireless Headphones", category: "Electronics", price: 1999, rating: 4.5, image: "images/headphones.jpg" },
  { id: 2, name: "Smart Watch", category: "Electronics", price: 3499, rating: 4.4, image: "images/watch.jpg" },
  { id: 3, name: "Bluetooth Speaker", category: "Electronics", price: 1499, rating: 4.3, image: "images/speaker.jpg" },
  { id: 4, name: "Wireless Mouse", category: "Electronics", price: 699, rating: 4.2, image: "images/mouse.jpg" },
  { id: 5, name: "Mechanical Keyboard", category: "Electronics", price: 2999, rating: 4.6, image: "images/keyboard.jpg" },
  { id: 6, name: "Gaming Earbuds", category: "Electronics", price: 1299, rating: 4.1, image: "images/earbuds.jpg" },
  { id: 7, name: "Laptop Backpack", category: "Accessories", price: 899, rating: 4.3, image: "images/backpack.jpg" },
  { id: 8, name: "Men's T-Shirt", category: "Clothing", price: 599, rating: 4.0, image: "images/tshirt.jpg" },
  { id: 9, name: "Men's Jeans", category: "Clothing", price: 1199, rating: 4.2, image: "images/jeans.jpg" },
  { id: 10, name: "Winter Jacket", category: "Clothing", price: 2499, rating: 4.4, image: "images/jacket.jpg" },
  { id: 11, name: "Running Shoes", category: "Clothing", price: 1999, rating: 4.5, image: "images/shoes.jpg" },
  { id: 12, name: "Sports Cap", category: "Accessories", price: 399, rating: 4.1, image: "images/cap.jpg" },
  { id: 13, name: "Stylish Sunglasses", category: "Accessories", price: 799, rating: 4.2, image: "images/sunglasses.jpg" },
  { id: 14, name: "Leather Wallet", category: "Accessories", price: 699, rating: 4.3, image: "images/wallet.jpg" },
  { id: 15, name: "Smartphone Stand", category: "Electronics", price: 299, rating: 4.0, image: "images/stand.jpg" },
  { id: 16, name: "USB Charging Cable", category: "Electronics", price: 199, rating: 4.1, image: "images/cable.jpg" },
  { id: 17, name: "Portable Power Bank", category: "Electronics", price: 1299, rating: 4.4, image: "images/powerbank.jpg" },
  { id: 18, name: "Noise Cancelling Headset", category: "Electronics", price: 3999, rating: 4.6, image: "images/headset.jpg" },
  { id: 19, name: "Fitness Band", category: "Electronics", price: 1799, rating: 4.2, image: "images/fitnessband.jpg" },
  { id: 20, name: "Cotton Hoodie", category: "Clothing", price: 1499, rating: 4.3, image: "images/hoodie.jpg" },
  { id: 21, name: "Formal Shirt", category: "Clothing", price: 999, rating: 4.1, image: "images/shirt.jpg" },
  { id: 22, name: "Casual Sneakers", category: "Clothing", price: 2199, rating: 4.4, image: "images/sneakers.jpg" },
  { id: 23, name: "Travel Backpack", category: "Accessories", price: 1599, rating: 4.5, image: "images/travelbag.jpg" },
  { id: 24, name: "Laptop Sleeve", category: "Accessories", price: 499, rating: 4.0, image: "images/laptopsleeve.jpg" },
  { id: 25, name: "Digital Alarm Clock", category: "Electronics", price: 899, rating: 4.2, image: "images/clock.jpg" },
  { id: 26, name: "Python Programming Book", category: "Books", price: 699, rating: 4.6, image: "images/pythonbook.jpg" },
  { id: 27, name: "Machine Learning Guide", category: "Books", price: 899, rating: 4.5, image: "images/mlbook.jpg" },
  { id: 28, name: "Data Science Handbook", category: "Books", price: 799, rating: 4.4, image: "images/dsbook.jpg" },
  { id: 29, name: "AI Basics Book", category: "Books", price: 749, rating: 4.3, image: "images/aibook.jpg" },
  { id: 30, name: "Programming Fundamentals", category: "Books", price: 599, rating: 4.2, image: "images/programmingbook.jpg" }
];

let products = [];
const CART_STORAGE_KEY = "cart";
const VIEWED_STORAGE_KEY = "recentlyViewed";
const CURRENT_USER_KEY = "currentUser";

function isHttpMode() {
  return window.location.protocol.startsWith("http");
}

function getApiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (window.location.port === "5000") {
    return normalizedPath;
  }

  return `http://127.0.0.1:5000${normalizedPath}`;
}

function createDemoLoginResponse(email) {
  const userName = email.split("@")[0].replace(/\./g, " ").trim() || "Shopper";
  const formattedName = userName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

  return {
    success: true,
    message: `Welcome back, ${formattedName}.`,
    user: {
      name: formattedName,
      email,
    },
  };
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed: ${response.status}`);
  }

  return data;
}

async function getProducts() {
  if (products.length) return products;

  try {
    products = isHttpMode()
      ? await fetchJson(getApiUrl("/api/products"))
      : await fetchJson("data/products.json");
  } catch (error) {
    products = fallbackProducts;
  }

  return products;
}

function getCart() {
  return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function getStoredArray(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function saveStoredArray(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatPrice(price) {
  return `\u20B9${price}`;
}

function getCartCountElement() {
  return document.getElementById("cart-count") || document.getElementById("cartCount");
}

function displayProducts(productsList) {
  const container = document.getElementById("products-container");
  if (!container) return;

  renderProductCards(container, productsList, "No products found.");
}

function searchProducts() {
  applyProductFilters();
}

function addToCart(id) {
  const cart = getCart();
  cart.push(Number(id));
  saveCart(cart);
  updateCartCount();
  refreshCartRecommendations();
  alert("Added to cart");
}

function updateCartCount() {
  const countElement = getCartCountElement();
  if (!countElement) return;

  countElement.innerText = getCart().length;
}

function getRecentlyViewed() {
  return getStoredArray(VIEWED_STORAGE_KEY);
}

function trackRecentlyViewed(productId) {
  const normalizedId = Number(productId);
  const viewed = getRecentlyViewed().filter((id) => Number(id) !== normalizedId);
  viewed.unshift(normalizedId);
  saveStoredArray(VIEWED_STORAGE_KEY, viewed.slice(0, 8));
}

function getRecommendationTag(product) {
  if (product.recommendationTag) return product.recommendationTag;

  if (product.recommendationSource === "current-product") {
    return `Because you viewed ${product.sourceProductName || "this item"}`;
  }

  if (product.recommendationSource === "cart") {
    return `Pairs well with ${product.sourceProductName || "your cart items"}`;
  }

  if (product.recommendationSource === "viewed") {
    return `Inspired by ${product.sourceProductName || "your recent browsing"}`;
  }

  return "";
}

function renderProductCards(container, items, emptyMessage = "No items available.") {
  container.innerHTML = "";

  if (!items.length) {
    container.innerHTML = `<p>${emptyMessage}</p>`;
    return;
  }

  items.forEach((product) => {
    const recommendationTag = getRecommendationTag(product);

    container.innerHTML += `
      <div class="product-card">
        ${recommendationTag ? `<p class="recommendation-tag">${recommendationTag}</p>` : ""}
        <h3>${product.name}</h3>
        <img src="${product.image}" class="product-img" alt="${product.name}">
        <p class="price">${formatPrice(product.price)}</p>
        <button class="btn" onclick="addToCart(${product.id})">Add to Cart</button>
        <a href="product-detail.html?id=${product.id}">View</a>
      </div>
    `;
  });
}

function countCategoryInterest(productIds, allProducts) {
  return productIds.reduce((counts, productId) => {
    const product = allProducts.find((item) => Number(item.id) === Number(productId));
    if (!product) return counts;

    counts[product.category] = (counts[product.category] || 0) + 1;
    return counts;
  }, {});
}

function getCategoryNameById(productId, allProducts) {
  return allProducts.find((item) => Number(item.id) === Number(productId))?.category;
}

function getSourceProductName(productId, allProducts) {
  return allProducts.find((item) => Number(item.id) === Number(productId))?.name || "";
}

function getRecommendationReason(cartItems, viewedItems, currentProduct) {
  if (currentProduct) {
    return `More ${currentProduct.category.toLowerCase()} picks like this product.`;
  }

  if (cartItems.length) {
    return "Based on the categories already added to your cart.";
  }

  if (viewedItems.length) {
    return "Picked from products you explored recently.";
  }

  return "Popular picks based on what shoppers love.";
}

function buildRecommendations(allProducts, options = {}) {
  const {
    currentProductId = null,
    limit = 4,
    seedIds = [],
  } = options;

  const cartItems = getCart();
  const viewedItems = getRecentlyViewed();
  const currentProduct = currentProductId
    ? allProducts.find((item) => Number(item.id) === Number(currentProductId))
    : null;
  const categoryInterest = countCategoryInterest([...cartItems, ...viewedItems, ...seedIds], allProducts);
  const excludedIds = new Set([...seedIds.map(Number), Number(currentProductId)].filter(Boolean));
  const cartCategory = cartItems.length ? getCategoryNameById(cartItems[0], allProducts) : "";
  const viewedCategory = viewedItems.length ? getCategoryNameById(viewedItems[0], allProducts) : "";

  return allProducts
    .filter((product) => !excludedIds.has(Number(product.id)))
    .map((product) => {
      let score = Number(product.rating || 0) * 10;
      let recommendationSource = "popular";
      let sourceProductName = "";
      let recommendationTag = "";

      score += (categoryInterest[product.category] || 0) * 30;

      if (currentProduct) {
        if (product.category === currentProduct.category) {
          score += 60;
        }

        const priceGap = Math.abs((product.price || 0) - (currentProduct.price || 0));
        score += Math.max(0, 25 - Math.floor(priceGap / 150));
        recommendationSource = "current-product";
        sourceProductName = currentProduct.name;
        recommendationTag = `Because you viewed ${currentProduct.name}`;
      } else if (cartCategory && product.category === cartCategory) {
        recommendationSource = "cart";
        sourceProductName = getSourceProductName(cartItems[0], allProducts);
        recommendationTag = `Pairs well with ${sourceProductName}`;
      } else if (viewedCategory && product.category === viewedCategory) {
        recommendationSource = "viewed";
        sourceProductName = getSourceProductName(viewedItems[0], allProducts);
        recommendationTag = `Inspired by ${sourceProductName}`;
      } else {
        recommendationTag = "Top rated right now";
      }

      if (cartItems.includes(Number(product.id))) {
        score -= 1000;
      }

      return {
        ...product,
        recommendationScore: score,
        recommendationSource,
        sourceProductName,
        recommendationTag,
      };
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore || (b.rating || 0) - (a.rating || 0))
    .slice(0, limit);
}

function populateCategoryFilter(allProducts) {
  const filter = document.getElementById("category-filter");
  if (!filter) return;

  const selectedValue = filter.value || "all";
  const categories = [...new Set(allProducts.map((product) => product.category))].sort();

  filter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach((category) => {
    filter.innerHTML += `<option value="${category}">${category}</option>`;
  });
  filter.value = categories.includes(selectedValue) ? selectedValue : "all";
}

function applyProductFilters() {
  const searchInput = document.getElementById("search");
  const categoryFilter = document.getElementById("category-filter");
  const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
  const selectedCategory = categoryFilter ? categoryFilter.value : "all";
  const filtered = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(query);
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  displayProducts(filtered);
}

async function loadCart() {
  const cart = getCart();
  const allProducts = await getProducts();
  const container = document.getElementById("cart-items") || document.getElementById("cartItems");
  const totalElement = document.getElementById("total");

  if (!container || !totalElement) return;

  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    totalElement.innerText = "0";
    return;
  }

  let total = 0;

  cart.forEach((id, index) => {
    const product = allProducts.find((item) => Number(item.id) === Number(id));
    if (!product) return;

    total += product.price;
    container.innerHTML += `
      <div class="product-card">
        <h4>${product.name}</h4>
        <img src="${product.image}" class="product-img" alt="${product.name}">
        <p class="price">${formatPrice(product.price)}</p>
        <button class="btn" onclick="removeItem(${index})">Remove</button>
      </div>
    `;
  });

  totalElement.innerText = total;
}

function removeItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  loadCart();
  updateCartCount();
  refreshCartRecommendations();
}

async function payWithRazorpay() {
  const cart = getCart();
  const checkoutButton = document.getElementById("checkout-button");
  const message = document.getElementById("checkout-message");

  if (!checkoutButton || !message) return;

  if (!cart.length) {
    message.innerText = "Add at least one product before checkout.";
    return;
  }

  if (typeof Razorpay === "undefined") {
    message.innerText = "Razorpay Checkout could not load. Check your internet connection.";
    return;
  }

  checkoutButton.disabled = true;
  message.innerText = "Preparing secure checkout...";

  try {
    const order = await fetchJson(getApiUrl("/api/payments/create-order"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cart }),
    });
    const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY)) || {};
    const razorpay = new Razorpay({
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      name: "E-Shop",
      description: "E-Shop cart purchase",
      order_id: order.order_id,
      prefill: {
        name: currentUser.name || "",
        email: currentUser.email || "",
      },
      theme: {
        color: "#ff6600",
      },
      handler: async (payment) => {
        try {
          await fetchJson(getApiUrl("/api/payments/verify"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payment),
          });

          saveCart([]);
          updateCartCount();
          loadCart();
          refreshCartRecommendations();
          message.innerText = "Payment verified successfully. Thank you for your order.";
        } catch (error) {
          checkoutButton.disabled = false;
          message.innerText = error.message || "Payment verification failed. Please contact support.";
        }
      },
      modal: {
        ondismiss: () => {
          checkoutButton.disabled = false;
          message.innerText = "Checkout was closed before payment was completed.";
        },
      },
    });

    razorpay.on("payment.failed", (response) => {
      checkoutButton.disabled = false;
      message.innerText = response.error.description || "Payment failed. Please try again.";
    });

    razorpay.open();
  } catch (error) {
    checkoutButton.disabled = false;
    message.innerText = error.message || "Unable to start checkout. Please try again.";
  }
}

async function loadProductDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");
  const container = document.getElementById("productDetails");

  if (!container) return;

  if (!productId) {
    container.innerHTML = "<p>Select a product to view its details.</p>";
    return;
  }

  let product = null;

  try {
    product = isHttpMode()
      ? await fetchJson(getApiUrl(`/api/products/${productId}`))
      : (await getProducts()).find((item) => String(item.id) === String(productId));
  } catch (error) {
    product = (await getProducts()).find((item) => String(item.id) === String(productId));
  }

  if (!product) {
    container.innerHTML = "<p>Product not found.</p>";
    return;
  }

  trackRecentlyViewed(product.id);

  container.innerHTML = `
    <div class="product-image">
      <img src="${product.image}" alt="${product.name}">
    </div>
    <div class="product-info">
      <h2>${product.name}</h2>
      <p class="price">${formatPrice(product.price)}</p>
      <p class="rating">Rating: ${product.rating || "N/A"} / 5</p>
      <p class="description">${product.description || "A quality product from our collection."}</p>
      <button class="btn" onclick="addToCart(${product.id})">Add to Cart</button>
    </div>
  `;

  loadRecommendations(product.id);
}

async function loadRecommendations(productId) {
  const container = document.getElementById("recommendations");
  if (!container) return;
  const allProducts = await getProducts();
  const currentProduct = allProducts.find((item) => Number(item.id) === Number(productId));
  const localRecommendations = buildRecommendations(allProducts, {
    currentProductId: productId,
    limit: 4,
    seedIds: [productId],
  });
  const copyElement = document.getElementById("recommendation-copy");

  if (copyElement && currentProduct) {
    copyElement.innerText = getRecommendationReason(getCart(), getRecentlyViewed(), currentProduct);
  }

  try {
    if (!isHttpMode()) {
      renderProductCards(container, localRecommendations, "No recommendations available right now.");
      return;
    }

    const apiRecommendations = await fetchJson(getApiUrl(`/api/recommend?id=${productId}`));
    const mergedRecommendations = [...localRecommendations, ...apiRecommendations]
      .filter((item, index, list) => list.findIndex((candidate) => Number(candidate.id) === Number(item.id)) === index)
      .slice(0, 4);

    renderProductCards(container, mergedRecommendations, "No recommendations available right now.");
  } catch (error) {
    renderProductCards(container, localRecommendations, "No recommendations available right now.");
  }
}

async function loadHomeRecommendations() {
  const container = document.getElementById("home-recommendations");
  if (!container) return;

  const allProducts = await getProducts();
  const cartItems = getCart();
  const viewedItems = getRecentlyViewed();
  const recommendations = buildRecommendations(allProducts, {
    limit: 6,
    seedIds: [...cartItems, ...viewedItems],
  });
  const copyElement = document.getElementById("home-recommendation-copy");

  if (copyElement) {
    copyElement.innerText = getRecommendationReason(cartItems, viewedItems, null);
  }

  renderProductCards(container, recommendations, "Recommendations will appear as you browse products.");
}

async function loadCartRecommendations() {
  const container = document.getElementById("cart-recommendations");
  if (!container) return;

  const allProducts = await getProducts();
  const cartItems = getCart();
  const viewedItems = getRecentlyViewed();
  const recommendations = buildRecommendations(allProducts, {
    limit: 4,
    seedIds: [...cartItems, ...viewedItems],
  });
  const copyElement = document.getElementById("cart-recommendation-copy");

  if (copyElement) {
    copyElement.innerText = cartItems.length
      ? "Customers often add these items with products already in your cart."
      : "Add products to your cart to unlock more relevant suggestions.";
  }

  renderProductCards(container, recommendations, "Recommendations will appear here as you shop.");
}

function refreshCartRecommendations() {
  if (!window.location.pathname.includes("cart.html")) return;
  loadCartRecommendations();
}

function setupLoginForm() {
  const form = document.getElementById("login-form");
  const message = document.getElementById("login-message");

  if (!form || !message) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      message.innerText = "Please enter email and password.";
      return;
    }

    try {
      const result = isHttpMode()
        ? await fetchJson(getApiUrl("/api/login"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          })
        : createDemoLoginResponse(email);

      message.innerText = result.message;

      if (result.user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(result.user));
      }
    } catch (error) {
      const fallbackResult = createDemoLoginResponse(email);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(fallbackResult.user));
      message.innerText = "Backend is unavailable, so demo login was used instead.";
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  updateCartCount();
  setupLoginForm();

  if (document.getElementById("products-container")) {
    const allProducts = await getProducts();
    populateCategoryFilter(allProducts);

    const requestedCategory = new URLSearchParams(window.location.search).get("category");
    const categoryFilter = document.getElementById("category-filter");

    if (categoryFilter && requestedCategory && [...categoryFilter.options].some((option) => option.value === requestedCategory)) {
      categoryFilter.value = requestedCategory;
    }

    applyProductFilters();
  }

  if (document.getElementById("home-recommendations")) {
    loadHomeRecommendations();
  }

  if (window.location.pathname.includes("cart.html")) {
    loadCart();
    loadCartRecommendations();
  }

  if (window.location.pathname.includes("product-detail.html")) {
    loadProductDetail();
  }
});
