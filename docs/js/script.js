// Main JavaScript for Veterans Claims Assistance Portal

document.addEventListener('DOMContentLoaded', function() {
    // Multi-step form navigation
    const claimForm = document.getElementById('claimForm');
    const formSteps = document.querySelectorAll('.form-step');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const progressPercentage = document.getElementById('progress-percentage');
    let currentStep = 1;
    const totalSteps = formSteps.length;

    // Initialize form validation
    initFormValidation();

    // Initialize conditional fields
    initConditionalFields();

    // Initialize file upload
    initFileUpload();

    // Next buttons
    document.getElementById('next-1').addEventListener('click', function() {
        if (validateStep(1)) {
            goToStep(2);
        }
    });

    document.getElementById('next-2').addEventListener('click', function() {
        if (validateStep(2)) {
            goToStep(3);
        }
    });

    document.getElementById('next-3').addEventListener('click', function() {
        if (validateStep(3)) {
            updateReviewSummary();
            goToStep(4);
        }
    });

    // Previous buttons
    document.getElementById('prev-2').addEventListener('click', function() {
        goToStep(1);
    });

    document.getElementById('prev-3').addEventListener('click', function() {
        goToStep(2);
    });

    document.getElementById('prev-4').addEventListener('click', function() {
        goToStep(3);
    });

    // Handle form submission
    if (claimForm) {
        claimForm.addEventListener('submit', function(e) {
            e.preventDefault();

            if (!validateStep(4)) {
                return;
            }

            // Show loading state
            const submitButton = document.getElementById('submit-form');
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Submitting...';

            // Get form data
            const formData = new FormData(claimForm);
            const claimData = {
                id: generateId(),
                date: new Date().toISOString(),
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                branch: formData.get('branch'),
                serviceStart: formData.get('serviceStart'),
                serviceEnd: formData.get('serviceEnd'),
                rank: formData.get('rank'),
                dischargeType: formData.get('dischargeType'),
                claimType: formData.get('claimType'),
                currentRating: formData.get('currentRating'),
                conditions: getSelectedConditions(),
                claimDetails: formData.get('claimDetails'),
                status: 'new',
                notes: [],
                files: []
            };

            // Handle file uploads
            const fileInput = document.getElementById('fileUpload');
            if (fileInput && fileInput.files.length > 0) {
                for (let i = 0; i < fileInput.files.length; i++) {
                    const file = fileInput.files[i];
                    // In a real application, you would upload the file to a server
                    // For this demo, we'll just store the file name
                    claimData.files.push({
                        name: file.name,
                        size: file.size,
                        type: file.type
                    });
                }
            }

            // Simulate server delay
            setTimeout(function() {
                // Save claim data to localStorage
                saveClaimToStorage(claimData);

                // Show success message
                showSuccessMessage();

                // Reset form and go back to step 1
                claimForm.reset();
                goToStep(1);

                // Reset button
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }, 1500);
        });
    }

    // Helper functions
    function goToStep(step) {
        // Hide all steps
        formSteps.forEach(formStep => {
            formStep.classList.add('hidden');
        });

        // Show the current step
        document.getElementById(`step-${step}`).classList.remove('hidden');

        // Update progress bar
        currentStep = step;
        const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `Step ${currentStep} of ${totalSteps}`;
        progressPercentage.textContent = `${Math.round(progress)}%`;

        // Scroll to top of form
        window.scrollTo({
            top: claimForm.offsetTop - 100,
            behavior: 'smooth'
        });
    }

    function validateStep(step) {
        let isValid = true;
        const stepElement = document.getElementById(`step-${step}`);

        // Get all required inputs in the current step
        const requiredInputs = stepElement.querySelectorAll('[required]');

        requiredInputs.forEach(input => {
            const errorMessage = input.nextElementSibling;
            if (input.type === 'checkbox' && !input.checked) {
                isValid = false;
                errorMessage.textContent = 'This field is required';
                errorMessage.classList.remove('hidden');
                highlightInput(input, true);
            } else if (input.value.trim() === '') {
                isValid = false;
                errorMessage.textContent = 'This field is required';
                errorMessage.classList.remove('hidden');
                highlightInput(input, true);
            } else if (input.type === 'email' && !isValidEmail(input.value)) {
                isValid = false;
                errorMessage.textContent = 'Please enter a valid email address';
                errorMessage.classList.remove('hidden');
                highlightInput(input, true);
            } else {
                if (errorMessage) {
                    errorMessage.classList.add('hidden');
                }
                highlightInput(input, false);
            }
        });

        return isValid;
    }

    function initFormValidation() {
        // Add input event listeners to all form fields
        const inputs = claimForm.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            input.addEventListener('input', function() {
                const errorMessage = this.nextElementSibling;
                if (errorMessage && errorMessage.classList.contains('error-message')) {
                    if (this.required && this.value.trim() === '') {
                        errorMessage.textContent = 'This field is required';
                        errorMessage.classList.remove('hidden');
                        highlightInput(this, true);
                    } else if (this.type === 'email' && !isValidEmail(this.value) && this.value.trim() !== '') {
                        errorMessage.textContent = 'Please enter a valid email address';
                        errorMessage.classList.remove('hidden');
                        highlightInput(this, true);
                    } else if (this.type === 'tel' && !isValidPhone(this.value) && this.value.trim() !== '') {
                        errorMessage.textContent = 'Please enter a valid phone number';
                        errorMessage.classList.remove('hidden');
                        highlightInput(this, true);
                    } else {
                        errorMessage.classList.add('hidden');
                        highlightInput(this, false);
                    }
                }
            });
        });

        // Format phone number as user types
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', function(e) {
                const x = e.target.value.replace(/\\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
                e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
            });
        }
    }

    function initConditionalFields() {
        // Show/hide current rating field based on claim type
        const claimTypeSelect = document.getElementById('claimType');
        const ratingContainer = document.getElementById('rating-container');

        if (claimTypeSelect && ratingContainer) {
            claimTypeSelect.addEventListener('change', function() {
                if (this.value === 'Increase') {
                    ratingContainer.classList.remove('hidden');
                    document.getElementById('currentRating').required = true;
                } else {
                    ratingContainer.classList.add('hidden');
                    document.getElementById('currentRating').required = false;
                }
            });
        }

        // Show text field for "Other" condition
        const otherConditionCheckbox = document.getElementById('other-condition');
        if (otherConditionCheckbox) {
            otherConditionCheckbox.addEventListener('change', function() {
                const container = document.getElementById('conditions-container');
                let otherField = document.getElementById('other-condition-text');

                if (this.checked) {
                    if (!otherField) {
                        const div = document.createElement('div');
                        div.className = 'mt-2 ml-6';
                        div.innerHTML = `
                            <label for="other-condition-text" class="block text-gray-700 mb-1">Please specify:</label>
                            <input type="text" id="other-condition-text" name="otherCondition"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600">
                        `;
                        container.appendChild(div);
                    } else {
                        otherField.parentElement.classList.remove('hidden');
                    }
                } else if (otherField) {
                    otherField.parentElement.classList.add('hidden');
                }
            });
        }
    }

    function initFileUpload() {
        const dropzone = document.getElementById('dropzone');
        const fileInput = document.getElementById('fileUpload');
        const filePreview = document.getElementById('file-preview');

        if (dropzone && fileInput) {
            // Click on dropzone to trigger file input
            dropzone.addEventListener('click', function() {
                fileInput.click();
            });

            // Highlight dropzone on drag over
            dropzone.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.classList.add('bg-green-50', 'border-green-500');
            });

            dropzone.addEventListener('dragleave', function() {
                this.classList.remove('bg-green-50', 'border-green-500');
            });

            // Handle file drop
            dropzone.addEventListener('drop', function(e) {
                e.preventDefault();
                this.classList.remove('bg-green-50', 'border-green-500');

                if (e.dataTransfer.files.length) {
                    fileInput.files = e.dataTransfer.files;
                    updateFilePreview(fileInput.files);
                }
            });

            // Handle file selection
            fileInput.addEventListener('change', function() {
                updateFilePreview(this.files);
            });
        }

        function updateFilePreview(files) {
            if (!filePreview) return;

            filePreview.innerHTML = '';

            if (files.length === 0) {
                return;
            }

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileSize = formatFileSize(file.size);
                const fileType = getFileIcon(file.type);

                const fileElement = document.createElement('div');
                fileElement.className = 'flex items-center p-2 bg-gray-50 rounded border border-gray-200';
                fileElement.innerHTML = `
                    <div class="text-green-700 mr-2">${fileType}</div>
                    <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900 truncate">${file.name}</p>
                        <p class="text-xs text-gray-500">${fileSize}</p>
                    </div>
                    <button type="button" class="remove-file text-red-500 hover:text-red-700">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                `;

                filePreview.appendChild(fileElement);

                // Add event listener to remove button
                const removeButton = fileElement.querySelector('.remove-file');
                removeButton.addEventListener('click', function() {
                    fileElement.remove();
                    // Note: This doesn't actually remove the file from the input
                    // In a real application, you would need to handle this properly
                });
            }
        }

        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        function getFileIcon(fileType) {
            if (fileType.includes('pdf')) {
                return '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>';
            } else if (fileType.includes('image')) {
                return '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>';
            } else if (fileType.includes('word') || fileType.includes('document')) {
                return '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>';
            } else {
                return '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>';
            }
        }
    }

    function updateReviewSummary() {
        const reviewSummary = document.getElementById('review-summary');
        if (!reviewSummary) return;

        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const branch = document.getElementById('branch').value;
        const serviceStart = document.getElementById('serviceStart').value;
        const serviceEnd = document.getElementById('serviceEnd').value;
        const rank = document.getElementById('rank').value;
        const dischargeType = document.getElementById('dischargeType').value;
        const claimType = document.getElementById('claimType').value;
        const conditions = getSelectedConditions();
        const claimDetails = document.getElementById('claimDetails').value;

        reviewSummary.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                    <p class="font-semibold">Name:</p>
                    <p>${firstName} ${lastName}</p>
                </div>
                <div>
                    <p class="font-semibold">Contact:</p>
                    <p>${email}${phone ? ', ' + phone : ''}</p>
                </div>
                <div>
                    <p class="font-semibold">Military Service:</p>
                    <p>${branch}${rank ? ', ' + rank : ''}${dischargeType ? ', ' + dischargeType : ''}</p>
                </div>
                <div>
                    <p class="font-semibold">Service Period:</p>
                    <p>${formatDate(serviceStart)}${serviceEnd ? ' to ' + formatDate(serviceEnd) : ' to Present'}</p>
                </div>
                <div class="col-span-2">
                    <p class="font-semibold">Claim Type:</p>
                    <p>${claimType}</p>
                </div>
                <div class="col-span-2">
                    <p class="font-semibold">Conditions:</p>
                    <p>${conditions.length > 0 ? conditions.join(', ') : 'None specified'}</p>
                </div>
                <div class="col-span-2">
                    <p class="font-semibold">Claim Details:</p>
                    <p class="whitespace-pre-line">${claimDetails}</p>
                </div>
            </div>
        `;
    }

    function getSelectedConditions() {
        const conditions = [];
        const checkboxes = document.querySelectorAll('input[name="conditions[]"]:checked');

        checkboxes.forEach(checkbox => {
            if (checkbox.value === 'Other') {
                const otherText = document.getElementById('other-condition-text');
                if (otherText && otherText.value.trim() !== '') {
                    conditions.push(otherText.value.trim());
                } else {
                    conditions.push('Other');
                }
            } else {
                conditions.push(checkbox.value);
            }
        });

        return conditions;
    }

    function showSuccessMessage() {
        // Create success message element
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed inset-0 flex items-center justify-center z-50';
        successMessage.innerHTML = `
            <div class="absolute inset-0 bg-black opacity-50"></div>
            <div class="bg-white rounded-lg p-8 max-w-md z-10 relative">
                <div class="text-center">
                    <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <svg class="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Claim Submitted Successfully!</h3>
                    <p class="text-sm text-gray-500 mb-4">
                        Your claim assistance request has been submitted. We will review your information and contact you soon.
                    </p>
                    <p class="text-sm text-gray-500 mb-6">
                        Reference ID: <span class="font-mono font-bold">${generateId().substring(0, 8).toUpperCase()}</span>
                    </p>
                    <button type="button" class="close-success-message w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(successMessage);

        // Add event listener to close button
        const closeButton = successMessage.querySelector('.close-success-message');
        closeButton.addEventListener('click', function() {
            successMessage.remove();
        });

        // Auto-remove after 8 seconds
        setTimeout(function() {
            if (document.body.contains(successMessage)) {
                successMessage.remove();
            }
        }, 8000);
    }

    function highlightInput(input, isError) {
        if (isError) {
            input.classList.add('border-red-500', 'focus:ring-red-500');
            input.classList.remove('border-gray-300', 'focus:ring-green-600');
        } else {
            input.classList.remove('border-red-500', 'focus:ring-red-500');
            input.classList.add('border-gray-300', 'focus:ring-green-600');
        }
    }

    function isValidEmail(email) {
        const re = /^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    function isValidPhone(phone) {
        const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        return phone === '' || re.test(phone);
    }

    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    function saveClaimToStorage(claimData) {
        // Get existing claims from localStorage
        let claims = JSON.parse(localStorage.getItem('veteranClaims')) || [];

        // Add new claim
        claims.push(claimData);

        // Save back to localStorage
        localStorage.setItem('veteranClaims', JSON.stringify(claims));
    }
});
