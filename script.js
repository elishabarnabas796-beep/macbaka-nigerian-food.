/* =========================================================
   MACBAKA — JAVASCRIPT
   Navigation • Menu • Cart • Reservations • Animations
========================================================= */

/* =========================================================
   01. ELEMENTS
========================================================= */

const navbar = document.getElementById("navbar");

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

const cartButton = document.getElementById("cartButton");
const cartSidebar = document.getElementById("cartSidebar");
const cartOverlay = document.getElementById("cartOverlay");
const closeCart = document.getElementById("closeCart");

const cartItemsContainer = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");

const categoryButtons = document.querySelectorAll(".category-btn");
const foodCards = document.querySelectorAll(".food-card");
const searchInput = document.getElementById("foodSearch");
const searchForm = document.getElementById("searchForm");
const clearSearch = document.getElementById("clearSearch");
const noResults = document.getElementById("noResults");
const searchResultsCount = document.getElementById("searchResultsCount");
const addCartButtons = document.querySelectorAll(".add-cart");
const reservationForm = document.getElementById("reservationForm");
const checkoutButton = document.getElementById("checkoutButton");

/* =========================================================
   02. NAVBAR SCROLL EFFECT
========================================================= */

if (navbar) {
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });
}

/* =========================================================
   03. MOBILE NAVIGATION
========================================================= */

if (menuToggle) {
    menuToggle.addEventListener("click", () => {
        navMenu.classList.toggle("active");
        menuToggle.classList.toggle("active");
    });
}

document.querySelectorAll(".nav-left a").forEach(link => {
    link.addEventListener("click", () => {
        if (navMenu) navMenu.classList.remove("active");
        if (menuToggle) menuToggle.classList.remove("active");
    });
});

/* =========================================================
   04. MENU FILTER
========================================================= */

let activeCategory = "all";

function filterFoods() {
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const searchWords = searchTerm
        .split(/\s+/)
        .filter(Boolean);
    let visibleCards = 0;

    foodCards.forEach(card => {
        const matchesCategory =
            activeCategory === "all" || card.dataset.category === activeCategory;

        const content = (card.dataset.name + " " + card.textContent)
            .toLowerCase()
            .replace(/&amp;/g, "and");
        const matchesSearch = searchWords.every(word => content.includes(word));
        const isVisible = matchesCategory && matchesSearch;

        card.style.display = isVisible ? "block" : "none";
        card.style.opacity = isVisible ? "1" : "0";
        card.style.transform = isVisible ? "translateY(0)" : "translateY(20px)";

        if (isVisible) visibleCards += 1;
    });

    if (noResults) {
        noResults.style.display = visibleCards === 0 ? "block" : "none";
    }

    if (clearSearch) {
        clearSearch.hidden = !searchTerm;
    }

    if (searchResultsCount) {
        searchResultsCount.textContent = searchTerm
            ? `${visibleCards} ${visibleCards === 1 ? "dish" : "dishes"} found`
            : "";
    }
}

categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
        activeCategory = button.dataset.category;

        categoryButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        filterFoods();
    });
});

if (searchInput) {
    searchInput.addEventListener("input", filterFoods);
}

if (clearSearch) {
    clearSearch.addEventListener("click", () => {
        searchInput.value = "";
        searchInput.focus();
        filterFoods();
    });
}

if (searchForm) {
    searchForm.addEventListener("submit", event => {
        event.preventDefault();
        filterFoods();
    });
}

filterFoods();

/* =========================================================
   05. SHOPPING CART
========================================================= */

let cart = [];

function openCart() {
    if (cartSidebar) cartSidebar.classList.add("open");
    if (cartOverlay) cartOverlay.classList.add("show");
    document.body.classList.add("cart-open");
}

function closeCartSidebar() {
    if (cartSidebar) cartSidebar.classList.remove("open");
    if (cartOverlay) cartOverlay.classList.remove("show");
    document.body.classList.remove("cart-open");
}

function formatNumber(number) {
    return new Intl.NumberFormat("en-NG").format(number);
}

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name,
            price,
            quantity: 1
        });
    }

    updateCart();
    openCart();
}

function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    updateCart();
}

function changeQuantity(name, change) {
    const item = cart.find(entry => entry.name === name);
    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        removeFromCart(name);
        return;
    }

    updateCart();
}

function updateCart() {
    if (!cartItemsContainer || !cartCount || !cartTotal) return;

    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <p class="empty-cart">
                Your cart is empty.
            </p>
        `;

        cartCount.textContent = "0";
        cartTotal.textContent = "₦0";
        return;
    }

    let totalItems = 0;
    let totalPrice = 0;

    cart.forEach(item => {
        totalItems += item.quantity;
        totalPrice += item.price * item.quantity;

        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";

        cartItem.innerHTML = `
            <div>
                <h4>${item.name}</h4>
                <p>₦${formatNumber(item.price)} × ${item.quantity}</p>
                <button class="remove-item" data-name="${item.name}">Remove</button>
            </div>

            <div>
                <div class="cart-item-price">₦${formatNumber(item.price * item.quantity)}</div>

                <div class="quantity-controls">
                    <button class="quantity-btn" data-action="decrease" data-name="${item.name}">−</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" data-action="increase" data-name="${item.name}">+</button>
                </div>
            </div>
        `;

        cartItemsContainer.appendChild(cartItem);
    });

    cartCount.textContent = String(totalItems);
    cartTotal.textContent = `₦${formatNumber(totalPrice)}`;

    document.querySelectorAll(".remove-item").forEach(button => {
        button.addEventListener("click", () => {
            removeFromCart(button.dataset.name);
        });
    });

    document.querySelectorAll(".quantity-btn").forEach(button => {
        button.addEventListener("click", () => {
            const change = button.dataset.action === "increase" ? 1 : -1;
            changeQuantity(button.dataset.name, change);
        });
    });
}

if (cartButton) {
    cartButton.addEventListener("click", openCart);
}

if (closeCart) {
    closeCart.addEventListener("click", closeCartSidebar);
}

if (cartOverlay) {
    cartOverlay.addEventListener("click", closeCartSidebar);
}

addCartButtons.forEach(button => {
    button.addEventListener("click", () => {
        const card = button.closest(".food-card");
        if (!card) return;

        const name = card.dataset.name;
        const price = Number(card.dataset.price);

        addToCart(name, price);
    });
});

/* =========================================================
   06. CHECKOUT
========================================================= */

if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
        if (cart.length === 0) {
            alert("Your cart is empty. Please add a meal first.");
            return;
        }

        const orderSummary = cart
            .map(item => `${item.name} × ${item.quantity}`)
            .join("\n");

        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const confirmed = confirm(
            `Your Macbaka order:\n\n` +
            `${orderSummary}\n\n` +
            `Total: ₦${formatNumber(total)}\n\n` +
            `Send this order to Macbaka on WhatsApp?`
        );

        if (confirmed) {
            const message = [
                "Hello Macbaka, I would like to place an order.",
                "",
                orderSummary,
                "",
                `Total: ₦${formatNumber(total)}`,
                "",
                "Please confirm availability and delivery details."
            ].join("\n");

            window.open(
                `https://wa.me/2348063591838?text=${encodeURIComponent(message)}`,
                "_blank",
                "noopener,noreferrer"
            );

            cart = [];
            updateCart();
            closeCartSidebar();
        }
    });
}

/* =========================================================
   07. RESERVATION FORM
========================================================= */

if (reservationForm) {
    reservationForm.addEventListener("submit", event => {
        event.preventDefault();

        const name = document.getElementById("guestName").value.trim();
        const phone = document.getElementById("guestPhone").value.trim();
        const date = document.getElementById("reservationDate").value;
        const time = document.getElementById("reservationTime").value;
        const guests = document.getElementById("guests").value;

        if (!name || !phone || !date || !time || !guests) {
            alert("Please complete all reservation fields.");
            return;
        }

        alert(
            `Thank you, ${name}!\n\n` +
            `Your reservation request has been received.\n\n` +
            `Date: ${date}\n` +
            `Time: ${time}\n` +
            `Guests: ${guests}`
        );

        reservationForm.reset();
    });
}

/* =========================================================
   08. SCROLL REVEAL ANIMATION
========================================================= */

const revealElements = document.querySelectorAll(
    ".food-card, .about-content, .about-image, .gallery-item, .reservation-content, .contact-grid > div"
);

const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.12
});

revealElements.forEach(element => {
    element.classList.add("reveal");
    revealObserver.observe(element);
});

/* =========================================================
   09. ACTIVE NAVIGATION
========================================================= */

const sections = document.querySelectorAll("section[id]");
const navigationLinks = document.querySelectorAll(".nav-left a");

const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.id;

            navigationLinks.forEach(link => {
                link.classList.remove("active");

                if (link.getAttribute("href") === `#${id}`) {
                    link.classList.add("active");
                }
            });
        }
    });
}, {
    threshold: 0.45
});

sections.forEach(section => {
    sectionObserver.observe(section);
});

/* =========================================================
   10. SET MINIMUM RESERVATION DATE
========================================================= */

const reservationDate = document.getElementById("reservationDate");

if (reservationDate) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    reservationDate.min = `${year}-${month}-${day}`;
}

/* =========================================================
   11. KEYBOARD ACCESS
========================================================= */

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeCartSidebar();

        if (navMenu) {
            navMenu.classList.remove("active");
        }
    }
});

/* =========================================================
   12. INITIALIZE
========================================================= */

updateCart();

console.log("Macbaka V1 successfully loaded.");
