const allStalls = [
  {
    name: "Hainan Story",
    type: "Local favourite",
    dish: "Signature chicken rice",
    price: 7.2,
    rating: "4.8",
    tag: "A crowd favourite",
    category: "Local",
    photo: "photo-one",
  },
  {
    name: "Noodle House",
    type: "Rice & noodles",
    dish: "Wok hei beef hor fun",
    price: 8.5,
    rating: "4.7",
    tag: "Wok-fried fresh",
    category: "Rice",
    photo: "photo-two",
  },
  {
    name: "Little Thai Kitchen",
    type: "Quick bites",
    dish: "Basil chicken rice",
    price: 8.9,
    rating: "4.9",
    tag: "A little spicy",
    category: "Quick",
    photo: "photo-three",
  },
  {
    name: "The Curry Club",
    type: "Local favourite",
    dish: "Chicken curry & rice",
    price: 9.2,
    rating: "4.6",
    tag: "Comfort food",
    category: "Local",
    photo: "photo-four",
  },
  {
    name: "Green Bowl Co.",
    type: "Quick bites",
    dish: "Sesame tofu grain bowl",
    price: 8.8,
    rating: "4.8",
    tag: "Plant-powered",
    category: "Quick",
    photo: "photo-five",
  },
  {
    name: "Wok & Roll",
    type: "Rice & noodles",
    dish: "Char siew wonton noodles",
    price: 8.2,
    rating: "4.7",
    tag: "Made to order",
    category: "Rice",
    photo: "photo-six",
  },
];

const locationConfig = {
  542: {
    name: "Blk 542 hawker",
    stalls: allStalls.slice(0, 4),
  },
  344: {
    name: "Blk 344 hawker",
    stalls: allStalls.slice(4),
  },
};

const locationParam = new URLSearchParams(window.location.search).get("location");
let currentLocation = locationParam === "344" ? "344" : "542";
let stalls = locationConfig[currentLocation].stalls;

const cart = (() => {
  try {
    const savedCart = JSON.parse(localStorage.getItem("demo-group-cart"));
    return Array.isArray(savedCart) ? savedCart : [];
  } catch (_) {
    return [];
  }
})();

function saveCart() {
  localStorage.setItem("demo-group-cart", JSON.stringify(cart));
}

let currentFilter = "All";
let toastTimer;

const grid = document.querySelector("#stallGrid");
const toast = document.querySelector("#toast");

const money = (amount) => `$${amount.toFixed(2)}`;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
}

function renderStalls() {
  const query = document
    .querySelector("#searchInput")
    .value.trim()
    .toLowerCase();

  const shown = stalls.filter(
    (stall) =>
      (currentFilter === "All" || stall.category === currentFilter) &&
      `${stall.name} ${stall.dish} ${stall.type}`
        .toLowerCase()
        .includes(query),
  );

  grid.innerHTML = shown.length
    ? shown
        .map((stall) => {
          return `
            <article class="stall-card">
              <div class="food-photo ${stall.photo}" role="img" aria-label="Illustration of ${stall.dish}">
                <span class="food-detail"></span>
                <span class="dish-label">${stall.tag}</span>
              </div>
              <div class="card-info">
                <div class="card-top">
                  <h3>${stall.name}</h3>
                  <span class="rating">★ ${stall.rating}</span>
                </div>
                <div class="card-sub">${stall.type} · 8 min prep</div>
                <div class="dish-name">${stall.dish}</div>
                <div class="card-bottom">
                  <span class="price">${money(stall.price)}</span>
                  <button
                    class="add-btn"
                    data-add="${stall.dish}"
                    aria-label="Add ${stall.dish} to group order"
                  >＋ Add</button>
                </div>
              </div>
            </article>
          `;
        })
        .join("")
    : '<div class="empty-state">No dishes match that search. Try another dish or stall.</div>';
}

function updateCart() {
  const count = cart.reduce((total, item) => total + item.qty, 0);
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );

  document.querySelector("#cartCount").textContent = count;
  document.querySelector("#cartItems").textContent = count
    ? `${count} dish${count === 1 ? "" : "es"} · pickup 12:30–12:45`
    : "No dishes yet";
  document.querySelector("#cartSummary").textContent = count
    ? "Your group order is growing"
    : "Your group order";
  document.querySelector("#cartTotal").textContent = money(total);

  const customerView = document.querySelector("#customerView");
  document
    .querySelector("#cartDock")
    .classList.toggle("hidden", count === 0 || customerView.classList.contains("hidden"));

  saveCart();
}

grid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;

  const item = stalls.find((stall) => stall.dish === button.dataset.add);
  if (!item) return;

  const existing = cart.find((row) => row.name === item.dish);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      name: item.dish,
      stall: item.name,
      price: item.price,
      qty: 1,
    });
  }

  updateCart();
  showToast(`${item.dish} added to your group order`);
});

document.querySelectorAll(".filter-chip").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter-chip").forEach((chip) => {
      chip.classList.remove("selected");
    });

    button.classList.add("selected");
    currentFilter = button.dataset.filter;
    renderStalls();
  });
});

document
  .querySelector("#searchInput")
  .addEventListener("input", renderStalls);

document.querySelectorAll(".role-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".role-btn").forEach((roleButton) => {
      roleButton.classList.toggle("active", roleButton === button);
    });

    const isCustomer = button.dataset.view === "customer";
    document
      .querySelector("#customerView")
      .classList.toggle("hidden", !isCustomer);
    document
      .querySelector("#stallView")
      .classList.toggle("hidden", isCustomer);

    updateCart();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

document
  .querySelector("#copyCode")
  .addEventListener("click", async (event) => {
    try {
      const inviteUrl = new URL(window.location.href);
      inviteUrl.searchParams.set("location", currentLocation);
      inviteUrl.searchParams.set("group", "LUNCH-4K2");
      await navigator.clipboard.writeText(inviteUrl.toString());
    } catch (_) {
      // Clipboard access can be unavailable in non-secure contexts.
    }

    event.currentTarget.textContent = "Copied ✓";
    showToast("Invite code LUNCH-4K2 copied");

    setTimeout(() => {
      event.currentTarget.textContent = "Copy invite ↗";
    }, 1800);
  });

function openOrderReview() {
  if (!cart.length) return;

  const rows = cart
    .map(
      (item) => `
        <div class="review-row">
          <span>
            ${item.qty} × ${item.name}
            <small>${item.stall}</small>
          </span>
          <div class="review-item-actions">
            <button type="button" class="review-qty" data-review-action="decrease" data-dish="${item.name}" aria-label="Decrease ${item.name} quantity">−</button>
            <strong>${item.qty}</strong>
            <button type="button" class="review-qty" data-review-action="increase" data-dish="${item.name}" aria-label="Increase ${item.name} quantity">＋</button>
            <button type="button" class="review-remove" data-review-action="remove" data-dish="${item.name}" aria-label="Remove ${item.name}">Remove</button>
          </div>
        </div>
      `,
    )
    .join("");

  const total = cart.reduce(
    (sum, item) => sum + item.qty * item.price,
    0,
  );

  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.innerHTML = `
    <section class="review-modal" role="dialog" aria-modal="true" aria-labelledby="reviewTitle">
      <button class="modal-close" aria-label="Close">×</button>
      <div class="eyebrow muted">ONE PICKUP FOR THE WHOLE CREW</div>
      <h2 id="reviewTitle">Your group order</h2>
      <p class="review-pickup">◷ Today · 12:30 – 12:45 pm · Food Republic</p>
      <div class="review-items">${rows}</div>
      <div class="review-total">
        <span>Group total</span>
        <strong>${money(total)}</strong>
      </div>
      <button class="confirm-order">
        Place demo order <span>→</span>
      </button>
      <p class="demo-note">Demo only · No payment will be taken</p>
    </section>
  `;

  document.body.appendChild(modal);

  modal.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-review-action]");

    if (actionButton) {
      const item = cart.find((row) => row.name === actionButton.dataset.dish);
      if (!item) return;

      if (actionButton.dataset.reviewAction === "increase") {
        item.qty += 1;
      } else {
        item.qty -= 1;
      }

      if (actionButton.dataset.reviewAction === "remove" || item.qty <= 0) {
        cart.splice(cart.indexOf(item), 1);
      }

      updateCart();
      modal.remove();
      openOrderReview();
      return;
    }

    if (event.target === modal || event.target.closest(".modal-close")) {
      modal.remove();
    }

    if (event.target.closest(".confirm-order")) {
      modal.remove();
      cart.length = 0;
      updateCart();
      showToast("Demo order placed · Your group pickup is set!");
    }
  });
}

document
  .querySelector("#checkoutBtn")
  .addEventListener("click", openOrderReview);

const slider = document.querySelector("#capacitySlider");

function setCapacity(value) {
  const limit = Number(value);

  document.querySelector("#sliderValue").textContent = limit;
  document.querySelector("#capacityValue").textContent = limit;
  document.querySelector("#capacityUsed").textContent = Math.min(8, limit);
  document.querySelector("#capacityProgress").style.width = `${Math.min(
    100,
    (8 / limit) * 100,
  )}%`;

  slider.style.background = `linear-gradient(to right, #789568 ${
    ((limit - 4) / 20) * 100
  }%, #edf0e9 ${((limit - 4) / 20) * 100}%)`;
}

slider.addEventListener("input", () => setCapacity(slider.value));
setCapacity(slider.value);

document.querySelectorAll(".order-action").forEach((button) => {
  button.addEventListener("click", () => {
    const ready = button.classList.toggle("ready");
    button.textContent = "✓";

    const count = document.querySelectorAll(".order-action.ready").length;
    document.querySelector("#readyCount").textContent = `${count} ready`;

    const name = button
      .closest(".order-item")
      .querySelector(".order-info strong")
      .childNodes[0].textContent.trim();

    showToast(
      ready
        ? `${name}'s order marked ready`
        : `${name}'s order moved back to preparing`,
    );
  });
});

document
  .querySelector("#openToggle")
  .addEventListener("click", (event) => {
    const button = event.currentTarget;
    const open = button.classList.toggle("off") === false;

    button
      .closest(".open-status")
      .querySelector("span:nth-child(2)").textContent = open
      ? "Taking orders"
      : "Paused";

    showToast(open ? "Your stall is taking orders" : "New orders paused");
  });

document
  .querySelector("#addSlot")
  .addEventListener("click", () =>
    showToast("Pickup window added for 1:00 – 1:15 pm"),
  );

document.querySelectorAll(".edit-slot").forEach((button) => {
  button.addEventListener("click", () => {
    showToast(button.dataset.message);
  });
});

document
  .querySelector("#viewAll")
  .addEventListener("click", () =>
    showToast("Showing the next pickup window"),
  );

const locationSelect = document.querySelector("#locationSelect");

function setLocation(locationKey, updateUrl = true) {
  if (!locationConfig[locationKey]) return;

  currentLocation = locationKey;
  stalls = locationConfig[currentLocation].stalls;
  locationSelect.value = currentLocation;
  document.title = `Demo · ${locationConfig[currentLocation].name}`;

  const allStallCount = document.querySelector("#allStallCount");
  if (allStallCount) {
    allStallCount.textContent = String(stalls.length).padStart(2, "0");
  }

  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set("location", currentLocation);
    window.history.pushState({ location: currentLocation }, "", url);
  }

  currentFilter = "All";
  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.classList.toggle("selected", chip.dataset.filter === "All");
  });

  renderStalls();
  showToast(`Now viewing ${locationConfig[currentLocation].name}`);
}

locationSelect.value = currentLocation;
locationSelect.addEventListener("change", (event) => {
  setLocation(event.target.value);
});

window.addEventListener("popstate", () => {
  const selected = new URLSearchParams(window.location.search).get("location");
  setLocation(selected === "344" ? "344" : "542", false);
});

locationSelect.value = currentLocation;
document.title = `Demo · ${locationConfig[currentLocation].name}`;

document.querySelector("#allStallCount").textContent = String(stalls.length).padStart(2, "0");

renderStalls();
updateCart();
