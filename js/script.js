// Veterans Claims Assistance Portal JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize FAQ accordion
    initFAQ();

    // Initialize testimonials carousel
    initTestimonialsCarousel();

    // Initialize smooth scrolling
    initSmoothScrolling();

    // Add animation to elements when they come into view
    if ('IntersectionObserver' in window) {
        animateOnScroll();
    }
    // Handle claim form submission
    const claimForm = document.getElementById('claim-form');
    if (claimForm) {
        claimForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Validate form
            if (validateForm()) {
                // Get form data
                const formData = new FormData(claimForm);
                const claimData = {
                    id: generateId(),
                    date: new Date().toISOString(),
                    firstName: formData.get('first-name'),
                    lastName: formData.get('last-name'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    branch: formData.get('service-branch'),
                    claimType: formData.get('claim-type'),
                    claimDetails: formData.get('claim-details'),
                    status: 'new',
                    notes: [],
                    files: {
                        medical_records: [],
                        va_letters: [],
                        other_documents: []
                    }
                };

                // Handle file uploads
                const medicalRecordsInput = document.getElementById('medical-records');
                const vaLettersInput = document.getElementById('va-letters');
                const otherDocumentsInput = document.getElementById('other-documents');

                // Process medical records
                if (medicalRecordsInput && medicalRecordsInput.files.length > 0) {
                    for (let i = 0; i < medicalRecordsInput.files.length; i++) {
                        const file = medicalRecordsInput.files[i];
                        claimData.files.medical_records.push({
                            name: file.name,
                            size: file.size,
                            type: file.type
                        });
                    }
                }

                // Process VA letters
                if (vaLettersInput && vaLettersInput.files.length > 0) {
                    for (let i = 0; i < vaLettersInput.files.length; i++) {
                        const file = vaLettersInput.files[i];
                        claimData.files.va_letters.push({
                            name: file.name,
                            size: file.size,
                            type: file.type
                        });
                    }
                }

                // Process other documents
                if (otherDocumentsInput && otherDocumentsInput.files.length > 0) {
                    for (let i = 0; i < otherDocumentsInput.files.length; i++) {
                        const file = otherDocumentsInput.files[i];
                        claimData.files.other_documents.push({
                            name: file.name,
                            size: file.size,
                            type: file.type
                        });
                    }
                }

                // Save claim data to localStorage
                saveClaimToStorage(claimData);

                // Show success message and reset form
                alert('Thank you for submitting your claim request. We will contact you soon.');
                claimForm.reset();
            }
        });
    }

    // Form validation function
    function validateForm() {
        let isValid = true;

        // Get form fields
        const firstName = document.getElementById('first-name');
        const lastName = document.getElementById('last-name');
        const email = document.getElementById('email');
        const serviceBranch = document.getElementById('service-branch');
        const claimType = document.getElementById('claim-type');
        const claimDetails = document.getElementById('claim-details');

        // Validate required fields
        if (!firstName.value.trim()) {
            highlightError(firstName);
            isValid = false;
        } else {
            removeError(firstName);
        }

        if (!lastName.value.trim()) {
            highlightError(lastName);
            isValid = false;
        } else {
            removeError(lastName);
        }

        if (!email.value.trim() || !isValidEmail(email.value)) {
            highlightError(email);
            isValid = false;
        } else {
            removeError(email);
        }

        if (!serviceBranch.value) {
            highlightError(serviceBranch);
            isValid = false;
        } else {
            removeError(serviceBranch);
        }

        if (!claimType.value) {
            highlightError(claimType);
            isValid = false;
        } else {
            removeError(claimType);
        }

        if (!claimDetails.value.trim()) {
            highlightError(claimDetails);
            isValid = false;
        } else {
            removeError(claimDetails);
        }

        return isValid;
    }

    // Helper function to validate email format
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Helper function to highlight form errors
    function highlightError(element) {
        element.classList.add('border-red-500');

        // Add error message if it doesn't exist
        let errorMessage = element.parentNode.querySelector('.error-message');
        if (!errorMessage) {
            errorMessage = document.createElement('p');
            errorMessage.className = 'error-message text-red-500 text-xs mt-1';
            errorMessage.textContent = 'This field is required';

            if (element.id === 'email' && element.value.trim() !== '') {
                errorMessage.textContent = 'Please enter a valid email address';
            }

            element.parentNode.appendChild(errorMessage);
        }
    }

    // Helper function to remove error highlighting
    function removeError(element) {
        element.classList.remove('border-red-500');

        // Remove error message if it exists
        const errorMessage = element.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    // Helper functions
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

    // FAQ Accordion functionality
    function initFAQ() {
        const faqQuestions = document.querySelectorAll('.faq-question');

        if (!faqQuestions.length) return;

        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const faqItem = question.parentElement;
                const isActive = faqItem.classList.contains('active');

                // Close all FAQ items
                document.querySelectorAll('.faq-item').forEach(item => {
                    item.classList.remove('active');
                });

                // If the clicked item wasn't active, open it
                if (!isActive) {
                    faqItem.classList.add('active');
                }
            });
        });
    }

    // Testimonials Carousel functionality
    function initTestimonialsCarousel() {
        const slides = document.querySelectorAll('.testimonial-slide');
        const prevButton = document.querySelector('.testimonial-control.prev');
        const nextButton = document.querySelector('.testimonial-control.next');

        if (!slides.length || !prevButton || !nextButton) return;

        let currentSlide = 0;

        function showSlide(index) {
            // Hide all slides
            slides.forEach(slide => {
                slide.classList.remove('active');
            });

            // Show the current slide
            slides[index].classList.add('active');
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        }

        // Add event listeners to buttons
        nextButton.addEventListener('click', nextSlide);
        prevButton.addEventListener('click', prevSlide);

        // Auto-advance slides every 5 seconds
        setInterval(nextSlide, 5000);
    }

    // Smooth scrolling for anchor links
    function initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    window.scrollTo({
                        top: targetElement.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Add animation to elements when they come into view
    function animateOnScroll() {
        const elements = document.querySelectorAll('.feature-card, .claim-status-tracker, .testimonials-carousel, .faq-container');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        elements.forEach(element => {
            // Set initial styles
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

            observer.observe(element);
        });
    }
});
