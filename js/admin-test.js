// Admin Authentication Test Script
// This script tests the Firebase Authentication for admin users

import { 
    auth, 
    signInWithEmailAndPassword, 
    signOut
} from './firebase-config.js';

document.addEventListener('DOMContentLoaded', function() {
    // Only run on admin.html
    if (!document.getElementById('loginForm')) {
        return;
    }
    
    // Create test UI
    const testContainer = document.createElement('div');
    testContainer.className = 'fixed bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg z-50 max-w-md';
    testContainer.innerHTML = `
        <h3 class="text-lg font-bold mb-2">Admin Authentication Test</h3>
        <div id="authStatus" class="mb-4">
            <p>Click the button below to test admin authentication</p>
        </div>
        <div class="flex space-x-2 mb-2">
            <input type="email" id="testEmail" placeholder="Admin Email" class="border p-2 rounded flex-grow">
            <input type="password" id="testPassword" placeholder="Password" class="border p-2 rounded flex-grow">
        </div>
        <div class="flex space-x-2">
            <button id="testAuthBtn" class="bg-green-700 text-white px-4 py-2 rounded flex-grow">Test Auth</button>
            <button id="createTestUserBtn" class="bg-blue-700 text-white px-4 py-2 rounded flex-grow">Create Test User</button>
        </div>
        <button id="closeTestBtn" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700">×</button>
    `;
    document.body.appendChild(testContainer);
    
    // Add event listeners
    document.getElementById('closeTestBtn').addEventListener('click', function() {
        testContainer.remove();
    });
    
    document.getElementById('testAuthBtn').addEventListener('click', async function() {
        const email = document.getElementById('testEmail').value;
        const password = document.getElementById('testPassword').value;
        const authStatus = document.getElementById('authStatus');
        
        if (!email || !password) {
            authStatus.innerHTML = '<p class="text-red-500">Please enter both email and password</p>';
            return;
        }
        
        authStatus.innerHTML = '<p class="text-gray-500">Testing authentication...</p>';
        
        try {
            // Try to sign in
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            authStatus.innerHTML = `
                <p class="text-green-500 font-semibold">✓ Authentication successful!</p>
                <p class="text-sm text-gray-600 mt-2">Logged in as: ${userCredential.user.email}</p>
                <p class="text-sm text-gray-600">User ID: ${userCredential.user.uid}</p>
            `;
            
            // Sign out after successful test
            setTimeout(async () => {
                await signOut(auth);
                authStatus.innerHTML += `
                    <p class="text-sm text-gray-600 mt-2">Signed out successfully.</p>
                `;
            }, 3000);
            
        } catch (error) {
            console.error('Authentication test failed:', error);
            
            authStatus.innerHTML = `
                <p class="text-red-500 font-semibold">✗ Authentication failed!</p>
                <p class="text-sm text-gray-600 mt-2">Error: ${error.message}</p>
                <div class="mt-2 p-2 bg-gray-100 rounded text-sm">
                    <p>Common issues:</p>
                    <ul class="list-disc pl-5 mt-1">
                        <li>Incorrect email or password</li>
                        <li>User does not exist</li>
                        <li>Authentication not enabled in Firebase</li>
                        <li>Network connectivity issues</li>
                    </ul>
                </div>
            `;
        }
    });
    
    document.getElementById('createTestUserBtn').addEventListener('click', async function() {
        const email = document.getElementById('testEmail').value;
        const password = document.getElementById('testPassword').value;
        const authStatus = document.getElementById('authStatus');
        
        if (!email || !password) {
            authStatus.innerHTML = '<p class="text-red-500">Please enter both email and password</p>';
            return;
        }
        
        if (password.length < 6) {
            authStatus.innerHTML = '<p class="text-red-500">Password must be at least 6 characters</p>';
            return;
        }
        
        authStatus.innerHTML = '<p class="text-gray-500">Creating test user...</p>';
        
        try {
            // Create user with Firebase Authentication REST API
            const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${auth.app.options.apiKey}`, {
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
            
            authStatus.innerHTML = `
                <p class="text-green-500 font-semibold">✓ Test user created successfully!</p>
                <p class="text-sm text-gray-600 mt-2">Email: ${email}</p>
                <p class="text-sm text-gray-600">User ID: ${data.localId}</p>
                <p class="text-sm text-gray-600 mt-2">You can now use these credentials to log in.</p>
            `;
            
        } catch (error) {
            console.error('Error creating test user:', error);
            
            authStatus.innerHTML = `
                <p class="text-red-500 font-semibold">✗ Failed to create test user!</p>
                <p class="text-sm text-gray-600 mt-2">Error: ${error.message}</p>
                <div class="mt-2 p-2 bg-gray-100 rounded text-sm">
                    <p>Common issues:</p>
                    <ul class="list-disc pl-5 mt-1">
                        <li>Email already in use</li>
                        <li>Weak password</li>
                        <li>Authentication not enabled in Firebase</li>
                        <li>Network connectivity issues</li>
                    </ul>
                </div>
            `;
        }
    });
});
