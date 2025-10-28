// script.js - Fully functional basket & dynamic price updates

document.addEventListener('DOMContentLoaded', () => {
  const basketBtn = document.getElementById('viewBasketBtn');
  const popup = document.getElementById('basketPopup');
  const basketCountEl = document.getElementById('basketCount');
  const basketListEl = document.getElementById('basketList');
  const basketTotalEl = document.getElementById('basketTotal');
  const orderNowBtn = document.getElementById('orderNowBtn');
  const clearBasketBtn = document.getElementById('clearBasketBtn');
  const closePopupBtn = document.getElementById('closePopupBtn');

  // basket array: { id, name, price, qty }
  let basket = [];

  // Helper: format integer price
  function toInt(v){ return parseInt(v, 10) || 0; }

  // Initialize credit options for places that used document.write in original
  document.querySelectorAll('.credits-select').forEach(select => {
    select.innerHTML = '';
    for (let i = 1; i <= 20; i++){
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = i;
      select.appendChild(opt);
    }
    // default: 1
    select.value = '1';
  });

  // Price update: when any .price-select changes, update sibling .price-value inside same card
  document.querySelectorAll('.service-card').forEach(card => {
    const select = card.querySelector('.price-select');
    const creditsSelect = card.querySelector('.credits-select');

    // Credits special case: Android WinTool credits price = credits * 150
    if (creditsSelect) {
      const CREDIT_PRICE = 150;
      function updateCredits() {
        const qty = toInt(creditsSelect.value);
        const total = qty * CREDIT_PRICE;
        const pv = card.querySelector('.price-value');
        if (pv) pv.textContent = total;
      }
      creditsSelect.addEventListener('change', updateCredits);
      updateCredits();
    }

    // generic price-select behavior: set shown price to selected option value
    if (select) {
      function updateSelectPrice() {
        const pv = card.querySelector('.price-value');
        if (!pv) return;
        // some selects might be like "1 -> credits price" but we're using option.value as price.
        const v = select.value;
        pv.textContent = v;
      }
      select.addEventListener('change', updateSelectPrice);
      updateSelectPrice();
    }
  });

  // Attach add button handlers: read name and visible price
  document.querySelectorAll('.service-card .add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.service-card');
      const name = (card.querySelector('h3')?.textContent || 'Service').trim();
      const pv = card.querySelector('.price-value');
      const price = toInt(pv?.textContent || card.dataset.price || 0);

      // Some cards display "Total: KSh 150" or "KSh 4000" — price-value should already be correct
      addToBasket(name, price);
    });
  });

  // Add item to basket (if same name exists, increment qty)
  function addToBasket(name, price) {
    if (!name || !price) {
      alert('Could not determine service name or price. Please try again.');
      return;
    }
    const existing = basket.find(it => it.name === name && it.price === price);
    if (existing) {
      existing.qty += 1;
    } else {
      basket.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2,6), name, price, qty: 1 });
    }
    updateBasketUI();
    // briefly highlight basket button
    flashBasket();
  }

  function flashBasket(){
    const el = document.getElementById('viewBasketBtn');
    el.classList.add('flash');
    setTimeout(()=> el.classList.remove('flash'), 400);
  }

  // Update basket DOM
  function updateBasketUI() {
    // count
    const totalItems = basket.reduce((s, it) => s + it.qty, 0);
    basketCountEl.textContent = totalItems;

    // list
    basketListEl.innerHTML = '';
    basket.forEach(item => {
      const li = document.createElement('li');

      // left: name & price
      const left = document.createElement('div');
      left.style.flex = '1';
      left.innerHTML = `<strong>${escapeHtml(item.name)}</strong><div style="font-size:0.9rem;color:#bfe;">KSh ${item.price}</div>`;

      // right: qty input & remove
      const controls = document.createElement('div');
      controls.className = 'item-controls';

      const qtyInput = document.createElement('input');
      qtyInput.type = 'number';
      qtyInput.min = '1';
      qtyInput.value = item.qty;
      qtyInput.className = 'qty';
      qtyInput.title = 'Change quantity';
      qtyInput.addEventListener('change', (e) => {
        const val = Math.max(1, toInt(e.target.value));
        item.qty = val;
        updateBasketUI();
      });

      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Remove';
      removeBtn.style.background = 'transparent';
      removeBtn.style.color = '#ff7b7b';
      removeBtn.style.border = '1px solid rgba(255,255,255,0.06)';
      removeBtn.style.padding = '6px';
      removeBtn.style.borderRadius = '6px';
      removeBtn.addEventListener('click', () => {
        basket = basket.filter(b => b.id !== item.id);
        updateBasketUI();
      });

      controls.appendChild(qtyInput);
      controls.appendChild(removeBtn);

      li.appendChild(left);
      li.appendChild(controls);

      basketListEl.appendChild(li);
    });

    // total
    const total = basket.reduce((s, it) => s + it.price * it.qty, 0);
    basketTotalEl.textContent = total;

    // disable order button if empty
    orderNowBtn.disabled = basket.length === 0;
    clearBasketBtn.disabled = basket.length === 0;
  }

  // popup toggles
  basketBtn.addEventListener('click', () => {
    popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
  });
  closePopupBtn.addEventListener('click', () => { popup.style.display = 'none'; });
  // also close if user clicks outside popup (optional)
  window.addEventListener('click', (ev) => {
    if (ev.target === popup) {
      popup.style.display = 'none';
    }
  });

  // clear basket
  clearBasketBtn.addEventListener('click', () => {
    if (!confirm('Clear entire basket?')) return;
    basket = [];
    updateBasketUI();
  });

  // order now -> open Telegram link with encoded message and clear basket
  orderNowBtn.addEventListener('click', () => {
    if (basket.length === 0) return;
    let message = "Hello Auditech, I'm placing an order for the following services:%0A";
    basket.forEach(it => {
      message += `- ${it.name} x${it.qty} (KSh ${it.price * it.qty})%0A`;
    });
    const total = basket.reduce((s, it) => s + it.price * it.qty, 0);
    message += `%0ATotal: KSh ${total}%0AThank you!`;
    const telegramLink = `https://t.me/Auditechh?text=${message}`;
    window.open(telegramLink, '_blank');
    // after ordering, clear basket
    basket = [];
    updateBasketUI();
    popup.style.display = 'none';
  });

  // escapeHtml helper for safety in innerHTML usage
  function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return (text + '').replace(/[&<>"']/g, function(m) { return map[m]; });
  }

  // initial UI update
  updateBasketUI();
});



