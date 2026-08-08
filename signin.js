document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const togglePasswordBtn = document.getElementById('toggle-password');
  const submitBtn = document.getElementById('submit-btn');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const successState = document.getElementById('success-state');
  const loginCardContent = document.getElementById('login-card-content');

  // Toggle Password Visibility
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      // Update eye icon SVG
      if (type === 'text') {
        togglePasswordBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
      } else {
        togglePasswordBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
      }
    });
  }

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const showError = (element, message) => {
    element.textContent = message;
    element.classList.add('visible');
    element.previousElementSibling.classList.add('has-error'); // input group
  };

  const hideError = (element) => {
    element.textContent = '';
    element.classList.remove('visible');
    if (element.previousElementSibling) {
      element.previousElementSibling.classList.remove('has-error');
    }
  };

  if (emailInput) {
    emailInput.addEventListener('input', () => hideError(emailError));
  }
  if (passwordInput) {
    passwordInput.addEventListener('input', () => hideError(passwordError));
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      let isValid = true;
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email) {
        showError(emailError, 'Email is required');
        isValid = false;
      } else if (!validateEmail(email)) {
        showError(emailError, 'Please enter a valid email address');
        isValid = false;
      }

      if (!password) {
        showError(passwordError, 'Password is required');
        isValid = false;
      } else if (password.length < 6) {
        showError(passwordError, 'Password must be at least 6 characters');
        isValid = false;
      }

      if (isValid) {
        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="btn-spinner"></div> Processing...';

        // Simulate API call
        setTimeout(() => {
          submitBtn.classList.remove('loading');
          
          // Hide login form, show success state
          loginCardContent.style.opacity = '0';
          setTimeout(() => {
            loginCardContent.style.display = 'none';
            successState.style.display = 'flex';
            
            // Trigger checkmark animation
            setTimeout(() => {
              successState.classList.add('active');
            }, 50);

            // Redirect smoothly
            setTimeout(() => {
              window.location.href = 'index.html';
            }, 2500);
          }, 300);
          
        }, 1500);
      }
    });
  }
});
