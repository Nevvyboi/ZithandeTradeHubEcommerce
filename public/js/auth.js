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

const loginFormEl = document.getElementById('loginForm');
const registerFormEl = document.getElementById('registerForm');

document.addEventListener('DOMContentLoaded', function () {
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  const tab = new URLSearchParams(window.location.search).get('tab');
  if (tab === 'register') {
    registerBtn.classList.add('active');
    loginBtn.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
  } else {
    loginBtn.classList.add('active');
    registerBtn.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
  }

  loginBtn.addEventListener('click', function () {
    this.classList.add('active');
    registerBtn.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
  });

  registerBtn.addEventListener('click', function () {
    this.classList.add('active');
    loginBtn.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
  });

  const togglePasswordIcons = document.querySelectorAll('.togglePassword');
  togglePasswordIcons.forEach(icon => {
    icon.addEventListener('click', function () {
      const input = this.parentElement.querySelector('input');
      const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
      input.setAttribute('type', type);
      this.classList.toggle('fa-eye');
      this.classList.toggle('fa-eye-slash');
    });
  });

  const errorMap = {
    email: 'This email is already in use.',
    emailexist: 'Email already registered. Please use a different one.',
    password: 'Incorrect password.',
    user: 'User not found.',
    mismatch: 'Passwords do not match.',
    insert: 'Registration failed. Try again later.',
    server: 'Unexpected server error.'
  };
  const error = new URLSearchParams(window.location.search).get('error');
  if (error && errorMap[error]) {
    showPopup(errorMap[error]);
  }

  function showPopup(message) {
    let existingPopup = document.getElementById('errorPopup');
    if (!existingPopup) {
      const popup = document.createElement('div');
      popup.id = 'errorPopup';
      popup.className = 'popupOverlay';
      popup.innerHTML = `
        <div class="popupContainer">
          <div class="popupContent">
            <h3>Error</h3>
            <p id="popupMessage">${message}</p>
            <button id="popupCloseBtn">OK</button>
          </div>
        </div>`;
      
      document.body.appendChild(popup);
    } else {
      document.getElementById('popupMessage').textContent = message;
      existingPopup.classList.add('active');
    }
    
    document.getElementById('popupCloseBtn').onclick = () => {
      document.getElementById('errorPopup').classList.remove('active');
      setTimeout(() => {
        const popup = document.getElementById('errorPopup');
        if (popup) {
          popup.remove();
        }
      }, 300);
      history.replaceState({}, document.title, location.pathname);
    };
    setTimeout(() => {
      document.getElementById('errorPopup').classList.add('active');
    }, 10);
  }

  loginFormEl.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    // Hardcoded admin check
    if (email === "zithande@admin.com" && password === "123") {
        window.location.href = "admin.html";
        return;
    }

    // Regular login flow
    fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    })
    .then(res => {
      if (res.redirected) window.location.href = res.url;
    });
  });

  registerFormEl.addEventListener('submit', function (e) {
    e.preventDefault();
    const fullName = document.getElementById('registerFullName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const accountType = document.querySelector('input[name="accountType"]:checked').value;

    fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `fullName=${encodeURIComponent(fullName)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&accountType=${accountType}&confirmedPassword=${encodeURIComponent(confirmPassword)}`
    })
      .then(res => {
        if (res.redirected) window.location.href = res.url;
      });
  });
});
