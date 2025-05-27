// Firebase Authentication Tests
console.log('Starting Firebase Authentication Tests...');

// Test 1: Firebase Auth Initialization
function testAuthInitialization() {
    console.log('Test 1: Firebase Auth Initialization');
    try {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            const auth = firebase.auth();
            console.log('✅ Firebase Auth is initialized');
            return true;
        } else {
            console.error('❌ Firebase Auth is not initialized');
            return false;
        }
    } catch (error) {
        console.error('❌ Error testing Firebase Auth initialization:', error);
        return false;
    }
}

// Test 2: Admin Authentication
function testAdminAuth() {
    console.log('Test 2: Admin Authentication');
    return new Promise((resolve) => {
        try {
            // Get a reference to Firebase Auth
            const auth = firebase.auth();
            
            // Sign out any existing user first
            auth.signOut()
                .then(() => {
                    console.log('✅ Successfully signed out any existing user');
                    
                    // Try to sign in with admin credentials
                    // Note: In a real test, you would use environment variables or a secure way to store test credentials
                    // For this demo, we're using a test admin account
                    const email = 'admin@example.com';
                    const password = 'admin123';
                    
                    return auth.signInWithEmailAndPassword(email, password);
                })
                .then((userCredential) => {
                    // Signed in successfully
                    const user = userCredential.user;
                    console.log('✅ Successfully signed in as admin:', user.email);
                    
                    // Sign out after successful test
                    return auth.signOut();
                })
                .then(() => {
                    console.log('✅ Successfully signed out after test');
                    resolve(true);
                })
                .catch((error) => {
                    console.error('❌ Error in admin authentication test:', error);
                    // Try to sign out in case of partial authentication
                    auth.signOut().catch(() => {});
                    resolve(false);
                });
        } catch (error) {
            console.error('❌ Error testing admin authentication:', error);
            resolve(false);
        }
    });
}

// Test 3: Authentication State Change
function testAuthStateChange() {
    console.log('Test 3: Authentication State Change');
    return new Promise((resolve) => {
        try {
            // Get a reference to Firebase Auth
            const auth = firebase.auth();
            
            // Sign out any existing user first
            auth.signOut()
                .then(() => {
                    console.log('✅ Successfully signed out any existing user');
                    
                    // Set up auth state change listener
                    const unsubscribe = auth.onAuthStateChanged((user) => {
                        if (user) {
                            console.log('✅ Auth state changed to signed in:', user.email);
                            
                            // Sign out after detecting sign in
                            auth.signOut()
                                .then(() => {
                                    console.log('✅ Successfully signed out after auth state change test');
                                    // Don't resolve here, wait for the next auth state change
                                })
                                .catch((error) => {
                                    console.error('❌ Error signing out after auth state change test:', error);
                                    unsubscribe();
                                    resolve(false);
                                });
                        } else {
                            console.log('✅ Auth state changed to signed out');
                            unsubscribe();
                            resolve(true);
                        }
                    });
                    
                    // Try to sign in with admin credentials
                    const email = 'admin@example.com';
                    const password = 'admin123';
                    
                    auth.signInWithEmailAndPassword(email, password)
                        .catch((error) => {
                            console.error('❌ Error signing in for auth state change test:', error);
                            unsubscribe();
                            resolve(false);
                        });
                })
                .catch((error) => {
                    console.error('❌ Error signing out before auth state change test:', error);
                    resolve(false);
                });
        } catch (error) {
            console.error('❌ Error testing auth state change:', error);
            resolve(false);
        }
    });
}

// Run all tests
async function runAllTests() {
    const results = {
        authInitTest: testAuthInitialization(),
        adminAuthTest: await testAdminAuth(),
        authStateTest: await testAuthStateChange()
    };
    
    console.log('Test Results:', results);
    
    // Overall result
    const allPassed = Object.values(results).every(result => result === true);
    if (allPassed) {
        console.log('✅ All Firebase Auth tests passed!');
    } else {
        console.error('❌ Some Firebase Auth tests failed');
    }
    
    return results;
}

// Export the test functions
window.authTests = {
    testAuthInitialization,
    testAdminAuth,
    testAuthStateChange,
    runAllTests
};

// Auto-run tests if this script is loaded directly
if (document.currentScript && document.currentScript.getAttribute('data-autorun') === 'true') {
    runAllTests();
}
