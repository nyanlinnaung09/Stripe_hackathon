const stalls = [
  { name: 'Hainan Story', type: 'Local favourite', dish: 'Signature chicken rice', price: 7.20, rating: '4.8', tag: 'A crowd favourite', category: 'Local', photo: 'photo-one' },
  { name: 'Noodle House', type: 'Rice & noodles', dish: 'Wok hei beef hor fun', price: 8.50, rating: '4.7', tag: 'Wok-fried fresh', category: 'Rice', photo: 'photo-two' },
  { name: 'Little Thai Kitchen', type: 'Quick bites', dish: 'Basil chicken rice', price: 8.90, rating: '4.9', tag: 'A little spicy', category: 'Quick', photo: 'photo-three' },
  { name: 'The Curry Club', type: 'Local favourite', dish: 'Chicken curry & rice', price: 9.20, rating: '4.6', tag: 'Comfort food', category: 'Local', photo: 'photo-four' },
  { name: 'Green Bowl Co.', type: 'Quick bites', dish: 'Sesame tofu grain bowl', price: 8.80, rating: '4.8', tag: 'Plant-powered', category: 'Quick', photo: 'photo-five' },
  { name: 'Wok & Roll', type: 'Rice & noodles', dish: 'Char siew wonton noodles', price: 8.20, rating: '4.7', tag: 'Made to order', category: 'Rice', photo: 'photo-six' }
];
const cart = [];
let currentFilter = 'All';
let toastTimer;
const grid = document.querySelector('#stallGrid');
const toast = document.querySelector('#toast');
const money = n => `$${n.toFixed(2)}`;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2300);
}

function renderStalls() {
  const query = document.querySelector('#searchInput').value.trim().toLowerCase();
  const shown = stalls.filter(s => (currentFilter === 'All' || s.category === currentFilter) && `${s.name} ${s.dish} ${s.type}`.toLowerCase().includes(query));
  grid.innerHTML = shown.length ? shown.map(s => {
    const idx = stalls.indexOf(s);
    return `<article class="stall-card"><div class="food-photo ${s.photo}" role="img" aria-label="Illustration of ${s.dish}"><span class="food-detail"></span><span class="dish-label">${s.tag}</span></div><div class="card-info"><div class="card-top"><h3>${s.name}</h3><span class="rating">★ ${s.rating}</span></div><div class="card-sub">${s.type} · 8 min prep</div><div class="dish-name">${s.dish}</div><div class="card-bottom"><span class="price">${money(s.price)}</span><button class="add-btn" data-add="${idx}" aria-label="Add ${s.dish} to group order">＋ Add</button></div></div></article>`;
  }).join('') : '<div class="empty-state">No dishes match that search. Try another dish or stall.</div>';
}

function updateCart() {
  const count = cart.reduce((n, item) => n + item.qty, 0);
  const total = cart.reduce((n, item) => n + item.price * item.qty, 0);
  document.querySelector('#cartCount').textContent = count;
  document.querySelector('#cartItems').textContent = count ? `${count} dish${count === 1 ? '' : 'es'} · pickup 12:30–12:45` : 'No dishes yet';
  document.querySelector('#cartSummary').textContent = count ? 'Your group order is growing' : 'Your group order';
  document.querySelector('#cartTotal').textContent = money(total);
  document.querySelector('#cartDock').classList.toggle('hidden', count === 0 || document.querySelector('#customerView').classList.contains('hidden'));
}

grid.addEventListener('click', event => {
  const button = event.target.closest('[data-add]');
  if (!button) return;
  const item = stalls[Number(button.dataset.add)];
  const existing = cart.find(row => row.name === item.dish);
  if (existing) existing.qty += 1;
  else cart.push({ name: item.dish, stall: item.name, price: item.price, qty: 1 });
  updateCart();
  showToast(`${item.dish} added to your group order`);
});

document.querySelectorAll('.filter-chip').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('selected'));
  button.classList.add('selected');
  currentFilter = button.dataset.filter;
  renderStalls();
}));
document.querySelector('#searchInput').addEventListener('input', renderStalls);

document.querySelectorAll('.role-btn').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.role-btn').forEach(b => b.classList.toggle('active', b === button));
  const isCustomer = button.dataset.view === 'customer';
  document.querySelector('#customerView').classList.toggle('hidden', !isCustomer);
  document.querySelector('#stallView').classList.toggle('hidden', isCustomer);
  updateCart();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}));

document.querySelector('#copyCode').addEventListener('click', async event => {
  try { await navigator.clipboard.writeText('LUNCH-4K2'); } catch (_) {}
  event.currentTarget.textContent = 'Copied ✓';
  showToast('Invite code LUNCH-4K2 copied');
  setTimeout(() => { event.currentTarget.textContent = 'Copy invite ↗'; }, 1800);
});

function openOrderReview() {
  if (!cart.length) return;
  const rows = cart.map(i => `<div class="review-row"><span>${i.qty} × ${i.name}<small>${i.stall}</small></span><strong>${money(i.qty * i.price)}</strong></div>`).join('');
  const total = cart.reduce((n, i) => n + i.qty * i.price, 0);
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.innerHTML = `<section class="review-modal" role="dialog" aria-modal="true" aria-labelledby="reviewTitle"><button class="modal-close" aria-label="Close">×</button><div class="eyebrow muted">ONE PICKUP FOR THE WHOLE CREW</div><h2 id="reviewTitle">Your group order</h2><p class="review-pickup">◷ Today · 12:30 – 12:45 pm · Food Republic</p><div class="review-items">${rows}</div><div class="review-total"><span>Group total</span><strong>${money(total)}</strong></div><button class="confirm-order">Place demo order <span>→</span></button><p class="demo-note">Demo only · No payment will be taken</p></section>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => {
    if (e.target === modal || e.target.closest('.modal-close')) modal.remove();
    if (e.target.closest('.confirm-order')) {
      modal.remove(); cart.length = 0; updateCart();
      showToast('Demo order placed · Your group pickup is set!');
    }
  });
}
document.querySelector('#checkoutBtn').addEventListener('click', openOrderReview);

const slider = document.querySelector('#capacitySlider');
function setCapacity(value) {
  const limit = Number(value);
  document.querySelector('#sliderValue').textContent = limit;
  document.querySelector('#capacityValue').textContent = limit;
  document.querySelector('#capacityUsed').textContent = Math.min(8, limit);
  document.querySelector('#capacityProgress').style.width = `${Math.min(100, (8 / limit) * 100)}%`;
  slider.style.background = `linear-gradient(to right, #789568 ${((limit - 4) / 20) * 100}%, #edf0e9 ${((limit - 4) / 20) * 100}%)`;
}
slider.addEventListener('input', () => setCapacity(slider.value));
setCapacity(slider.value);

document.querySelectorAll('.order-action').forEach(button => button.addEventListener('click', () => {
  const ready = button.classList.toggle('ready');
  button.textContent = ready ? '✓' : '✓';
  const count = document.querySelectorAll('.order-action.ready').length;
  document.querySelector('#readyCount').textContent = `${count} ready`;
  const name = button.closest('.order-item').querySelector('.order-info strong').childNodes[0].textContent.trim();
  showToast(ready ? `${name}'s order marked ready` : `${name}'s order moved back to preparing`);
}));

document.querySelector('#openToggle').addEventListener('click', event => {
  const button = event.currentTarget;
  const open = button.classList.toggle('off') === false;
  button.closest('.open-status').querySelector('span:nth-child(2)').textContent = open ? 'Taking orders' : 'Paused';
  showToast(open ? 'Your stall is taking orders' : 'New orders paused');
});
document.querySelector('#addSlot').addEventListener('click', () => showToast('Pickup window added for 1:00 – 1:15 pm'));
document.querySelectorAll('.edit-slot').forEach(button => button.addEventListener('click', () => showToast(button.dataset.message)));
document.querySelector('#viewAll').addEventListener('click', () => showToast('Showing the next pickup window'));

renderStalls();
updateCart();
