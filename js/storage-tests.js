// Firebase Storage Tests
console.log('Starting Firebase Storage Tests...');

// Test 1: Firebase Storage Initialization
function testStorageInitialization() {
    console.log('Test 1: Firebase Storage Initialization');
    try {
        if (typeof firebase !== 'undefined' && firebase.storage) {
            const storage = firebase.storage();
            console.log('✅ Firebase Storage is initialized');
            return true;
        } else {
            console.error('❌ Firebase Storage is not initialized');
            return false;
        }
    } catch (error) {
        console.error('❌ Error testing Firebase Storage initialization:', error);
        return false;
    }
}

// Test 2: File Upload to Firebase Storage
function testFileUpload() {
    console.log('Test 2: File Upload to Firebase Storage');
    return new Promise((resolve) => {
        try {
            // Create a test file (a small text file)
            const testContent = 'This is a test file for Firebase Storage upload.';
            const testBlob = new Blob([testContent], { type: 'text/plain' });
            const testFile = new File([testBlob], 'test-file.txt', { type: 'text/plain' });
            
            // Get a reference to Firebase Storage
            const storage = firebase.storage();
            const testFileRef = storage.ref('test-files/test-file-' + Date.now() + '.txt');
            
            // Upload the file
            const uploadTask = testFileRef.put(testFile);
            
            uploadTask.on('state_changed', 
                (snapshot) => {
                    // Progress monitoring
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload progress: ' + progress.toFixed(2) + '%');
                }, 
                (error) => {
                    // Error handling
                    console.error('❌ Error uploading file:', error);
                    resolve(false);
                }, 
                () => {
                    // Upload completed successfully
                    uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                        console.log('✅ File uploaded successfully. Download URL:', downloadURL);
                        
                        // Now try to delete the file
                        testFileRef.delete().then(() => {
                            console.log('✅ Test file deleted successfully');
                            resolve(true);
                        }).catch((error) => {
                            console.error('❌ Error deleting test file:', error);
                            // Still consider the test successful if upload worked
                            resolve(true);
                        });
                    });
                }
            );
        } catch (error) {
            console.error('❌ Error testing file upload:', error);
            resolve(false);
        }
    });
}

// Test 3: File Download from Firebase Storage
function testFileDownload() {
    console.log('Test 3: File Download from Firebase Storage');
    return new Promise((resolve) => {
        try {
            // Create and upload a test file first
            const testContent = 'This is a test file for Firebase Storage download.';
            const testBlob = new Blob([testContent], { type: 'text/plain' });
            const testFile = new File([testBlob], 'test-download-file.txt', { type: 'text/plain' });
            
            // Get a reference to Firebase Storage
            const storage = firebase.storage();
            const testFileRef = storage.ref('test-files/test-download-file-' + Date.now() + '.txt');
            
            // Upload the file
            const uploadTask = testFileRef.put(testFile);
            
            uploadTask.on('state_changed', 
                null, 
                (error) => {
                    console.error('❌ Error uploading file for download test:', error);
                    resolve(false);
                }, 
                () => {
                    // Upload completed, now try to download
                    testFileRef.getDownloadURL().then((url) => {
                        console.log('✅ Got download URL:', url);
                        
                        // Fetch the file
                        fetch(url)
                            .then(response => response.text())
                            .then(data => {
                                if (data === testContent) {
                                    console.log('✅ File downloaded successfully and content matches');
                                    
                                    // Clean up by deleting the test file
                                    testFileRef.delete().then(() => {
                                        console.log('✅ Test download file deleted successfully');
                                        resolve(true);
                                    }).catch((error) => {
                                        console.error('❌ Error deleting test download file:', error);
                                        // Still consider the test successful if download worked
                                        resolve(true);
                                    });
                                } else {
                                    console.error('❌ Downloaded content does not match original content');
                                    resolve(false);
                                }
                            })
                            .catch(error => {
                                console.error('❌ Error fetching file:', error);
                                resolve(false);
                            });
                    }).catch((error) => {
                        console.error('❌ Error getting download URL:', error);
                        resolve(false);
                    });
                }
            );
        } catch (error) {
            console.error('❌ Error testing file download:', error);
            resolve(false);
        }
    });
}

// Run all tests
async function runAllTests() {
    const results = {
        storageInitTest: testStorageInitialization(),
        uploadTest: await testFileUpload(),
        downloadTest: await testFileDownload()
    };
    
    console.log('Test Results:', results);
    
    // Overall result
    const allPassed = Object.values(results).every(result => result === true);
    if (allPassed) {
        console.log('✅ All Firebase Storage tests passed!');
    } else {
        console.error('❌ Some Firebase Storage tests failed');
    }
    
    return results;
}

// Export the test functions
window.storageTests = {
    testStorageInitialization,
    testFileUpload,
    testFileDownload,
    runAllTests
};

// Auto-run tests if this script is loaded directly
if (document.currentScript && document.currentScript.getAttribute('data-autorun') === 'true') {
    runAllTests();
}
