// Admin User Creation Script
// This script helps create an admin user in Firebase Authentication

import { 
    auth,
    database,
    ref,
    set
} from './firebase-config.js';

document.addEventListener('DOMContentLoaded', function() {
    // Create admin setup UI
    const setupContainer = document.createElement('div');
    setupContainer.className = 'fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50 max-w-md';
    setupContainer.innerHTML = `
        <h3 class="text-lg font-bold mb-2">Create Admin User</h3>
        <p class="text-sm text-gray-600 mb-4">
            This tool helps you create an admin user in Firebase Authentication.
            <br>
            <strong>Note:</strong> You must enable Email/Password authentication in the Firebase console first.
        </p>
        <div class="space-y-3">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" id="adminEmail" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" id="adminPassword" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input type="password" id="confirmPassword" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            </div>
            <div>
                <button id="createAdminBtn" class="bg-green-700 text-white px-4 py-2 rounded w-full">Create Admin User</button>
            </div>
            <div id="setupStatus" class="text-sm"></div>
        </div>
        <button id="closeSetupBtn" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700">×</button>
    `;
    document.body.appendChild(setupContainer);
    
    // Add event listeners
    document.getElementById('closeSetupBtn').addEventListener('click', function() {
        setupContainer.remove();
    });
    
    document.getElementById('createAdminBtn').addEventListener('click', async function() {
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const statusEl = document.getElementById('setupStatus');
        
        // Validate inputs
        if (!email || !password || !confirmPassword) {
            statusEl.textContent = 'Please fill in all fields';
            statusEl.className = 'text-sm text-red-500';
            return;
        }
        
        if (password !== confirmPassword) {
            statusEl.textContent = 'Passwords do not match';
            statusEl.className = 'text-sm text-red-500';
            return;
        }
        
        if (password.length < 6) {
            statusEl.textContent = 'Password must be at least 6 characters';
            statusEl.className = 'text-sm text-red-500';
            return;
        }
        
        // Show loading state
        statusEl.textContent = 'Creating admin user...';
        statusEl.className = 'text-sm text-gray-500';
        
        try {
            // Create user with Firebase Authentication REST API
            const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password,
                    returnSecureToken: true
                })
            });
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message);
            }
            
            // Set user as admin in the database
            const userRef = ref(database, `admins/${data.localId}`);
            await set(userRef, {
                email,
                role: 'admin',
                createdAt: new Date().toISOString()
            });
            
            // Success
            statusEl.textContent = `Admin user created successfully! You can now log in with ${email}`;
            statusEl.className = 'text-sm text-green-500';
            
            // Clear form
            document.getElementById('adminEmail').value = '';
            document.getElementById('adminPassword').value = '';
            document.getElementById('confirmPassword').value = '';
            
        } catch (error) {
            console.error('Error creating admin user:', error);
            statusEl.textContent = `Error: ${error.message}`;
            statusEl.className = 'text-sm text-red-500';
        }
    });
});
