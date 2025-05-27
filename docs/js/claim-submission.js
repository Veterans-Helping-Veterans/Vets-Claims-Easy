// Claim Submission Module for Veterans Claims Assistance Portal
import { encryptData, generateId } from '../js/security.js';

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

            // Show upload progress modal
            uploadProgressModal.classList.remove('hidden');
            uploadStatus.textContent = 'Preparing submission...';
            uploadProgressBar.style.width = '0%';
            uploadProgressText.textContent = '0%';

            try {
                // Get form data
                const formData = new FormData(claimForm);
                
                // Create claim data object
                const claimData = {
                    id: generateId(),
                    date: new Date().toISOString(),
                    status: 'new',
                    branch: formData.get('branch'),
                    claimType: formData.get('claimType'),
                    files: Array.from(document.getElementById('fileUpload').files).map(file => ({
                        name: file.name,
                        size: file.size,
                        type: file.type
                    })),
                    notes: [],
                    // Sensitive data to be encrypted
                    sensitiveData: encryptData({
                        firstName: formData.get('firstName'),
                        lastName: formData.get('lastName'),
                        email: formData.get('email'),
                        phone: formData.get('phone'),
                        serviceStart: formData.get('serviceStart'),
                        serviceEnd: formData.get('serviceEnd'),
                        claimDetails: formData.get('claimDetails')
                    })
                };

                // Update progress
                uploadProgressBar.style.width = '50%';
                uploadProgressText.textContent = '50%';
                uploadStatus.textContent = 'Saving submission...';

                // Get existing claims from localStorage
                let claims = JSON.parse(localStorage.getItem('claims') || '[]');
                
                // Add new claim
                claims.push(claimData);
                
                // Save back to localStorage
                localStorage.setItem('claims', JSON.stringify(claims));

                // Update progress
                uploadProgressBar.style.width = '100%';
                uploadProgressText.textContent = '100%';
                uploadStatus.textContent = 'Submission complete!';

                // Show success message and reset form
                setTimeout(() => {
                    uploadProgressModal.classList.add('hidden');
                    alert('Thank you for submitting your claim request. We will contact you soon.');
                    claimForm.reset();
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
});

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
