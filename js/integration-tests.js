// Firebase Integration Tests
console.log('Starting Firebase Integration Tests...');

// Test 1: Form Submission to Firebase
function testFormSubmission() {
    console.log('Test 1: Form Submission to Firebase');
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
            
            // Create a test claim
            const testClaim = {
                veteranName: 'Test Veteran',
                veteranEmail: 'test@example.com',
                veteranPhone: '555-123-4567',
                serviceStartDate: '2010-01-01',
                serviceEndDate: '2015-01-01',
                serviceBranch: 'Army',
                claimType: 'Disability',
                claimDescription: 'This is a test claim submission',
                timestamp: Date.now(),
                testData: true // Mark as test data
            };
            
            // Generate a unique ID for this test claim
            const claimId = 'test-claim-' + Date.now();
            
            // Save the test claim to Firebase
            db.ref('claims/' + claimId).set(testClaim)
                .then(() => {
                    console.log('✅ Successfully saved test claim to Firebase');
                    
                    // Read the claim back to verify
                    return db.ref('claims/' + claimId).once('value');
                })
                .then((snapshot) => {
                    const data = snapshot.val();
                    if (data && data.veteranName === testClaim.veteranName) {
                        console.log('✅ Successfully read test claim from Firebase');
                        
                        // Clean up by deleting the test claim
                        return db.ref('claims/' + claimId).remove();
                    } else {
                        console.error('❌ Test claim data does not match');
                        resolve(false);
                    }
                })
                .then(() => {
                    console.log('✅ Successfully deleted test claim from Firebase');
                    resolve(true);
                })
                .catch((error) => {
                    console.error('❌ Error in form submission test:', error);
                    resolve(false);
                });
        } catch (error) {
            console.error('❌ Error testing form submission:', error);
            resolve(false);
        }
    });
}

// Test 2: Admin Dashboard Data Retrieval
function testAdminDashboard() {
    console.log('Test 2: Admin Dashboard Data Retrieval');
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
            
            // Create multiple test claims
            const testClaims = {
                'test-claim-1': {
                    veteranName: 'Test Veteran 1',
                    veteranEmail: 'test1@example.com',
                    claimType: 'Disability',
                    timestamp: Date.now() - 1000,
                    testData: true
                },
                'test-claim-2': {
                    veteranName: 'Test Veteran 2',
                    veteranEmail: 'test2@example.com',
                    claimType: 'Education',
                    timestamp: Date.now(),
                    testData: true
                }
            };
            
            // Save the test claims to Firebase
            const updates = {};
            Object.keys(testClaims).forEach(key => {
                updates['claims/' + key] = testClaims[key];
            });
            
            db.ref().update(updates)
                .then(() => {
                    console.log('✅ Successfully saved test claims to Firebase');
                    
                    // Read all claims to simulate admin dashboard
                    return db.ref('claims').orderByChild('timestamp').once('value');
                })
                .then((snapshot) => {
                    const claims = snapshot.val();
                    if (claims) {
                        console.log('✅ Successfully retrieved claims for admin dashboard');
                        
                        // Verify that our test claims are included
                        let foundTestClaims = 0;
                        Object.keys(claims).forEach(key => {
                            if (claims[key].testData) {
                                foundTestClaims++;
                            }
                        });
                        
                        if (foundTestClaims >= 2) {
                            console.log('✅ Found all test claims in the retrieved data');
                            
                            // Clean up by deleting the test claims
                            const deleteUpdates = {};
                            Object.keys(testClaims).forEach(key => {
                                deleteUpdates['claims/' + key] = null;
                            });
                            
                            return db.ref().update(deleteUpdates);
                        } else {
                            console.error('❌ Not all test claims were found in the retrieved data');
                            resolve(false);
                        }
                    } else {
                        console.error('❌ No claims retrieved from Firebase');
                        resolve(false);
                    }
                })
                .then(() => {
                    console.log('✅ Successfully deleted test claims from Firebase');
                    resolve(true);
                })
                .catch((error) => {
                    console.error('❌ Error in admin dashboard test:', error);
                    resolve(false);
                });
        } catch (error) {
            console.error('❌ Error testing admin dashboard:', error);
            resolve(false);
        }
    });
}

// Test 3: File Upload Integration
function testFileUploadIntegration() {
    console.log('Test 3: File Upload Integration');
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
            
            // Get a reference to the database and storage
            const db = firebase.database();
            const storage = firebase.storage();
            
            // Create a test file
            const testContent = 'This is a test file for Firebase Storage integration.';
            const testBlob = new Blob([testContent], { type: 'text/plain' });
            const testFile = new File([testBlob], 'test-integration-file.txt', { type: 'text/plain' });
            
            // Create a test claim with a file reference
            const testClaimId = 'test-claim-with-file-' + Date.now();
            const testClaim = {
                veteranName: 'Test Veteran with File',
                veteranEmail: 'test-file@example.com',
                claimType: 'Disability',
                timestamp: Date.now(),
                testData: true,
                hasAttachments: true
            };
            
            // Upload the file to Firebase Storage
            const fileRef = storage.ref('claim-files/' + testClaimId + '/test-integration-file.txt');
            const uploadTask = fileRef.put(testFile);
            
            uploadTask.on('state_changed', 
                (snapshot) => {
                    // Progress monitoring
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload progress: ' + progress.toFixed(2) + '%');
                }, 
                (error) => {
                    // Error handling
                    console.error('❌ Error uploading file for integration test:', error);
                    resolve(false);
                }, 
                () => {
                    // Upload completed successfully
                    uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                        console.log('✅ File uploaded successfully. Download URL:', downloadURL);
                        
                        // Add the file URL to the claim
                        testClaim.fileURL = downloadURL;
                        testClaim.fileName = 'test-integration-file.txt';
                        
                        // Save the claim to Firebase
                        db.ref('claims/' + testClaimId).set(testClaim)
                            .then(() => {
                                console.log('✅ Successfully saved test claim with file to Firebase');
                                
                                // Read the claim back to verify
                                return db.ref('claims/' + testClaimId).once('value');
                            })
                            .then((snapshot) => {
                                const data = snapshot.val();
                                if (data && data.fileURL === downloadURL) {
                                    console.log('✅ Successfully verified claim with file in Firebase');
                                    
                                    // Clean up by deleting the test claim and file
                                    return Promise.all([
                                        db.ref('claims/' + testClaimId).remove(),
                                        fileRef.delete()
                                    ]);
                                } else {
                                    console.error('❌ Test claim with file data does not match');
                                    resolve(false);
                                }
                            })
                            .then(() => {
                                console.log('✅ Successfully deleted test claim and file from Firebase');
                                resolve(true);
                            })
                            .catch((error) => {
                                console.error('❌ Error in file upload integration test:', error);
                                resolve(false);
                            });
                    }).catch((error) => {
                        console.error('❌ Error getting download URL:', error);
                        resolve(false);
                    });
                }
            );
        } catch (error) {
            console.error('❌ Error testing file upload integration:', error);
            resolve(false);
        }
    });
}

// Run all tests
async function runAllTests() {
    const results = {
        formSubmissionTest: await testFormSubmission(),
        adminDashboardTest: await testAdminDashboard(),
        fileUploadIntegrationTest: await testFileUploadIntegration()
    };
    
    console.log('Test Results:', results);
    
    // Overall result
    const allPassed = Object.values(results).every(result => result === true);
    if (allPassed) {
        console.log('✅ All Firebase integration tests passed!');
    } else {
        console.error('❌ Some Firebase integration tests failed');
    }
    
    return results;
}

// Export the test functions
window.integrationTests = {
    testFormSubmission,
    testAdminDashboard,
    testFileUploadIntegration,
    runAllTests
};

// Auto-run tests if this script is loaded directly
if (document.currentScript && document.currentScript.getAttribute('data-autorun') === 'true') {
    runAllTests();
}
