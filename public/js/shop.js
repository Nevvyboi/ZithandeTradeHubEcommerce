const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.navLinks');
if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => navLinks.classList.toggle('active'));
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

const wishlistBtn = document.getElementById("wishlistBtn");
if (wishlistBtn) {
    wishlistBtn.addEventListener("click", function(e) {
        e.preventDefault();

        const loggedIn = getCookie('loggedIn');
        if (loggedIn !== 'true') {
            const loginPopup = document.getElementById("loginRequiredPopup");
            if (loginPopup) loginPopup.style.display = "flex";
            return;
        }

        const wishlistCount = parseInt(document.querySelector(".wishlistCount")?.textContent || "0");
        if (wishlistCount === 0) {
            const popup = document.getElementById("emptyWishlistPopup");
            if (popup) popup.style.display = "flex";
        } else {
            window.location.href = "profile.html#wishlist";
        }
    });
}

const cartBtn = document.getElementById("cartBtn");
if (cartBtn) {
    cartBtn.addEventListener("click", function(e) {
        e.preventDefault();

        const loggedIn = getCookie('loggedIn');
        if (loggedIn !== 'true') {
            const loginPopup = document.getElementById("loginRequiredPopup");
            if (loginPopup) loginPopup.style.display = "flex";
            return;
        }

        const cartCount = parseInt(document.querySelector(".cartCount").textContent);
        if (cartCount === 0) {
            const popup = document.getElementById("emptyCartPopup");
            if (popup) popup.style.display = "flex";
        } else {
            window.location.href = "cart.html";
        }
    });
}

document.querySelectorAll(".popupCloseBtn, .popupOverlay").forEach(element => {
    element.addEventListener("click", function(e) {
        if (e.target.classList.contains("popupCloseBtn") || e.target.classList.contains("popupOverlay")) {
            const emptyWishlist = document.getElementById("emptyWishlistPopup");
            const emptyCart = document.getElementById("emptyCartPopup");
            const notLoggedIn = document.getElementById('loginRequiredPopup');
            const noCategory = document.getElementById('generalAlertPopup');
            
            if (emptyWishlist) emptyWishlist.style.display = "none";
            if (emptyCart) emptyCart.style.display = "none";
            if (notLoggedIn) notLoggedIn.style.display = "none";
            if (noCategory) noCategory.style.display = "none";
        }
    });
});

const profileLink = document.getElementById('profileLink');
if (profileLink) {
    profileLink.addEventListener('click', function (e) {
        e.preventDefault();
        const loggedIn = getCookie('loggedIn');
        const accountType = getCookie('accountType');
        if (loggedIn === 'true') {
            window.location.href = accountType === 'seller' ? 'seller.html' : 'profile.html';
        } else {
            window.location.href = 'auth.html';
        }
    });
}

let allProducts = [];
let wishlistProductIds = [];
let cartProductIds = [];
let userEmail = getCookie("userEmail") || "guest@example.com";

function loadProducts(products, userEmail, wishlistProductIds, cartProductIds) {
    wishlistProductIds = Array.isArray(wishlistProductIds) ? wishlistProductIds : [];
    cartProductIds = Array.isArray(cartProductIds) ? cartProductIds : [];

    const container = document.querySelector('.productsGrid');
    container.innerHTML = '';

    const categoryMap = {1: "Electronics", 2: "Fashion", 3: "Home & Garden", 4: "Gaming", 5: "Health & Fitness"};

    products.forEach(product => {
        const isInWishlist = wishlistProductIds.includes(product.id);
        const isInCart = cartProductIds.includes(product.id);

        const card = document.createElement('div');
        card.className = 'productCard';
        card.dataset.productId = product.id;

        card.innerHTML = `
            <div class="imageWrapper">
                <img src="${product.image}" alt="${product.name}">
                <div class="actionIcons">
                    <button class="wishlistBtn ${isInWishlist ? 'active' : ''}" data-id="${product.id}">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="cartBtn ${isInCart ? 'active' : ''}" data-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                </div>
            </div>
            <div class="productContent">
                <div class="productCategory">${categoryMap[product.category] || 'Category'}</div>
                <h4 class="productName">${product.name}</h4>
                <div class="priceRow">
                    <span class="productPrice">R${product.price}</span>
                </div>
            </div>
        `;

        card.addEventListener('click', function(e) {
            if (!e.target.closest('.wishlistBtn') && !e.target.closest('.cartBtn')) {
                window.location.href = `/product.html?id=${product.id}`;
            }
        });

        container.appendChild(card);
    });

    setupDelegation(userEmail);
}


document.addEventListener('DOMContentLoaded', () => {

    Promise.all([
        fetch('/api/all-products').then(res => res.json()),
        fetch(`/api/wishlist/items/${encodeURIComponent(userEmail)}`).then(res => res.json()),
        fetch(`/api/cart/items/${encodeURIComponent(userEmail)}`).then(res => res.json())
    ])
    .then(([products, wishlistData, cartData]) => {
        allProducts = products;
        wishlistProductIds = wishlistData.items.map(item => item.id);
        cartProductIds = cartData.items.map(item => item.id);
        loadProducts(products, userEmail, wishlistProductIds, cartProductIds);
        updateCounts(userEmail);
    })
    .catch(err => console.error("Error loading products:", err));

    const categoryLinks = document.querySelectorAll('.categoryList li a');

    categoryLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();

            const categoryId = link.dataset.id;
            const categoryName = link.textContent.trim();

            try {
                const productsRes = await fetch(`/api/productsByCategoryId/${categoryId}`);
                const products = await productsRes.json();

                if (products.length === 0) {
                    showGeneralAlert("No Products Found", `No products found in ${categoryName} category.`);
                    return;
                }

                renderProducts(products);
            } catch (err) {
                console.error("Error:", err);
                alert("An error occurred.");
            }
        });
    });

    const viewBtns = document.querySelectorAll('.viewBtn');
    const productsGrid = document.querySelector('.productsGrid');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            if (this.dataset.view === 'grid') {
                productsGrid.classList.remove('listView');
            } else {
                productsGrid.classList.add('listView');
            }
        });
    });

    document.getElementById("sort").addEventListener("change", function() {
        const selectedSort = this.value;
        let sortedProducts = [...allProducts];
        console.log(sortedProducts);
        if (selectedSort === "price-low") {
            sortedProducts.sort((a, b) => a.price - b.price);
        } else if (selectedSort === "price-high") {
            sortedProducts.sort((a, b) => b.price - a.price);
        } else if (selectedSort === "newest") {
            sortedProducts.sort((a, b) => b.id - a.id);
        }

        loadProducts(sortedProducts, wishlistProductIds, cartProductIds);
    });
});

function showGeneralAlert(title, message) {
    const popup = document.getElementById("generalAlertPopup");
    const popupTitle = document.getElementById("alertPopupTitle");
    const popupMessage = document.getElementById("alertPopupMessage");

    if (popup && popupTitle && popupMessage) {
        popupTitle.textContent = title;
        popupMessage.textContent = message;
        popup.style.display = "flex";
    }
}

function closeGeneralAlertPopup() {
    const popup = document.getElementById("generalAlertPopup");
    if (popup) popup.style.display = "none";
}

function setupDelegation(userEmail) {
    const container = document.querySelector('.productsGrid');

    container.addEventListener('click', async (e) => {
        const wishlistBtn = e.target.closest('.wishlistBtn');
        const cartBtn = e.target.closest('.cartBtn');

        if (wishlistBtn) {
            e.preventDefault();
            e.stopPropagation();

            if (userEmail === "guest@example.com") {
                document.getElementById("loginRequiredPopup").style.display = "flex";
                return;
            }

            const productId = wishlistBtn.dataset.id;

            const response = await fetch('/api/wishlist/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userEmail, productId: parseInt(productId) })
            });

            const result = await response.json();
            wishlistBtn.classList.toggle('active', result.inWishlist);
            updateCounts(userEmail);
        }

        if (cartBtn) {
            e.preventDefault();
            e.stopPropagation();

            if (userEmail === "guest@example.com") {
                document.getElementById("loginRequiredPopup").style.display = "flex";
                return;
            }

            const productId = cartBtn.dataset.id;

            const response = await fetch('/api/cart/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userEmail, productId: parseInt(productId) })
            });

            const result = await response.json();
            cartBtn.classList.toggle('active', result.inCart);
            updateCounts(userEmail);
        }
    });
}

function updateCounts(userEmail) {
    fetch(`/api/wishlist/count/${encodeURIComponent(userEmail)}`)
        .then(res => res.json())
        .then(data => {
            const wishlistCountElement = document.querySelector('.wishlistCount');
            if (wishlistCountElement) {
                wishlistCountElement.textContent = data.count || 0;
            }
        })
        .catch(err => {
            console.error('Error updating wishlist count:', err);
        });

    fetch(`/api/cart/count/${encodeURIComponent(userEmail)}`)
        .then(res => res.json())
        .then(data => {
            const cartCountElement = document.querySelector('.cartCount');
            if (cartCountElement) {
                cartCountElement.textContent = data.count || 0;
            }
        })
        .catch(err => {
            console.error('Error updating cart count:', err);
        });
}

function bufferToBase64(buffer) {
    const binary = buffer.reduce((data, byte) => data + String.fromCharCode(byte), '');
    return window.btoa(binary);
}

function renderProducts(products) {
    const productsGrid = document.querySelector('.productsGrid');
    productsGrid.innerHTML = '';

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'productCard';
        const base64Image = bufferToBase64(product.image.data);
        const image = `data:image/jpeg;base64,${base64Image}`;

        card.innerHTML = `
            <div class="imageWrapper">
                <img src="${image}" alt="${product.name}" />
            </div>
            <div class="productContent">
                <h4 class="productName">${product.name}</h4>
                <div class="priceRow">
                    <span class="productPrice">R${product.price}</span>
                </div>
            </div>
        `;

        productsGrid.appendChild(card);
    });
}

