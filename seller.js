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


document.getElementById('logoutBtn')?.addEventListener('click', function () {
    document.cookie = "loggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "accountType=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  
    window.location.href = 'home.html';
});
  
function openModal() {
    document.getElementById('editProfileModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('editProfileModal').style.display = 'none';
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

document.addEventListener('DOMContentLoaded', () => {
  const userEmail = getCookie("userEmail") || "guest@example.com";
  const accountType = getCookie("accountType");

  if (!userEmail || userEmail === "guest@example.com" || accountType !== "seller") {
    window.location.href = '/home.html';
    return;
  }

  const decodedEmail = decodeURIComponent(userEmail);
  fetch(`/api/seller-products/${encodeURIComponent(userEmail)}`)
        .then(res => res.json())
        .then(products => {
            // Safety fallback
            if (!Array.isArray(products)) {
                console.error("Invalid products data:", products);
                products = [];
            }

            loadSellerProducts(products);
        })
        .catch(err => {
            console.error("Error fetching seller products:", err);
            loadSellerProducts([]);
        });
  fetch(`/api/sellerStats/${encodeURIComponent(userEmail)}`)
        .then(res => res.json())
        .then(data => {
            document.querySelector('.profileName').textContent = data.fullName;
            document.querySelector('.statValue').textContent = data.productCount;
        })
        .catch(err => {
            console.error("Error loading seller stats:", err);
            alert("Could not load seller data.");
        });
});

function loadSellerProducts(products) {
  const container = document.querySelector('.sellerProductsGrid');
  container.innerHTML = '';

  if (!products.length) {
      container.innerHTML = `<p>No products found for this seller.</p>`;
      return;
  }

  products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'sellerProductCard';

      card.innerHTML = `
          <div class="sellerProductImage">
              <img src="${product.image}" alt="${product.name}">
          </div>
          <div class="sellerProductInfo">
              <h4 class="productName">${product.name}</h4>
              <div class="productPrice">R${product.price}</div>
              <div class="productSales">${product.sales} sales</div>
              <div class="productRating">${product.rating}★</div>
              <button class="deleteProductBtn" data-id="${product.id}">Delete</button>
          </div>
      `;
      container.appendChild(card);
  });

  document.querySelectorAll('.deleteProductBtn').forEach(button => {
      button.addEventListener('click', function () {
          const productId = this.dataset.id;
          if (confirm("Are you sure you want to delete this product?")) {
              deleteProduct(productId);
          }
      });
  });
}

function deleteProduct(productId) {
  fetch(`/api/delete-product/${productId}`, {
      method: 'DELETE'
  })
  .then(res => {
      if (!res.ok) throw new Error("Failed to delete product.");
      return res.json();
  })
  .then(data => {
      alert("Product deleted successfully!");
      location.reload();
  })
  .catch(err => {
      console.error("Error deleting product:", err);
      alert("Error deleting product.");
  });
}
