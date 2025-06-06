const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.navLinks');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
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

const footerWishlistBtn = document.getElementById("footerWishlistLink");
if (footerWishlistBtn) {
    footerWishlistBtn.addEventListener("click", function(e) {
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

document.querySelectorAll(".popupCloseBtn, .popupOverlay").forEach(element => {
    element.addEventListener("click", function(e) {
        if (e.target.classList.contains("popupCloseBtn") || e.target.classList.contains("popupOverlay")) {
            const emptyWishlist = document.getElementById("emptyWishlistPopup");
            const emptyCart = document.getElementById("emptyCartPopup");
            const notLoggedIn = document.getElementById('loginRequiredPopup');
            const reqquiredFields = document.getElementById('validationPopup');
            
            if (emptyWishlist) emptyWishlist.style.display = "none";
            if (emptyCart) emptyCart.style.display = "none";
            if (notLoggedIn) notLoggedIn.style.display = "none";
            if (reqquiredFields) reqquiredFields.style.display='none';
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

document.addEventListener("DOMContentLoaded", () => {
    const userEmail = getCookie("userEmail");
    fetch(`/api/cart/items/${encodeURIComponent(userEmail)}`)
        .then(res => res.json())
        .then(() => updateCounts(userEmail))
        .catch(err => console.error("Error fetching cart items:", err));
});

function updateCounts(userEmail) {
    fetch(`/api/wishlist/count/${encodeURIComponent(userEmail)}`)
        .then(res => res.json())
        .then(data => {
            document.querySelector('.wishlistCount').textContent = data.count || 0;
        })
        .catch(err => console.error('Error updating wishlist count:', err));

    fetch(`/api/cart/count/${encodeURIComponent(userEmail)}`)
        .then(res => res.json())
        .then(data => {
            document.querySelector('.cartCount').textContent = data.count || 0;
        })
        .catch(err => console.error('Error updating cart count:', err));
}

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    try {
        const res = await fetch(`/api/products/${productId}`);
        const product = await res.json();

        document.getElementById("productName").textContent = product.name;
        document.getElementById("productPrice").textContent = `R${product.price}`;
        document.getElementById("productDescription").textContent = product.description;
        document.getElementById("productImage").src = `data:image/jpeg;base64,${product.image}`;
    } catch (err) {
        console.error("Error loading product details:", err);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const userEmail = getCookie("userEmail") || "guest@example.com";
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    const wishlistBtn = document.getElementById("addToWishlistBtn");
    const cartBtn = document.getElementById("addToCartBtn");

    if (wishlistBtn) {
        wishlistBtn.addEventListener("click", async () => {
            if (userEmail === "guest@example.com") {
                document.getElementById("loginRequiredPopup").style.display = "flex";
                return;
            }

            const response = await fetch('/api/wishlist/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userEmail, productId: parseInt(productId) })
            });

            const result = await response.json();
            if (result.inWishlist) {
                showPopup("Product added to wishlist!");
            } else {
                showPopup("Product removed from wishlist.");
            }
            updateCounts(userEmail);
        });
    }

    if (cartBtn) {
        cartBtn.addEventListener("click", async () => {
            if (userEmail === "guest@example.com") {
                document.getElementById("loginRequiredPopup").style.display = "flex";
                return;
            }

            const response = await fetch('/api/cart/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userEmail, productId: parseInt(productId) })
            });

            const result = await response.json();
            if (result.inCart) {
                showPopup("Product added to cart!");
            } else {
                showPopup("Product removed from cart.");
            }
            updateCounts(userEmail);
        });
    }
});

function showPopup(message) {
    const overlay = document.createElement('div');
    overlay.classList.add('popupOverlay');
    overlay.innerHTML = `
        <div class="popupCard newsletterPopup">
            <div class="popupIcon success">
                <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
            </div>
            <h3>${message}</h3>
            <button class="popupActionBtn">OK</button>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.style.display = 'flex';
    overlay.querySelector('.popupActionBtn').addEventListener('click', () => {
        overlay.remove();
    });
}

document.querySelector('.btnSubmitReview').addEventListener('click', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const userEmail = decodeURIComponent(getCookie("userEmail"));

    const rating = document.querySelector('input[name="rating"]:checked')?.value;
    const reviewText = document.getElementById("reviewText").value.trim();

    if (!userEmail) {
        const loginPopup = document.getElementById("loginRequiredPopup");
        if (loginPopup) loginPopup.style.display = "flex";
        return
    }

    if (!rating || !reviewText) {
        showPopup("Please complete both rating and review.");
        return;
    }

    try {
        const res = await fetch('/api/reviews/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, userEmail, rating, review: reviewText })
        });

        if (res.status === 403) {
            return;
        }

        const data = await res.json();
        showPopup(data.message);
        loadReviews(); 
    } catch (err) {
        console.error(err);
    }
});

async function loadReviews() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    try {
        const res = await fetch(`/api/reviews/${productId}`);
        const data = await res.json();
        console.log(data);

        const reviewsContainer = document.querySelector('.reviewsList');
        reviewsContainer.innerHTML = '';

        if (data.reviews.length === 0) {
            reviewsContainer.innerHTML = '<p>No reviews yet.</p>';
            return;
        }
        data.reviews.forEach(review => {
            const reviewCard = document.createElement('div');
            reviewCard.classList.add('singleReview');
        
            reviewCard.innerHTML = `
                <div class="reviewTop">
                    <div class="reviewerName">${review.fullName}</div>
                    <div class="reviewStars">${'⭐'.repeat(review.rating)}</div>
                </div>
                <div class="reviewText">${review.review}</div>
                <div class="reviewDate">${timeAgo(review.createdAt)}</div>
            `;
        
            reviewsContainer.appendChild(reviewCard);
        });
    } catch (err) {
        console.error("Error loading reviews:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadReviews();
});

function timeAgo(date) {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHrs > 0) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
    if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    return `just now`;
}