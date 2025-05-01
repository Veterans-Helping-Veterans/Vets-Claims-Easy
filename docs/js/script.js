// Main JavaScript for Veterans Claims Assistance Portal

document.addEventListener('DOMContentLoaded', function() {
    // Handle claim form submission
    const claimForm = document.getElementById('claimForm');
    if (claimForm) {
        claimForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
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
                claimType: formData.get('claimType'),
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
            
            // Save claim data to localStorage
            saveClaimToStorage(claimData);
            
            // Show success message and reset form
            alert('Your claim assistance request has been submitted successfully. We will contact you soon.');
            claimForm.reset();
        });
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
});
