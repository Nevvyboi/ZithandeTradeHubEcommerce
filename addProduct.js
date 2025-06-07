const imageUpload = document.getElementById("imageUpload");
const fileInput = document.getElementById("fileInput");
const imagePreview = document.getElementById("imagePreview");

imageUpload.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) => handleFile(e.target.files));

imageUpload.addEventListener("dragover", (e) => {
    e.preventDefault();
    imageUpload.style.backgroundColor = "#f0f0ff";
});

imageUpload.addEventListener("dragleave", () => {
    imageUpload.style.backgroundColor = "";
});

imageUpload.addEventListener("drop", (e) => {
    e.preventDefault();
    imageUpload.style.backgroundColor = "";
    handleFile(e.dataTransfer.files);
});

function handleFile(files) {
    const file = files[0]; 
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.innerHTML = ""; 
      const img = document.createElement("img");
      img.src = e.target.result;
      imagePreview.appendChild(img);
    };
    reader.readAsDataURL(file);
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const response = await fetch('/upload-product', {
        method: 'POST',
        body: formData
    });

    const result = await response.text();
    alert(result);
});

document.addEventListener('DOMContentLoaded', () => {
    const userEmail = getCookie("userEmail");
    const sellerIdInput = document.getElementById('sellerId');
    const form = document.getElementById('productForm');
    const submitBtn = document.getElementById('submitBtn');

    submitBtn.disabled = true;

    fetch(`/api/getUserId/${encodeURIComponent(userEmail)}`)
    .then(res => res.json())
    .then(data => {
        console.log("✅ Seller ID fetched:", data.id); 
        sellerIdInput.value = data.id;
        submitBtn.disabled = false;
    })
    .catch(err => {
        console.error('Error fetching seller ID:', err);
        alert("Could not load seller ID. Please login again.");
    });


    form.addEventListener('submit', async (e) => {
        e.preventDefault();
    
        const productName = document.getElementById('productName').value.trim();
    
        // Check if product name exists before submitting
        const checkResponse = await fetch(`/api/checkProductName/${encodeURIComponent(productName)}`);
        const checkData = await checkResponse.json();
    
        if (checkData.exists) {
            alert("Product with this name already exists. Please choose another name.");
            return;
        }
    
        // Proceed with upload if no duplicate
        const formData = new FormData(form);
        const response = await fetch('/upload-product', {
            method: 'POST',
            body: formData
        });
    
        window.location.href = '/seller.html';
    });
    
});


  