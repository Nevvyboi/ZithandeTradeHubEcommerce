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
      .then(stats => {
        console.log(stats);
    
        const profileNameEl = document.getElementById('profileName');
        const statValueEl = document.getElementById('statValue');
        const totalRevenueEl = document.getElementById('totalRevenue');
        const totalReviewsEl = document.getElementById('totalReviews');
    
        if (profileNameEl) profileNameEl.textContent = stats.fullName;
        if (statValueEl) statValueEl.textContent = stats.productCount;
        if (totalRevenueEl) totalRevenueEl.textContent = stats.totalRevenue;
        if (totalReviewsEl) totalReviewsEl.textContent = stats.totalReviews;
      })
      .catch(err => console.error("Error loading seller stats:", err));
  });

function getStarHTML(rating) {
  const filledStar = '<i class="fas fa-star" style="color: gold;"></i>';
  const emptyStar = '<i class="far fa-star" style="color: #ccc;"></i>';
  let html = '';

  for (let i = 1; i <= 5; i++) {
    html += i <= Math.round(rating) ? filledStar : emptyStar;
  }

  return html;
}

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
                <div class="productSales">${product.sales} order(s)</div>
                <div class="productRating">
                    ${getStarHTML(product.rating)}
                    <span class="reviewCount">(${product.totalReviews} review${product.totalReviews !== 1 ? 's' : ''})</span>
                </div>
                <button class="updateProductBtn" data-id="${product.id}">Update</button>
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

    document.querySelectorAll('.updateProductBtn').forEach(button => {
        button.addEventListener('click', function () {
            const productId = this.dataset.id;
            openUpdateModal(productId);
        });
    });
}

function deleteProduct(productId) {
  fetch(`/api/products/${productId}`, {
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

function openUpdateModal(productId) {
    fetch(`/api/products/${productId}`)
        .then(res => res.json())
        .then(product => {
            document.getElementById('updateProductId').value = product.id;
            document.getElementById('updateProductName').value = product.name;
            document.getElementById('updateProductPrice').value = product.price;
            document.getElementById('updateProductStock').value = product.stock || 0;
            document.getElementById('updateProductDescription').value = product.description || '';
            
            const imagePreview = document.getElementById('currentProductImage');
            imagePreview.src = `/api/product-image/${product.id}`;

            document.getElementById('updateProductModal').style.display = 'flex';
        })
        .catch(err => console.error("Error fetching product details:", err));
}

function closeUpdateModal() {
    document.getElementById('updateProductModal').style.display = 'none';
}

document.getElementById('updateProductForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const productId = document.getElementById('updateProductId').value;

    const updatedProduct = {
        name: document.getElementById('updateProductName').value,
        price: parseFloat(document.getElementById('updateProductPrice').value),
        stock: parseInt(document.getElementById('updateProductStock').value),
        description: document.getElementById('updateProductDescription').value,
        image: null
    };

    const fileInput = document.getElementById('updateProductImage');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onloadend = function () {
            updatedProduct.image = reader.result.split(',')[1]; 
            sendProductUpdate(productId, updatedProduct);
        };
        reader.readAsDataURL(file); 
    } else {
        sendProductUpdate(productId, updatedProduct);
    }
});

function sendProductUpdate(productId, product) {
    fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(product)
    })
    .then(res => {
        if (!res.ok) throw new Error('Update failed');
        return res.json();
    })
    .then(() => {
        alert('Product updated successfully!');
        closeUpdateModal();
        location.reload();
    })
    .catch(err => {
        console.error("Error updating product:", err);
        alert('Failed to update product.');
    });
}

function groupOrdersById(orders) {
  const grouped = {};
  orders.forEach(order => {
    if (!grouped[order.orderId]) {
      grouped[order.orderId] = {
        ...order,
        products: []
      };
    }
    grouped[order.orderId].products.push(order.productName);
  });

  return Object.values(grouped);
}

document.addEventListener("DOMContentLoaded", () => {
    fetch("/seller/orders", { credentials: "include" })
    .then(res => res.json())
    .then(orders => {
        const groupedOrders = groupOrdersById(orders);
        const tbody = document.getElementById("ordersBody");
        tbody.innerHTML = "";

        groupedOrders.forEach(order => {
        const productList = order.products.join(", ");
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>#${order.orderId}</td>
            <td>${order.orderDate}</td>
            <td>${order.buyerName}</td>
            <td>${productList}</td>
            <td>R${Number(order.price).toFixed(2)}</td>
            <td>
            <select class="statusSelect status-${order.status}" data-order-id="${order.orderId}">
                <option ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                <option ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                <option ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                <option ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                <option ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
            </td>
            <td><button class="updateBtn" data-order-id="${order.orderId}">Update</button></td>
        `;
        tbody.appendChild(row);
        });

      document.querySelectorAll(".updateBtn").forEach(button => {
        button.addEventListener("click", () => {
          const orderId = button.dataset.orderId;
          console.log(orderId);
          const status = document.querySelector(`select[data-order-id="${orderId}"]`).value;
          fetch(`/seller/orders/${orderId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
          }).then(() => location.reload());
        });
      });
    });
});