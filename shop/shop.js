(() => {
  const scriptUrl = document.currentScript?.src || new URL('shop/shop.js', location.href).href;
  const shopRoot = new URL('.', scriptUrl);
  const storageKey = 'milliondream-shop-cart-v1';
  let catalogPromise;
  let catalog = [];
  let toastTimer;

  const shopUrl = (path = '') => new URL(path, shopRoot).href;
  const node = (tag, className, value) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value != null) element.textContent = value;
    return element;
  };

  function readCart() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return {};
      return Object.fromEntries(Object.entries(saved).filter(([id, quantity]) =>
        /^[a-z0-9-]+$/.test(id) && Number.isSafeInteger(quantity) && quantity > 0 && quantity <= 99));
    } catch { return {}; }
  }

  function writeCart(cart) {
    try { localStorage.setItem(storageKey, JSON.stringify(cart)); }
    catch { notify('장바구니를 저장할 수 없습니다. 브라우저 저장 설정을 확인해 주세요.'); return false; }
    refreshCartViews();
    return true;
  }

  function cartCount() {
    return Object.values(readCart()).reduce((total, quantity) => total + quantity, 0);
  }

  function updateCartCount() {
    document.querySelectorAll('[data-shop-cart-count]').forEach((span) => {
      span.textContent = String(cartCount());
    });
  }

  function notify(message) {
    let toast = document.querySelector('.sk-toast');
    if (!toast) {
      toast = node('div', 'sk-toast');
      toast.setAttribute('role', 'status');
      document.body.append(toast);
    }
    toast.textContent = message;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.remove(), 3500);
  }

  function loadCatalog() {
    if (!catalogPromise) {
      catalogPromise = fetch(shopUrl('products.json'), { cache: 'no-store' })
        .then((response) => {
          if (!response.ok) throw new Error(`상품 목록을 불러오지 못했습니다 (${response.status})`);
          return response.json();
        })
        .then((products) => {
          if (!Array.isArray(products)) throw new Error('상품 목록 형식이 올바르지 않습니다.');
          catalog = products.filter((product) => product && /^[a-z0-9-]+$/.test(product.id));
          return catalog;
        });
    }
    return catalogPromise;
  }

  function art(product) {
    const box = node('span', 'sk-art');
    box.dataset.theme = product.theme || 'field';
    box.setAttribute('aria-hidden', 'true');
    box.append(node('span', 'sk-art-mark', product.id === 'field-class' ? '01' : product.id === 'coaching-one' ? '02' : '03'));
    box.append(node('span', 'sk-art-caption', 'MILLION DREAM · LEARNING'));
    return box;
  }

  function productCard(product) {
    const card = node('article', 'sk-card');
    const visualLink = node('a', 'sk-card-visual');
    visualLink.href = shopUrl(`product.html?id=${encodeURIComponent(product.id)}`);
    visualLink.setAttribute('aria-label', `${product.name} 자세히 보기`);
    visualLink.append(art(product));
    const body = node('div', 'sk-card-body');
    const title = node('h3', 'sk-card-title');
    const titleLink = node('a', '', product.name);
    titleLink.href = visualLink.href;
    title.append(titleLink);
    const bottom = node('div', 'sk-card-bottom');
    const add = node('button', 'sk-button', '담기 +');
    add.type = 'button';
    add.dataset.shopAdd = product.id;
    bottom.append(node('span', 'sk-price-note', '가격은 공식 판매 페이지에서 확인'), add);
    body.append(node('span', 'sk-kicker', product.label), title, node('p', 'sk-card-copy', product.summary), bottom);
    card.append(visualLink, body);
    return card;
  }

  function renderProductLists(products) {
    document.querySelectorAll('[data-shop-featured], [data-shop-catalog]').forEach((container) => {
      const limit = container.hasAttribute('data-shop-featured') ? Number(container.dataset.shopFeatured) || 3 : products.length;
      container.classList.add('sk-grid');
      container.replaceChildren(...products.slice(0, limit).map(productCard));
    });
  }

  function renderProductDetail(products) {
    const container = document.querySelector('[data-shop-product]');
    if (!container) return;
    const id = new URLSearchParams(location.search).get('id');
    const product = products.find((item) => item.id === id);
    if (!product) {
      container.replaceChildren(node('h1', '', '상품을 찾을 수 없습니다'));
      const back = node('a', 'sk-button sk-button-secondary', '쇼핑 목록으로 돌아가기');
      back.href = shopUrl();
      container.append(back);
      return;
    }
    document.title = `${product.name} | 밀리언드림`;
    const visual = node('div', 'sk-detail-visual');
    visual.append(art(product));
    const copy = node('div', 'sk-detail-copy');
    const heading = node('h1', '', product.name);
    const information = node('div', 'sk-info-box');
    information.append(node('strong', '', '가격·일정·세부 조건'), node('span', '', '공식 판매 페이지에서 최신 정보를 확인해 주세요.'));
    const actions = node('div', 'sk-detail-actions');
    const add = node('button', 'sk-button', '장바구니에 담기');
    add.type = 'button';
    add.dataset.shopAdd = product.id;
    const official = node('a', 'sk-button sk-button-secondary', '공식 판매 페이지 보기 ↗');
    official.href = product.purchaseUrl;
    official.target = '_blank';
    official.rel = 'noopener noreferrer';
    actions.append(add, official);
    copy.append(node('span', 'sk-kicker', product.label), heading, node('p', '', product.detail), information, actions,
      node('p', 'sk-muted', '이 사이트의 장바구니는 선택 목록입니다. 실제 주문과 결제는 공식 판매 페이지에서 진행됩니다.'));
    container.replaceChildren(visual, copy);
  }

  function cartRows(products) {
    const cart = readCart();
    return products.filter((product) => cart[product.id]).map((product) => {
      const row = node('div', 'sk-cart-row');
      const info = node('div', 'sk-cart-info');
      const title = node('h3');
      const link = node('a', '', product.name);
      link.href = shopUrl(`product.html?id=${encodeURIComponent(product.id)}`);
      title.append(link);
      info.append(node('span', 'sk-kicker', product.label), title, node('p', '', '가격은 공식 판매 페이지에서 확인'));
      const quantity = node('div', 'sk-qty');
      quantity.setAttribute('aria-label', `${product.name} 수량`);
      const minus = node('button', '', '−');
      minus.type = 'button';
      minus.dataset.shopQuantity = product.id;
      minus.dataset.step = '-1';
      minus.setAttribute('aria-label', `${product.name} 수량 줄이기`);
      const output = node('output', '', String(cart[product.id]));
      const plus = node('button', '', '+');
      plus.type = 'button';
      plus.dataset.shopQuantity = product.id;
      plus.dataset.step = '1';
      plus.setAttribute('aria-label', `${product.name} 수량 늘리기`);
      quantity.append(minus, output, plus);
      const remove = node('button', 'sk-remove', '삭제');
      remove.type = 'button';
      remove.dataset.shopRemove = product.id;
      row.append(info, quantity, remove);
      return row;
    });
  }

  function renderCart(products) {
    const container = document.querySelector('[data-shop-cart-page]');
    if (!container) return;
    const rows = cartRows(products);
    if (!rows.length) {
      const back = node('a', 'sk-button', '상품 둘러보기');
      back.href = shopUrl();
      container.replaceChildren(node('p', 'sk-empty', '아직 담은 상품이 없습니다.'), back);
      return;
    }
    const notice = node('p', 'sk-notice', '장바구니는 이 브라우저에만 저장되는 선택 목록입니다. 실제 주문은 공식 판매 페이지에서 옵션과 금액을 다시 확인한 뒤 진행됩니다.');
    const actions = node('div', 'sk-panel-actions');
    const continueLink = node('a', 'sk-button sk-button-secondary', '상품 더 보기');
    continueLink.href = shopUrl();
    const checkoutLink = node('a', 'sk-button', '결제 안내로 이동 →');
    checkoutLink.href = shopUrl('checkout.html');
    actions.append(continueLink, checkoutLink);
    container.replaceChildren(...rows, notice, actions);
  }

  function renderCheckout(products) {
    const container = document.querySelector('[data-shop-checkout]');
    if (!container) return;
    const rows = cartRows(products);
    if (!rows.length) {
      const back = node('a', 'sk-button', '상품 둘러보기');
      back.href = shopUrl();
      container.replaceChildren(node('p', 'sk-empty', '장바구니가 비어 있습니다.'), back);
      return;
    }
    const notice = node('p', 'sk-notice', '이 사이트에서는 결제를 받거나 완료 여부를 확인하지 않습니다. 아래 공식 판매 페이지에서 옵션을 다시 선택하고, 최신 가격·환불 조건을 확인한 뒤 결제해 주세요. 여러 옵션을 담았다면 판매 페이지에서 각각 선택해야 합니다.');
    const actions = node('div', 'sk-panel-actions');
    const back = node('a', 'sk-button sk-button-secondary', '장바구니로 돌아가기');
    back.href = shopUrl('cart.html');
    const official = node('a', 'sk-button', '공식 판매 페이지에서 확인 ↗');
    official.href = products[0].purchaseUrl;
    official.target = '_blank';
    official.rel = 'noopener noreferrer';
    actions.append(back, official);
    container.replaceChildren(...rows, notice, actions);
  }

  function refreshCartViews() {
    updateCartCount();
    if (catalog.length) {
      renderCart(catalog);
      renderCheckout(catalog);
    }
  }

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const add = event.target.closest('[data-shop-add]');
    if (add) {
      loadCatalog().then((products) => {
        const product = products.find((item) => item.id === add.dataset.shopAdd);
        if (!product) { notify('상품을 찾을 수 없습니다.'); return; }
        const cart = readCart();
        cart[product.id] = Math.min((cart[product.id] || 0) + 1, 99);
        if (writeCart(cart)) notify(`장바구니에 담았습니다: ${product.name}`);
      }).catch(() => notify('상품 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'));
      return;
    }
    const quantity = event.target.closest('[data-shop-quantity]');
    if (quantity) {
      const cart = readCart();
      const id = quantity.dataset.shopQuantity;
      if (!catalog.some((product) => product.id === id)) return;
      const next = Math.min(99, (cart[id] || 0) + Number(quantity.dataset.step));
      if (next > 0) cart[id] = next;
      else delete cart[id];
      writeCart(cart);
      return;
    }
    const remove = event.target.closest('[data-shop-remove]');
    if (remove) {
      const cart = readCart();
      delete cart[remove.dataset.shopRemove];
      writeCart(cart);
    }
  });

  window.addEventListener('storage', refreshCartViews);
  updateCartCount();
  if (document.querySelector('[data-shop-featured], [data-shop-catalog], [data-shop-product], [data-shop-cart-page], [data-shop-checkout]')) {
    loadCatalog().then((products) => {
      renderProductLists(products);
      renderProductDetail(products);
      refreshCartViews();
    }).catch((error) => {
      document.querySelectorAll('[data-shop-featured], [data-shop-catalog], [data-shop-product], [data-shop-cart-page], [data-shop-checkout]')
        .forEach((container) => container.replaceChildren(node('p', 'sk-empty', `상품 정보를 불러오지 못했습니다. ${error.message}`)));
    });
  }
})();
