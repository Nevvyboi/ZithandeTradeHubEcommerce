const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.navLinks');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

const newsletterForm = document.querySelector('.newsletterForm');
const newsletterPopup = document.getElementById('newsletterPopup');

if (newsletterForm && newsletterPopup) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const input = this.querySelector('input');

        newsletterPopup.style.display = 'flex';
        input.value = '';
        
        input.placeholder = 'Thanks for subscribing!';
        setTimeout(() => {
            input.placeholder = 'Your email address';
        }, 5000);
    });

const closeBtn = document.querySelector('#newsletterPopup .popupCloseBtn');
const closeNewsletterBtn = document.getElementById('closeNewsletterPopup');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            newsletterPopup.style.display = 'none';
        });
    }
    
    if (closeNewsletterBtn) {
        closeNewsletterBtn.addEventListener('click', () => {
            newsletterPopup.style.display = 'none';
        });
    }

    newsletterPopup.addEventListener('click', (e) => {
        if (e.target === newsletterPopup) {
            newsletterPopup.style.display = 'none';
        }
    });
}

const wishlistBtn = document.getElementById("wishlistBtn");
if (wishlistBtn) {
    wishlistBtn.addEventListener("click", function(e) {
        e.preventDefault();
        const wishlistCount = parseInt(document.querySelector(".wishlistCount").textContent);
        if (wishlistCount === 0) {
            const popup = document.getElementById("emptyWishlistPopup");
            if (popup) popup.style.display = "flex";
        } else {
            window.location.href = "profile.html#wishlist";
        }
    });    
}

const footerWishlistBtn = document.getElementById("footerWishlistLink");
if (footerWishlistBtn) {
    footerWishlistBtn.addEventListener("click", function(e) {
        e.preventDefault();

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
        const cartCount = parseInt(document.querySelector(".cartCount").textContent);
        if (cartCount === 0) {
            const popup = document.getElementById("emptyCartPopup");
            if (popup) popup.style.display = "flex";
        } else {
            window.location.href = "/cart";
        }
    });
}

document.querySelectorAll(".popupCloseBtn, .popupOverlay").forEach(element => {
    element.addEventListener("click", function(e) {
        if (e.target.classList.contains("popupCloseBtn") || e.target.classList.contains("popupOverlay")) {
            const emptyWishlist = document.getElementById("emptyWishlistPopup");
            const emptyCart = document.getElementById("emptyCartPopup");
            const newsletter = document.getElementById('newsletterPopup');
            
            if (emptyWishlist) emptyWishlist.style.display = "none";
            if (emptyCart) emptyCart.style.display = "none";
            if (newsletter) newsletter.style.display = "none";
        }
    });
});

document.querySelectorAll(".popupActionBtn").forEach(btn => {
    btn.addEventListener("click", function(e) {
        if (!this.closest('#newsletterPopup')) {
            window.location.href = "/products";
        }
    });
});

const header = document.querySelector('.header'); 
let lastScroll = 0;

if (header) {
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            header.classList.remove('header--hidden');
            return;
        }

        if (currentScroll > lastScroll && !header.classList.contains('header--hidden')) {
            header.classList.add('header--hidden');
        } else if (currentScroll < lastScroll && header.classList.contains('header--hidden')) {
            header.classList.remove('header--hidden');
        }
        
        lastScroll = currentScroll;
    });
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

const profileLink = document.getElementById('profileLink');
if (profileLink) {
    profileLink.addEventListener('click', function (e) {
        e.preventDefault();

        const loggedIn = getCookie('loggedIn');
        const accountType = getCookie('accountType');

        if (loggedIn === 'true') {
            if (accountType === 'seller') {
                window.location.href = 'seller.html';
            } else {
                window.location.href = 'profile.html';
            }
        } else {
            window.location.href = 'auth.html';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded.');

    const userEmail = getCookie("userEmail") || "guest@example.com";

    if (userEmail !== "guest@example.com") {
        Promise.all([
            fetch('http://localhost:3000/api/featured-products').then(res => res.json()),
            fetch(`http://localhost:3000/api/wishlist/items/${encodeURIComponent(userEmail)}`).then(res => res.json()),
            fetch(`http://localhost:3000/api/cart/items/${encodeURIComponent(userEmail)}`).then(res => res.json())
        ])
        .then(([products, wishlistData, cartData]) => {
            const wishlistProductIds = wishlistData.items.map(item => item.id);
            const cartProductIds = cartData.items.map(item => item.id);
            loadProducts(products, userEmail, wishlistProductIds, cartProductIds);
            updateCounts(userEmail);
        })
        .catch(err => {
            console.error("Error loading products:", err);
        });
    } else {
        fetch('http://localhost:3000/api/featured-products')
            .then(res => res.json())
            .then(products => {
                loadProducts(products, userEmail, [], []);
            })
            .catch(err => console.error("Error loading products:", err));
    }

    loadCategoryCounts();
});

function loadCategoryCounts() {
    fetch('http://localhost:3000/api/categories/counts')
        .then(res => res.json())
        .then(data => {
            const categoryMap = {
                1: "Electronics",
                2: "Fashion",
                3: "Home & Garden",
                4: "Gaming",
                5: "Health & Fitness"
            };

            const counts = {};
            Object.keys(categoryMap).forEach(catId => {
                counts[catId] = 0;
            });

            data.forEach(item => {
                counts[item.categoryId] = item.count;
            });

            Object.entries(categoryMap).forEach(([catId, catName]) => {
                const categoryCard = Array.from(document.querySelectorAll('.categoryCard')).find(card => 
                    card.querySelector('.categoryTitle')?.textContent === catName
                );

                if (categoryCard) {
                    categoryCard.querySelector('.categoryCount').textContent = `${counts[catId]} Products`;
                }
            });
        })
        .catch(err => console.error("Error loading category counts:", err));
}

function loadProducts(products, userEmail, wishlistProductIds, cartProductIds) {
    const container = document.getElementById('featuredGrid');
    if (!container) return;

    container.innerHTML = '';

    const categoryMap = {
        1: 'Jewelry',
        2: 'Clothing',
        3: 'Home Decor',
        4: 'Art',
        5: 'Electronics'
    };

    products.forEach(product => {
        const isInWishlist = wishlistProductIds.includes(product.id);
        const isInCart = cartProductIds.includes(product.id);

        const card = document.createElement('div');
        card.className = 'productCard';
        card.innerHTML = `
            <span class="badge">Featured</span>
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
            </div>`;
        container.appendChild(card);
    });

    setupDelegation(userEmail);
}

function setupDelegation(userEmail) {
    const container = document.getElementById('featuredGrid');

    if (!container) {
        console.error('Featured grid container not found for delegation');
        return;
    }

    const newContainer = container.cloneNode(true);
    container.parentNode.replaceChild(newContainer, container);

    newContainer.addEventListener('click', async (e) => {
        const wishlistBtn = e.target.closest('.wishlistBtn');
        const cartBtn = e.target.closest('.cartBtn');

        if (wishlistBtn) {
            e.preventDefault();
            e.stopPropagation();
            
            const productId = wishlistBtn.dataset.id;
            console.log(`Wishlist clicked for product: ${productId}`);

            if (!productId) {
                console.error('Product ID not found');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/api/wishlist/toggle', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userEmail, productId: parseInt(productId) })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('Wishlist toggle result:', result);

                if (result.inWishlist) {
                    wishlistBtn.classList.add('active');
                } else {
                    wishlistBtn.classList.remove('active');
                }
                
                updateCounts(userEmail);
            } catch (error) {
                console.error('Error toggling wishlist:', error);
            }
        }

        if (cartBtn) {
            e.preventDefault();
            e.stopPropagation();
            
            const productId = cartBtn.dataset.id;
            console.log(`Cart clicked for product: ${productId}`);

            if (!productId) {
                console.error('Product ID not found');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/api/cart/toggle', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userEmail, productId: parseInt(productId) })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('Cart toggle result:', result);
                
                if (result.inCart) {
                    cartBtn.classList.add('active');
                } else {
                    cartBtn.classList.remove('active');
                }
                
                updateCounts(userEmail);
            } catch (error) {
                console.error('Error toggling cart:', error);
            }
        }
    });
}

function updateCounts(userEmail) {
    fetch(`http://localhost:3000/api/wishlist/count/${encodeURIComponent(userEmail)}`)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        })
        .then(data => {
            const wishlistCountElement = document.querySelector('.wishlistCount');
            if (wishlistCountElement) {
                wishlistCountElement.textContent = data.count || 0;
            }
        })
        .catch(err => {
            console.error('Error updating wishlist count:', err);
        });

    fetch(`http://localhost:3000/api/cart/count/${encodeURIComponent(userEmail)}`)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        })
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