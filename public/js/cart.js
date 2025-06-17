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
          
          if (emptyWishlist) emptyWishlist.style.display = "none";
          if (emptyCart) emptyCart.style.display = "none";
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
            renderCartItems(data.items);
            attachRemoveListeners();
            calculateCartTotals(data.items);
            updateCounts(userEmail);
        })
        .catch(err => console.error("Error fetching cart items:", err));
});

function renderCartItems(items) {
    const cartContainer = document.getElementById("cartItems");
    cartContainer.innerHTML = "";

    items.forEach(item => {
        const itemTotal = (item.price * item.quantity).toFixed(2);

        const cartItemHTML = `
            <div class="cartItem" data-id="${item.id}">
                <div class="cartProduct">
                    <div class="productImage">
                        <img src="${item.image}" />
                    </div>
                    <div class="productInfo">
                        <h3 class="productTitle">${item.name}</h3>
                    </div>
                </div>
                <div class="cartPrice">R${item.price}</div>
                <div class="cartQuantity">
                    <div class="quantitySelector">
                        <button class="quantityBtn minus"><i class="fas fa-minus"></i></button>
                        <input type="number" value="${item.quantity}" min="1" />
                        <button class="quantityBtn plus"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
                <div class="cartTotal">R${itemTotal}</div>
                <div class="cartRemove">
                    <button class="removeBtn"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
        cartContainer.insertAdjacentHTML("beforeend", cartItemHTML);
    });
    attachQuantityListeners();
}

function attachQuantityListeners() {
    const cartItems = document.querySelectorAll(".cartItem");

    cartItems.forEach(cartItem => {
        const quantityInput = cartItem.querySelector("input");
        const minusBtn = cartItem.querySelector(".minus");
        const plusBtn = cartItem.querySelector(".plus");
        const price = parseFloat(cartItem.querySelector(".cartPrice").textContent.replace("R", ""));
        const totalElement = cartItem.querySelector(".cartTotal");
        const itemId = cartItem.getAttribute("data-id");

        function updateTotal() {
            const quantity = parseInt(quantityInput.value);
            const newTotal = (price * quantity).toFixed(2);
            totalElement.textContent = `R${newTotal}`;
            recalculateCartTotals();
            
            updateQuantityInDatabase(itemId, quantity);
        }

        minusBtn.addEventListener("click", () => {
            let quantity = parseInt(quantityInput.value);
            if (quantity > 1) {
                quantity--;
                quantityInput.value = quantity;
                updateTotal();
            }
        });

        plusBtn.addEventListener("click", () => {
            let quantity = parseInt(quantityInput.value);
            quantity++;
            quantityInput.value = quantity;
            updateTotal();
        });

        quantityInput.addEventListener("input", () => {
            let quantity = parseInt(quantityInput.value);
            if (isNaN(quantity) || quantity < 1) {
                quantityInput.value = 1;
            }
            updateTotal();
        });
    });
}


async function updateQuantityInDatabase(productId, quantity) {
    const userEmail = getCookie("userEmail");

    await fetch('/api/cart/update-quantity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail, productId: parseInt(productId), quantity: parseInt(quantity) })
    });
}

function recalculateCartTotals() {
    const cartItems = document.querySelectorAll(".cartItem");
    let subtotal = 0;

    cartItems.forEach(cartItem => {
        const price = parseFloat(cartItem.querySelector(".cartPrice").textContent.replace("R", ""));
        const quantity = parseInt(cartItem.querySelector("input").value);
        subtotal += price * quantity;
    });

    const tax = subtotal * 0.14;
    const total = subtotal + tax;

    document.getElementById("subtotal").textContent = `R${subtotal.toFixed(2)}`;
    document.getElementById("tax").textContent = `R${tax.toFixed(2)}`;
    document.getElementById("total").textContent = `R${total.toFixed(2)}`;
}

function attachRemoveListeners() {
    const removeButtons = document.querySelectorAll(".removeBtn");
    removeButtons.forEach((btn, index) => {
        btn.addEventListener("click", () => {
            const itemId = btn.closest(".cartItem").dataset.id;
            handleRemoveFromCart(itemId);
        });
    });
}

function calculateCartTotals(items) {
    let subtotal = 0;
    items.forEach(item => {
        subtotal += item.price * item.quantity; 
    });

    const tax = subtotal * 0.14; 
    const total = subtotal + tax;

    document.getElementById("subtotal").textContent = `R${subtotal.toFixed(2)}`;
    document.getElementById("tax").textContent = `R${tax.toFixed(2)}`;
    document.getElementById("total").textContent = `R${total.toFixed(2)}`;
}

async function handleRemoveFromCart(productId) {
    try {
        const userEmail = decodeURIComponent(getCookie("userEmail"));

        const response = await fetch(`/api/cart/remove?userEmail=${encodeURIComponent(userEmail)}&productId=${productId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error("Failed to remove item");
        }

        window.location.reload();
    } catch (err) {
        console.error("Error removing cart item:", err);
    }
}

function updateCounts(userEmail) {
    fetch(`/api/wishlist/count/${encodeURIComponent(userEmail)}`)
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

document.getElementById("checkoutButton").addEventListener("click", function (e) {
    e.preventDefault();

    const provinceSelect = document.querySelector("select");
    const selectedProvince = provinceSelect.value;

    if (!selectedProvince || selectedProvince === "Select Province") {
        showProvincePopup();
        return;
    }

    window.location.href = "checkout.html";
});

function showProvincePopup() {
    const popup = document.getElementById("selectProvincePopup");
    if (popup) {
        popup.style.display = "flex";
    }
}

const popupCloseBtn = document.querySelector("#selectProvincePopup .popupCloseBtn");
if (popupCloseBtn) {
    popupCloseBtn.addEventListener("click", () => {
        document.getElementById("selectProvincePopup").style.display = "none";
    });
}