document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in (this would normally use a more robust method)
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  // Get auth container
  const authContainer = document.querySelector('.auth-buttons');
  
  if (authContainer) {
    if (isLoggedIn) {
      // User is logged in, show logout button and user info
      const username = localStorage.getItem('username') || 'User';
      authContainer.innerHTML = `
        <div class="user-menu">
          <img src="/placeholder.svg?height=32&width=32" alt="User Avatar" class="user-avatar">
          <span class="user-name">${username}</span>
        </div>
        <a href="#" class="btn-logout" id="logoutBtn">Logout</a>
      `;
      
      // Add logout functionality
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
          e.preventDefault();
          // Clear login state
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('username');
          // Redirect to home page
          window.location.href = 'index.html';
        });
      }
    } else {
      // User is not logged in, show login button
      authContainer.innerHTML = `
        <a href="sign-in.html" class="btn-login">Login</a>
      `;
    }
  }
  
  // Add active class to current page in navigation
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links a');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || 
        (currentPage === 'index.html' && href === '/') || 
        (href !== '/' && currentPage.includes(href))) {
      link.classList.add('active');
    }
  });
});