// ============================================
// CALCULATOR ENGINE - PROFESSIONAL VERSION
// ============================================

class CalculatorEngine {
  constructor() {
    this.reset();
    this.MAX_DISPLAY_LENGTH = 12;
    this.MAX_DECIMAL_PLACES = 8;
  }

  reset() {
    this.firstOperand = null;
    this.operator = null;
    this.waitingForSecondOperand = false;
    this.lastAction = null;
    this.hasDecimal = false;
    this.displayValue = '0';
    this.expression = '';
    this.error = null;
  }

  /**
   * Input a digit
   * @param {string} digit - Single digit 0-9
   */
  inputDigit(digit) {
    if (this.error) {
      this.reset();
    }

    if (this.waitingForSecondOperand || 
        this.displayValue === '0' || 
        this.lastAction === 'equals') {
      this.displayValue = digit;
      this.waitingForSecondOperand = false;
      this.hasDecimal = false;
    } else {
      // Prevent overflow
      if (this.displayValue.replace('.', '').length >= this.MAX_DISPLAY_LENGTH) {
        return;
      }
      this.displayValue += digit;
    }
    
    this.lastAction = 'digit';
  }

 
   // Input decimal point
   
  inputDecimal() {
    if (this.error) return;
    
    if (this.waitingForSecondOperand || this.lastAction === 'equals') {
      this.displayValue = '0.';
      this.waitingForSecondOperand = false;
      this.hasDecimal = true;
    } else if (!this.displayValue.includes('.')) {
      if (this.displayValue.length < this.MAX_DISPLAY_LENGTH) {
        this.displayValue += '.';
        this.hasDecimal = true;
      }
    }
    
    this.lastAction = 'decimal';
  }

  /**
   * Handle operator input
   * @param {string} nextOperator - +, -, *, /
   */
  handleOperator(nextOperator) {
    const inputValue = parseFloat(this.displayValue);
    
    // Prevent consecutive operators from calculating
    if (this.operator && this.lastAction === 'operator') {
      this.operator = nextOperator;
      this.updateExpression(inputValue, nextOperator);
      this.lastAction = 'operator';
      return;
    }

    // If we have a pending operation, calculate it first
    if (this.firstOperand !== null && 
        this.operator && 
        this.lastAction !== 'operator' &&
        !this.waitingForSecondOperand) {
      const result = this.calculate();
      if (this.error) return;
      
      this.displayValue = String(result);
      this.firstOperand = result;
    } else {
      this.firstOperand = inputValue;
    }

    this.operator = nextOperator;
    this.waitingForSecondOperand = true;
    this.hasDecimal = false;
    this.updateExpression(inputValue, nextOperator);
    this.lastAction = 'operator';
  }

  /**
   * Perform calculation
   * @returns {number|string} Result or error message
   */
  calculate() {
    const inputValue = parseFloat(this.displayValue);
    
    if (this.operator === null || this.firstOperand === null) {
      return inputValue;
    }

    // Handle division by zero
    if (this.operator === '/' && inputValue === 0) {
      this.error = 'Undefined';
      return this.error;
    }

    let result;
    switch (this.operator) {
      case '+':
        result = this.firstOperand + inputValue;
        break;
      case '-':
        result = this.firstOperand - inputValue;
        break;
      case '*':
        result = this.firstOperand * inputValue;
        break;
      case '/':
        result = this.firstOperand / inputValue;
        break;
      default:
        return inputValue;
    }

    // Round to avoid floating point issues
    result = Math.round((result + Number.EPSILON) * Math.pow(10, this.MAX_DECIMAL_PLACES)) / 
             Math.pow(10, this.MAX_DECIMAL_PLACES);

    // Check for overflow
    if (!isFinite(result)) {
      this.error = 'Result too large';
      return this.error;
    }

    return result;
  }

  /**
   * Evaluate the current expression
   */
  evaluate() {
    if (this.operator === null || this.waitingForSecondOperand) {
      return;
    }

    const result = this.calculate();
    
    if (typeof result === 'string') {
      this.displayValue = result;
    } else {
      this.displayValue = this.formatDisplay(result);
      this.firstOperand = result;
    }
    
    this.operator = null;
    this.waitingForSecondOperand = true;
    this.expression = '';
    this.lastAction = 'equals';
  }

  /**
   * Format number for display
   * @param {number} num - Number to format
   * @returns {string} Formatted string
   */
  formatDisplay(num) {
    const numStr = String(num);
    
    // If number is too long, use scientific notation
    if (numStr.length > this.MAX_DISPLAY_LENGTH) {
      if (Math.abs(num) > 1e12 || Math.abs(num) < 1e-6) {
        return num.toExponential(6);
      }
      
      // For decimal numbers, round to fit
      if (numStr.includes('.')) {
        const [integer, decimal] = numStr.split('.');
        const allowedDecimal = Math.max(0, this.MAX_DISPLAY_LENGTH - integer.length - 1);
        return parseFloat(num.toFixed(allowedDecimal)).toString();
      }
      
      // For large integers, use exponential notation
      return num.toExponential(6);
    }
    
    return numStr;
  }

  /**
   * Update expression display
   * @param {number} value - Current value
   * @param {string} operator - Current operator
   */
  updateExpression(value, operator) {
    if (this.expression === '') {
      this.expression = `${value} ${operator}`;
    } else {
      this.expression = `${this.expression} ${value} ${operator}`;
    }
  }

  /**
   * Delete last character
   */
  backspace() {
    if (this.error || this.waitingForSecondOperand) return;
    
    if (this.displayValue.length > 1) {
      const lastChar = this.displayValue.slice(-1);
      if (lastChar === '.') {
        this.hasDecimal = false;
      }
      this.displayValue = this.displayValue.slice(0, -1);
    } else {
      this.displayValue = '0';
      this.hasDecimal = false;
    }
    
    this.lastAction = 'backspace';
  }

  /**
   * Get current display value
   * @returns {string} Display value
   */
  getDisplayValue() {
    return this.displayValue;
  }

  /**
   * Get current expression
   * @returns {string} Expression string
   */
  getExpression() {
    return this.expression;
  }

  /**
   * Check if calculator has error
   * @returns {boolean} True if error exists
   */
  hasError() {
    return this.error !== null;
  }

  /**
   * Get error message
   * @returns {string|null} Error message or null
   */
  getError() {
    return this.error;
  }
}

// ============================================
// UI CONTROLLER
// ============================================

class CalculatorUI {
  constructor() {
    this.calculator = new CalculatorEngine();
    this.initializeDOM();
    this.bindEvents();
    this.initializeKeyboard();
  }

  initializeDOM() {
    this.display = document.getElementById('display');
    this.expressionDisplay = document.getElementById('expression');
    this.memoryStatus = document.getElementById('memory-status');
  }

  bindEvents() {
    // Number buttons
    document.querySelectorAll('[data-number]').forEach(button => {
      button.addEventListener('click', (e) => {
        this.handleButtonPress(e.target);
        this.calculator.inputDigit(button.dataset.number);
        this.updateDisplay();
      });
    });

    // Operator buttons
    document.querySelectorAll('[data-operator]').forEach(button => {
      button.addEventListener('click', (e) => {
        this.handleButtonPress(e.target);
        this.calculator.handleOperator(button.dataset.operator);
        this.updateDisplay();
      });
    });

    // Action buttons
    document.querySelectorAll('[data-action]').forEach(button => {
      button.addEventListener('click', (e) => {
        this.handleButtonPress(e.target);
        const action = button.dataset.action;
        
        switch (action) {
          case 'clear':
            this.calculator.reset();
            break;
          case 'equals':
            this.calculator.evaluate();
            break;
          case 'decimal':
            this.calculator.inputDecimal();
            break;
          case 'backspace':
            this.calculator.backspace();
            break;
        }
        
        this.updateDisplay();
      });
    });
  }

  initializeKeyboard() {
    document.addEventListener('keydown', (e) => {
      e.preventDefault();
      
      const key = e.key;
      
      // Number keys
      if (key >= '0' && key <= '9') {
        this.simulateButtonPress(`[data-number="${key}"]`);
        this.calculator.inputDigit(key);
        this.updateDisplay();
        return;
      }
      
      // Operator keys
      if (['+', '-', '*', '/'].includes(key)) {
        this.simulateButtonPress(`[data-operator="${key}"]`);
        this.calculator.handleOperator(key);
        this.updateDisplay();
        return;
      }
      
      // Special keys
      switch (key) {
        case '.':
          this.simulateButtonPress('[data-action="decimal"]');
          this.calculator.inputDecimal();
          break;
        case 'Enter':
        case '=':
          this.simulateButtonPress('[data-action="equals"]');
          this.calculator.evaluate();
          break;
        case 'Escape':
        case 'Delete':
          this.simulateButtonPress('.clear');
          this.calculator.reset();
          break;
        case 'Backspace':
          this.simulateButtonPress('.backspace');
          this.calculator.backspace();
          break;
      }
      
      this.updateDisplay();
    });
  }

  handleButtonPress(button) {
    button.classList.add('pressed');
    setTimeout(() => {
      button.classList.remove('pressed');
    }, 150);
  }

  simulateButtonPress(selector) {
    const button = document.querySelector(selector);
    if (button) {
      this.handleButtonPress(button);
    }
  }

  updateDisplay() {
    const displayValue = this.calculator.getDisplayValue();
    const expression = this.calculator.getExpression();
    
    // Update main display
    this.display.textContent = displayValue;
    
    if (this.calculator.hasError()) {
      this.display.classList.add('error');
      this.display.textContent = this.calculator.getError();
    } else {
      this.display.classList.remove('error');
    }
    
    // Update expression display
    this.expressionDisplay.textContent = expression;
    
    // Update memory status
    if (this.calculator.firstOperand !== null) {
      this.memoryStatus.textContent = `M: ${this.calculator.firstOperand}`;
    } else {
      this.memoryStatus.textContent = 'No Memory';
    }
  }
}

// ============================================
// INITIALIZATION
// ============================================

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const calculatorUI = new CalculatorUI();
  console.log('🧮 Modern Calculator initialized successfully!');
  
  // Export for debugging if needed
  window.calculator = calculatorUI;
});