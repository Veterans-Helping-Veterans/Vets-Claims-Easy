// Claim Submission Module for Veterans Claims Assistance Portal
// This module handles the submission of claims to the server

import { submitClaim } from './api-client-supabase.js';

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
            if (!validateForm()) {
                return;
            }

            // Show upload progress modal
            uploadProgressModal.classList.remove('hidden');
            uploadStatus.textContent = 'Preparing submission...';
            uploadProgressBar.style.width = '0%';
            uploadProgressText.textContent = '0%';

            try {
                // Get form data
                const formData = new FormData(claimForm);
                const files = Array.from(document.getElementById('fileUpload').files);
                
                // Create claim data object
                const claimData = {
                    date: new Date().toISOString(),
                    branch: formData.get('branch'),
                    claimType: formData.get('claimType'),
                    sensitiveData: {
                        firstName: formData.get('firstName'),
                        lastName: formData.get('lastName'),
                        email: formData.get('email'),
                        phone: formData.get('phone'),
                        serviceStart: formData.get('serviceStart'),
                        serviceEnd: formData.get('serviceEnd')
                    },
                    claimDetails: formData.get('claimDetails'),
                    files: files.map(file => ({
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        category: 'other_documents'
                    }))
                };

                // Submit claim
                const claim = await submitClaim(claimData);
                
                // Show success message
                uploadStatus.textContent = 'Submission successful!';
                uploadProgressBar.style.width = '100%';
                uploadProgressText.textContent = '100%';
                
                // Clear form
                claimForm.reset();
                
                // Hide modal after 2 seconds
                setTimeout(() => {
                    uploadProgressModal.classList.add('hidden');
                }, 2000);

            } catch (error) {
                console.error('Error submitting claim:', error);
                uploadStatus.textContent = 'Error submitting claim. Please try again.';
                uploadProgressBar.style.width = '0%';
                uploadProgressText.textContent = '';
            }
        });
    }

    function validateForm() {
        // Add your form validation logic here
        return true;
    }
});
