// Firebase Initialization Script
// This script initializes Firebase on page load without requiring user interaction

import {
    database,
    auth,
    storage,
    isAuthenticated
} from './firebase-config.js';

// Initialize Firebase silently
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Check if we're on the admin page
        const isAdminPage = window.location.pathname.includes('admin.html');
        
        // If on admin page, check authentication
        if (isAdminPage) {
            const authenticated = await isAuthenticated();
            console.log('Admin authentication status:', authenticated ? 'Authenticated' : 'Not authenticated');
        }
        
        // Log successful initialization (only in development)
        if (localStorage.getItem('devMode') === 'true') {
            console.log('Firebase initialized successfully');
            console.log('Current page:', window.location.pathname);
        }
    } catch (error) {
        // Log errors silently (only in development)
        if (localStorage.getItem('devMode') === 'true') {
            console.error('Firebase initialization error:', error);
        }
    }
});
