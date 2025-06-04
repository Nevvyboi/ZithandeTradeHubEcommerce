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

document.getElementById("wishlistBtn").addEventListener("click", function(e) {
    e.preventDefault();
    const wishlistCount = parseInt(document.querySelector(".wishlistCount").textContent);
    if (wishlistCount === 0) {
        document.getElementById("emptyWishlistPopup").style.display = "flex";
    } else {
        window.location.href = "/wishlist"; 
    }
});
document.getElementById("cartBtn").addEventListener("click", function(e) {
    e.preventDefault();
    const cartCount = parseInt(document.querySelector(".cartCount").textContent);
    if (cartCount === 0) {
        document.getElementById("emptyCartPopup").style.display = "flex";
    } else {
        window.location.href = "/cart";
    }
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

function loadProducts(products) {
    const container = document.querySelector('.productsGrid');
    container.innerHTML = '';

    const categoryMap = {1:'Electronics', 2:'Fashion', 3:'Home & Garden', 4:'Gaming', 5:'Health & Fitness'};

    products.forEach(product => {
        const isInWishlist = wishlistProductIds.includes(product.id);
        const isInCart = cartProductIds.includes(product.id);

        const card = document.createElement('div');
        card.className = 'productCard';

        card.innerHTML = `
            <div class="imageWrapper">
                <img src="${product.image}" alt="${product.name}" />
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
        container.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', () => {

    Promise.all([
        fetch('http://localhost:3000/api/all-products').then(res => res.json()),
        fetch(`http://localhost:3000/api/wishlist/items/${encodeURIComponent(userEmail)}`).then(res => res.json()),
        fetch(`http://localhost:3000/api/cart/items/${encodeURIComponent(userEmail)}`).then(res => res.json())
    ])
    .then(([products, wishlistData, cartData]) => {
        allProducts = products;
        wishlistProductIds = wishlistData.items.map(item => item.id);
        cartProductIds = cartData.items.map(item => item.id);
        loadProducts(allProducts);
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
                    alert(`No products found in ${categoryName} category`);
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

        if (selectedSort === "price-low") {
            sortedProducts.sort((a, b) => a.price - b.price);
        } else if (selectedSort === "price-high") {
            sortedProducts.sort((a, b) => b.price - a.price);
        } else if (selectedSort === "newest") {
            sortedProducts.sort((a, b) => b.id - a.id);
        }

        loadProducts(sortedProducts);
    });
});

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

