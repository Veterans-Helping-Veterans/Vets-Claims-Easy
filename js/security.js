/**
 * Security measures for Veterans VA Claims Assistance Portal
 * This script implements basic security features for the website
 */

// Prevent clickjacking
if (window.self !== window.top) {
    window.top.location = window.self.location;
}

// Disable right-click context menu for sensitive pages
document.addEventListener('contextmenu', function(e) {
    const path = window.location.pathname;
    if (path.includes('submit.html') || path.includes('admin.html')) {
        e.preventDefault();
        return false;
    }
});

// Add CSRF token to forms
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        if (!form.querySelector('input[name="csrf_token"]')) {
            const csrfToken = generateCSRFToken();
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'csrf_token';
            input.value = csrfToken;
            form.appendChild(input);
            
            // Store token in session storage
            sessionStorage.setItem('csrf_token', csrfToken);
        }
    });
});

// Generate a random CSRF token
function generateCSRFToken() {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
}

// Sanitize input to prevent XSS
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// Validate form inputs
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    let isValid = true;
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value.trim()) {
            isValid = false;
            highlightInvalidField(input);
        } else if (input.type === 'email' && input.value && !validateEmail(input.value)) {
            isValid = false;
            highlightInvalidField(input);
        } else {
            removeInvalidHighlight(input);
        }
    });
    
    return isValid;
}

// Validate email format
function validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
}

// Highlight invalid form fields
function highlightInvalidField(field) {
    field.classList.add('border-red-500');
    
    // Add error message if it doesn't exist
    let errorMsg = field.nextElementSibling;
    if (!errorMsg || !errorMsg.classList.contains('error-message')) {
        errorMsg = document.createElement('p');
        errorMsg.className = 'text-red-500 text-sm mt-1 error-message';
        errorMsg.textContent = field.hasAttribute('data-error-message') 
            ? field.getAttribute('data-error-message') 
            : 'This field is required';
        field.parentNode.insertBefore(errorMsg, field.nextSibling);
    }
}

// Remove invalid highlight
function removeInvalidHighlight(field) {
    field.classList.remove('border-red-500');
    
    // Remove error message if it exists
    const errorMsg = field.nextElementSibling;
    if (errorMsg && errorMsg.classList.contains('error-message')) {
        errorMsg.remove();
    }
}

// Log security events
function logSecurityEvent(eventType, details) {
    console.log(`Security Event [${new Date().toISOString()}]: ${eventType}`, details);
    // In a real application, this would send the event to a server
}

// Check for session timeout
function checkSessionTimeout() {
    const lastActivity = sessionStorage.getItem('lastActivity');
    const now = new Date().getTime();
    
    // Set timeout to 30 minutes
    const timeoutDuration = 30 * 60 * 1000;
    
    if (lastActivity && (now - lastActivity > timeoutDuration)) {
        // Session expired
        sessionStorage.clear();
        if (window.location.pathname.includes('admin.html')) {
            window.location.href = 'index.html?session=expired';
        }
    }
    
    // Update last activity
    sessionStorage.setItem('lastActivity', now);
}

// Update last activity timestamp on user interaction
['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
    document.addEventListener(event, function() {
        sessionStorage.setItem('lastActivity', new Date().getTime());
    });
});

// Check session timeout every minute
setInterval(checkSessionTimeout, 60000);

// Initialize security measures
checkSessionTimeout();

// Security utilities for encryption and ID generation

// Encryption key (change this to your own secret key)
const ENCRYPTION_KEY = 'your-secret-encryption-key-2025';

// Generate a unique ID
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Encrypt sensitive data
export function encryptData(data) {
    try {
        // Convert the data to a string
        const str = JSON.stringify(data);
        
        // Simple encryption (for demo purposes - you might want to use a stronger encryption in production)
        const encrypted = btoa(encodeURIComponent(str));
        
        return encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        return null;
    }
}

// Decrypt sensitive data
export function decryptData(encryptedData) {
    try {
        // Simple decryption (matching the encryption above)
        const decrypted = decodeURIComponent(atob(encryptedData));
        
        return JSON.parse(decrypted);
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
}
