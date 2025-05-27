// Setup Script for Veterans Claims Assistance Portal
// This script helps set up Firebase for the application

import { 
    app,
    auth,
    database, 
    storage, 
    ref, 
    set, 
    get, 
    child
} from './firebase-config.js';

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const testConnectionBtn = document.getElementById('testConnectionBtn');
    const connectionStatus = document.getElementById('connectionStatus');
    const createAdminBtn = document.getElementById('createAdminBtn');
    const adminStatus = document.getElementById('adminStatus');
    const initDatabaseBtn = document.getElementById('initDatabaseBtn');
    const databaseStatus = document.getElementById('databaseStatus');
    
    // Test Firebase connection
    if (testConnectionBtn) {
        testConnectionBtn.addEventListener('click', async function() {
            connectionStatus.innerHTML = '<p class="text-gray-500">Testing connection to Firebase...</p>';
            
            try {
                // Test database connection
                const testRef = ref(database, 'test');
                const timestamp = new Date().toISOString();
                await set(testRef, { timestamp, message: 'Firebase connection test' });
                
                // Read back the data
                const snapshot = await get(child(ref(database), 'test'));
                if (snapshot.exists()) {
                    connectionStatus.innerHTML = `
                        <p class="text-green-500 font-semibold">✓ Firebase connection successful!</p>
                        <p class="text-sm text-gray-600 mt-2">Your Firebase configuration is working correctly.</p>
                        <div class="mt-2 p-2 bg-gray-200 rounded text-xs font-mono overflow-auto">
                            <pre>${JSON.stringify(snapshot.val(), null, 2)}</pre>
                        </div>
                    `;
                } else {
                    connectionStatus.innerHTML = `
                        <p class="text-yellow-500 font-semibold">⚠ Connection successful, but no data returned.</p>
                        <p class="text-sm text-gray-600 mt-2">This might be due to database security rules.</p>
                    `;
                }
            } catch (error) {
                console.error('Firebase connection test failed:', error);
                connectionStatus.innerHTML = `
                    <p class="text-red-500 font-semibold">✗ Firebase connection failed!</p>
                    <p class="text-sm text-gray-600 mt-2">Error: ${error.message}</p>
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
    }
    
    // Create admin user
    if (createAdminBtn) {
        createAdminBtn.addEventListener('click', async function() {
            const email = document.getElementById('adminEmail').value;
            const password = document.getElementById('adminPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validate inputs
            if (!email || !password || !confirmPassword) {
                adminStatus.textContent = 'Please fill in all fields';
                adminStatus.className = 'text-sm text-red-500 mt-2';
                return;
            }
            
            if (password !== confirmPassword) {
                adminStatus.textContent = 'Passwords do not match';
                adminStatus.className = 'text-sm text-red-500 mt-2';
                return;
            }
            
            if (password.length < 6) {
                adminStatus.textContent = 'Password must be at least 6 characters';
                adminStatus.className = 'text-sm text-red-500 mt-2';
                return;
            }
            
            // Show loading state
            adminStatus.textContent = 'Creating admin user...';
            adminStatus.className = 'text-sm text-gray-500 mt-2';
            
            try {
                // Create user with Firebase Authentication REST API
                const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${app.options.apiKey}`, {
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
                adminStatus.textContent = `Admin user created successfully! You can now log in with ${email}`;
                adminStatus.className = 'text-sm text-green-500 mt-2';
                
                // Clear form
                document.getElementById('adminEmail').value = '';
                document.getElementById('adminPassword').value = '';
                document.getElementById('confirmPassword').value = '';
                
            } catch (error) {
                console.error('Error creating admin user:', error);
                adminStatus.textContent = `Error: ${error.message}`;
                adminStatus.className = 'text-sm text-red-500 mt-2';
            }
        });
    }
    
    // Initialize database
    if (initDatabaseBtn) {
        initDatabaseBtn.addEventListener('click', async function() {
            databaseStatus.textContent = 'Initializing database...';
            databaseStatus.className = 'text-sm text-gray-500 mt-2';
            
            try {
                // Create initial database structure
                const dbRef = ref(database);
                
                // Check if database already has structure
                const snapshot = await get(child(dbRef, 'initialized'));
                
                if (snapshot.exists() && snapshot.val() === true) {
                    databaseStatus.textContent = 'Database is already initialized.';
                    databaseStatus.className = 'text-sm text-yellow-500 mt-2';
                    return;
                }
                
                // Create claims node
                await set(child(dbRef, 'claims'), {});
                
                // Create claimsByDate node
                await set(child(dbRef, 'claimsByDate'), {});
                
                // Create settings node
                await set(child(dbRef, 'settings'), {
                    initialized: new Date().toISOString(),
                    version: '1.0.0'
                });
                
                // Mark as initialized
                await set(child(dbRef, 'initialized'), true);
                
                databaseStatus.textContent = 'Database initialized successfully!';
                databaseStatus.className = 'text-sm text-green-500 mt-2';
                
            } catch (error) {
                console.error('Error initializing database:', error);
                databaseStatus.textContent = `Error: ${error.message}`;
                databaseStatus.className = 'text-sm text-red-500 mt-2';
            }
        });
    }
});
