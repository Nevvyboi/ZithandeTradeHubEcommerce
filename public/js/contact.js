const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.navLinks');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

const faqQuestions = document.querySelectorAll('.faqQuestion');

faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
        const faqItem = question.parentElement;
        const answer = faqItem.querySelector('.faqAnswer');
        const icon = question.querySelector('i');
        
        faqItem.classList.toggle('active');
        
        if (faqItem.classList.contains('active')) {
            answer.style.display = 'block';
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
        } else {
            answer.style.display = 'none';
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
        }
    });
});

document.getElementById("contactForm").addEventListener("submit", function(e) {
    e.preventDefault(); 
    
    setTimeout(() => {
        document.getElementById("messageSubmittedPopup").style.display = "flex";

        this.reset();
    }, 800);
});

document.querySelector("#messageSubmittedPopup .popupCloseBtn").addEventListener("click", function() {
    document.getElementById("messageSubmittedPopup").style.display = "none";
});

document.getElementById("returnToHome").addEventListener("click", function() {
    window.location.href = "/";
});

document.getElementById("messageSubmittedPopup").addEventListener("click", function(e) {
    if (e.target === this) {
        this.style.display = "none";
    }
});

document.getElementById("wishlistBtn").addEventListener("click", function(e) {
    e.preventDefault();
    const wishlistCount = parseInt(document.querySelector(".wishlistCount").textContent);
    if (wishlistCount === 0) {
        document.getElementById("emptyWishlistPopup").style.display = "flex";
    } else {
        window.location.href = "/wishlist"; 
    }
});

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

document.getElementById("cartBtn").addEventListener("click", function(e) {
    e.preventDefault();
    const cartCount = parseInt(document.querySelector(".cartCount").textContent);
    if (cartCount === 0) {
        document.getElementById("emptyCartPopup").style.display = "flex";
    } else {
        window.location.href = "/cart";
    }
});

document.querySelectorAll(".popupCloseBtn, .popupOverlay").forEach(element => {
    element.addEventListener("click", function(e) {
        if (e.target.classList.contains("popupCloseBtn") || e.target.classList.contains("popupOverlay")) {
            document.getElementById("emptyWishlistPopup").style.display = "none";
            document.getElementById("emptyCartPopup").style.display = "none";
        }
    });
});

document.querySelectorAll(".popupActionBtn").forEach(btn => {
    btn.addEventListener("click", function() {
        window.location.href = "/products";
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