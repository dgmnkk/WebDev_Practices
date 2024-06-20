let pizzaList;
const cartKey = 'pizzaCart';
let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

const updateItemsAmout = (length) => document.querySelector('.title .badge').textContent = length;
const saveCart = () => localStorage.setItem(cartKey, JSON.stringify(cart));
const updateCartBadge = () => document.querySelector('.order-title .badge').textContent = cart.length;


document.addEventListener("DOMContentLoaded", () => {
    fetch("./pizza-list.json")
        .then(response => response.json())
        .then(data => {
            pizzaList = data;
            renderPizzas('all');
            updateCartBadge();
            renderCart();
        });
});

const renderPizzas = (filter) => {
    const menuPanel = document.querySelector('.menu-panel');
    menuPanel.innerHTML = '';
    let filteredPizzas = [];
    if (filter == 'all') {
        filteredPizzas = pizzaList;
    } else if (filter == 'vega') {
        filteredPizzas = pizzaList.filter(pizza => !pizza.content['meat'] && !pizza.content['chicken']);
    } else {
        filteredPizzas = pizzaList.filter(pizza => pizza.content[filter]);
    }
    updateItemsAmout(filteredPizzas.length);
    filteredPizzas.forEach(pizza => {
        const pizzaHtml = `
            <div class="menu-item">
                ${pizza.is_new ? '<span class="new-badge">Нова</span>' : '<span class="new-badge non">Нова</span>'}
                ${pizza.is_popular ? '<span class="popular-badge">Популярна</span>' : '<span class="popular-badge non">Нова</span>'}
                <img class="item-img" src="${pizza.icon}" />
                <div class="description">
                    <h3>${pizza.title}</h3>
                    <p class="type">${pizza.type}</p>
                    <p class="item-components">${Object.values(pizza.content).flat().join(', ')}</p>
                    <div class="options">
                        ${pizza.small_size ? createOptionHtml(pizza, 'small_size') : ''}
                        ${pizza.big_size ? createOptionHtml(pizza, 'big_size') : ''}
                    </div>
                </div>
            </div>`;
        menuPanel.innerHTML += pizzaHtml;
    });
};

const createOptionHtml = (pizza, size) => {
    return `
        <div class="option">
            <div>
                <img src="images/size-icon.svg" />
                <span>${pizza[size].size}</span>
            </div>
            <div>
                <img src="images/weight.svg" />
                <span>${pizza[size].weight}</span>
            </div>
            <p class="price">${pizza[size].price}</p>
            <p class="currency">грн</p>
            <button onclick="addToCart(${pizza.id}, '${size}')">Купити</button>
        </div>`;
};

const renderCart = () => {
    const cardPanel = document.querySelector('.card-panel');
    const summaryPrice = document.querySelector('.summary-price p:nth-child(2)');
    cardPanel.innerHTML = '';
    cart.forEach(item => {
        const cartItemHtml = `
            <div class="card-item">
                <div>
                    <p class="item-name">${item.title} (${item.sizeLabel})</p>
                    <span>
                        <img src="images/size-icon.svg" />
                        <span>${item.size}</span>
                    </span>
                    <span class="weight">
                        <img src="images/weight.svg" />
                        <span>${item.weight}</span>
                    </span>
                    <div class="price-info">
                        <p>${item.price * item.quantity} грн</p>
                        <div class="quantity">
                            <button class="decrement-btn" onclick="changeQuantity(${item.id}, '${item.sizeKey}', -1)">-</button>
                            <span class="numberBox"><span>${item.quantity}</span></span>
                            <button class="increment-btn" onclick="changeQuantity(${item.id}, '${item.sizeKey}', 1)">+</button>
                            <button class="delete-btn" onclick="removeFromCart(${item.id}, '${item.sizeKey}')">×</button>
                        </div>
                    </div>
                </div>
                <img class="summary-img" src="${item.icon}"/>
            </div>`;
        cardPanel.innerHTML += cartItemHtml;
    });
    summaryPrice.textContent = `${calculateTotal()} грн`;
};


const addToCart = (id, sizeKey) => {
    const pizza = pizzaList.find(pizza => pizza.id === id);
    const size = pizza[sizeKey];
    const sizeLabel = sizeKey === 'small_size' ? 'Мала' : 'Велика';
    const cartItem = cart.find(item => item.id === id && item.sizeKey === sizeKey);

    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({
            id: pizza.id,
            title: pizza.title,
            size: size.size,
            weight: size.weight,
            price: size.price,
            quantity: 1,
            sizeKey: sizeKey,
            sizeLabel: sizeLabel,
            icon: pizza.icon
        });
    }
    saveCart();
    updateCartBadge();
    renderCart();
};

const changeQuantity = (id, sizeKey, delta) => {
    const cartItem = cart.find(item => item.id === id && item.sizeKey === sizeKey);
    if (cartItem) {
        cartItem.quantity += delta;
        if (cartItem.quantity <= 0) {
            cart = cart.filter(item => item !== cartItem);
        }
        saveCart();
        updateCartBadge();
        renderCart();
    }
};

const removeFromCart = (id, sizeKey) => {
    cart = cart.filter(item => !(item.id === id && item.sizeKey === sizeKey));
    saveCart();
    updateCartBadge();
    renderCart();
};

const clearCart = () => {
    cart = [];
    saveCart();
    updateCartBadge();
    renderCart();
};

const placeOrder = () => {
    window.location.href = 'order.html';
};
const calculateTotal = () => cart.reduce((total, item) => total + item.price * item.quantity, 0);
document.querySelector('.clean-btn').addEventListener('click', clearCart);
document.querySelectorAll('.categories-panel button').forEach(button => {
    button.addEventListener('click', () => renderPizzas(button.getAttribute('name')));
});
