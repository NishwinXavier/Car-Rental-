/* ===================================================
   BOOK.JS — Roadify Premium Booking Logic
   =================================================== */

// Global State
const state = {
  currentStep: 1,
  selectedCar: null,
  rental: {
    pickupLoc: '',
    dropoffLoc: '',
    pickupDate: '',
    pickupTime: '10:00 AM',
    returnDate: '',
    returnTime: '10:00 AM',
    driverAge: '26–35',
    promoCode: '',
    discountPct: 0,
    specialReqs: ''
  },
  personal: {
    fName: '',
    lName: '',
    email: '',
    phone: '',
    licNo: '',
    licExp: '',
    country: 'United States',
    city: '',
    address: '',
    emName: '',
    emPhone: ''
  },
  addOns: [],
  payment: {
    method: 'card',
    cName: '',
    cNum: '',
    cExp: '',
    cCvv: ''
  }
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  initDefaultDates();
  initNavIndicator();
  recalc();
});

// Initialize Default Dates (Today & +3 Days)
function initDefaultDates() {
  const today = new Date();
  const nextThree = new Date(today);
  nextThree.setDate(today.getDate() + 3);

  const formatDate = (d) => d.toISOString().split('T')[0];

  const pickupInput = document.getElementById('pickupDate');
  const returnInput = document.getElementById('returnDate');

  if (pickupInput && !pickupInput.value) pickupInput.value = formatDate(today);
  if (returnInput && !returnInput.value) returnInput.value = formatDate(nextThree);
}

// Navbar sliding indicator for book page
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

// Filter Cars
function filterCars(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const cards = document.querySelectorAll('.bcar-card');
  cards.forEach(card => {
    const carCat = card.getAttribute('data-cat');
    if (cat === 'all' || carCat === cat) {
      card.style.display = 'flex';
      card.style.animation = 'fadeInUp 0.4s ease both';
    } else {
      card.style.display = 'none';
    }
  });
}

// Select Car
function selectCar(btn) {
  const card = btn.closest('.bcar-card');
  if (!card) return;

  document.querySelectorAll('.bcar-card').forEach(c => {
    c.classList.remove('selected');
    const selectBtn = c.querySelector('.btn-select');
    if (selectBtn) selectBtn.textContent = 'Select Vehicle';
  });

  card.classList.add('selected');
  btn.textContent = 'Selected ✓';

  const img = card.querySelector('img') ? card.querySelector('img').src : '';
  const name = card.getAttribute('data-name');
  const price = parseFloat(card.getAttribute('data-price')) || 0;
  const cat = card.querySelector('.bcar-cat') ? card.querySelector('.bcar-cat').textContent : '';

  state.selectedCar = { name, price, img, cat };

  // Enable Next button
  const nextBtn = document.getElementById('step1Next');
  if (nextBtn) nextBtn.disabled = false;

  recalc();
}

// Step Navigation
function goToStep(stepNum) {
  state.currentStep = stepNum;

  // Update Stepper fill track width
  const fillTrack = document.getElementById('stepperFill');
  if (fillTrack) {
    const percentage = (stepNum - 1) * 25;
    fillTrack.style.width = `${percentage}%`;
  }

  // Update Stepper Circles
  document.querySelectorAll('.step').forEach(stepEl => {
    const s = parseInt(stepEl.getAttribute('data-step'));
    stepEl.classList.remove('active', 'done');
    if (s === stepNum) {
      stepEl.classList.add('active');
    } else if (s < stepNum) {
      stepEl.classList.add('done');
    }
  });

  // Switch visible section
  document.querySelectorAll('.book-section').forEach(sec => sec.classList.remove('active-step'));
  const targetSec = document.getElementById(`step${stepNum}-section`);
  if (targetSec) targetSec.classList.add('active-step');

  // Scroll to top of stepper
  const stepper = document.querySelector('.stepper-wrapper');
  if (stepper) {
    stepper.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  recalc();
}

// Validate Step 2
function validateStep2() {
  const pickupLoc = document.getElementById('pickupLoc').value;
  const pickupDate = document.getElementById('pickupDate').value;
  const returnDate = document.getElementById('returnDate').value;

  let valid = true;

  if (!pickupLoc) {
    markInvalid('pickupLoc');
    valid = false;
  } else {
    clearInvalid('pickupLoc');
  }

  if (!pickupDate) {
    markInvalid('pickupDate');
    valid = false;
  } else {
    clearInvalid('pickupDate');
  }

  if (!returnDate) {
    markInvalid('returnDate');
    valid = false;
  } else {
    clearInvalid('returnDate');
  }

  if (pickupDate && returnDate && new Date(returnDate) < new Date(pickupDate)) {
    markInvalid('returnDate');
    alert('Return date cannot be earlier than pickup date.');
    valid = false;
  }

  if (valid) {
    state.rental.pickupLoc = pickupLoc;
    state.rental.dropoffLoc = document.getElementById('dropoffLoc').value || pickupLoc;
    state.rental.pickupDate = pickupDate;
    state.rental.returnDate = returnDate;
    state.rental.pickupTime = document.getElementById('pickupTime').value;
    state.rental.returnTime = document.getElementById('returnTime').value;
    goToStep(3);
  }
}

// Validate Step 3
function validateStep3() {
  const fName = document.getElementById('fName').value.trim();
  const lName = document.getElementById('lName').value.trim();
  const email = document.getElementById('emailFld').value.trim();
  const phone = document.getElementById('phoneFld').value.trim();
  const licNo = document.getElementById('licNo').value.trim();
  const terms = document.getElementById('terms').checked;

  let valid = true;

  if (!fName) { markInvalid('fName', 'fNameErr', 'First name required'); valid = false; } else { clearInvalid('fName', 'fNameErr'); }
  if (!lName) { markInvalid('lName', 'lNameErr', 'Last name required'); valid = false; } else { clearInvalid('lName', 'lNameErr'); }
  
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    markInvalid('emailFld', 'emailErr', 'Valid email address required'); valid = false;
  } else { clearInvalid('emailFld', 'emailErr'); }

  if (!phone || phone.length < 7) {
    markInvalid('phoneFld', 'phoneErr', 'Valid phone number required'); valid = false;
  } else { clearInvalid('phoneFld', 'phoneErr'); }

  if (!licNo) { markInvalid('licNo', 'licErr', 'Driver license number required'); valid = false; } else { clearInvalid('licNo', 'licErr'); }

  if (!terms) {
    document.getElementById('termsErr').textContent = 'You must accept the terms to proceed';
    valid = false;
  } else {
    document.getElementById('termsErr').textContent = '';
  }

  if (valid) {
    state.personal.fName = fName;
    state.personal.lName = lName;
    state.personal.email = email;
    state.personal.phone = phone;
    state.personal.licNo = licNo;
    goToStep(4);
  }
}

function markInvalid(inputId, errId, msg) {
  const el = document.getElementById(inputId);
  if (el) el.classList.add('invalid');
  if (errId) {
    const err = document.getElementById(errId);
    if (err) err.textContent = msg || 'Required field';
  }
}

function clearInvalid(inputId, errId) {
  const el = document.getElementById(inputId);
  if (el) el.classList.remove('invalid');
  if (errId) {
    const err = document.getElementById(errId);
    if (err) err.textContent = '';
  }
}

// Calculate Rental Days
function getDays() {
  const pDateStr = document.getElementById('pickupDate') ? document.getElementById('pickupDate').value : '';
  const rDateStr = document.getElementById('returnDate') ? document.getElementById('returnDate').value : '';

  if (!pDateStr || !rDateStr) return 1;

  const pDate = new Date(pDateStr);
  const rDate = new Date(rDateStr);
  const diffTime = Math.max(0, rDate - pDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
}

// Calculate & Update All Summaries
function recalc() {
  const days = getDays();
  const car = state.selectedCar;

  // Selected Addons sum
  let addOnsPerDay = 0;
  let addOnsFlat = 0;
  document.querySelectorAll('.addon-card').forEach(card => {
    const cb = card.querySelector('.addon-cb');
    if (cb && cb.checked) {
      const price = parseFloat(card.getAttribute('data-price')) || 0;
      const isFlat = card.getAttribute('data-name') === 'Airport Pickup';
      if (isFlat) addOnsFlat += price;
      else addOnsPerDay += price;
    }
  });

  const addOnsTotal = (addOnsPerDay * days) + addOnsFlat;

  // Car costs
  const carRate = car ? car.price : 0;
  const baseCost = carRate * days;
  const insuranceCost = 50 * days;

  // Discount
  const discountAmount = (baseCost * (state.rental.discountPct / 100));

  const subtotal = baseCost + insuranceCost + addOnsTotal - discountAmount;
  const tax = subtotal * 0.10;
  const grandTotal = subtotal + tax;

  // Update Summary Sidebars Across Steps
  const fillCarSidebar = (containerId) => {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (!car) {
      el.innerHTML = `<div class="sum-empty"><span>No vehicle selected</span></div>`;
    } else {
      el.innerHTML = `
        <div class="sum-car-filled">
          <img src="${car.img}" class="sum-car-img" alt="${car.name}">
          <div>
            <div class="sum-car-name">${car.name}</div>
            <div class="sum-car-cat">${car.cat} — $${car.price}/day</div>
          </div>
        </div>
      `;
    }
  };

  fillCarSidebar('sumCar');
  fillCarSidebar('sumCar3');
  fillCarSidebar('sumCar4');

  const pDateVal = document.getElementById('pickupDate') ? document.getElementById('pickupDate').value : '—';
  const rDateVal = document.getElementById('returnDate') ? document.getElementById('returnDate').value : '—';

  const setText = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  };

  setText('sPickup', pDateVal || '—');
  setText('sReturn', rDateVal || '—');
  setText('sDays', `${days} day${days > 1 ? 's' : ''}`);
  setText('sDays3', `${days} day${days > 1 ? 's' : ''}`);
  setText('sDays4', `${days} day${days > 1 ? 's' : ''}`);

  setText('sBase', `$${baseCost.toLocaleString()}`);
  setText('sBase3', `$${baseCost.toLocaleString()}`);
  setText('sBase4', `$${baseCost.toLocaleString()}`);

  setText('sInsurance', `$${insuranceCost.toLocaleString()}`);
  setText('sIns4', `$${insuranceCost.toLocaleString()}`);

  setText('sAddons', `$${addOnsTotal.toLocaleString()}`);
  setText('sAdd4', `$${addOnsTotal.toLocaleString()}`);

  if (state.rental.discountPct > 0) {
    const promoRow = document.getElementById('sPromoRow');
    if (promoRow) promoRow.style.display = 'flex';
    setText('sPromo', `-$${discountAmount.toFixed(0)}`);
  }

  setText('sTax', `$${tax.toFixed(0)}`);
  setText('sTax3', `$${tax.toFixed(0)}`);
  setText('sTax4', `$${tax.toFixed(0)}`);

  const formattedTotal = `$${grandTotal.toFixed(0)}`;
  setText('sTotal', formattedTotal);
  setText('sTotal3', formattedTotal);
  setText('sTotal4', formattedTotal);
  setText('payTotal', formattedTotal);
}

// Promo Code Application
function applyPromo() {
  const code = document.getElementById('promoCode').value.trim().toUpperCase();
  if (code === 'ROAD20') {
    state.rental.discountPct = 20;
    alert('Promo code ROAD20 applied! 20% discount added.');
  } else if (code === 'LUX10') {
    state.rental.discountPct = 10;
    alert('Promo code LUX10 applied! 10% discount added.');
  } else {
    alert('Invalid promo code. Try ROAD20 for 20% off!');
  }
  recalc();
}

// Credit Card Live Visual Updates
function updateCC() {
  const name = document.getElementById('cName').value || 'YOUR NAME';
  const num = document.getElementById('cNum').value || '•••• •••• •••• ••••';
  const exp = document.getElementById('cExp').value || 'MM/YY';

  const holderEl = document.getElementById('ccHolder');
  const numEl = document.getElementById('ccNum');
  const expEl = document.getElementById('ccExp');

  if (holderEl) holderEl.textContent = name.toUpperCase();
  if (numEl) numEl.textContent = num;
  if (expEl) expEl.textContent = exp;
}

// Card Number Formatter
function fmtCard(input) {
  let v = input.value.replace(/\D/g, '');
  let matches = v.match(/\d{4,16}/g);
  let match = (matches && matches[0]) || '';
  let parts = [];
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  if (parts.length) {
    input.value = parts.join(' ');
  } else {
    input.value = v;
  }
}

// Expiry Formatter
function fmtExp(input) {
  let v = input.value.replace(/\D/g, '');
  if (v.length >= 2) {
    input.value = v.substring(0, 2) + '/' + v.substring(2, 4);
  } else {
    input.value = v;
  }
}

// Switch Payment Method Tabs
function switchPM(method, btn) {
  document.querySelectorAll('.pm-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  document.querySelectorAll('.pm-panel').forEach(p => p.classList.remove('active'));
  const targetPanel = document.getElementById(`panel-${method}`);
  if (targetPanel) targetPanel.classList.add('active');

  state.payment.method = method;
}

// FAQ Accordion Toggle
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const ans = item.querySelector('.faq-a');

  const isOpen = item.classList.contains('open');

  document.querySelectorAll('.faq-item').forEach(i => {
    i.classList.remove('open');
    const a = i.querySelector('.faq-a');
    if (a) a.classList.remove('open');
  });

  if (!isOpen) {
    item.classList.add('open');
    ans.classList.add('open');
  }
}

// Handle Payment Confirmation
function handlePayment() {
  if (state.payment.method === 'card') {
    const cNum = document.getElementById('cNum').value;
    const cExp = document.getElementById('cExp').value;
    const cCvv = document.getElementById('cCvv').value;

    if (!cNum || cNum.replace(/\s/g, '').length < 15) {
      alert('Please enter a valid card number');
      return;
    }
    if (!cExp || cExp.length < 5) {
      alert('Please enter expiry date MM/YY');
      return;
    }
    if (!cCvv || cCvv.length < 3) {
      alert('Please enter CVV');
      return;
    }
  }

  // Generate Reference Number
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const refCode = `RDY-2026-${randomNum}`;
  const refEl = document.getElementById('bookRef');
  if (refEl) refEl.textContent = refCode;

  // Build Summary on Confirmation Screen
  const confSummary = document.getElementById('confSummary');
  const car = state.selectedCar || { name: 'Mercedes-Benz S-Class', price: 450 };
  const days = getDays();
  const total = document.getElementById('sTotal4') ? document.getElementById('sTotal4').textContent : '$1,500';

  if (confSummary) {
    confSummary.innerHTML = `
      <h4>Rental Summary</h4>
      <div class="conf-grid">
        <div class="conf-item"><span>Vehicle</span><span>${car.name}</span></div>
        <div class="conf-item"><span>Pickup Location</span><span>${state.rental.pickupLoc || 'New York — 5th Ave'}</span></div>
        <div class="conf-item"><span>Pickup Date</span><span>${state.rental.pickupDate} (${state.rental.pickupTime})</span></div>
        <div class="conf-item"><span>Return Date</span><span>${state.rental.returnDate} (${state.rental.returnTime})</span></div>
        <div class="conf-item"><span>Primary Driver</span><span>${state.personal.fName || 'John'} ${state.personal.lName || 'Doe'}</span></div>
        <div class="conf-item"><span>Total Paid</span><span style="color:var(--color-red);font-weight:800">${total}</span></div>
      </div>
    `;
  }

  goToStep(5);
}

// Expose functions to window for HTML onclick attributes
window.filterCars = filterCars;
window.selectCar = selectCar;
window.goToStep = goToStep;
window.validateStep2 = validateStep2;
window.validateStep3 = validateStep3;
window.recalc = recalc;
window.applyPromo = applyPromo;
window.updateCC = updateCC;
window.fmtCard = fmtCard;
window.fmtExp = fmtExp;
window.switchPM = switchPM;
window.toggleFaq = toggleFaq;
window.handlePayment = handlePayment;

