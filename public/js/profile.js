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
  
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.navLinks');
        
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});
        
const accountMenuItems = document.querySelectorAll('.accountMenu li');
const accountTabs = document.querySelectorAll('.accountTab');
        
accountMenuItems.forEach(item => {
  item.addEventListener('click', function(e) {
    e.preventDefault();
    const tabId = this.querySelector('a').getAttribute('href').substring(1);
                
    accountMenuItems.forEach(i => i.classList.remove('active'));
    this.classList.add('active');
                
    accountTabs.forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
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

document.getElementById('logoutBtn')?.addEventListener('click', function () {
  document.cookie = "loggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "accountType=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "userEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

  window.location.href = 'home.html';
});

function loadUserProfile(userEmail) {
  fetch(`http://localhost:3000/api/user-profile/${encodeURIComponent(userEmail)}`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      const userInfoElement = document.querySelector('.userInfo');
      if (userInfoElement) {
        userInfoElement.innerHTML = `
          <h3>${data.name} ${data.surname}</h3>
          <p>Member since ${data.memberSince}</p>
        `;
      }

      const dashboardGreeting = document.getElementById('dashboardGreeting');
      if (dashboardGreeting) {
        dashboardGreeting.innerHTML = `
          Hello <strong>${data.name} ${data.surname}</strong> (not <strong>${data.name} ${data.surname}</strong>? 
          <a href="#" id="profileLink">Log out</a>)
        `;

        document.getElementById('profileLink').addEventListener('click', function (e) {
          e.preventDefault();
          window.location.href = 'auth.html';
        });
      }
    })
    .catch(err => {
      console.error("Error loading user profile:", err);
    });
}

document.querySelectorAll('.dashboardCard a').forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    const targetTab = this.getAttribute('href').substring(1);

    accountMenuItems.forEach(i => i.classList.remove('active'));

    accountMenuItems.forEach(item => {
      const menuLink = item.querySelector('a');
      if (menuLink && menuLink.getAttribute('href').substring(1) === targetTab) {
        item.classList.add('active');
      }
    });

    accountTabs.forEach(tab => tab.classList.remove('active'));
    document.getElementById(targetTab).classList.add('active');
  });
});

function loadWishlist(userEmail) {
  fetch(`http://localhost:3000/api/wishlist/items/${encodeURIComponent(userEmail)}`)
    .then(res => res.json())
    .then(data => {
      const wishlistContainer = document.querySelector('.wishlistItems');
      wishlistContainer.innerHTML = '';

      if (data.items.length === 0) {
        wishlistContainer.innerHTML = '<p>Your wishlist is empty.</p>';
        return;
      }

      data.items.forEach(item => {
        const stockClass = item.stock > 0 ? 'in-stock' : 'out-of-stock';
        const stockText = item.stock > 0 ? 'In Stock' : 'Out of Stock';
        const disabled = item.stock > 0 ? '' : 'disabled';

        const wishlistItem = `
          <div class="wishlistItem" data-product-id="${item.id}">
            <div class="productImage">
              <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="productInfo">
              <h3 class="productTitle">${item.name}</h3>
              <div class="productPrice">R${item.price}</div>
              <div class="productStock ${stockClass}">${stockText}</div>
            </div>
            <div class="productActions">
              <button class="btn btnPrimary add-to-cart" ${disabled}>Add to Cart</button>
              <button class="btn btnOutline remove-item">Remove</button>
            </div>
          </div>
        `;

        wishlistContainer.insertAdjacentHTML('beforeend', wishlistItem);
      });

      wishlistContainer.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function() {
          const productId = this.closest('.wishlistItem').dataset.productId;
          addToCart(userEmail, productId);
        });
      });

      wishlistContainer.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
          const productId = this.closest('.wishlistItem').dataset.productId;
          removeFromWishlist(userEmail, productId, this.closest('.wishlistItem'));
        });
      });
    })
    .catch(err => {
      console.error("Error loading wishlist:", err);
    });
}

function addToCart(userEmail, productId) {
  fetch('http://localhost:3000/api/cart/toggle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userEmail, productId })
  })
  .then(res => res.json())
  .then(result => {
    console.log(result.message);
    alert('Item added to cart!');
    updateCounts(userEmail);
  })
  .catch(err => console.error('Error adding to cart:', err));
}

function removeFromWishlist(userEmail, productId, wishlistItemElement) {
  fetch('http://localhost:3000/api/wishlist/toggle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userEmail, productId })
  })
  .then(res => res.json())
  .then(result => {
    console.log(result.message);
    wishlistItemElement.remove(); 

    updateCounts(userEmail);
  })
  .catch(err => console.error('Error removing from wishlist:', err));
}


function updateCounts(userEmail) {
  fetch(`http://localhost:3000/api/wishlist/count/${encodeURIComponent(userEmail)}`)
    .then(res => res.json())
    .then(data => {
      const wishlistCountElement = document.querySelector('.wishlistCount');
      if (wishlistCountElement) {
        wishlistCountElement.textContent = data.count || 0;
      }
    })
    .catch(err => console.error('Error updating wishlist count:', err));

  fetch(`http://localhost:3000/api/cart/count/${encodeURIComponent(userEmail)}`)
    .then(res => res.json())
    .then(data => {
      const cartCountElement = document.querySelector('.cartCount');
      if (cartCountElement) {
        cartCountElement.textContent = data.count || 0;
      }
    })
    .catch(err => console.error('Error updating cart count:', err));
}

document.addEventListener('DOMContentLoaded', () => {
  const userEmail = getCookie("userEmail");
  const isLoggedIn = userEmail && userEmail !== "guest@example.com" && userEmail !== "examplegmail.com";

  if (isLoggedIn) {
    loadUserProfile(userEmail);
    loadWishlist(userEmail);
    updateCounts(userEmail); 
  }
});

document.addEventListener('DOMContentLoaded', () => {
  console.log('Profile DOM loaded.');

  const userEmail = getCookie("userEmail") || "guest@example.com";

  if (!userEmail || userEmail === "guest@example.com") {
    window.location.href = '/home.html';  
    return;
  }

  if (userEmail !== "guest@example.com") {
      loadUserProfile(userEmail);
      loadWishlist(userEmail);
      updateCounts(userEmail);
  }

  const hash = window.location.hash.substring(1);
  if (hash) {
      const targetTab = document.getElementById(hash);
      if (targetTab) {
          document.querySelectorAll('.accountTab').forEach(tab => tab.classList.remove('active'));
          targetTab.classList.add('active');

          document.querySelectorAll('.accountMenu li').forEach(item => item.classList.remove('active'));
          const matchingMenuItem = document.querySelector(`.accountMenu a[href="#${hash}"]`);
          if (matchingMenuItem) {
              matchingMenuItem.parentElement.classList.add('active');
          }
      }
  }
});