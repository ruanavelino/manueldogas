// DOM elements
const form = document.getElementById('orderForm');
const gasCheckbox = document.getElementById('gas');
const waterCheckbox = document.getElementById('water');
const gasQuantity = document.getElementById('gasQuantity');
const waterQuantity = document.getElementById('waterQuantity');
const waterBrandContainer = document.querySelector('.water-brand-container');
const quantitiesContainer = document.querySelector('.quantities-container');
const productSelection = document.querySelector('.product-selection');
const paymentSelect = document.getElementById('paymentSelect');
const changeContainer = document.getElementById('changeContainer');
const orderTotalElement = document.getElementById('orderTotal');
const submitButton = document.getElementById('submitOrder');
const confirmationModal = document.getElementById('confirmationModal');
const orderSummary = document.getElementById('orderSummary');
const cancelButton = document.getElementById('cancelOrder');
const confirmButton = document.getElementById('confirmOrder');

// Product prices
const PRODUCT_PRICES = {
    gas: 89.90,
    waterLustral: 8.90,
    waterSaloa: 7.90,
    waterSantaJoana: 9.90
};

// Phone number for WhatsApp
const whatsappNumber = '5581971202071'; // Format: country code + number without special chars

// Initialize input masks and event listeners
document.addEventListener('DOMContentLoaded', function() {
    setupInputMasks();
    setupEventListeners();
    makeProductCardsClickable();
    
    // Initially hide quantities container
    quantitiesContainer.style.display = 'none';
    
    // Set default water brand
    document.getElementById('saloa').checked = true;
});

function setupInputMasks() {
    // Phone mask - limiting to digits and proper format
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            if (value.length > 2) {
                value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
            }
            if (value.length > 10) {
                value = value.substring(0, 10) + '-' + value.substring(10);
            }
            e.target.value = value;
        }
    });
    
    // Currency mask for change amount
    const changeInput = document.getElementById('change');
    changeInput.addEventListener('input', function(e) {
        // Remove non-digit characters, keep only numbers
        let value = e.target.value.replace(/\D/g, '');
        
        // Convert to cents then to BRL format with 2 decimal places
        if (value) {
            const cents = parseInt(value);
            const reais = cents / 100;
            e.target.value = formatCurrency(reais);
        } else {
            e.target.value = '';
        }
    });
}

function formatCurrency(value) {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function makeProductCardsClickable() {
    // Make the entire card clickable
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function(e) {
            const checkbox = this.querySelector('.product-checkbox');
            
            // Toggle the checkbox state
            checkbox.checked = !checkbox.checked;
            
            // Update the card appearance immediately
            toggleProductCard(checkbox);
            
            // Trigger the change event manually
            const event = new Event('change');
            checkbox.dispatchEvent(event);
            
            // Remove focus from the card to prevent focus outline
            this.blur();
        });
    });
}

function setupEventListeners() {
    // Product selection
    gasCheckbox.addEventListener('change', function() {
        toggleProductCard(this);
        updateQuantitiesVisibility();
        calculateTotal();
    });

    waterCheckbox.addEventListener('change', function() {
        toggleProductCard(this);
        updateQuantitiesVisibility();
        calculateTotal();
    });
    
    // Water brand selection
    document.querySelectorAll('.brand-radio').forEach(radio => {
        radio.addEventListener('change', function() {
            calculateTotal();
        });
    });
    
    // Quantity changes
    document.getElementById('gasQty').addEventListener('change', calculateTotal);
    document.getElementById('waterQty').addEventListener('change', calculateTotal);

    // Payment method selection
    paymentSelect.addEventListener('change', function() {
        if (this.value === 'Dinheiro') {
            changeContainer.style.display = 'block';
        } else {
            changeContainer.style.display = 'none';
        }
    });

    // Form submission
    submitButton.addEventListener('click', function() {
        if (validateForm()) {
            showConfirmationModal();
        }
    });

    // Modal buttons
    cancelButton.addEventListener('click', function() {
        confirmationModal.style.display = 'none';
    });

    confirmButton.addEventListener('click', function() {
        sendToWhatsApp();
    });

    // Close modal if clicked outside
    window.addEventListener('click', function(event) {
        if (event.target === confirmationModal) {
            confirmationModal.style.display = 'none';
        }
    });
}

function toggleProductCard(checkbox) {
    const card = checkbox.closest('.product-card');
    if (checkbox.checked) {
        card.classList.add('active');
    } else {
        card.classList.remove('active');
    }
}

function updateQuantitiesVisibility() {
    // Show/hide individual quantity controls
    gasQuantity.style.display = gasCheckbox.checked ? 'block' : 'none';
    waterQuantity.style.display = waterCheckbox.checked ? 'block' : 'none';
    
    // Show/hide the water brand container based on water checkbox
    waterBrandContainer.style.display = waterCheckbox.checked ? 'block' : 'none';
    
    // Show/hide the quantities container based on selections
    if (gasCheckbox.checked || waterCheckbox.checked) {
        quantitiesContainer.style.display = 'block';
        if (productSelection.querySelector('.step-indicator')) {
            productSelection.querySelector('.step-indicator .step:first-child').classList.remove('active');
            productSelection.querySelector('.step-indicator .step:last-child').classList.add('active');
        }
    } else {
        quantitiesContainer.style.display = 'none';
        if (productSelection.querySelector('.step-indicator')) {
            productSelection.querySelector('.step-indicator .step:first-child').classList.add('active');
            productSelection.querySelector('.step-indicator .step:last-child').classList.remove('active');
        }
    }
}

function calculateTotal() {
    let total = 0;
    
    // Calculate gas total
    if (gasCheckbox.checked) {
        const gasQty = parseInt(document.getElementById('gasQty').value) || 0;
        total += PRODUCT_PRICES.gas * gasQty;
    }
    
    // Calculate water total
    if (waterCheckbox.checked) {
        const waterQty = parseInt(document.getElementById('waterQty').value) || 0;
        const selectedBrand = document.querySelector('input[name="waterBrand"]:checked');
        
        if (selectedBrand) {
            // Get the selected water brand price
            let waterPrice;
            switch (selectedBrand.value) {
                case 'Lustral':
                    waterPrice = PRODUCT_PRICES.waterLustral;
                    break;
                case 'Saloá':
                    waterPrice = PRODUCT_PRICES.waterSaloa;
                    break;
                case 'Santa Joana':
                    waterPrice = PRODUCT_PRICES.waterSantaJoana;
                    break;
                default:
                    waterPrice = PRODUCT_PRICES.waterSaloa; // Default to cheapest
            }
            
            total += waterPrice * waterQty;
        }
    }
    
    // Update the total display
    orderTotalElement.textContent = formatCurrency(total);
    
    // Store the calculated total as a data attribute for easy access
    orderTotalElement.dataset.totalValue = total;
}

function getSelectedWaterBrand() {
    const selectedBrand = document.querySelector('input[name="waterBrand"]:checked');
    return selectedBrand ? selectedBrand.value : null;
}

function validateForm() {
    let isValid = true;
    
    // Clear previous error messages
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

    // Required fields validation
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showError(field, 'Campo obrigatório');
            isValid = false;
        }
    });

    // Phone validation - must have at least 14 chars including formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput.value.length < 14) {
        showError(phoneInput, 'Telefone inválido');
        isValid = false;
    }

    // Product selection validation
    if (!gasCheckbox.checked && !waterCheckbox.checked) {
        showError(document.querySelector('.product-cards'), 'Selecione pelo menos um produto');
        isValid = false;
    }
    
    // Water brand validation
    if (waterCheckbox.checked && !getSelectedWaterBrand()) {
        showError(document.querySelector('.water-brands'), 'Selecione uma marca de água');
        isValid = false;
    }

    // Payment method validation
    if (!paymentSelect.value) {
        showError(paymentSelect, 'Selecione uma forma de pagamento');
        isValid = false;
    }

    // If money payment is selected, validate change amount
    if (paymentSelect.value === 'Dinheiro') {
        const changeInput = document.getElementById('change');
        if (!changeInput.value) {
            showError(changeInput, 'Informe o valor para troco');
            isValid = false;
        } else {
            // Validate if the change amount is sufficient
            const orderTotal = parseFloat(orderTotalElement.dataset.totalValue);
            const changeValue = parseCurrencyValue(changeInput.value);
            
            if (changeValue < orderTotal) {
                showError(changeInput, 'O valor para troco deve ser maior ou igual ao total do pedido');
                isValid = false;
            }
        }
    }

    return isValid;
}

function parseCurrencyValue(currencyString) {
    // Remove currency symbol, dots and convert comma to dot for proper parsing
    return parseFloat(currencyString.replace(/[^\d,]/g, '').replace(',', '.'));
}

function showError(element, message) {
    element.classList.add('error');
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    element.parentNode.appendChild(errorMessage);
}

function showConfirmationModal() {
    // Get form values
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const street = document.getElementById('street').value;
    const number = document.getElementById('number').value;
    const neighborhood = document.getElementById('neighborhood').value;
    const reference = document.getElementById('reference').value || 'Não informado';
    
    const gasOrdered = gasCheckbox.checked;
    const waterOrdered = waterCheckbox.checked;
    const gasQty = gasOrdered ? document.getElementById('gasQty').value : 0;
    const waterQty = waterOrdered ? document.getElementById('waterQty').value : 0;
    const waterBrand = waterOrdered ? getSelectedWaterBrand() : '';
    
    const observation = document.getElementById('observation').value || 'Nenhuma';
    const paymentMethod = paymentSelect.value;
    const change = (paymentMethod === 'Dinheiro') ? document.getElementById('change').value : 'N/A';
    const total = orderTotalElement.textContent;
    
    // Calculate change amount if payment is cash
    let changeAmount = '';
    if (paymentMethod === 'Dinheiro') {
        const totalValue = parseFloat(orderTotalElement.dataset.totalValue);
        const changeValue = parseCurrencyValue(change);
        const actualChange = changeValue - totalValue;
        
        if (actualChange >= 0) {
            changeAmount = formatCurrency(actualChange);
        }
    }

    // Format order summary
    const addressLine = `${street}, ${number}, ${neighborhood}, Gravatá/PE`;

    let summaryHTML = `
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Telefone:</strong> ${phone}</p>
        <p><strong>Endereço:</strong> ${addressLine}</p>
    `;

    if (reference !== 'Não informado') {
        summaryHTML += `<p><strong>Referência:</strong> ${reference}</p>`;
    }

    summaryHTML += `<p><strong>Pedido:</strong></p>`;

    if (gasOrdered) {
        summaryHTML += `<p>- Gás: ${gasQty} botijão(ões) - ${formatCurrency(gasQty * PRODUCT_PRICES.gas)}</p>`;
    }
    
    if (waterOrdered) {
        let waterPrice;
        switch (waterBrand) {
            case 'Lustral':
                waterPrice = PRODUCT_PRICES.waterLustral;
                break;
            case 'Saloá':
                waterPrice = PRODUCT_PRICES.waterSaloa;
                break;
            case 'Santa Joana':
                waterPrice = PRODUCT_PRICES.waterSantaJoana;
                break;
            default:
                waterPrice = 0;
        }
        
        summaryHTML += `<p>- Água: ${waterQty} galão(ões) ${waterBrand} - ${formatCurrency(waterQty * waterPrice)}</p>`;
    }

    if (observation !== 'Nenhuma') {
        summaryHTML += `<p><strong>Observação:</strong> ${observation}</p>`;
    }

    summaryHTML += `
        <p><strong>Pagamento:</strong> ${paymentMethod}</p>
        <p><strong>Total do Pedido:</strong> ${total}</p>
    `;

    if (paymentMethod === 'Dinheiro') {
        summaryHTML += `<p><strong>Troco para:</strong> ${change}</p>`;
        summaryHTML += `<p><strong>Valor do Troco:</strong> ${changeAmount}</p>`;
    }

    // Update modal content
    orderSummary.innerHTML = summaryHTML;
    
    // Show modal
    confirmationModal.style.display = 'flex';
}

function sendToWhatsApp() {
    // Get form values
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const street = document.getElementById('street').value;
    const number = document.getElementById('number').value;
    const neighborhood = document.getElementById('neighborhood').value;
    const reference = document.getElementById('reference').value || 'Não informado';
    
    const gasOrdered = gasCheckbox.checked;
    const waterOrdered = waterCheckbox.checked;
    const gasQty = gasOrdered ? document.getElementById('gasQty').value : 0;
    const waterQty = waterOrdered ? document.getElementById('waterQty').value : 0;
    const waterBrand = waterOrdered ? getSelectedWaterBrand() : '';
    
    const observation = document.getElementById('observation').value || 'Nenhuma';
    const paymentMethod = paymentSelect.value;
    const change = (paymentMethod === 'Dinheiro') ? document.getElementById('change').value : 'N/A';
    const total = orderTotalElement.textContent;

    // Calculate change amount if payment is cash
    let changeAmount = '';
    if (paymentMethod === 'Dinheiro') {
        const totalValue = parseFloat(orderTotalElement.dataset.totalValue);
        const changeValue = parseCurrencyValue(change);
        const actualChange = changeValue - totalValue;
        
        if (actualChange >= 0) {
            changeAmount = formatCurrency(actualChange);
        }
    }

    // Format WhatsApp message
    const addressLine = `${street}, ${number}, ${neighborhood}, Gravatá/PE`;

    let message = `Novo Pedido - Manuel do Gás\n`;
    message += `Nome: ${name}\n`;
    message += `Telefone: ${phone}\n`;
    message += `Endereço: ${addressLine}\n`;
    
    if (reference !== 'Não informado') {
        message += `Referência: ${reference}\n`;
    }
    
    message += `Pedido:\n`;
    
    if (gasOrdered) {
        message += `- Gás: ${gasQty} botijão(ões)\n`;
    }
    
    if (waterOrdered) {
        message += `- Água: ${waterQty} galão(ões) ${waterBrand}\n`;
    }
    
    if (observation !== 'Nenhuma') {
        message += `Observação: ${observation}\n`;
    }
    
    message += `Pagamento: ${paymentMethod}\n`;
    message += `Total do Pedido: ${total}\n`;
    
    if (paymentMethod === 'Dinheiro') {
        message += `Troco para: ${change}\n`;
        message += `Valor do Troco: ${changeAmount}`;
    }

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
    
    // Reset form after sending
    confirmationModal.style.display = 'none';
    form.reset();
    gasQuantity.style.display = 'none';
    waterQuantity.style.display = 'none';
    waterBrandContainer.style.display = 'none';
    quantitiesContainer.style.display = 'none';
    changeContainer.style.display = 'none';
    
    // Reset all card appearances
    document.querySelectorAll('.product-card').forEach(card => {
        card.classList.remove('active');
    });
    
    orderTotalElement.textContent = formatCurrency(0);
    
    // Reset default water brand
    document.getElementById('saloa').checked = true;
} 