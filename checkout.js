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
    const userEmail = getCookie("userEmail")

    fetch(`/api/cart/items/${encodeURIComponent(userEmail)}`)
        .then(res => res.json())
        .then(data => {
            updateCounts(userEmail);
        })
        .catch(err => console.error("Error fetching cart items:", err));
});

function updateCounts(userEmail) {
    fetch(`api/wishlist/count/${encodeURIComponent(userEmail)}`)
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

    fetch(`/api/cart/count/${encodeURIComponent(userEmail)}`)
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

document.addEventListener("DOMContentLoaded", () => {
    loadCartDataFromServer();
});

async function loadCartDataFromServer() {
    try {
        const userEmail = getCookie("userEmail");  
        if (!userEmail) {
            const loginPopup = document.getElementById("loginRequiredPopup");
            if (loginPopup) loginPopup.style.display = "flex";
            return;
        }

        const encodedEmail = encodeURIComponent(userEmail);
        const response = await fetch(`/api/cart/items/${encodedEmail}`);
        const data = await response.json();

        console.log("Cart Items:", data);

        if (!data.items || data.items.length === 0) {
            alert("No items in cart.");
            return;
        }

        renderOrderSummary(data.items);

    } catch (err) {
        console.error("Failed to load cart data", err);
    }
}

function renderOrderSummary(cartItems) {
    const container = document.getElementById("orderItemsContainer");
    container.innerHTML = "";

    let subtotal = 0;

    cartItems.forEach(item => {
        const quantity = item.quantity || 1;
        const itemTotal = item.price * quantity;
        subtotal += itemTotal;

        const itemDiv = document.createElement("div");
        itemDiv.className = "summaryItem";
        itemDiv.innerHTML = `
            <div class="itemProduct">${item.name} × ${quantity}</div>
            <div class="itemTotal">R${itemTotal.toFixed(2)}</div>
        `;
        container.appendChild(itemDiv);
    });

    document.getElementById("summarySubtotal").textContent = `R${subtotal.toFixed(2)}`;

    const tax = subtotal * 0.14; 
    const total = subtotal + tax;

    document.getElementById("summaryTotal").textContent = `R${total.toFixed(2)}`;
}

document.querySelector('.placeOrder').addEventListener('click', async function() {
    const requiredFields = [
        '#first-name', '#last-name', '#street-address', '#city', 
        '#state', '#postcode', '#email', '#phone', '#terms'
    ];

    let valid = true;
    requiredFields.forEach(field => {
        const input = document.querySelector(field);
        if ((input.type === 'checkbox' && !input.checked) || (!input.value.trim())) {
            input.style.border = '2px solid red';
            valid = false;
        } else {
            input.style.border = '1px solid #ddd';
        }
    });

    if (!valid) {
        document.getElementById('validationPopup').style.display = 'flex';
        return;
    }

    document.getElementById('loadingPopup').style.display = 'flex';

    try {
        await createOrder();
        document.getElementById('loadingPopup').style.display = 'none';
        document.getElementById('successPopup').style.display = 'flex';
    } catch (err) {
        console.error('❌ Error placing order:', err);
        alert("An error occurred while placing your order.");
        document.getElementById('loadingPopup').style.display = 'none';
    }
});

async function createOrder() {
    const userEmail = decodeURIComponent(getCookie('userEmail')); 
    
    const cartRes = await fetch(`/api/cart/items/${userEmail}`);
    const cartData = await cartRes.json();

    let total = 0;
    cartData.items.forEach(item => {
        total += item.price * (item.quantity || 1);  
    });

    const billingInfo = {
        firstName: document.getElementById('first-name').value,
        lastName: document.getElementById('last-name').value,
        address: document.getElementById('street-address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zip: document.getElementById('postcode').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
    };

    const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ userEmail, cart: cartData.items, billingInfo, total })
    });

    if (!response.ok) throw new Error('Failed to place order');
}
