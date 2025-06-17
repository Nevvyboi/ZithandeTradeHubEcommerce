const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.navLinks');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

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
            
            if (emptyWishlist) emptyWishlist.style.display = "none";
            if (emptyCart) emptyCart.style.display = "none";
            if (notLoggedIn) notLoggedIn.style.display = "none";
        }
    });
});

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
  
document.getElementById('profileLink').addEventListener('click', function (e) {
    e.preventDefault();
  
    const loggedIn = getCookie('loggedIn');
  
    if (loggedIn === 'true') {
      window.location.href = 'profile.html';
    } else {
      window.location.href = 'auth.html';
    }
});

const header = document.querySelector('.header');
let lastScroll = 0;

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
  
  document.addEventListener('DOMContentLoaded', () => {
    const userEmail = getCookie("userEmail") || "guest@example.com";
    if (userEmail !== "guest@example.com") {
        updateCounts(userEmail);
    }
});

document.getElementById('trackingForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const orderNumber = document.getElementById('orderNumber').value.trim();
    const email = document.getElementById('emailAddress').value.trim();
    const resultDiv = document.getElementById('trackingResult');

    resultDiv.innerHTML = "Loading tracking information...";

    // Replace this with your real backend endpoint
    fetch(`/api/track-order?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`)
        .then(res => {
            if (!res.ok) throw new Error("Order not found");
            return res.json();
        })
        .then(data => {
            resultDiv.innerHTML = `
                <h3>Order Status: ${data.status}</h3>
                <p><strong>Order ID:</strong> ${data.orderId}</p>
                <p><strong>Items:</strong></p>
                <ul>
                    ${data.items.map(item => `<li>${item.name} x ${item.quantity}</li>`).join("")}
                </ul>
                <p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
            `;
        })
        .catch(err => {
            showTrackingPopup("Order Not Found", "We couldn’t find an order matching that number and email.", "fa-times-circle");
});

});

// Reusable popup handler
function showTrackingPopup(title, message, iconClass = "fa-info-circle") {
    const popup = document.getElementById("trackingPopup");
    const popupTitle = document.getElementById("popupTitle");
    const popupMessage = document.getElementById("popupMessage");
    const popupIcon = document.getElementById("popupIcon");

    popupTitle.textContent = title;
    popupMessage.textContent = message;
    popupIcon.className = `fas ${iconClass}`;

    popup.style.display = "flex";
}

// Close popup when clicking on overlay or close button
document.querySelectorAll(".popupCloseBtn, #trackingPopup").forEach(el => {
    el.addEventListener("click", function (e) {
        if (e.target.classList.contains("popupCloseBtn") || e.target.id === "trackingPopup") {
            document.getElementById("trackingPopup").style.display = "none";
        }
    });
});
