/**
 * HMS Client-side Form Validation (HOS-87)
 * Provides reusable validation utilities for all forms.
 */

'use strict';

const HMSValidator = (function() {
    // ===== Validation Rules =====
    const RULES = {
        email: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address'
        },
        username: {
            pattern: /^[a-zA-Z0-9._-]+$/,
            message: 'Username can only contain letters, numbers, dots, hyphens, and underscores'
        },
        password: {
            minLength: 8,
            patterns: [
                { regex: /[A-Z]/, message: 'Must contain an uppercase letter' },
                { regex: /[a-z]/, message: 'Must contain a lowercase letter' },
                { regex: /[0-9]/, message: 'Must contain a digit' },
                { regex: /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/, message: 'Must contain a special character' }
            ],
            message: 'Password must be at least 8 characters with uppercase, lowercase, digit, and special character'
        },
        phone: {
            pattern: /^[\d\s\-\(\)\+]{7,20}$/,
            message: 'Please enter a valid phone number'
        },
        required: {
            message: 'This field is required'
        }
    };

    // ===== DOM Helpers =====
    function getElement(selector) {
        if (typeof selector === 'string') return document.querySelector(selector);
        return selector;
    }

    function showFieldError(input, message) {
        const container = input.closest('.mb-4') || input.parentElement;
        const existing = container.querySelector('.field-error');

        // Remove existing error
        if (existing) existing.remove();

        // Add error class
        input.classList.add('border-red-400', 'focus:ring-red-500');
        input.classList.remove('border-gray-300', 'focus:ring-primary-500');

        // Create error element
        const error = document.createElement('p');
        error.className = 'field-error mt-1.5 text-xs text-red-600 flex items-center gap-1';
        error.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        container.appendChild(error);
    }

    function clearFieldError(input) {
        const container = input.closest('.mb-4') || input.parentElement;
        const existing = container.querySelector('.field-error');
        if (existing) existing.remove();

        input.classList.remove('border-red-400', 'focus:ring-red-500');
        input.classList.add('border-gray-300', 'focus:ring-primary-500');
    }

    function clearAllErrors(form) {
        form.querySelectorAll('.field-error').forEach(el => el.remove());
        form.querySelectorAll('.border-red-400').forEach(el => {
            el.classList.remove('border-red-400', 'focus:ring-red-500');
            el.classList.add('border-gray-300', 'focus:ring-primary-500');
        });
    }

    // ===== Validators =====
    function validateEmail(value) {
        if (!value) return { valid: false, message: RULES.required.message };
        if (!RULES.email.pattern.test(value)) return { valid: false, message: RULES.email.message };
        return { valid: true };
    }

    function validateUsername(value) {
        if (!value) return { valid: false, message: RULES.required.message };
        if (!RULES.username.pattern.test(value)) return { valid: false, message: RULES.username.message };
        return { valid: true };
    }

    function validatePassword(value) {
        if (!value) return { valid: false, message: RULES.required.message };
        if (value.length < RULES.password.minLength) {
            return { valid: false, message: `Password must be at least ${RULES.password.minLength} characters` };
        }
        for (const rule of RULES.password.patterns) {
            if (!rule.regex.test(value)) return { valid: false, message: rule.message };
        }
        return { valid: true };
    }

    function validateRequired(value) {
        if (!value || value.trim() === '') return { valid: false, message: RULES.required.message };
        return { valid: true };
    }

    function validatePhone(value) {
        if (!value) return { valid: true }; // Optional
        if (!RULES.phone.pattern.test(value)) return { valid: false, message: RULES.phone.message };
        return { valid: true };
    }

    // ===== Field Validator by Type =====
    function validateField(input) {
        const type = input.dataset.validate || input.type;
        const value = input.value;
        const name = input.name;

        if (name === 'email' || type === 'email') return validateEmail(value);
        if (name === 'username' || name === 'email' || type === 'text' && name.includes('username')) return validateUsername(value);
        if (name === 'password' || type === 'password') return validatePassword(value);
        if (name === 'phone' || type === 'tel') return validatePhone(value);
        if (input.required) return validateRequired(value);

        return { valid: true };
    }

    // ===== Form Validation =====
    function validateForm(form, options = {}) {
        const {
            showErrors = true,
            focusFirst = true,
            validateOnBlur = true,
            validateOnInput = true
        } = options;

        // Clear previous errors
        if (showErrors) clearAllErrors(form);

        let isValid = true;
        const inputs = form.querySelectorAll('input, select, textarea');
        let firstInvalid = null;

        inputs.forEach(input => {
            // Skip disabled, hidden, or non-validated fields
            if (input.disabled || input.type === 'hidden' || input.type === 'submit' || input.type === 'button') return;

            const result = validateField(input);
            if (!result.valid) {
                isValid = false;
                if (showErrors) showFieldError(input, result.message);
                if (!firstInvalid) firstInvalid = input;
            } else {
                if (showErrors) clearFieldError(input);
            }
        });

        // Focus first invalid field
        if (focusFirst && firstInvalid) {
            firstInvalid.focus();
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Setup live validation events
        if (isValid && validateOnBlur) {
            setupLiveValidation(form);
        }

        return isValid;
    }

    // ===== Live Validation (on blur & input) =====
    function setupLiveValidation(form) {
        form.addEventListener('blur', function(e) {
            const input = e.target;
            if (input.tagName === 'INPUT' || input.tagName === 'SELECT' || input.tagName === 'TEXTAREA') {
                if (input.dataset.validate !== 'off') {
                    const result = validateField(input);
                    if (!result.valid) {
                        showFieldError(input, result.message);
                    } else {
                        clearFieldError(input);
                    }
                }
            }
        }, true);

        form.addEventListener('input', function(e) {
            const input = e.target;
            if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
                // Clear error as user types
                const container = input.closest('.mb-4') || input.parentElement;
                const existing = container.querySelector('.field-error');
                if (existing) {
                    const result = validateField(input);
                    if (result.valid) {
                        clearFieldError(input);
                    } else {
                        existing.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${result.message}`;
                    }
                }
            }
        });
    }

    // ===== Password Strength Meter =====
    function getPasswordStrength(password) {
        let score = 0;
        if (password.length >= 8) score += 25;
        if (password.length >= 12) score += 10;
        if (/[A-Z]/.test(password)) score += 15;
        if (/[a-z]/.test(password)) score += 15;
        if (/[0-9]/.test(password)) score += 15;
        if (/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password)) score += 20;

        if (score >= 90) return { level: 'strong', color: 'bg-emerald-500', text: 'Very Strong', textColor: 'text-emerald-600' };
        if (score >= 70) return { level: 'good', color: 'bg-blue-500', text: 'Strong', textColor: 'text-blue-600' };
        if (score >= 50) return { level: 'fair', color: 'bg-amber-500', text: 'Fair', textColor: 'text-amber-600' };
        return { level: 'weak', color: 'bg-red-500', text: 'Weak', textColor: 'text-red-600' };
    }

    function attachPasswordStrength(inputId, meterId) {
        const input = document.getElementById(inputId);
        const meter = document.getElementById(meterId);
        if (!input || !meter) return;

        input.addEventListener('input', function() {
            const strength = getPasswordStrength(this.value);
            const bar = meter.querySelector('.strength-bar');
            const label = meter.querySelector('.strength-label');

            if (bar) {
                bar.style.width = this.value ? `${Math.min(strength.level === 'weak' ? 25 : strength.level === 'fair' ? 50 : strength.level === 'good' ? 75 : 100, 100)}%` : '0%';
                bar.className = `strength-bar h-2 rounded-full transition-all duration-300 ${this.value ? strength.color : 'bg-gray-200'}`;
            }
            if (label) {
                label.textContent = this.value ? strength.text : '';
                label.className = `strength-label text-xs mt-1 ${this.value ? strength.textColor : ''}`;
            }
        });
    }

    // ===== Toggle Password Visibility =====
    function togglePasswordVisibility(inputId, toggleBtnId) {
        const input = document.getElementById(inputId);
        const btn = document.getElementById(toggleBtnId);
        if (!input || !btn) return;

        btn.addEventListener('click', function() {
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            this.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
        });
    }

    // ===== Public API =====
    return {
        validateForm,
        validateField,
        validateEmail,
        validatePassword,
        validateRequired,
        validatePhone,
        showFieldError,
        clearFieldError,
        clearAllErrors,
        getPasswordStrength,
        attachPasswordStrength,
        togglePasswordVisibility,
        setupLiveValidation
    };
})();
