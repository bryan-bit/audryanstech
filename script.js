// ===== COMPLETE SCRIPT.JS (BASKET + CURRENCY SYSTEM) =====

document.addEventListener('DOMContentLoaded', () => {

  console.log("System loaded ✔");

  // =============================
  // GLOBAL SETTINGS
  // =============================
  let currency = "KES";
  let exchangeRate = 130; // 1 USD ≈ 130 KES

  let basket = [];

  const basketBtn = document.getElementById('viewBasketBtn');
  const popup = document.getElementById('basketPopup');
  const basketCountEl = document.getElementById('basketCount');
  const basketListEl = document.getElementById('basketList');
  const basketTotalEl = document.getElementById('basketTotal');
  const orderNowBtn = document.getElementById('orderNowBtn');
  const clearBasketBtn = document.getElementById('clearBasketBtn');
  const closePopupBtn = document.getElementById('closePopupBtn');
  const currencySelector = document.getElementById("currency");

  // =============================
  // FORMAT PRICE
  // =============================
  function formatPrice(kes) {
    if (currency === "USD") {
      return "$" + (kes / exchangeRate).toFixed(2);
    } else {
      return "KSh " + kes;
    }
  }

  // =============================
  // UPDATE ALL PRODUCT PRICES
  // =============================
  function updateAllPrices() {
    document.querySelectorAll('.service-card').forEach(card => {
      const pv = card.querySelector('.price-value');
      if (!pv) return;

      if (!pv.dataset.kes) {
        pv.dataset.kes = pv.textContent.replace(/[^0-9]/g, '');
      }

      const kes = parseInt(pv.dataset.kes);
      pv.textContent = formatPrice(kes);
    });
  }

  // =============================
  // CURRENCY SWITCH
  // =============================
  currencySelector.addEventListener("change", () => {
    currency = currencySelector.value;
    updateAllPrices();
    updateBasketUI();
  });

  // =============================
  // INIT CREDIT SELECTS
  // =============================
  document.querySelectorAll('.credits-select').forEach(select => {
    select.innerHTML = '';
    for (let i = 1; i <= 20; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = i;
      select.appendChild(opt);
    }
    select.value = '1';
  });

  // =============================
  // PRICE SELECT HANDLING
  // =============================
  document.querySelectorAll('.service-card').forEach(card => {
    const select = card.querySelector('.price-select');
    const creditsSelect = card.querySelector('.credits-select');

    if (creditsSelect) {
      const CREDIT_PRICE = 150;
      function updateCredits() {
        const qty = parseInt(creditsSelect.value);
        const total = qty * CREDIT_PRICE;
        const pv = card.querySelector('.price-value');
        pv.dataset.kes = total;
        pv.textContent = formatPrice(total);
      }
      creditsSelect.addEventListener('change', updateCredits);
      updateCredits();
    }

    if (select) {
      function updateSelectPrice() {
        const pv = card.querySelector('.price-value');
        const value = parseInt(select.value);
        pv.dataset.kes = value;
        pv.textContent = formatPrice(value);
      }
      select.addEventListener('change', updateSelectPrice);
      updateSelectPrice();
    }
  });

  // =============================
  // ADD TO BASKET
  // =============================
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.service-card');
      const name = card.querySelector('h3').textContent;
      const pv = card.querySelector('.price-value');

      const price = parseInt(pv.dataset.kes || pv.textContent.replace(/[^0-9]/g, ''));

      addToBasket(name, price);
    });
  });

  function addToBasket(name, price) {
    const existing = basket.find(item => item.name === name && item.price === price);

    if (existing) {
      existing.qty++;
    } else {
      basket.push({ id: Date.now(), name, price, qty: 1 });
    }

    updateBasketUI();
  }

  // =============================
  // UPDATE BASKET UI
  // =============================
  function updateBasketUI() {

    basketCountEl.textContent = basket.reduce((s, i) => s + i.qty, 0);

    basketListEl.innerHTML = '';

    basket.forEach(item => {
      const li = document.createElement('li');

      li.innerHTML = `
        <div>
          <strong>${item.name}</strong><br>
          ${formatPrice(item.price)} x ${item.qty}
        </div>
      `;

      basketListEl.appendChild(li);
    });

    const total = basket.reduce((s, i) => s + i.price * i.qty, 0);
    basketTotalEl.textContent = formatPrice(total);

    orderNowBtn.disabled = basket.length === 0;
    clearBasketBtn.disabled = basket.length === 0;
  }

  // =============================
  // POPUP CONTROL
  // =============================
  basketBtn.addEventListener('click', () => {
    popup.classList.add('active');
  });

  closePopupBtn.addEventListener('click', () => {
    popup.classList.remove('active');
  });

  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      popup.classList.remove('active');
    }
  });

  // =============================
  // CLEAR BASKET
  // =============================
  clearBasketBtn.addEventListener('click', () => {
    basket = [];
    updateBasketUI();
  });

  // =============================
  // ORDER (WHATSAPP)
  // =============================
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

  // =============================
  // INIT
  // =============================
  updateAllPrices();
  updateBasketUI();

});
