// Claim Submission Module for Veterans Claims Assistance Portal
// This module handles the submission of claims to Firebase

import { 
    database, 
    storage, 
    ref, 
    push, 
    set, 
    storageRef, 
    uploadBytesResumable, 
    getDownloadURL,
    generateId,
    encryptData
} from './firebase-config.js';

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const claimForm = document.getElementById('claim-form');
    const uploadProgressModal = document.getElementById('uploadProgressModal');
    const uploadProgressBar = document.getElementById('uploadProgressBar');
    const uploadProgressText = document.getElementById('uploadProgressText');
    const uploadStatus = document.getElementById('uploadStatus');

    if (claimForm) {
        claimForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Validate form
            if (!validateForm('claim-form')) {
                return;
            }

            // Get form data
            const formData = new FormData(claimForm);
            const claimId = generateId();
            
            // Basic claim data
            const claimData = {
                id: claimId,
                date: new Date().toISOString(),
                firstName: formData.get('first-name'),
                lastName: formData.get('last-name'),
                email: formData.get('email'),
                phone: formData.get('phone') || '',
                branch: formData.get('service-branch'),
                serviceStart: formData.get('service-start') || '',
                serviceEnd: formData.get('service-end') || '',
                claimType: formData.get('claim-type'),
                claimDetails: formData.get('claim-details'),
                status: 'new',
                notes: [],
                files: {
                    medical_records: [],
                    va_letters: [],
                    other_documents: []
                },
                submissionDate: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };

            // Show upload progress modal
            uploadProgressModal.classList.remove('hidden');
            uploadStatus.textContent = 'Preparing files...';

            try {
                // Handle file uploads
                const medicalRecordsInput = document.getElementById('medical-records');
                const vaLettersInput = document.getElementById('va-letters');
                const otherDocumentsInput = document.getElementById('other-documents');

                // Upload medical records
                if (medicalRecordsInput && medicalRecordsInput.files.length > 0) {
                    uploadStatus.textContent = 'Uploading medical records...';
                    const medicalRecords = await uploadFiles(medicalRecordsInput.files, claimId, 'medical_records');
                    claimData.files.medical_records = medicalRecords;
                }

                // Upload VA letters
                if (vaLettersInput && vaLettersInput.files.length > 0) {
                    uploadStatus.textContent = 'Uploading VA letters...';
                    const vaLetters = await uploadFiles(vaLettersInput.files, claimId, 'va_letters');
                    claimData.files.va_letters = vaLetters;
                }

                // Upload other documents
                if (otherDocumentsInput && otherDocumentsInput.files.length > 0) {
                    uploadStatus.textContent = 'Uploading other documents...';
                    const otherDocuments = await uploadFiles(otherDocumentsInput.files, claimId, 'other_documents');
                    claimData.files.other_documents = otherDocuments;
                }

                // Encrypt sensitive data
                const sensitiveData = {
                    firstName: claimData.firstName,
                    lastName: claimData.lastName,
                    email: claimData.email,
                    phone: claimData.phone,
                    claimDetails: claimData.claimDetails
                };
                
                // Replace sensitive data with encrypted version
                claimData.sensitiveData = encryptData(sensitiveData);
                delete claimData.firstName;
                delete claimData.lastName;
                delete claimData.email;
                delete claimData.phone;
                delete claimData.claimDetails;

                // Save claim data to Firebase
                uploadStatus.textContent = 'Saving claim data...';
                await saveClaimToFirebase(claimData);

                // Update progress
                uploadProgressBar.style.width = '100%';
                uploadProgressText.textContent = '100%';
                uploadStatus.textContent = 'Submission complete!';

                // Show success message and reset form
                setTimeout(() => {
                    uploadProgressModal.classList.add('hidden');
                    alert('Thank you for submitting your claim request. We will contact you soon.');
                    claimForm.reset();
                    window.location.href = 'index.html';
                }, 1500);

            } catch (error) {
                console.error('Error submitting claim:', error);
                uploadStatus.textContent = 'Error: ' + error.message;
                
                setTimeout(() => {
                    uploadProgressModal.classList.add('hidden');
                    alert('An error occurred while submitting your claim. Please try again.');
                }, 1500);
            }
        });
    }

    // Function to upload files to Firebase Storage
    async function uploadFiles(files, claimId, category) {
        const uploadedFiles = [];
        let totalFiles = files.length;
        let filesUploaded = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileId = generateId();
            const fileExtension = file.name.split('.').pop();
            const fileName = `${fileId}.${fileExtension}`;
            const filePath = `claims/${claimId}/${category}/${fileName}`;
            
            // Create a storage reference
            const fileRef = storageRef(storage, filePath);
            
            // Upload file
            const uploadTask = uploadBytesResumable(fileRef, file);
            
            // Wait for upload to complete
            await new Promise((resolve, reject) => {
                uploadTask.on('state_changed', 
                    (snapshot) => {
                        // Calculate total progress across all files
                        const fileProgress = snapshot.bytesTransferred / snapshot.totalBytes;
                        const overallProgress = ((filesUploaded + fileProgress) / totalFiles) * 100;
                        
                        // Update progress bar
                        uploadProgressBar.style.width = `${overallProgress}%`;
                        uploadProgressText.textContent = `${Math.round(overallProgress)}%`;
                        
                        // Update status
                        uploadStatus.textContent = `Uploading ${file.name} (${i+1}/${totalFiles})...`;
                    },
                    (error) => {
                        console.error('Error uploading file:', error);
                        reject(error);
                    },
                    async () => {
                        // Upload completed successfully
                        filesUploaded++;
                        
                        // Get download URL
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        
                        // Add file metadata to array
                        uploadedFiles.push({
                            id: fileId,
                            name: file.name,
                            originalName: file.name,
                            size: file.size,
                            type: file.type,
                            path: filePath,
                            url: downloadURL,
                            uploadDate: new Date().toISOString()
                        });
                        
                        resolve();
                    }
                );
            });
        }
        
        return uploadedFiles;
    }

    // Function to save claim data to Firebase
    async function saveClaimToFirebase(claimData) {
        // Create a new claim reference
        const claimsRef = ref(database, 'claims/' + claimData.id);
        
        // Save the claim data
        await set(claimsRef, claimData);
        
        // Also save to a list of claims by date for easier querying
        const claimsByDateRef = ref(database, 'claimsByDate/' + claimData.id);
        await set(claimsByDateRef, {
            id: claimData.id,
            date: claimData.date,
            status: claimData.status,
            branch: claimData.branch,
            claimType: claimData.claimType
        });
    }

    // Function to validate form
    function validateForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return false;
        
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('border-red-500');
                
                // Add error message if not already present
                let errorMessage = field.dataset.errorMessage || 'This field is required';
                let errorElement = field.parentElement.querySelector('.error-message');
                
                if (!errorElement) {
                    errorElement = document.createElement('p');
                    errorElement.className = 'text-red-500 text-xs mt-1 error-message';
                    field.parentElement.appendChild(errorElement);
                }
                
                errorElement.textContent = errorMessage;
            } else {
                field.classList.remove('border-red-500');
                const errorElement = field.parentElement.querySelector('.error-message');
                if (errorElement) {
                    errorElement.remove();
                }
            }
        });
        
        return isValid;
    }
});
