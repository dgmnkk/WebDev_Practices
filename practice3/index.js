const inputField = document.querySelector('.input-panel input');
const addButton = document.querySelector('.input-panel button');
const itemsList = document.querySelector('.items-list');
const summaryRemaining = document.querySelector('.summary:not(.bought) .summary-items-row');
const summaryBought = document.querySelector('.summary.bought .summary-items-row');

const initialItems = [
    { name: 'Печиво', quantity: 2, bought: false },
    { name: 'Сир', quantity: 1, bought: false },
    { name: 'Помідори', quantity: 2, bought: true }
];

function renderItem(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = `item ${item.bought ? 'bought' : ''}`;

    const itemName = item.bought ? 
        `<span class="item-name">${item.name}</span>` : 
        `<input class="item-name" type="text" value="${item.name}"/>`;

    itemDiv.innerHTML = `
        ${itemName}
        <div class="quantity">
            <button class="decrement-btn" data-tooltip="Зменшити кількість">-</button>
            <span class="numberBox"><span>${item.quantity}</span></span>
            <button class="increment-btn" data-tooltip="Збільшити кількість">+</button>
        </div>
        <div class="status-panel">
            <button class="status-button" data-tooltip="${item.bought ? 'Зробити не купленим' : 'Купити товар'}">${item.bought ? 'Куплено' : 'Купити'}</button>
            ${item.bought ? '' : '<button class="remove-button" data-tooltip="Видалити товар">x</button>'}
        </div>
    `;

    if (!item.bought) {
        const input = itemDiv.querySelector('input.item-name');
        input.addEventListener('blur', () => updateItemName(input, item));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                updateItemName(input, item);
            }
        });

        const removeButton = itemDiv.querySelector('.remove-button');
        removeButton.addEventListener('click', () => removeItem(item));

        const incrementButton = itemDiv.querySelector('.increment-btn');
        incrementButton.addEventListener('click', () => updateItemQuantity(item, 1));

        const decrementButton = itemDiv.querySelector('.decrement-btn');
        decrementButton.addEventListener('click', () => updateItemQuantity(item, -1));
    }

    const statusButton = itemDiv.querySelector('.status-button');
    statusButton.addEventListener('click', () => toggleItemStatus(item));

    return itemDiv;
}

function addItem(name, quantity = 1, bought = false) {
    const newItem = { name, quantity, bought };
    if (initialItems.some(item => item.name.toLowerCase() === name.toLowerCase())) {
        alert('Такий товар вже існує');
        return;
    }
    initialItems.push(newItem);
    itemsList.appendChild(renderItem(newItem));
    updateSummary();
}

function removeItem(item) {
    const index = initialItems.indexOf(item);
    if (index > -1) {
        initialItems.splice(index, 1);
        renderItems();
    }
}

function toggleItemStatus(item) {
    item.bought = !item.bought;
    renderItems();
}

function updateItemName(input, item) {
    if (initialItems.some(i => i.name.toLowerCase() === input.value.toLowerCase())) {
        input.value = item.name;
    }

    if(input.value !== ''){
        item.name = input.value;
        renderItems();
    }else{
        input.value = item.name;
    }
}

function updateItemQuantity(item, delta) {
    item.quantity += delta;
    if (item.quantity < 1) {
        item.quantity = 1;
    }
    renderItems();
}

function renderItems() {
    itemsList.innerHTML = '';
    initialItems.forEach(item => {
        itemsList.appendChild(renderItem(item));
    });
    updateSummary();
}

function updateSummary() {
    summaryRemaining.innerHTML = '';
    summaryBought.innerHTML = '';

    const remainingItems = initialItems.filter(item => !item.bought);
    const boughtItems = initialItems.filter(item => item.bought);

    remainingItems.forEach(item => {
        summaryRemaining.innerHTML += `
            <div class="summary-item">
                <span class="item-name">${item.name}</span>
                <span class="badge">${item.quantity}</span>
            </div>
        `;
    });

    boughtItems.forEach(item => {
        summaryBought.innerHTML += `
            <div class="summary-item">
                <span class="item-name">${item.name}</span>
                <span class="badge">${item.quantity}</span>
            </div>
        `;
    });
}

addButton.addEventListener('click', () => {
    const itemName = inputField.value.trim();
    if (itemName) {
        addItem(itemName);
        inputField.value = '';
        inputField.focus();
    }
});

inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        addButton.click();
    }
});

renderItems();