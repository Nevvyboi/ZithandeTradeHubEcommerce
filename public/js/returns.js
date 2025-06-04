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
