// Calculator State Variables
let currentInput = '0';
let previousInput = '';
let operator = '';
let waitingForNewNumber = false;

// Get display elements
const display = document.getElementById('display');
const history = document.getElementById('history');

// 1. DISPLAY FUNCTIONS
function updateDisplay() {
    // Format large numbers with commas
    const formattedNumber = formatNumber(currentInput);
    display.textContent = formattedNumber;
    
    // Adjust font size for long numbers
    if (formattedNumber.length > 10) {
        display.style.fontSize = '1.8rem';
    } else if (formattedNumber.length > 8) {
        display.style.fontSize = '2.2rem';
    } else {
        display.style.fontSize = '2.5rem';
    }
}

function updateHistory(calculation) {
    history.textContent = calculation;
}

function formatNumber(num) {
    if (num === '' || num === 'Error') return num;
    
    // Handle decimal numbers
    if (num.includes('.')) {
        const parts = num.split('.');
        const wholePart = parseInt(parts[0]).toLocaleString();
        return wholePart + '.' + parts[1];
    }
    
    // Handle whole numbers
    const number = parseInt(num);
    return isNaN(number) ? num : number.toLocaleString();
}

// 2. INPUT FUNCTIONS
function inputNumber(num) {
    if (waitingForNewNumber) {
        currentInput = num;
        waitingForNewNumber = false;
    } else {
        currentInput = currentInput === '0' ? num : currentInput + num;
    }
    updateDisplay();
}

function inputOperator(op) {
    // If there's a pending calculation, complete it first
    if (previousInput !== '' && currentInput !== '' && operator !== '' && !waitingForNewNumber) {
        calculate();
    }
    
    previousInput = currentInput;
    operator = op;
    waitingForNewNumber = true;
    
    // Update history display
    const operatorSymbol = getOperatorSymbol(op);
    updateHistory(`${formatNumber(previousInput)} ${operatorSymbol}`);
}

function inputDecimal() {
    if (waitingForNewNumber) {
        currentInput = '0.';
        waitingForNewNumber = false;
    } else if (!currentInput.includes('.')) {
        currentInput += '.';
    }
    updateDisplay();
}

// 3. CALCULATION FUNCTIONS
function calculate() {
    if (previousInput === '' || operator === '' || waitingForNewNumber) {
        return;
    }
    
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    let result;
    
    // Perform calculation based on operator
    switch (operator) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            if (current === 0) {
                showError('Cannot divide by zero');
                return;
            }
            result = prev / current;
            break;
        default:
            return;
    }
    
    // Handle very large or very small numbers
    if (!isFinite(result)) {
        showError('Result too large');
        return;
    }
    
    // Round result to avoid floating point errors
    result = Math.round(result * 100000000) / 100000000;
    
    // Update history with complete calculation
    const operatorSymbol = getOperatorSymbol(operator);
    updateHistory(`${formatNumber(previousInput)} ${operatorSymbol} ${formatNumber(currentInput)} =`);
    
    currentInput = result.toString();
    previousInput = '';
    operator = '';
    waitingForNewNumber = true;
    
    updateDisplay();
    
    // Add success animation
    display.classList.add('success');
    setTimeout(() => {
        display.classList.remove('success');
    }, 500);
}

// 4. CLEAR FUNCTIONS
function clearAll() {
    currentInput = '0';
    previousInput = '';
    operator = '';
    waitingForNewNumber = false;
    updateDisplay();
    updateHistory('');
    
    // Remove any error states
    display.classList.remove('error');
}

function clearLast() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

// 5. UTILITY FUNCTIONS
function getOperatorSymbol(op) {
    const symbols = {
        '+': '+',
        '-': '−',
        '*': '×',
        '/': '÷'
    };
    return symbols[op] || op;
}

function showError(message) {
    currentInput = 'Error';
    updateDisplay();
    updateHistory(message);
    
    // Add error animation
    display.classList.add('error');
    
    // Clear error after 2 seconds
    setTimeout(() => {
        clearAll();
    }, 2000);
}

// 6. KEYBOARD SUPPORT
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    // Prevent default behavior for calculator keys
    if (/[0-9+\-*/.=]/.test(key) || key === 'Enter' || key === 'Escape' || key === 'Backspace') {
        event.preventDefault();
    }
    
    // Visual feedback for pressed keys
    const buttonElement = document.querySelector(`[data-key="${key}"]`) || 
                         document.querySelector(`[data-key="${key === 'Enter' ? 'Enter' : key}"]`);
    
    if (buttonElement) {
        buttonElement.classList.add('pressed');
        setTimeout(() => {
            buttonElement.classList.remove('pressed');
        }, 150);
    }
    
    // Handle different key types
    if (/[0-9]/.test(key)) {
        inputNumber(key);
    } else if (key === '.') {
        inputDecimal();
    } else if (['+', '-', '*', '/'].includes(key)) {
        inputOperator(key);
    } else if (key === 'Enter' || key === '=') {
        calculate();
    } else if (key === 'Escape') {
        clearAll();
    } else if (key === 'Backspace') {
        clearLast();
    }
});

// 7. INITIALIZATION
document.addEventListener('DOMContentLoaded', function() {
    updateDisplay();
    console.log('🧮 Calculator loaded successfully!');
    
    // Add subtle entrance animation
    const calculator = document.querySelector('.calculator');
    calculator.style.opacity = '0';
    calculator.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        calculator.style.transition = 'all 0.6s ease';
        calculator.style.opacity = '1';
        calculator.style.transform = 'translateY(0)';
    }, 100);
});

// 8. ADDITIONAL FEATURES
// Double-click to copy result
display.addEventListener('dblclick', function() {
    if (navigator.clipboard) {
        const textToCopy = currentInput === '0' ? '0' : currentInput;
        navigator.clipboard.writeText(textToCopy).then(() => {
            // Visual feedback for copy
            const originalText = display.textContent;
            display.textContent = 'Copied!';
            setTimeout(() => {
                display.textContent = originalText;
            }, 1000);
        });
    }
});

// Prevent context menu on calculator
document.querySelector('.calculator').addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

// 9. ERROR HANDLING
window.addEventListener('error', function(e) {
    console.error('Calculator error:', e.error);
    showError('Something went wrong');
});