// Mark JS enabled for CSS fallbacks
document.documentElement.classList.add('js-enabled');

// Utility: smooth scroll
function smoothScrollTo(targetSelector) {
  const el = document.querySelector(targetSelector);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 80;
  window.scrollTo({ top: y, behavior: 'smooth' });
}

// Utility: Toast notifications
function showToast(message, type = 'success', timeout = 3500) {
  const stack = document.querySelector('.toast-stack');
  if (!stack) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const msg = document.createElement('div');
  msg.className = 'toast-message';
  msg.textContent = message;

  const close = document.createElement('button');
  close.className = 'toast-close';
  close.type = 'button';
  close.textContent = '×';
  close.addEventListener('click', () => {
    toast.remove();
  });

  toast.appendChild(msg);
  toast.appendChild(close);
  stack.appendChild(toast);

  if (timeout) {
    setTimeout(() => toast.remove(), timeout);
  }
}

// Navigation + hamburger menu
function initNavigation() {
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');

  if (!navToggle || !nav) return;

  let scrollPosition = 0;

  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.classList.toggle('is-open');
    nav.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    
    // Prevent body scroll when nav menu is open
    if (isOpen) {
      scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      document.body.classList.add('nav-menu-open');
      document.body.style.top = `-${scrollPosition}px`;
    } else {
      document.body.classList.remove('nav-menu-open');
      document.body.style.top = '';
      window.scrollTo(0, scrollPosition);
    }
  });

  // Close menu on nav click (mobile)
  nav.addEventListener('click', (e) => {
    const target = e.target;
    if (target instanceof HTMLElement && target.tagName === 'A') {
      // Don't close menu if clicking on dropdown toggle
      if (target.classList.contains('nav-dropdown-toggle')) {
        return;
      }
      navToggle.classList.remove('is-open');
      nav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-menu-open');
      document.body.style.top = '';
      if (scrollPosition) {
        window.scrollTo(0, scrollPosition);
        scrollPosition = 0;
      }
    }
  });

  // Close menu on window resize to desktop
  function handleResize() {
    if (window.innerWidth > 900 && nav.classList.contains('is-open')) {
      navToggle.classList.remove('is-open');
      nav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-menu-open');
      document.body.style.top = '';
      if (scrollPosition) {
        window.scrollTo(0, scrollPosition);
        scrollPosition = 0;
      }
    }
  }

  window.addEventListener('resize', handleResize);

  // Smooth scroll links / buttons
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    const scrollAttr = target.getAttribute('data-scroll-target');
    if (scrollAttr) {
      e.preventDefault();
      smoothScrollTo(scrollAttr);
    }
  });
}

// Dropdown menu functionality
function initDropdowns() {
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  
  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.nav-dropdown-toggle');
    if (!toggle) return;
    
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = dropdown.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      
      // Close other dropdowns
      dropdowns.forEach(otherDropdown => {
        if (otherDropdown !== dropdown) {
          otherDropdown.classList.remove('is-open');
          const otherToggle = otherDropdown.querySelector('.nav-dropdown-toggle');
          if (otherToggle) {
            otherToggle.setAttribute('aria-expanded', 'false');
          }
        }
      });
    });
  });
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!(e.target instanceof HTMLElement)) return;
    
    const isClickInside = Array.from(dropdowns).some(dropdown => 
      dropdown.contains(e.target)
    );
    
    if (!isClickInside) {
      dropdowns.forEach(dropdown => {
        dropdown.classList.remove('is-open');
        const toggle = dropdown.querySelector('.nav-dropdown-toggle');
        if (toggle) {
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }
  });
}

// Tracking module (simulated)
const MOCK_TRACKING_DATA = {
  'SS-9042381': 'in-transit',
  'SS-1234567': 'out-for-delivery',
  'SS-7777777': 'delivered',
};

const STEP_ORDER = ['booked', 'in-transit', 'out-for-delivery', 'delivered'];

function initTracking() {
  const form = document.getElementById('tracking-form');
  const input = document.getElementById('tracking-id');
  const statusEl = document.getElementById('tracking-status');
  const steps = document.querySelectorAll('.timeline-step');

  if (!form || !input || !statusEl || !steps.length) return;

  function setStatus(statusKey) {
    const statusTextMap = {
      booked: 'Shipment booked. Awaiting pickup.',
      'in-transit': 'Shipment is in transit to the destination hub.',
      'out-for-delivery': 'Your package is out for delivery.',
      delivered: 'Delivered. Thank you for shipping with us!',
      unknown: 'Tracking ID not found. Please check and try again.',
    };

    steps.forEach((stepEl) => {
      const step = stepEl.getAttribute('data-step');
      if (!step) return;
      const currentIndex = STEP_ORDER.indexOf(step);
      const statusIndex = STEP_ORDER.indexOf(statusKey);

      stepEl.classList.remove('is-active', 'is-complete');
      if (statusIndex === -1) return;
      if (currentIndex < statusIndex) {
        stepEl.classList.add('is-complete');
      } else if (currentIndex === statusIndex) {
        stepEl.classList.add('is-active');
      }
    });

    statusEl.textContent = statusTextMap[statusKey] || statusTextMap.unknown;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = input.value.trim().toUpperCase();

    const isValid = /^SS-\d{7}$/.test(value);
    if (!isValid) {
      showToast('Please enter a valid tracking ID (e.g. SS-1234567).', 'error');
      setStatus('unknown');
      return;
    }

    const status = MOCK_TRACKING_DATA[value] || 'in-transit';
    setStatus(status);
    showToast(`Tracking updated for ${value}.`, 'success');
  });
}

// Booking form
function initBooking() {
  const form = document.getElementById('pickup-form');
  const confirmation = document.getElementById('booking-confirmation');

  if (!form || !confirmation) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const pickup = String(data.get('pickupAddress') || '').trim();
    const drop = String(data.get('dropAddress') || '').trim();
    const weight = Number(data.get('weight') || 0);

    if (!pickup || !drop || !weight) {
      showToast('Please complete all required booking fields.', 'error');
      return;
    }

    const trackingId = `SS-${Math.floor(1000000 + Math.random() * 8999999)}`;
    confirmation.textContent = `Pickup booked successfully! Your tracking ID is ${trackingId}.`;
    showToast('Pickup booked successfully.', 'success');
    form.reset();
  });
}

// Price estimator
function initPriceEstimator() {
  const form = document.getElementById('price-form');
  const weightInput = document.getElementById('estimate-weight');
  const distanceSelect = document.getElementById('distance');
  const speedSelect = document.getElementById('speed');
  const valueEl = document.querySelector('.price-value');

  if (!form || !weightInput || !distanceSelect || !speedSelect || !valueEl)
    return;

  function calculatePrice() {
    const weight = Number(weightInput.value || 0);
    const distance = distanceSelect.value;
    const speed = speedSelect.value;

    if (!weight || !distance || !speed) {
      valueEl.textContent = '—';
      return;
    }

    let base = 3;
    if (distance === 'city') base += 2;
    else if (distance === 'regional') base += 5;
    else if (distance === 'national') base += 8;
    else if (distance === 'international') base += 15;

    base += weight * 0.9;

    if (speed === 'express') base *= 1.5;
    if (speed === 'same-day') base *= 2.2;

    const total = Math.max(4, Math.round(base * 100) / 100);
    valueEl.textContent = `$${total.toFixed(2)}`;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculatePrice();
    showToast('Price estimate calculated.', 'success', 2600);
  });

  [weightInput, distanceSelect, speedSelect].forEach((el) =>
    el.addEventListener('change', calculatePrice)
  );
}

// Testimonials slider
function initTestimonials() {
  const slides = Array.from(
    document.querySelectorAll('.testimonial-slide')
  );
  const dotsContainer = document.querySelector('.testimonial-dots');
  const prevBtn = document.querySelector('[data-testimonial-prev]');
  const nextBtn = document.querySelector('[data-testimonial-next]');

  if (!slides.length || !dotsContainer || !prevBtn || !nextBtn) return;

  let index = 0;
  let autoTimer;

  function setActive(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach((slide, idx) => {
      slide.classList.toggle('is-active', idx === index);
    });
    const dots = Array.from(dotsContainer.children);
    dots.forEach((dot, idx) => {
      dot.classList.toggle('is-active', idx === index);
    });
  }

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'testimonial-dot';
    dot.addEventListener('click', () => {
      setActive(i);
      restartAuto();
    });
    dotsContainer.appendChild(dot);
  });

  prevBtn.addEventListener('click', () => {
    setActive(index - 1);
    restartAuto();
  });
  nextBtn.addEventListener('click', () => {
    setActive(index + 1);
    restartAuto();
  });

  function restartAuto() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(() => setActive(index + 1), 8000);
  }

  setActive(0);
  restartAuto();
}

// FAQ accordion and search
function initFaq() {
  const faqItems = document.querySelectorAll('.faq-item');
  const searchInput = document.getElementById('faq-search');

  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) {
        const scrollHeight = answer.scrollHeight;
        answer.style.maxHeight = `${scrollHeight}px`;
      } else {
        answer.style.maxHeight = '0';
      }
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const term = searchInput.value.toLowerCase();
      faqItems.forEach((item) => {
        const text = item.textContent || '';
        const matches = text.toLowerCase().includes(term);
        item.style.display = matches ? '' : 'none';
      });
    });
  }
}

// Contact form
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const email = String(data.get('email') || '').trim();
    const message = String(data.get('message') || '').trim();
    if (!email || !message) {
      showToast('Please fill in your email and message.', 'error');
      return;
    }
    showToast('Thanks for reaching out! We will reply shortly.', 'success');
    form.reset();
  });
}

// Auth modal
function initAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;

  const openButtons = document.querySelectorAll('[data-open-auth]');
  const closeEls = modal.querySelectorAll('[data-close-modal]');
  const tabs = modal.querySelectorAll('[data-auth-tab]');
  const panels = modal.querySelectorAll('[data-auth-panel]');

  function openModal(initialTab = 'login') {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    setActiveTab(initialTab);
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function setActiveTab(tabName) {
    tabs.forEach((tab) => {
      const name = tab.getAttribute('data-auth-tab');
      const active = name === tabName;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    panels.forEach((panel) => {
      const name = panel.getAttribute('data-auth-panel');
      panel.classList.toggle('active', name === tabName);
    });
  }

  openButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-open-auth') || 'login';
      openModal(tab);
    });
  });

  closeEls.forEach((el) => el.addEventListener('click', closeModal));

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const name = tab.getAttribute('data-auth-tab');
      if (name) setActiveTab(name);
    });
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Simple front-end validation feedback
  ['login-form', 'signup-form', 'forgot-form'].forEach((id) => {
    const form = document.getElementById(id);
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Check terms and conditions for signup
      if (id === 'signup-form') {
        const termsCheckbox = form.querySelector('#signup-terms');
        if (!termsCheckbox.checked) {
          showToast('Please agree to the Terms and Conditions to continue.', 'error');
          return;
        }
      }
      
      showToast('Form submitted (demo only, no backend).', 'success');
      form.reset();
    });
  });

  // Social auth buttons
  const socialButtons = modal.querySelectorAll('[data-social-auth]');
  socialButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const provider = btn.getAttribute('data-social-auth');
      showToast(`Social login with ${provider.charAt(0).toUpperCase() + provider.slice(1)} (demo only).`, 'info');
    });
  });
}

// Live chat toggle
function initChat() {
  const toggles = document.querySelectorAll('[data-toggle-chat]');
  const panel = document.getElementById('chat-panel');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const body = document.querySelector('.chat-body');

  if (!toggles.length || !panel || !form || !input || !body) return;

  function setOpen(open) {
    panel.classList.toggle('is-open', open);
    panel.setAttribute('aria-hidden', String(!open));
  }

  toggles.forEach((btn) =>
    btn.addEventListener('click', () => {
      const isOpen = panel.classList.contains('is-open');
      setOpen(!isOpen);
    })
  );

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    const userMsg = document.createElement('p');
    userMsg.className = 'chat-message user';
    userMsg.textContent = text;
    body.appendChild(userMsg);
    body.scrollTop = body.scrollHeight;

    input.value = '';

    const reply = document.createElement('p');
    reply.className = 'chat-message bot';
    reply.textContent =
      'Thanks for your message! This is a demo chat. A support agent will reply soon.';
    setTimeout(() => {
      body.appendChild(reply);
      body.scrollTop = body.scrollHeight;
    }, 700);
  });
}

// Theme toggle
function initTheme() {
  const btn = document.querySelector('.btn-theme-toggle');
  if (!btn) return;

  const prefersDark = window.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches;
  const stored = window.localStorage.getItem('swiftship-theme');
  const initial = stored || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', initial);

  btn.addEventListener('click', () => {
    const current =
      document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    window.localStorage.setItem('swiftship-theme', next);
  });
}

// Misc: year in footer
function initYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = String(new Date().getFullYear());
}

// --------------------
// User dashboard
// --------------------

function initUserDashboard() {
  const navButtons = document.querySelectorAll('[data-dashboard-tab]');
  const panels = document.querySelectorAll('[data-dashboard-panel]');
  if (!navButtons.length || !panels.length) return;

  function setActive(tab) {
    navButtons.forEach((btn) => {
      const key = btn.getAttribute('data-dashboard-tab');
      btn.classList.toggle('is-active', key === tab);
    });
    panels.forEach((panel) => {
      const key = panel.getAttribute('data-dashboard-panel');
      panel.classList.toggle('is-active', key === tab);
    });
  }

  navButtons.forEach((btn) =>
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-dashboard-tab');
      if (tab) setActive(tab);
    })
  );

  const demoShipments = [
    {
      id: 'SS-9042381',
      from: 'Warehouse A',
      to: 'Mumbai',
      status: 'in-transit',
    },
    {
      id: 'SS-1234567',
      from: 'Delhi',
      to: 'Bangalore',
      status: 'out-for-delivery',
    },
    {
      id: 'SS-7777777',
      from: 'London',
      to: 'New York',
      status: 'delivered',
    },
  ];

  const demoAddresses = [
    {
      label: 'Home',
      address: '221B Baker Street',
      city: 'London',
      type: 'Residential',
    },
    {
      label: 'Office',
      address: '12 Logistics Park',
      city: 'Mumbai',
      type: 'Business',
    },
  ];

  const demoPayments = [
    {
      date: '2025-11-02',
      desc: 'Shipment SS-9042381',
      amount: '$18.50',
      status: 'Paid',
    },
    {
      date: '2025-11-15',
      desc: 'Shipment SS-7777777',
      amount: '$34.90',
      status: 'Paid',
    },
  ];

  const demoBookings = [
    {
      pickup: 'Delhi',
      drop: 'Jaipur',
      weight: '2.4kg',
      type: 'Express',
    },
    {
      pickup: 'Mumbai',
      drop: 'Pune',
      weight: '1.2kg',
      type: 'Same-day',
    },
  ];

  function fillTable(id, rows) {
    const table = document.getElementById(id);
    if (!table) return;
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    rows.forEach((cols) => {
      const tr = document.createElement('tr');
      cols.forEach((html) => {
        const td = document.createElement('td');
        td.innerHTML = html;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  fillTable(
    'table-shipments',
    demoShipments.map((s) => [
      s.id,
      s.from,
      s.to,
      `<span class="badge-status ${s.status}">${s.status.replace(
        /-/g,
        ' '
      )}</span>`,
    ])
  );

  fillTable(
    'table-addresses',
    demoAddresses.map((a) => [a.label, a.address, a.city, a.type])
  );

  fillTable(
    'table-payments',
    demoPayments.map((p) => [p.date, p.desc, p.amount, p.status])
  );

  fillTable(
    'table-bookings',
    demoBookings.map((b) => [b.pickup, b.drop, b.weight, b.type])
  );

  const activeShipments = demoShipments.filter(
    (s) => s.status !== 'delivered'
  ).length;
  const delivered = demoShipments.filter(
    (s) => s.status === 'delivered'
  ).length;

  const activeEl = document.getElementById('dash-active-shipments');
  const deliveredEl = document.getElementById('dash-delivered');
  const addrEl = document.getElementById('dash-addresses');
  if (activeEl) activeEl.textContent = String(activeShipments);
  if (deliveredEl) deliveredEl.textContent = String(delivered);
  if (addrEl) addrEl.textContent = String(demoAddresses.length);

  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Profile saved (demo only).', 'success');
    });
  }
}

// --------------------
// Admin panel
// --------------------

function initAdminPanel() {
  const navButtons = document.querySelectorAll('[data-admin-tab]');
  const panels = document.querySelectorAll('[data-admin-panel]');
  if (!navButtons.length || !panels.length) return;

  function setActive(tab) {
    navButtons.forEach((btn) => {
      const key = btn.getAttribute('data-admin-tab');
      btn.classList.toggle('is-active', key === tab);
    });
    panels.forEach((panel) => {
      const key = panel.getAttribute('data-admin-panel');
      panel.classList.toggle('is-active', key === tab);
    });
  }

  navButtons.forEach((btn) =>
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-admin-tab');
      if (tab) setActive(tab);
    })
  );

  const shipmentsKey = 'swiftship-admin-shipments';
  const agentsKey = 'swiftship-admin-agents';
  const destKey = 'swiftship-admin-destinations';

  function readStore(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function writeStore(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  let shipments = readStore(shipmentsKey, []);
  let agents = readStore(agentsKey, []);
  let destinations = readStore(destKey, []);

  function fillShipments() {
    const table = document.getElementById('admin-table-shipments');
    if (!table) return;
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    shipments.forEach((s) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${s.id}</td>
        <td>${s.from}</td>
        <td>${s.to}</td>
        <td><span class="badge-status ${s.status}">${s.status.replace(
          /-/g,
          ' '
        )}</span></td>
        <td>${s.agent || ''}</td>
      `;
      tbody.appendChild(tr);
    });

    const totalEl = document.getElementById('admin-total-shipments');
    const activeEl = document.getElementById('admin-active-today');
    if (totalEl) totalEl.textContent = String(shipments.length);
    if (activeEl)
      activeEl.textContent = String(
        shipments.filter((s) => s.status !== 'delivered').length
      );
  }

  function fillAgents() {
    const table = document.getElementById('admin-table-agents');
    if (!table) return;
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    agents.forEach((a) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${a.name}</td><td>${a.region}</td>`;
      tbody.appendChild(tr);
    });
    const totalEl = document.getElementById('admin-total-agents');
    if (totalEl) totalEl.textContent = String(agents.length);
  }

  function fillDestinations() {
    const table = document.getElementById('admin-table-destinations');
    if (!table) return;
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    destinations.forEach((d) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${d.city}</td><td>${d.country}</td>`;
      tbody.appendChild(tr);
    });
  }

  const addShipmentForm = document.getElementById('admin-add-shipment-form');
  if (addShipmentForm) {
    addShipmentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const from = document.getElementById('admin-from');
      const to = document.getElementById('admin-to');
      const agent = document.getElementById('admin-agent');
      const status = document.getElementById('admin-status');
      if (
        !(from instanceof HTMLInputElement) ||
        !(to instanceof HTMLInputElement) ||
        !(agent instanceof HTMLInputElement) ||
        !(status instanceof HTMLSelectElement)
      ) {
        return;
      }
      const id = `SS-${Math.floor(1000000 + Math.random() * 8999999)}`;
      shipments.unshift({
        id,
        from: from.value.trim(),
        to: to.value.trim(),
        agent: agent.value.trim(),
        status: status.value,
      });
      writeStore(shipmentsKey, shipments);
      fillShipments();
      addShipmentForm.reset();
      showToast('Shipment added.', 'success');
    });
  }

  const priceForm = document.getElementById('admin-price-form');
  if (priceForm) {
    priceForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Price multipliers saved (demo only).', 'success');
    });
  }

  const destForm = document.getElementById('admin-dest-form');
  if (destForm) {
    destForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const cityInput = document.getElementById('dest-name');
      const countryInput = document.getElementById('dest-country');
      if (
        !(cityInput instanceof HTMLInputElement) ||
        !(countryInput instanceof HTMLInputElement)
      ) {
        return;
      }
      const city = cityInput.value.trim();
      const country = countryInput.value.trim();
      if (!city || !country) return;
      destinations.unshift({ city, country });
      writeStore(destKey, destinations);
      fillDestinations();
      destForm.reset();
      showToast('Destination added.', 'success');
    });
  }

  const agentForm = document.getElementById('admin-agent-form');
  if (agentForm) {
    agentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('agent-name');
      const regionInput = document.getElementById('agent-region');
      if (
        !(nameInput instanceof HTMLInputElement) ||
        !(regionInput instanceof HTMLInputElement)
      ) {
        return;
      }
      const name = nameInput.value.trim();
      const region = regionInput.value.trim();
      if (!name || !region) return;
      agents.unshift({ name, region });
      writeStore(agentsKey, agents);
      fillAgents();
      agentForm.reset();
      showToast('Agent added.', 'success');
    });
  }

  fillShipments();
  fillAgents();
  fillDestinations();
}

// --------------------
// Agent console
// --------------------

function initAgentConsole() {
  const navButtons = document.querySelectorAll('[data-agent-tab]');
  const panels = document.querySelectorAll('[data-agent-panel]');
  if (!navButtons.length || !panels.length) return;

  function setActive(tab) {
    navButtons.forEach((btn) => {
      const key = btn.getAttribute('data-agent-tab');
      btn.classList.toggle('is-active', key === tab);
    });
    panels.forEach((panel) => {
      const key = panel.getAttribute('data-agent-panel');
      panel.classList.toggle('is-active', key === tab);
    });
  }

  navButtons.forEach((btn) =>
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-agent-tab');
      if (tab) setActive(tab);
    })
  );

  const table = document.getElementById('agent-table-shipments');
  if (!table) return;
  const tbody = table.querySelector('tbody');
  if (!tbody) return;

  const demo = [
    {
      id: 'SS-9042381',
      pickup: 'Warehouse A',
      drop: 'Mumbai',
      status: 'booked',
    },
    {
      id: 'SS-1234567',
      pickup: 'Delhi',
      drop: 'Bangalore',
      status: 'out-for-delivery',
    },
  ];

  function render() {
    tbody.innerHTML = '';
    demo.forEach((s, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${s.id}</td>
        <td>${s.pickup}</td>
        <td>${s.drop}</td>
        <td><span class="badge-status ${s.status}">${s.status.replace(
          /-/g,
          ' '
        )}</span></td>
        <td>
          <button class="btn btn-sm btn-outline" data-action="pickup" data-index="${index}">Mark picked up</button>
          <button class="btn btn-sm btn-primary" data-action="delivered" data-index="${index}">Mark delivered</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    const pickupsEl = document.getElementById('agent-pickups');
    const outEl = document.getElementById('agent-out');
    const deliveredEl = document.getElementById('agent-delivered');
    if (pickupsEl)
      pickupsEl.textContent = String(
        demo.filter((d) => d.status === 'booked').length
      );
    if (outEl)
      outEl.textContent = String(
        demo.filter((d) => d.status === 'out-for-delivery').length
      );
    if (deliveredEl)
      deliveredEl.textContent = String(
        demo.filter((d) => d.status === 'delivered').length
      );
  }

  tbody.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const action = target.getAttribute('data-action');
    const indexStr = target.getAttribute('data-index');
    if (!action || indexStr == null) return;
    const idx = Number(indexStr);
    const item = demo[idx];
    if (!item) return;
    if (action === 'pickup') {
      item.status = 'out-for-delivery';
      showToast(`Shipment ${item.id} marked as picked up.`, 'success');
    } else if (action === 'delivered') {
      item.status = 'delivered';
      showToast(`Shipment ${item.id} marked as delivered.`, 'success');
    }
    render();
  });

  render();
}

// Scroll to top button
function initScrollToTop() {
  const scrollToTopBtn = document.getElementById('scroll-to-top');
  
  if (!scrollToTopBtn) return;

  // Show/hide button based on scroll position
  function toggleScrollButton() {
    if (window.pageYOffset > 300) {
      scrollToTopBtn.style.opacity = '1';
      scrollToTopBtn.style.visibility = 'visible';
      scrollToTopBtn.style.pointerEvents = 'auto';
    } else {
      scrollToTopBtn.style.opacity = '0';
      scrollToTopBtn.style.visibility = 'hidden';
      scrollToTopBtn.style.pointerEvents = 'none';
    }
  }

  // Initially hide the button
  scrollToTopBtn.style.opacity = '0';
  scrollToTopBtn.style.visibility = 'hidden';
  scrollToTopBtn.style.pointerEvents = 'none';
  scrollToTopBtn.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';

  // Scroll to top on click
  scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Listen to scroll events
  window.addEventListener('scroll', toggleScrollButton);
  toggleScrollButton(); // Check initial state
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initDropdowns();
  initTracking();
  initBooking();
  initPriceEstimator();
  initTestimonials();
  initFaq();
  initContactForm();
  initAuthModal();
  initChat();
  initTheme();
  initYear();
  initUserDashboard();
  initAdminPanel();
  initAgentConsole();
  initScrollToTop();
});