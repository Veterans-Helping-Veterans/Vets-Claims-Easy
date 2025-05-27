// Admin Authentication Module for Veterans Claims Assistance Portal
// This module handles admin authentication with Firebase

import { 
    auth, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut,
    isAuthenticated
} from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async function() {
    // DOM elements - Login
    const loginForm = document.getElementById('loginForm');
    const loginContainer = document.getElementById('loginContainer');
    const adminDashboard = document.getElementById('adminDashboard');
    const loginError = document.getElementById('loginError');
    const togglePassword = document.getElementById('togglePassword');
    const logoutBtn = document.getElementById('logoutBtn');

    // Check if user is already logged in
    const userAuthenticated = await isAuthenticated();
    if (userAuthenticated && loginContainer && adminDashboard) {
        loginContainer.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
        // The admin.js script will handle loading the dashboard data
    }

    // Toggle password visibility
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('adminPassword');
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            // Toggle eye icon
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = document.getElementById('adminEmail').value;
            const password = document.getElementById('adminPassword').value;

            if (!email || !password) {
                showLoginError('Please enter both email and password.');
                return;
            }

            try {
                // Show loading state
                const submitButton = loginForm.querySelector('button[type="submit"]');
                const originalButtonText = submitButton.innerHTML;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
                submitButton.disabled = true;

                // Sign in with Firebase Authentication
                await signInWithEmailAndPassword(auth, email, password);

                // Login successful
                if (loginError) loginError.classList.add('hidden');
                loginContainer.classList.add('hidden');
                adminDashboard.classList.remove('hidden');

                // Log the login for audit purposes
                logAdminAction('login', { timestamp: new Date().toISOString() });

                // Set up session timeout (15 minutes)
                setupSessionTimeout(15);

            } catch (error) {
                console.error('Login error:', error);
                
                // Reset button
                const submitButton = loginForm.querySelector('button[type="submit"]');
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;

                // Show appropriate error message
                if (error.code === 'auth/invalid-credential') {
                    showLoginError('Invalid email or password. Please try again.');
                } else if (error.code === 'auth/too-many-requests') {
                    showLoginError('Too many failed login attempts. Please try again later.');
                } else {
                    showLoginError('An error occurred during login. Please try again.');
                }

                // Log failed login attempt for security monitoring
                logAdminAction('failed_login', { 
                    timestamp: new Date().toISOString(),
                    error: error.code
                });
            }
        });
    }

    // Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function() {
            try {
                await signOut(auth);
                
                // Log the logout for audit purposes
                logAdminAction('logout', { timestamp: new Date().toISOString() });
                
                // Redirect to login page
                adminDashboard.classList.add('hidden');
                loginContainer.classList.remove('hidden');
                document.getElementById('loginForm').reset();
                if (loginError) loginError.classList.add('hidden');
                
            } catch (error) {
                console.error('Logout error:', error);
                alert('An error occurred during logout. Please try again.');
            }
        });
    }

    // Function to show login error
    function showLoginError(message) {
        if (loginError) {
            loginError.textContent = message;
            loginError.classList.remove('hidden');
        } else {
            alert(message);
        }
    }

    // Function to set up session timeout
    function setupSessionTimeout(minutes) {
        // Clear any existing timeout
        if (window.sessionTimeoutId) {
            clearTimeout(window.sessionTimeoutId);
        }

        // Set new timeout
        const timeoutMs = minutes * 60 * 1000;
        window.sessionTimeoutId = setTimeout(async () => {
            // Check if user is still active
            const isActive = document.visibilityState === 'visible';
            if (isActive) {
                // If active, show warning
                const stayLoggedIn = confirm('Your session is about to expire. Do you want to stay logged in?');
                if (stayLoggedIn) {
                    // Reset timeout
                    setupSessionTimeout(minutes);
                } else {
                    // Log out
                    await signOut(auth);
                    adminDashboard.classList.add('hidden');
                    loginContainer.classList.remove('hidden');
                    alert('You have been logged out due to inactivity.');
                }
            } else {
                // If not active, log out automatically
                await signOut(auth);
                adminDashboard.classList.add('hidden');
                loginContainer.classList.remove('hidden');
            }
        }, timeoutMs);

        // Also set up activity listeners to reset timeout
        const resetTimeout = () => {
            setupSessionTimeout(minutes);
        };

        // Add event listeners for user activity
        document.addEventListener('click', resetTimeout);
        document.addEventListener('keypress', resetTimeout);
        document.addEventListener('mousemove', debounce(resetTimeout, 1000));
        document.addEventListener('scroll', debounce(resetTimeout, 1000));
    }

    // Debounce function to limit how often a function is called
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }

    // Function to log admin actions for audit purposes
    function logAdminAction(action, details) {
        const user = auth.currentUser;
        const logEntry = {
            action,
            timestamp: new Date().toISOString(),
            userId: user ? user.uid : 'unauthenticated',
            userEmail: user ? user.email : 'unauthenticated',
            details
        };

        // In a real application, this would be sent to a secure logging service
        // For now, we'll just log to console
        console.log('Admin action logged:', logEntry);

        // Store in localStorage for demo purposes
        const adminLogs = JSON.parse(localStorage.getItem('adminActionLogs') || '[]');
        adminLogs.push(logEntry);
        localStorage.setItem('adminActionLogs', JSON.stringify(adminLogs));
    }
});
