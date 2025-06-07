document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.legalTab');
  const contents = document.querySelectorAll('.legalContent');
  
  function switchTab(tabId) {
    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));
  
    const tab = document.querySelector(`.legalTab[dataTab="${tabId}"]`);
    const content = document.getElementById(`${tabId}Content`);
    if (tab && content) {
      tab.classList.add('active');
      content.classList.add('active');
    }
  }
  
    tabs.forEach(tab => {
    tab.addEventListener('click', () => {
    const tabId = tab.getAttribute('dataTab');
    switchTab(tabId);
    history.replaceState(null, null, `#${tabId}`);
  });
});

const initialHash = window.location.hash.substring(1); 
if (initialHash) {
    switchTab(initialHash);
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

