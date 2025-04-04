// DOM elements
const form = document.getElementById('orderForm');
const gasCheckbox = document.getElementById('gas');
const waterCheckbox = document.getElementById('water');
const gasQuantity = document.getElementById('gasQuantity');
const waterQuantity = document.getElementById('waterQuantity');
const paymentSelect = document.getElementById('paymentSelect');
const changeContainer = document.getElementById('changeContainer');
const submitButton = document.getElementById('submitOrder');
const confirmationModal = document.getElementById('confirmationModal');
const orderSummary = document.getElementById('orderSummary');
const cancelButton = document.getElementById('cancelOrder');
const confirmButton = document.getElementById('confirmOrder');

// Phone number for WhatsApp
const whatsappNumber = '5581971202071'; // Format: country code + number without special chars

// Initialize input masks
document.addEventListener('DOMContentLoaded', function() {
    // Set up input masks and event listeners
    setupInputMasks();
    setupEventListeners();
    
    // Make product cards clickable as a whole
    makeProductCardsClickable();
});

function setupInputMasks() {
    // Phone mask
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
}

function makeProductCardsClickable() {
    // Make the entire card clickable
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't trigger if clicked on quantity controls
            if (e.target.closest('.quantity-control')) return;
            
            const checkbox = this.querySelector('.product-checkbox');
            checkbox.checked = !checkbox.checked;
            
            // Trigger the change event manually
            const event = new Event('change');
            checkbox.dispatchEvent(event);
        });
    });
}

function setupEventListeners() {
    // Product selection
    gasCheckbox.addEventListener('change', function() {
        toggleQuantityControl(this, gasQuantity);
    });

    waterCheckbox.addEventListener('change', function() {
        toggleQuantityControl(this, waterQuantity);
    });

    // Payment method selection
    paymentSelect.addEventListener('change', function() {
        if (this.value === 'Dinheiro') {
            changeContainer.style.display = 'block';
        } else {
            changeContainer.style.display = 'none';
        }
    });

    // Set up quantity control buttons
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent triggering the card click
            const input = this.parentElement.querySelector('.quantity-input');
            const currentValue = parseInt(input.value);
            
            if (this.classList.contains('plus')) {
                input.value = currentValue + 1;
            } else if (this.classList.contains('minus') && currentValue > 1) {
                input.value = currentValue - 1;
            }
        });
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

function toggleQuantityControl(checkbox, quantityControl) {
    if (checkbox.checked) {
        quantityControl.style.display = 'flex';
        checkbox.parentElement.classList.add('active');
    } else {
        quantityControl.style.display = 'none';
        checkbox.parentElement.classList.remove('active');
    }
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

    // Phone validation
    const phoneInput = document.getElementById('phone');
    if (phoneInput.value.replace(/\D/g, '').length < 11) {
        showError(phoneInput, 'Telefone inválido');
        isValid = false;
    }

    // Product selection validation
    if (!gasCheckbox.checked && !waterCheckbox.checked) {
        showError(document.querySelector('.product-cards'), 'Selecione pelo menos um produto');
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
        }
    }

    return isValid;
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
    const gasQty = gasOrdered ? document.querySelector('input[name="gasQty"]').value : 0;
    const waterQty = waterOrdered ? document.querySelector('input[name="waterQty"]').value : 0;
    
    const observation = document.getElementById('observation').value || 'Nenhuma';
    const paymentMethod = paymentSelect.value;
    const change = (paymentMethod === 'Dinheiro') ? document.getElementById('change').value : 'N/A';

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
        summaryHTML += `<p>- Gás: ${gasQty} botijão(ões)</p>`;
    }
    
    if (waterOrdered) {
        summaryHTML += `<p>- Água: ${waterQty} galão(ões)</p>`;
    }

    if (observation !== 'Nenhuma') {
        summaryHTML += `<p><strong>Observação:</strong> ${observation}</p>`;
    }

    summaryHTML += `<p><strong>Pagamento:</strong> ${paymentMethod}</p>`;

    if (paymentMethod === 'Dinheiro') {
        summaryHTML += `<p><strong>Troco para:</strong> R$ ${change}</p>`;
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
    const gasQty = gasOrdered ? document.querySelector('input[name="gasQty"]').value : 0;
    const waterQty = waterOrdered ? document.querySelector('input[name="waterQty"]').value : 0;
    
    const observation = document.getElementById('observation').value || 'Nenhuma';
    const paymentMethod = paymentSelect.value;
    const change = (paymentMethod === 'Dinheiro') ? document.getElementById('change').value : 'N/A';

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
        message += `- Água: ${waterQty} galão(ões)\n`;
    }
    
    if (observation !== 'Nenhuma') {
        message += `Observação: ${observation}\n`;
    }
    
    message += `Pagamento: ${paymentMethod}\n`;
    
    if (paymentMethod === 'Dinheiro') {
        message += `Troco para: R$ ${change}`;
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
    changeContainer.style.display = 'none';
    document.querySelectorAll('.product-card').forEach(card => card.classList.remove('active'));
} 