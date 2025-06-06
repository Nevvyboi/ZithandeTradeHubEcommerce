const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.navLinks');
        
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

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

function updateCounts(userEmail) {
  fetch(`http://localhost:3000/api/wishlist/count/${encodeURIComponent(userEmail)}`)
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

  fetch(`http://localhost:3000/api/cart/count/${encodeURIComponent(userEmail)}`)
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
