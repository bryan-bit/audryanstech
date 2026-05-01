document.addEventListener('DOMContentLoaded', () => {

  console.log("System loaded ✔");

  // =============================
  // SAFE ELEMENT GETTER
  // =============================
  const get = (id) => document.getElementById(id);

  const basketBtn = get('viewBasketBtn');
  const popup = get('basketPopup');
  const basketCountEl = get('basketCount');
  const basketListEl = get('basketList');
  const basketTotalEl = get('basketTotal');
  const orderNowBtn = get('orderNowBtn');
  const clearBasketBtn = get('clearBasketBtn');
  const closePopupBtn = get('closePopupBtn');
  const currencySelector = get('currency');

  let currency = "KES";
  let exchangeRate = 130;
  let basket = [];

  // =============================
  // FORMAT PRICE
  // =============================
  function formatPrice(kes) {
    if (currency === "USD") {
      return "$" + (kes / exchangeRate).toFixed(2);
    }
    return "KSh " + kes;
  }

  // =============================
  // UPDATE ALL PRICES
  // =============================
  function updateAllPrices() {
    document.querySelectorAll('.service-card').forEach(card => {
      const pv = card.querySelector('.price-value');
      if (!pv) return;

      if (!pv.dataset.kes) {
        const raw = pv.textContent.replace(/[^0-9]/g, '');
        pv.dataset.kes = parseInt(raw || 0);
      }

      const kes = parseInt(pv.dataset.kes);

      pv.textContent = formatPrice(kes);
    });
  }

  // =============================
  // CURRENCY SWITCH (SAFE)
  // =============================
  if (currencySelector) {
    currencySelector.addEventListener("change", () => {
      currency = currencySelector.value;
      console.log("Currency:", currency);
      updateAllPrices();
      updateBasketUI();
    });
  }

  // =============================
  // PRICE SELECTS
  // =============================
  document.querySelectorAll('.service-card').forEach(card => {
    const select = card.querySelector('.price-select');

    if (select) {
      const pv = card.querySelector('.price-value');

      const updatePrice = () => {
        const value = parseInt(select.value);
        pv.dataset.kes = value;
        pv.textContent = formatPrice(value);
      };

      select.addEventListener('change', updatePrice);
      updatePrice();
    }
  });

  // =============================
  // ADD TO BASKET
  // =============================
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.service-card');
      if (!card) return;

      const name = card.querySelector('h3')?.textContent || "Item";
      const pv = card.querySelector('.price-value');

      if (!pv || !pv.dataset.kes) return;

      const price = parseInt(pv.dataset.kes);

      const existing = basket.find(i => i.name === name && i.price === price);

      if (existing) {
        existing.qty++;
      } else {
        basket.push({ id: Date.now(), name, price, qty: 1 });
      }

      updateBasketUI();
    });
  });

  // =============================
  // UPDATE BASKET UI
  // =============================
  function updateBasketUI() {
    if (!basketCountEl || !basketListEl || !basketTotalEl) return;

    basketCountEl.textContent = basket.reduce((s, i) => s + i.qty, 0);

    basketListEl.innerHTML = '';

    basket.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${item.name}</strong><br>
        ${formatPrice(item.price)} x ${item.qty}
      `;
      basketListEl.appendChild(li);
    });

    const total = basket.reduce((s, i) => s + i.price * i.qty, 0);
    basketTotalEl.textContent = formatPrice(total);

    if (orderNowBtn) orderNowBtn.disabled = basket.length === 0;
    if (clearBasketBtn) clearBasketBtn.disabled = basket.length === 0;
  }

  // =============================
  // POPUP (SAFE)
  // =============================
  if (basketBtn && popup) {
    basketBtn.addEventListener('click', () => {
      popup.classList.add('active');
    });
  }

  if (closePopupBtn && popup) {
    closePopupBtn.addEventListener('click', () => {
      popup.classList.remove('active');
    });
  }

  if (popup) {
    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        popup.classList.remove('active');
      }
    });
  }

  // =============================
  // CLEAR
  // =============================
  if (clearBasketBtn) {
    clearBasketBtn.addEventListener('click', () => {
      basket = [];
      updateBasketUI();
    });
  }

  // =============================
  // ORDER (WHATSAPP)
  // =============================
  if (orderNowBtn) {
    orderNowBtn.addEventListener('click', () => {
      let message = "Hello, I want to order:%0A";

      basket.forEach(item => {
        message += `- ${item.name} x${item.qty} (${formatPrice(item.price * item.qty)})%0A`;
      });

      const total = basket.reduce((s, i) => s + i.price * i.qty, 0);
      message += `%0ATotal: ${formatPrice(total)}`;

      window.open(`https://wa.me/254725820123?text=${message}`, '_blank');

      basket = [];
      updateBasketUI();
      popup.classList.remove('active');
    });
  }

  // INIT
  updateAllPrices();
  updateBasketUI();

});
