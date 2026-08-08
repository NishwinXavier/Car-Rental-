/* ===================================================
   SIGNUP.JS — Roadify Create Account Interactive Logic
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavIndicator();
  initPasswordToggle();
  initPasswordStrength();
  initFileUpload();
  initFormValidation();
});

// Navbar indicator positioning
function initNavIndicator() {
  const navLinks = document.querySelectorAll('.nav-link');
  const indicator = document.querySelector('.nav-indicator');
  const nav = document.querySelector('.nav-links');

  if (!indicator || !nav) return;

  function move(link) {
    const navRect = nav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    indicator.style.left = `${linkRect.left - navRect.left}px`;
    indicator.style.width = `${linkRect.width}px`;
    indicator.classList.add('visible');
  }

  navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => move(link));
  });

  nav.addEventListener('mouseleave', () => {
    const active = document.querySelector('.nav-link.active');
    if (active) move(active);
    else indicator.classList.remove('visible');
  });
}

// Show / Hide Password
function initPasswordToggle() {
  const toggleBtn = document.getElementById('toggle-signup-password');
  const pwdInput = document.getElementById('signupPassword');

  if (toggleBtn && pwdInput) {
    toggleBtn.addEventListener('click', () => {
      const type = pwdInput.getAttribute('type') === 'password' ? 'text' : 'password';
      pwdInput.setAttribute('type', type);
      toggleBtn.classList.toggle('active');
    });
  }
}

// Live Password Strength Indicator
function initPasswordStrength() {
  const pwdInput = document.getElementById('signupPassword');
  const bar = document.getElementById('strength-bar');
  const text = document.getElementById('strength-text');

  if (!pwdInput || !bar || !text) return;

  pwdInput.addEventListener('input', () => {
    const val = pwdInput.value;
    if (!val) {
      bar.style.width = '0%';
      text.textContent = 'Password strength';
      text.style.color = '#94a3b8';
      return;
    }

    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    if (score <= 1) {
      bar.style.width = '33%';
      bar.style.backgroundColor = '#f87171'; // Red
      text.textContent = 'Weak password';
      text.style.color = '#f87171';
    } else if (score === 2 || score === 3) {
      bar.style.width = '66%';
      bar.style.backgroundColor = '#facc15'; // Yellow
      text.textContent = 'Medium password';
      text.style.color = '#facc15';
    } else {
      bar.style.width = '100%';
      bar.style.backgroundColor = '#4ade80'; // Green
      text.textContent = 'Strong password';
      text.style.color = '#4ade80';
    }
  });
}

// Drag and Drop File Upload
function initFileUpload() {
  const dropzone = document.getElementById('upload-dropzone');
  const fileInput = document.getElementById('licenseFile');
  const preview = document.getElementById('file-preview');

  if (!dropzone || !fileInput) return;

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length) {
      fileInput.files = files;
      showPreview(files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
      showPreview(fileInput.files[0]);
    }
  });

  function showPreview(file) {
    if (preview) {
      preview.style.display = 'flex';
      const fileSize = (file.size / (1024 * 1024)).toFixed(2);
      preview.innerHTML = `
        <span>📄 <strong>${file.name}</strong> (${fileSize} MB)</span>
        <span style="color:#4ade80;font-weight:700;">✓ Ready</span>
      `;
    }
  }
}

// Live Form Validation & Enable Submit
function initFormValidation() {
  const form = document.getElementById('signup-form');
  const submitBtn = document.getElementById('btn-submit-signup');
  const termsCb = document.getElementById('terms-agree');

  if (!form || !submitBtn) return;

  const fields = {
    firstName: document.getElementById('firstName'),
    lastName: document.getElementById('lastName'),
    dob: document.getElementById('dob'),
    email: document.getElementById('signupEmail'),
    phone: document.getElementById('phone'),
    username: document.getElementById('username'),
    password: document.getElementById('signupPassword'),
    confirmPassword: document.getElementById('confirmPassword'),
    licenseNo: document.getElementById('licenseNo'),
    licenseExpiry: document.getElementById('licenseExpiry')
  };

  function validate() {
    let allValid = true;

    // First Name
    if (fields.firstName) {
      if (!fields.firstName.value.trim()) allValid = false;
    }

    // Last Name
    if (fields.lastName) {
      if (!fields.lastName.value.trim()) allValid = false;
    }

    // DOB
    if (fields.dob) {
      if (!fields.dob.value) allValid = false;
    }

    // Email
    if (fields.email) {
      const isEmail = /\S+@\S+\.\S+/.test(fields.email.value.trim());
      if (!isEmail) allValid = false;
    }

    // Phone
    if (fields.phone) {
      if (fields.phone.value.trim().length < 7) allValid = false;
    }

    // Username
    if (fields.username) {
      if (!fields.username.value.trim()) allValid = false;
    }

    // Password (min 8 chars)
    if (fields.password) {
      if (fields.password.value.length < 8) allValid = false;
    }

    // Confirm Password Match
    if (fields.confirmPassword && fields.password) {
      if (!fields.confirmPassword.value || fields.confirmPassword.value !== fields.password.value) {
        allValid = false;
      }
    }

    // License No
    if (fields.licenseNo) {
      if (!fields.licenseNo.value.trim()) allValid = false;
    }

    // License Expiry
    if (fields.licenseExpiry) {
      if (!fields.licenseExpiry.value) allValid = false;
    }

    // Terms checkbox
    if (termsCb && !termsCb.checked) {
      allValid = false;
    }

    submitBtn.disabled = !allValid;
    return allValid;
  }

  // Attach input listeners
  Object.values(fields).forEach(input => {
    if (input) {
      input.addEventListener('input', validate);
      input.addEventListener('blur', () => validateField(input));
    }
  });

  if (termsCb) {
    termsCb.addEventListener('change', validate);
  }

  // Field specific error highlighting on blur
  function validateField(input) {
    const id = input.id;
    let errEl = document.getElementById(`${id}-error`);
    if (!errEl && id === 'signupEmail') errEl = document.getElementById('email-error');
    if (!errEl && id === 'signupPassword') errEl = document.getElementById('password-error');
    if (!errEl && id === 'confirmPassword') errEl = document.getElementById('confirm-error');
    if (!errEl && id === 'licenseNo') errEl = document.getElementById('license-error');
    if (!errEl && id === 'licenseExpiry') errEl = document.getElementById('expiry-error');

    if (!errEl) return;

    if (id === 'signupEmail') {
      if (input.value && !/\S+@\S+\.\S+/.test(input.value)) {
        input.classList.add('invalid');
        errEl.textContent = 'Please enter a valid email address';
      } else {
        input.classList.remove('invalid');
        errEl.textContent = '';
      }
    } else if (id === 'confirmPassword') {
      const pwd = fields.password ? fields.password.value : '';
      if (input.value && input.value !== pwd) {
        input.classList.add('invalid');
        errEl.textContent = 'Passwords do not match';
      } else {
        input.classList.remove('invalid');
        errEl.textContent = '';
      }
    } else if (id === 'signupPassword') {
      if (input.value && input.value.length < 8) {
        input.classList.add('invalid');
        errEl.textContent = 'Password must be at least 8 characters';
      } else {
        input.classList.remove('invalid');
        errEl.textContent = '';
      }
    } else {
      if (input.hasAttribute('required') && !input.value.trim()) {
        input.classList.add('invalid');
        errEl.textContent = 'This field is required';
      } else {
        input.classList.remove('invalid');
        errEl.textContent = '';
      }
    }
  }

  // Handle Form Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validate()) return;

    // Show spinner on submit button
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = document.getElementById('btn-spinner');

    if (btnText) btnText.style.display = 'none';
    if (spinner) spinner.style.display = 'inline-block';
    submitBtn.disabled = true;

    // Simulate registration processing
    setTimeout(() => {
      form.style.display = 'none';
      const successState = document.getElementById('signup-success-state');
      if (successState) successState.style.display = 'block';

      // Scroll to top of card smoothly
      const card = document.querySelector('.signup-card');
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 1200);
  });
}
