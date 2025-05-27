// Firebase Test Script
// This script tests the Firebase connection and basic functionality

import { 
    database, 
    storage, 
    ref, 
    set, 
    get, 
    child,
    auth,
    signInWithEmailAndPassword
} from './firebase-config.js';

// Function to test Firebase connection
async function testFirebaseConnection() {
    console.log('Testing Firebase connection...');
    
    try {
        // Test database connection
        const testRef = ref(database, 'test');
        const timestamp = new Date().toISOString();
        await set(testRef, { timestamp, message: 'Firebase connection test' });
        
        // Read back the data
        const snapshot = await get(child(ref(database), 'test'));
        if (snapshot.exists()) {
            console.log('Firebase database connection successful!');
            console.log('Test data:', snapshot.val());
            return true;
        } else {
            console.error('No data available in test node');
            return false;
        }
    } catch (error) {
        console.error('Firebase connection test failed:', error);
        return false;
    }
}

// Function to test admin authentication
async function testAdminAuth(email, password) {
    console.log('Testing admin authentication...');
    
    try {
        // Try to sign in
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Admin authentication successful!');
        console.log('User:', userCredential.user.email);
        return true;
    } catch (error) {
        console.error('Admin authentication failed:', error);
        return false;
    }
}

// Run tests when the page loads
document.addEventListener('DOMContentLoaded', async function() {
    // Create a test UI
    const testContainer = document.createElement('div');
    testContainer.className = 'fixed bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg z-50 max-w-md';
    testContainer.innerHTML = `
        <h3 class="text-lg font-bold mb-2">Firebase Connection Test</h3>
        <div id="connectionStatus" class="mb-4">
            <p>Testing connection to Firebase...</p>
        </div>
        <div id="authTest" class="mb-4">
            <h4 class="font-semibold mb-2">Test Admin Authentication</h4>
            <div class="flex space-x-2 mb-2">
                <input type="email" id="testEmail" placeholder="Admin Email" class="border p-2 rounded flex-grow">
                <input type="password" id="testPassword" placeholder="Password" class="border p-2 rounded flex-grow">
            </div>
            <button id="testAuthBtn" class="bg-green-700 text-white px-4 py-2 rounded">Test Auth</button>
            <p id="authStatus" class="mt-2"></p>
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
        
        if (!email || !password) {
            document.getElementById('authStatus').textContent = 'Please enter both email and password';
            document.getElementById('authStatus').className = 'mt-2 text-red-500';
            return;
        }
        
        document.getElementById('authStatus').textContent = 'Testing authentication...';
        document.getElementById('authStatus').className = 'mt-2 text-gray-500';
        
        const success = await testAdminAuth(email, password);
        
        if (success) {
            document.getElementById('authStatus').textContent = 'Authentication successful!';
            document.getElementById('authStatus').className = 'mt-2 text-green-500';
        } else {
            document.getElementById('authStatus').textContent = 'Authentication failed. Check console for details.';
            document.getElementById('authStatus').className = 'mt-2 text-red-500';
        }
    });
    
    // Test Firebase connection
    const connectionStatus = document.getElementById('connectionStatus');
    const success = await testFirebaseConnection();
    
    if (success) {
        connectionStatus.innerHTML = `
            <p class="text-green-500">✓ Firebase connection successful!</p>
            <p class="text-sm text-gray-500">Your Firebase configuration is working correctly.</p>
        `;
    } else {
        connectionStatus.innerHTML = `
            <p class="text-red-500">✗ Firebase connection failed!</p>
            <p class="text-sm text-gray-500">Check the console for error details.</p>
            <div class="mt-2 p-2 bg-gray-100 rounded text-sm">
                <p>Common issues:</p>
                <ul class="list-disc pl-5 mt-1">
                    <li>Incorrect Firebase configuration</li>
                    <li>Missing or incorrect API key</li>
                    <li>Database rules preventing read/write</li>
                    <li>Network connectivity issues</li>
                </ul>
            </div>
        `;
    }
});
