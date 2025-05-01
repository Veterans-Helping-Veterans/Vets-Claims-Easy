// Admin Dashboard JavaScript for Veterans Claims Assistance Portal

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const loginForm = document.getElementById('loginForm');
    const loginContainer = document.getElementById('loginContainer');
    const adminDashboard = document.getElementById('adminDashboard');
    const logoutBtn = document.getElementById('logoutBtn');
    const claimsTableBody = document.getElementById('claimsTableBody');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const claimModal = document.getElementById('claimModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const claimDetails = document.getElementById('claimDetails');
    const statusUpdate = document.getElementById('statusUpdate');
    const updateStatusBtn = document.getElementById('updateStatusBtn');
    const adminNote = document.getElementById('adminNote');
    const addNoteBtn = document.getElementById('addNoteBtn');
    
    // Admin credentials (in a real app, this would be server-side)
    const adminCredentials = {
        email: 'admin@example.com',
        password: 'admin123'
    };
    
    // Current claim being viewed
    let currentClaimId = null;
    
    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('adminEmail').value;
            const password = document.getElementById('adminPassword').value;
            
            if (email === adminCredentials.email && password === adminCredentials.password) {
                // Login successful
                loginContainer.classList.add('hidden');
                adminDashboard.classList.remove('hidden');
                
                // Load claims
                loadClaims();
            } else {
                // Login failed
                alert('Invalid credentials. Please try again.');
            }
        });
    }
    
    // Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            adminDashboard.classList.add('hidden');
            loginContainer.classList.remove('hidden');
            document.getElementById('loginForm').reset();
        });
    }
    
    // Handle filter buttons
    if (filterButtons) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('bg-green-600', 'text-white'));
                filterButtons.forEach(btn => btn.classList.add('bg-gray-300', 'text-gray-800'));
                this.classList.remove('bg-gray-300', 'text-gray-800');
                this.classList.add('bg-green-600', 'text-white');
                
                // Filter claims
                const filter = this.getAttribute('data-filter');
                loadClaims(filter);
            });
        });
    }
    
    // Close modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            claimModal.classList.add('hidden');
        });
    }
    
    // Update claim status
    if (updateStatusBtn) {
        updateStatusBtn.addEventListener('click', function() {
            if (currentClaimId) {
                updateClaimStatus(currentClaimId, statusUpdate.value);
                alert('Status updated successfully');
                loadClaims();
                
                // Update the status in the modal
                const statusElement = document.querySelector('#claimDetails .status');
                if (statusElement) {
                    statusElement.textContent = getStatusLabel(statusUpdate.value);
                    statusElement.className = 'status ' + getStatusClass(statusUpdate.value);
                }
            }
        });
    }
    
    // Add admin note
    if (addNoteBtn) {
        addNoteBtn.addEventListener('click', function() {
            if (currentClaimId && adminNote.value.trim() !== '') {
                addNoteToClaimId(currentClaimId, adminNote.value);
                alert('Note added successfully');
                
                // Update the notes in the modal
                const notesContainer = document.getElementById('claimNotes');
                if (notesContainer) {
                    const note = document.createElement('div');
                    note.className = 'p-2 bg-gray-100 rounded mb-2';
                    note.innerHTML = `
                        <p class="text-sm">${adminNote.value}</p>
                        <p class="text-xs text-gray-500">${new Date().toLocaleString()}</p>
                    `;
                    notesContainer.appendChild(note);
                }
                
                // Clear the note input
                adminNote.value = '';
            }
        });
    }
    
    // Load claims from localStorage
    function loadClaims(filter = 'all') {
        if (!claimsTableBody) return;
        
        // Get claims from localStorage
        const claims = JSON.parse(localStorage.getItem('veteranClaims')) || [];
        
        // Filter claims if needed
        const filteredClaims = filter === 'all' 
            ? claims 
            : claims.filter(claim => claim.status === filter);
        
        // Clear table
        claimsTableBody.innerHTML = '';
        
        if (filteredClaims.length === 0) {
            claimsTableBody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-gray-500">No claims found</td></tr>';
            return;
        }
        
        // Sort claims by date (newest first)
        filteredClaims.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Populate table
        filteredClaims.forEach(claim => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            
            const dateObj = new Date(claim.date);
            const formattedDate = dateObj.toLocaleDateString();
            
            row.innerHTML = `
                <td class="py-2 px-4 border-b">${formattedDate}</td>
                <td class="py-2 px-4 border-b">${claim.firstName} ${claim.lastName}</td>
                <td class="py-2 px-4 border-b">${claim.claimType}</td>
                <td class="py-2 px-4 border-b">
                    <span class="${getStatusClass(claim.status)}">${getStatusLabel(claim.status)}</span>
                </td>
                <td class="py-2 px-4 border-b">
                    <button class="view-claim-btn bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
                        data-id="${claim.id}">
                        View Details
                    </button>
                </td>
            `;
            
            claimsTableBody.appendChild(row);
        });
        
        // Add event listeners to view buttons
        document.querySelectorAll('.view-claim-btn').forEach(button => {
            button.addEventListener('click', function() {
                const claimId = this.getAttribute('data-id');
                viewClaimDetails(claimId);
            });
        });
    }
    
    // View claim details
    function viewClaimDetails(claimId) {
        const claims = JSON.parse(localStorage.getItem('veteranClaims')) || [];
        const claim = claims.find(c => c.id === claimId);
        
        if (!claim) return;
        
        // Set current claim ID
        currentClaimId = claimId;
        
        // Set status dropdown to current status
        if (statusUpdate) {
            statusUpdate.value = claim.status;
        }
        
        // Format dates
        const submissionDate = new Date(claim.date).toLocaleString();
        const serviceStartDate = claim.serviceStart ? new Date(claim.serviceStart).toLocaleDateString() : 'Not provided';
        const serviceEndDate = claim.serviceEnd ? new Date(claim.serviceEnd).toLocaleDateString() : 'Not provided';
        
        // Populate claim details
        claimDetails.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h4 class="font-bold">Veteran Information</h4>
                    <p><span class="font-semibold">Name:</span> ${claim.firstName} ${claim.lastName}</p>
                    <p><span class="font-semibold">Email:</span> ${claim.email}</p>
                    <p><span class="font-semibold">Phone:</span> ${claim.phone || 'Not provided'}</p>
                </div>
                <div>
                    <h4 class="font-bold">Service Information</h4>
                    <p><span class="font-semibold">Branch:</span> ${claim.branch || 'Not provided'}</p>
                    <p><span class="font-semibold">Service Period:</span> ${serviceStartDate} to ${serviceEndDate}</p>
                </div>
            </div>
            
            <div class="mt-4">
                <h4 class="font-bold">Claim Information</h4>
                <p><span class="font-semibold">Submission Date:</span> ${submissionDate}</p>
                <p><span class="font-semibold">Claim Type:</span> ${claim.claimType}</p>
                <p><span class="font-semibold">Status:</span> <span class="status ${getStatusClass(claim.status)}">${getStatusLabel(claim.status)}</span></p>
                <div class="mt-2">
                    <p class="font-semibold">Details:</p>
                    <p class="bg-gray-50 p-2 rounded">${claim.claimDetails}</p>
                </div>
            </div>
            
            ${claim.files && claim.files.length > 0 ? `
                <div class="mt-4">
                    <h4 class="font-bold">Attached Documents</h4>
                    <ul class="list-disc pl-5">
                        ${claim.files.map(file => `
                            <li>${file.name} (${formatFileSize(file.size)})</li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}
            
            <div class="mt-4">
                <h4 class="font-bold">Notes</h4>
                <div id="claimNotes" class="mt-2">
                    ${claim.notes && claim.notes.length > 0 ? 
                        claim.notes.map(note => `
                            <div class="p-2 bg-gray-100 rounded mb-2">
                                <p class="text-sm">${note.text}</p>
                                <p class="text-xs text-gray-500">${new Date(note.date).toLocaleString()}</p>
                            </div>
                        `).join('') : 
                        '<p class="text-gray-500">No notes yet</p>'
                    }
                </div>
            </div>
        `;
        
        // Show modal
        claimModal.classList.remove('hidden');
    }
    
    // Update claim status
    function updateClaimStatus(claimId, newStatus) {
        const claims = JSON.parse(localStorage.getItem('veteranClaims')) || [];
        const claimIndex = claims.findIndex(c => c.id === claimId);
        
        if (claimIndex !== -1) {
            claims[claimIndex].status = newStatus;
            localStorage.setItem('veteranClaims', JSON.stringify(claims));
        }
    }
    
    // Add note to claim
    function addNoteToClaimId(claimId, noteText) {
        const claims = JSON.parse(localStorage.getItem('veteranClaims')) || [];
        const claimIndex = claims.findIndex(c => c.id === claimId);
        
        if (claimIndex !== -1) {
            if (!claims[claimIndex].notes) {
                claims[claimIndex].notes = [];
            }
            
            claims[claimIndex].notes.push({
                text: noteText,
                date: new Date().toISOString()
            });
            
            localStorage.setItem('veteranClaims', JSON.stringify(claims));
        }
    }
    
    // Helper functions
    function getStatusLabel(status) {
        switch (status) {
            case 'new': return 'New';
            case 'in-progress': return 'In Progress';
            case 'completed': return 'Completed';
            default: return 'Unknown';
        }
    }
    
    function getStatusClass(status) {
        switch (status) {
            case 'new': return 'status-new';
            case 'in-progress': return 'status-in-progress';
            case 'completed': return 'status-completed';
            default: return '';
        }
    }
    
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }
});
