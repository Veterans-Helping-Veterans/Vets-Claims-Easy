// Admin Dashboard JavaScript for Veterans Claims Assistance Portal
import { decryptData } from './security.js';

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
    const statusUpdate = document.getElementById('statusUpdate');
    const updateStatusBtn = document.getElementById('updateStatusBtn');
    const adminNote = document.getElementById('adminNote');
    const addNoteBtn = document.getElementById('addNoteBtn');

    // Admin credentials (in a real app, this would be server-side and properly hashed)
    const ADMIN_CREDENTIALS = {
        email: 'admin@example.com',
        password: 'admin123' // In production, use proper password hashing
    };

    // Current claim being viewed
    let currentClaimId = null;

    // Initialize
    init();

    function init() {
        checkAuth();
        setupEventListeners();
        loadClaims();
    }

    function setupEventListeners() {
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                handleLogin();
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                handleLogout();
            });
        }

        if (filterButtons) {
            filterButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const filter = this.getAttribute('data-filter');
                    // Remove active class from all buttons
                    filterButtons.forEach(btn => btn.classList.remove('bg-green-600', 'text-white'));
                    // Add active class to clicked button
                    this.classList.add('bg-green-600', 'text-white');
                    loadClaims(filter);
                });
            });
        }

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeClaimModal);
        }

        if (updateStatusBtn) {
            updateStatusBtn.addEventListener('click', function() {
                updateClaimStatus(currentClaimId, statusUpdate.value);
            });
        }

        if (addNoteBtn) {
            addNoteBtn.addEventListener('click', function() {
                if (!currentClaimId || !adminNote.value.trim()) return;
                addNoteToClaimId(currentClaimId, adminNote.value);
            });
        }
    }

    function handleLogin() {
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;

        if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
            sessionStorage.setItem('adminAuthenticated', 'true');
            showDashboard();
        } else {
            showError('Invalid credentials');
        }
    }

    function handleLogout() {
        sessionStorage.removeItem('adminAuthenticated');
        showLogin();
    }

    function checkAuth() {
        if (sessionStorage.getItem('adminAuthenticated')) {
            showDashboard();
        } else {
            showLogin();
        }
    }

    function showLogin() {
        if (loginContainer) loginContainer.classList.remove('hidden');
        if (adminDashboard) adminDashboard.classList.add('hidden');
    }

    function showDashboard() {
        if (loginContainer) loginContainer.classList.add('hidden');
        if (adminDashboard) adminDashboard.classList.remove('hidden');
        loadClaims();
    }

    function loadClaims(filter = 'all') {
        const claims = JSON.parse(localStorage.getItem('claims') || '[]');
        let filteredClaims = claims;

        if (filter !== 'all') {
            filteredClaims = claims.filter(claim => {
                if (filter === 'new') return claim.status === 'new';
                if (filter === 'in-progress') return ['in_review', 'evidence_gathering'].includes(claim.status);
                if (filter === 'completed') return ['approved', 'denied'].includes(claim.status);
                return false;
            });
        }

        displayClaims(filteredClaims);
        updateStats(claims);
    }

    function displayClaims(claims) {
        if (!claimsTableBody) return;

        claimsTableBody.innerHTML = claims.length === 0 
            ? '<tr><td colspan="5" class="py-4 text-center text-gray-500">No claims found</td></tr>'
            : claims.map(claim => {
                const decryptedData = decryptData(claim.sensitiveData);
                const date = new Date(claim.date).toLocaleDateString();
                
                return `
                    <tr class="hover:bg-gray-50">
                        <td class="py-2 px-4 border-b">${date}</td>
                        <td class="py-2 px-4 border-b">${decryptedData.firstName} ${decryptedData.lastName}</td>
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
                    </tr>
                `;
            }).join('');

        // Add click handlers for view buttons
        document.querySelectorAll('.view-claim-btn').forEach(button => {
            button.addEventListener('click', () => viewClaimDetails(button.getAttribute('data-id')));
        });
    }

    function viewClaimDetails(claimId) {
        const claims = JSON.parse(localStorage.getItem('claims') || '[]');
        const claim = claims.find(c => c.id === claimId);
        
        if (!claim || !claimModal) return;

        currentClaimId = claimId;
        const decryptedData = decryptData(claim.sensitiveData);
        
        const detailsHtml = `
            <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-gray-50 p-4 rounded">
                        <h4 class="text-sm font-medium text-gray-500 mb-1">Claim ID</h4>
                        <p class="font-semibold">${claim.id}</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded">
                        <h4 class="text-sm font-medium text-gray-500 mb-1">Submission Date</h4>
                        <p class="font-semibold">${new Date(claim.date).toLocaleString()}</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded">
                        <h4 class="text-sm font-medium text-gray-500 mb-1">Status</h4>
                        <p class="font-semibold"><span class="${getStatusClass(claim.status)}">${getStatusLabel(claim.status)}</span></p>
                    </div>
                </div>

                <div class="space-y-4">
                    <div>
                        <h4 class="font-semibold mb-2">Veteran Information</h4>
                        <div class="bg-gray-50 p-4 rounded">
                            <p><strong>Name:</strong> ${decryptedData.firstName} ${decryptedData.lastName}</p>
                            <p><strong>Email:</strong> ${decryptedData.email}</p>
                            <p><strong>Phone:</strong> ${decryptedData.phone || 'Not provided'}</p>
                        </div>
                    </div>

                    <div>
                        <h4 class="font-semibold mb-2">Service Information</h4>
                        <div class="bg-gray-50 p-4 rounded">
                            <p><strong>Branch:</strong> ${claim.branch}</p>
                            <p><strong>Service Period:</strong> ${claim.serviceStart} - ${claim.serviceEnd}</p>
                        </div>
                    </div>

                    <div>
                        <h4 class="font-semibold mb-2">Claim Details</h4>
                        <div class="bg-gray-50 p-4 rounded">
                            <p><strong>Type:</strong> ${claim.claimType}</p>
                            <p class="mt-2"><strong>Description:</strong></p>
                            <p class="whitespace-pre-wrap">${decryptedData.claimDetails}</p>
                        </div>
                    </div>

                    ${renderFiles(claim.files)}
                    ${renderNotes(claim.notes)}
                </div>
            </div>
        `;

        const modalContent = document.querySelector('#claimModal .admin-modal-body');
        if (modalContent) {
            modalContent.innerHTML = detailsHtml;
        }

        if (statusUpdate) {
            statusUpdate.value = claim.status;
        }

        claimModal.classList.remove('hidden');
    }

    function renderFiles(files) {
        if (!files || Object.keys(files).length === 0) {
            return `
                <div>
                    <h4 class="font-semibold mb-2">Uploaded Files</h4>
                    <p class="text-gray-500">No files uploaded</p>
                </div>
            `;
        }

        const fileCategories = {
            medical_records: 'Medical Records',
            va_letters: 'VA Letters',
            other_documents: 'Other Documents'
        };

        let filesHtml = '<div><h4 class="font-semibold mb-2">Uploaded Files</h4><div class="grid grid-cols-1 md:grid-cols-3 gap-4">';
        
        for (const [category, label] of Object.entries(fileCategories)) {
            const categoryFiles = files[category] || [];
            filesHtml += `
                <div>
                    <h5 class="text-sm font-medium text-gray-500 mb-2">${label}</h5>
                    ${categoryFiles.length === 0 
                        ? '<p class="text-gray-500">No files</p>'
                        : `<ul class="space-y-2">
                            ${categoryFiles.map(file => `
                                <li class="flex items-center">
                                    <i class="fas fa-file text-gray-400 mr-2"></i>
                                    <span class="text-sm">${file.name}</span>
                                </li>
                            `).join('')}
                        </ul>`
                    }
                </div>
            `;
        }
        
        filesHtml += '</div></div>';
        return filesHtml;
    }

    function renderNotes(notes) {
        return `
            <div>
                <h4 class="font-semibold mb-2">Notes</h4>
                <div class="space-y-2">
                    ${notes && notes.length > 0 
                        ? notes.map(note => `
                            <div class="bg-gray-50 p-3 rounded">
                                <p class="whitespace-pre-wrap">${note.text}</p>
                                <p class="text-sm text-gray-500 mt-1">${new Date(note.date).toLocaleString()}</p>
                            </div>
                          `).join('')
                        : '<p class="text-gray-500">No notes added</p>'
                    }
                </div>
            </div>
        `;
    }

    function updateClaimStatus(claimId, newStatus) {
        const claims = JSON.parse(localStorage.getItem('claims') || '[]');
        const claimIndex = claims.findIndex(c => c.id === claimId);
        
        if (claimIndex === -1) return;

        claims[claimIndex].status = newStatus;
        claims[claimIndex].lastUpdated = new Date().toISOString();

        if (!claims[claimIndex].notes) claims[claimIndex].notes = [];
        claims[claimIndex].notes.push({
            text: `Status updated to: ${getStatusLabel(newStatus)}`,
            date: new Date().toISOString(),
            type: 'status'
        });

        localStorage.setItem('claims', JSON.stringify(claims));
        showNotification('Status updated successfully');
        loadClaims();
        viewClaimDetails(claimId);
    }

    function addNoteToClaimId(claimId, noteText) {
        const claims = JSON.parse(localStorage.getItem('claims') || '[]');
        const claimIndex = claims.findIndex(c => c.id === claimId);
        
        if (claimIndex === -1) return;

        if (!claims[claimIndex].notes) claims[claimIndex].notes = [];
        
        claims[claimIndex].notes.push({
            text: noteText,
            date: new Date().toISOString(),
            type: 'note'
        });

        localStorage.setItem('claims', JSON.stringify(claims));
        if (adminNote) adminNote.value = '';
        showNotification('Note added successfully');
        viewClaimDetails(claimId);
    }

    function updateStats(claims) {
        const stats = {
            total: claims.length,
            new: claims.filter(c => c.status === 'new').length,
            inProgress: claims.filter(c => ['in_review', 'evidence_gathering'].includes(c.status)).length,
            completed: claims.filter(c => ['approved', 'denied'].includes(c.status)).length
        };

        const totalElement = document.getElementById('totalClaimsCount');
        const newElement = document.getElementById('newClaimsCount');
        const inProgressElement = document.getElementById('inProgressClaimsCount');
        const completedElement = document.getElementById('completedClaimsCount');

        if (totalElement) totalElement.textContent = stats.total;
        if (newElement) newElement.textContent = stats.new;
        if (inProgressElement) inProgressElement.textContent = stats.inProgress;
        if (completedElement) completedElement.textContent = stats.completed;
    }

    function closeClaimModal() {
        if (claimModal) {
            claimModal.classList.add('hidden');
            currentClaimId = null;
        }
    }

    function showNotification(message, type = 'success') {
        const toast = document.getElementById('notificationToast');
        const toastMessage = document.getElementById('notificationMessage');
        
        if (!toast || !toastMessage) return;

        toastMessage.textContent = message;
        toast.classList.remove('translate-y-20');
        
        setTimeout(() => {
            toast.classList.add('translate-y-20');
        }, 3000);
    }

    function showError(message) {
        const errorDiv = document.getElementById('loginError');
        if (!errorDiv) return;

        errorDiv.classList.remove('hidden');
        const errorMessage = errorDiv.querySelector('p');
        if (errorMessage) errorMessage.textContent = message;
    }

    function getStatusClass(status) {
        const classes = {
            new: 'bg-blue-100 text-blue-800',
            in_review: 'bg-yellow-100 text-yellow-800',
            evidence_gathering: 'bg-purple-100 text-purple-800',
            approved: 'bg-green-100 text-green-800',
            denied: 'bg-red-100 text-red-800',
            appealed: 'bg-orange-100 text-orange-800'
        };
        return `px-2 py-1 rounded-full text-sm ${classes[status] || 'bg-gray-100 text-gray-800'}`;
    }

    function getStatusLabel(status) {
        const labels = {
            new: 'New',
            in_review: 'In Review',
            evidence_gathering: 'Evidence Gathering',
            approved: 'Approved',
            denied: 'Denied',
            appealed: 'Appealed'
        };
        return labels[status] || status;
    }
});
