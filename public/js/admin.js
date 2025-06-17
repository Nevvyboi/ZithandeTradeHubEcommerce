const header = document.querySelector('.header'); 
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll <= 0) {
        header?.classList?.remove('header--hidden');
        return;
    }
    if (currentScroll > lastScroll && !header?.classList?.contains('header--hidden')) {
        header?.classList?.add('header--hidden');
    } else if (currentScroll < lastScroll && header?.classList?.contains('header--hidden')) {
        header?.classList?.remove('header--hidden');
    }
    lastScroll = currentScroll;
});

document.addEventListener("DOMContentLoaded", () => {
    const accountMenuItems = document.querySelectorAll('.accountMenu li');
    const accountTabs = document.querySelectorAll('.accountTab');

    accountMenuItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const tabId = this.querySelector('a').getAttribute('href').substring(1);
            accountMenuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            accountTabs.forEach(tab => tab.classList.remove('active'));
            document.getElementById(tabId)?.classList?.add('active');
        });
    });

    loadAdminStats();
    loadAdminOrders();
    loadProducts();
    loadAccounts();
    loadReviews();
});

function loadAdminStats() {
    fetch('/api/admin/stats')
        .then(res => res.json())
        .then(data => {
            document.getElementById('totalRevenue').textContent = "R" + (parseFloat(data.revenue || 0).toFixed(2));
            document.getElementById('totalOrders').textContent = data.orders || 0;
            document.getElementById('totalProducts').textContent = data.products || 0;
        })
        .catch(err => {
            console.error("Error fetching admin stats:", err);
        });
}

async function loadAdminOrders() {
    try {
        const res = await fetch('/api/admin/orders');
        const data = await res.json();

        const adminOrdersBody = document.getElementById('adminOrdersBody');
        const noOrdersMessage = document.getElementById('noOrdersMessage');

        adminOrdersBody.innerHTML = '';

        if (!data.orders?.length) {
            noOrdersMessage.style.display = 'block';
        } else {
            noOrdersMessage.style.display = 'none';
            data.orders.forEach(order => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>#${order.id}</td>
                    <td>${order.customerName}</td>
                    <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                    <td><span class="status ${order.status.toLowerCase()}">${order.status}</span></td>
                    <td>R${order.total}</td>
                    <td><button class="deleteOrderBtn" data-id="${order.id}">Delete</button></td>
                `;
                adminOrdersBody.appendChild(row);
            });

            document.querySelectorAll('.deleteOrderBtn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const orderId = btn.dataset.id;
                    if (confirm("Are you sure you want to delete this order?")) {
                        try {
                            const res = await fetch(`/api/admin/orders/${orderId}`, { method: 'DELETE' });
                            const result = await res.json();
                            if (result.success) {
                                alert("Order deleted successfully.");
                                loadAdminOrders();
                            } else {
                                alert("Failed to delete order.");
                            }
                        } catch (err) {
                            console.error(err);
                            alert("Error deleting order.");
                        }
                    }
                });
            });
        }
    } catch (error) {
        console.error('Error loading admin orders:', error);
    }
}

async function loadProducts() {
    try {
        const response = await fetch('/api/admin/products');
        const data = await response.json();

        const tableBody = document.getElementById('productsTableBody');
        tableBody.innerHTML = '';

        data.products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.description}</td>
                <td>R${product.price}</td>
                <td>${product.stock}</td>
                <td><button class="deleteBtn" onclick="deleteProduct(${product.id})">Delete</button></td>
            `;
            tableBody.appendChild(row);
        });

    } catch (err) {
        console.error('Error loading products:', err);
    }
}

async function deleteProduct(productId) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
        const response = await fetch(`/api/admin/products/${productId}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            alert('Product deleted successfully.');
            loadProducts();
        } else {
            alert('Failed to delete product.');
        }
    } catch (err) {
        console.error('Error deleting product:', err);
    }
}

async function loadAccounts() {
    try {
        const res = await fetch('/api/admin/accounts');
        const data = await res.json();

        const buyersBody = document.querySelector('#buyersTable');
        const sellersBody = document.querySelector('#sellersTable');

        buyersBody.innerHTML = '';
        sellersBody.innerHTML = '';

        data.buyers?.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${user.id}</td>
                <td>${user.fullName}</td>
                <td>${user.email}</td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                <td><button onclick="deleteUser(${user.id})" class="deleteBtn">Delete</button></td>
            `;
            buyersBody.appendChild(row);
        });

        data.sellers?.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${user.id}</td>
                <td>${user.fullName}</td>
                <td>${user.email}</td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                <td><button onclick="deleteUser(${user.id})" class="deleteBtn">Delete</button></td>
            `;
            sellersBody.appendChild(row);
        });

    } catch (err) {
        console.error('Error loading accounts:', err);
    }
}

async function deleteUser(userId) {
    if (!confirm("Are you sure you want to delete this account?")) return;
    try {
        const res = await fetch(`/api/admin/accounts/${userId}`, { method: 'DELETE' });
        const data = await res.json();
        alert(data.message);
        loadAccounts();
    } catch (err) {
        console.error('Error deleting user:', err);
    }
}

async function loadReviews() {
    try {
        const res = await fetch('/api/admin/reviews');
        const reviews = await res.json();

        const reviewsTableBody = document.getElementById('reviewsTableBody');
        reviewsTableBody.innerHTML = '';

        reviews.forEach(review => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${review.productName}</td>
                <td>${review.review}</td>
                <td>${'⭐'.repeat(review.rating)}</td>
                <td>${new Date(review.createdAt).toLocaleDateString()}</td>
                <td><button class="deleteBtn" onclick="deleteReview(${review.id})">Delete</button></td>
            `;
            reviewsTableBody.appendChild(row);
        });

    } catch (err) {
        console.error('Error loading reviews:', err);
    }
}

async function deleteReview(id) {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
        const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });

        if (res.ok) {
            loadReviews();
        } else {
            console.error('Failed to delete review');
        }
    } catch (err) {
        console.error('Error deleting review:', err);
    }
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

const isLoggedIn = getCookie("isAdmin");

if (!isLoggedIn || isLoggedIn !== "true") {
    window.location.href = "auth.html";
}

document.getElementById('logoutBtn')?.addEventListener('click', function () {
    document.cookie = "isAdmin=; path=/; max-age=0";
    window.location.href = "auth.html";
});