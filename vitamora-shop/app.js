/* ═══════════════════════════════════════════════
   VITAMORA SHOP – app.js
   Handles: navbar, drawer, cart sidebar, hero slider,
            scroll reveal, cart logic, toast, buy now,
            contact form, smooth scroll, active nav
═══════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── DOM refs ── */
  const header      = document.getElementById('header');
  const burger      = document.getElementById('burger');
  const drawer      = document.getElementById('drawer');
  const drawerClose = document.getElementById('drawerClose');
  const drawerMask  = document.getElementById('drawerMask');
  const cartBtn     = document.getElementById('cartBtn');
  const cartSidebar = document.getElementById('cartSidebar');
  const cartClose   = document.getElementById('cartClose');
  const cartMask    = document.getElementById('cartMask');
  const cartCount   = document.getElementById('cartCount');
  const csItems     = document.getElementById('csItems');
  const csEmpty     = document.getElementById('csEmpty');
  const csFoot      = document.getElementById('csFoot');
  const csTotal     = document.getElementById('csTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const sPrev       = document.getElementById('sPrev');
  const sNext       = document.getElementById('sNext');
  const sDots       = document.getElementById('sDots');
  const cForm       = document.getElementById('cForm');
  const formOk      = document.getElementById('formOk');
  const toast       = document.getElementById('toast');

  /* ══════════════════════════════════════════
     NAVBAR – solid class on scroll
  ══════════════════════════════════════════ */
  function onScroll() {
    if (window.scrollY > 60) {
      header.classList.add('solid');
    } else {
      header.classList.remove('solid');
    }
    updateActiveNav();
    revealElements();
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ══════════════════════════════════════════
     ACTIVE NAV LINK on scroll
  ══════════════════════════════════════════ */
  const sections = document.querySelectorAll('section[id], div[id="home"]');
  const navLinks = document.querySelectorAll('.nl');

  function updateActiveNav() {
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 100;
      if (window.scrollY >= top) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) link.classList.add('active');
    });
  }

  /* ══════════════════════════════════════════
     MOBILE DRAWER
  ══════════════════════════════════════════ */
  function openDrawer() {
    drawer.classList.add('open');
    drawerMask.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    drawerMask.classList.remove('show');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', openDrawer);
  drawerClose.addEventListener('click', closeDrawer);
  drawerMask.addEventListener('click', closeDrawer);

  // Close drawer on link click
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

  /* ══════════════════════════════════════════
     CART SIDEBAR
  ══════════════════════════════════════════ */
  function openCart() {
    cartSidebar.classList.add('open');
    cartMask.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    cartSidebar.classList.remove('open');
    cartMask.classList.remove('show');
    document.body.style.overflow = '';
  }

  cartBtn.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartMask.addEventListener('click', closeCart);

  /* ══════════════════════════════════════════
     CART STATE
  ══════════════════════════════════════════ */
  const PRODUCTS = {
    moringa: { name: 'Moringa Powder', price: 250, emoji: '🌿' },
    amla:    { name: 'Amla Powder',    price: 280, emoji: '🫐' }
  };

  let cart = {}; // { id: { ...product, qty } }

  function addToCart(id) {
    const p = PRODUCTS[id];
    if (!p) return;
    if (cart[id]) {
      cart[id].qty++;
    } else {
      cart[id] = { ...p, qty: 1 };
    }
    renderCart();
    showToast('🛒 ' + p.name + ' added to cart!');
    // Animate cart button
    cartBtn.classList.add('bump');
    setTimeout(() => cartBtn.classList.remove('bump'), 400);
  }

  function removeFromCart(id) {
    delete cart[id];
    renderCart();
  }

  function changeQty(id, delta) {
    if (!cart[id]) return;
    cart[id].qty += delta;
    if (cart[id].qty <= 0) removeFromCart(id);
    else renderCart();
  }

  function renderCart() {
    // Count
    const total = Object.values(cart).reduce((s, i) => s + i.qty, 0);
    cartCount.textContent = total;

    // Items
    csItems.innerHTML = '';
    if (total === 0) {
      csItems.appendChild(csEmpty.cloneNode(true));
      csFoot.style.display = 'none';
      return;
    }

    csFoot.style.display = 'flex';
    let sum = 0;

    Object.entries(cart).forEach(([id, item]) => {
      sum += item.price * item.qty;
      const el = document.createElement('div');
      el.className = 'cs-item';
      el.innerHTML = `
        <div class="csi-emoji">${item.emoji}</div>
        <div class="csi-info">
          <div class="csi-name">${item.name}</div>
          <div class="csi-price">₹${item.price} × ${item.qty} = ₹${item.price * item.qty}</div>
          <div class="csi-qty">
            <button class="qty-dec" data-id="${id}">−</button>
            <span>${item.qty}</span>
            <button class="qty-inc" data-id="${id}">+</button>
          </div>
        </div>
        <button class="csi-del" data-id="${id}" title="Remove">🗑</button>
      `;
      csItems.appendChild(el);
    });

    csTotal.textContent = '₹' + sum;

    // Bind qty/remove buttons
    csItems.querySelectorAll('.qty-dec').forEach(b => b.addEventListener('click', () => changeQty(b.dataset.id, -1)));
    csItems.querySelectorAll('.qty-inc').forEach(b => b.addEventListener('click', () => changeQty(b.dataset.id, +1)));
    csItems.querySelectorAll('.csi-del').forEach(b => b.addEventListener('click', () => removeFromCart(b.dataset.id)));
  }

  // Checkout → WhatsApp
  checkoutBtn.addEventListener('click', () => {
    if (Object.keys(cart).length === 0) return;
    const lines = Object.values(cart).map(i => `${i.name} x${i.qty} = ₹${i.price * i.qty}`).join('%0A');
    const total = Object.values(cart).reduce((s, i) => s + i.price * i.qty, 0);
    const msg = `Hi%2C%20I%20want%20to%20order%20from%20Vitamora%3A%0A${lines}%0ATotal%3A%20%E2%82%B9${total}`;
    window.open('https://wa.me/917225906842?text=' + msg, '_blank');
  });

  /* ══════════════════════════════════════════
     ADD TO CART & BUY NOW BUTTONS
  ══════════════════════════════════════════ */
  document.querySelectorAll('.add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      addToCart(btn.dataset.id);
      openCart();
    });
  });

  document.querySelectorAll('.buy-now').forEach(btn => {
    btn.addEventListener('click', () => {
      const name  = encodeURIComponent(btn.dataset.name);
      const price = btn.dataset.price;
      const msg   = `Hi%2C%20I%20want%20to%20buy%20${name}%20(200g)%20for%20%E2%82%B9${price}%20from%20Vitamora!`;
      window.open('https://wa.me/917225906842?text=' + msg, '_blank');
    });
  });

  /* ══════════════════════════════════════════
     HERO SLIDER
  ══════════════════════════════════════════ */
  const slides = document.querySelectorAll('.hs');
  const dots   = sDots ? sDots.querySelectorAll('.sdot') : [];
  let current  = 0;
  let sliderTimer;

  function goToSlide(n) {
    slides[current].classList.remove('active');
    if (dots[current]) dots[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');
  }

  function nextSlide() { goToSlide(current + 1); }
  function prevSlide() { goToSlide(current - 1); }

  function startSlider() {
    sliderTimer = setInterval(nextSlide, 5000);
  }
  function resetSlider() {
    clearInterval(sliderTimer);
    startSlider();
  }

  if (sPrev) sPrev.addEventListener('click', () => { prevSlide(); resetSlider(); });
  if (sNext) sNext.addEventListener('click', () => { nextSlide(); resetSlider(); });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goToSlide(parseInt(dot.dataset.i));
      resetSlider();
    });
  });

  // Swipe support
  let touchStartX = 0;
  const heroEl = document.querySelector('.hero');
  if (heroEl) {
    heroEl.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    heroEl.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) { dx < 0 ? nextSlide() : prevSlide(); resetSlider(); }
    }, { passive: true });
  }

  startSlider();

  /* ══════════════════════════════════════════
     SCROLL REVEAL
  ══════════════════════════════════════════ */
  const revealEls = document.querySelectorAll('.reveal, .reveal-l, .reveal-r');

  function revealElements() {
    const vh = window.innerHeight;
    revealEls.forEach(el => {
      if (el.getBoundingClientRect().top < vh - 80) {
        el.classList.add('visible');
      }
    });
  }

  // Run once on load
  revealElements();

  /* ══════════════════════════════════════════
     CONTACT FORM
  ══════════════════════════════════════════ */
  if (cForm) {
    cForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn = cForm.querySelector('button[type="submit"]');
      btn.textContent = '⏳ Sending…';
      btn.disabled = true;
      setTimeout(() => {
        formOk.style.display = 'block';
        cForm.reset();
        btn.textContent = '📨 Send Message';
        btn.disabled = false;
        setTimeout(() => { formOk.style.display = 'none'; }, 5000);
      }, 1200);
    });
  }

  /* ══════════════════════════════════════════
     TOAST
  ══════════════════════════════════════════ */
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(80px)';
    }, 2800);
  }

  /* ══════════════════════════════════════════
     SMOOTH SCROLL for anchor links
  ══════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = header.offsetHeight + 8;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    });
  });

  /* ══════════════════════════════════════════
     CART BUTTON BUMP ANIMATION (CSS inject)
  ══════════════════════════════════════════ */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes bump { 0%,100%{transform:scale(1)} 50%{transform:scale(1.35)} }
    .cart-btn.bump { animation: bump .35s ease; }
  `;
  document.head.appendChild(style);

  /* ── Init ── */
  renderCart();
  onScroll();

})();
