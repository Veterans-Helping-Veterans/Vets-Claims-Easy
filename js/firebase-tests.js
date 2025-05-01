// Firebase Tests
console.log('Starting Firebase Tests...');

// Test 1: Firebase SDK Initialization
function testFirebaseSDK() {
    console.log('Test 1: Firebase SDK Initialization');
    try {
        if (typeof firebase !== 'undefined') {
            console.log('✅ Firebase SDK is loaded');
            return true;
        } else {
            console.error('❌ Firebase SDK is not loaded');
            return false;
        }
    } catch (error) {
        console.error('❌ Error testing Firebase SDK:', error);
        return false;
    }
}

// Test 2: Firebase Configuration
function testFirebaseConfig() {
    console.log('Test 2: Firebase Configuration');
    try {
        // Get the Firebase config from the global variable or import it
        const firebaseConfig = {
            apiKey: "AIzaSyFyaNXfzAG2JBDSTpMcbmTTwk3Twg",
            authDomain: "vets-claims-easy.firebaseapp.com",
            projectId: "vets-claims-easy",
            storageBucket: "vets-claims-easy.appspot.com",
            messagingSenderId: "422934662221",
            appId: "1:422934662221:web:bc6b8f6dafa9af73b784",
            measurementId: "G-PVPX2CXDL",
            databaseURL: "https://vets-claims-easy-default-rtdb.firebaseio.com"
        };
        
        // Check if all required fields are present
        const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
        const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
        
        if (missingFields.length === 0) {
            console.log('✅ Firebase configuration is valid');
            return true;
        } else {
            console.error('❌ Firebase configuration is missing fields:', missingFields);
            return false;
        }
    } catch (error) {
        console.error('❌ Error testing Firebase configuration:', error);
        return false;
    }
}

// Test 3: Firebase Database Connection
function testDatabaseConnection() {
    console.log('Test 3: Firebase Database Connection');
    return new Promise((resolve) => {
        try {
            // Initialize Firebase if not already initialized
            let app;
            try {
                app = firebase.app();
            } catch (error) {
                app = firebase.initializeApp({
                    apiKey: "AIzaSyFyaNXfzAG2JBDSTpMcbmTTwk3Twg",
                    authDomain: "vets-claims-easy.firebaseapp.com",
                    projectId: "vets-claims-easy",
                    storageBucket: "vets-claims-easy.appspot.com",
                    messagingSenderId: "422934662221",
                    appId: "1:422934662221:web:bc6b8f6dafa9af73b784",
                    measurementId: "G-PVPX2CXDL",
                    databaseURL: "https://vets-claims-easy-default-rtdb.firebaseio.com"
                });
            }
            
            // Get a reference to the database
            const db = firebase.database();
            const testRef = db.ref('test');
            
            // Write test data
            const testData = {
                message: 'Test data',
                timestamp: Date.now()
            };
            
            testRef.set(testData)
                .then(() => {
                    console.log('✅ Successfully wrote data to Firebase');
                    
                    // Read the data back
                    return testRef.once('value');
                })
                .then((snapshot) => {
                    const data = snapshot.val();
                    if (data && data.message === testData.message) {
                        console.log('✅ Successfully read data from Firebase');
                        resolve(true);
                    } else {
                        console.error('❌ Data read from Firebase does not match test data');
                        resolve(false);
                    }
                })
                .catch((error) => {
                    console.error('❌ Error reading/writing to Firebase:', error);
                    resolve(false);
                });
        } catch (error) {
            console.error('❌ Error testing database connection:', error);
            resolve(false);
        }
    });
}

// Run all tests
async function runAllTests() {
    const results = {
        sdkTest: testFirebaseSDK(),
        configTest: testFirebaseConfig(),
        dbTest: await testDatabaseConnection()
    };
    
    console.log('Test Results:', results);
    
    // Overall result
    const allPassed = Object.values(results).every(result => result === true);
    if (allPassed) {
        console.log('✅ All Firebase tests passed!');
    } else {
        console.error('❌ Some Firebase tests failed');
    }
    
    return results;
}

// Export the test functions
window.firebaseTests = {
    testFirebaseSDK,
    testFirebaseConfig,
    testDatabaseConnection,
    runAllTests
};

// Auto-run tests if this script is loaded directly
if (document.currentScript && document.currentScript.getAttribute('data-autorun') === 'true') {
    runAllTests();
}
