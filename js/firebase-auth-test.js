// Firebase Authentication Test Script
import { 
    auth, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from './firebase-config.js';

// DOM Elements
const authStatusElement = document.getElementById('authStatus');
const loginForm = document.getElementById('loginForm');
const createAccountForm = document.getElementById('createAccountForm');
const logoutButton = document.getElementById('logoutButton');
const userInfoElement = document.getElementById('userInfo');

// Check authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        authStatusElement.textContent = 'Authenticated';
        authStatusElement.className = 'text-green-600 font-bold';
        
        // Display user info
        userInfoElement.innerHTML = `
            <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 class="text-lg font-semibold text-green-800 mb-2">User Information</h3>
                <p><strong>User ID:</strong> ${user.uid}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Email Verified:</strong> ${user.emailVerified}</p>
                <p><strong>Created:</strong> ${new Date(user.metadata.creationTime).toLocaleString()}</p>
                <p><strong>Last Sign In:</strong> ${new Date(user.metadata.lastSignInTime).toLocaleString()}</p>
            </div>
        `;
        
        // Show logout button, hide forms
        logoutButton.classList.remove('hidden');
        loginForm.classList.add('hidden');
        createAccountForm.classList.add('hidden');
    } else {
        // User is signed out
        authStatusElement.textContent = 'Not Authenticated';
        authStatusElement.className = 'text-red-600 font-bold';
        
        // Clear user info
        userInfoElement.innerHTML = '';
        
        // Hide logout button, show forms
        logoutButton.classList.add('hidden');
        loginForm.classList.remove('hidden');
        createAccountForm.classList.remove('hidden');
    }
});

// Login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const statusElement = document.getElementById('loginStatus');
    
    statusElement.textContent = 'Logging in...';
    statusElement.className = 'text-blue-600';
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        statusElement.textContent = 'Login successful!';
        statusElement.className = 'text-green-600';
    } catch (error) {
        statusElement.textContent = `Error: ${error.message}`;
        statusElement.className = 'text-red-600';
        console.error('Login error:', error);
    }
});

// Create account form submission
createAccountForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('createEmail').value;
    const password = document.getElementById('createPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const statusElement = document.getElementById('createStatus');
    
    // Check if passwords match
    if (password !== confirmPassword) {
        statusElement.textContent = 'Passwords do not match';
        statusElement.className = 'text-red-600';
        return;
    }
    
    statusElement.textContent = 'Creating account...';
    statusElement.className = 'text-blue-600';
    
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        statusElement.textContent = 'Account created successfully!';
        statusElement.className = 'text-green-600';
    } catch (error) {
        statusElement.textContent = `Error: ${error.message}`;
        statusElement.className = 'text-red-600';
        console.error('Account creation error:', error);
    }
});

// Logout button
logoutButton.addEventListener('click', async () => {
    try {
        await signOut(auth);
        console.log('User signed out');
    } catch (error) {
        console.error('Logout error:', error);
    }
});
