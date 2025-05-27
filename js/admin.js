// Admin Dashboard JavaScript for Veterans Claims Assistance Portal
import { login, logout, getClaims, updateStatus } from './api-client-supabase.js';
import { supabase } from './supabase-config.js';

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

    // Initialize
    init();

    function init() {
        checkAuth();
        setupEventListeners();
    }

    function setupEventListeners() {
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }

        if (filterButtons) {
            filterButtons.forEach(btn => {
                btn.addEventListener('click', () => loadClaims(btn.dataset.filter));
            });
        }

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeClaimModal);
        }
    }

    async function handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const { user, role } = await login(email, password);
            if (role !== 'admin') {
                throw new Error('Unauthorized: Admin access required');
            }
            showDashboard();
            loadClaims();
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed: ' + error.message);
        }
    }

    async function handleLogout() {
        try {
            await logout();
            showLogin();
        } catch (error) {
            console.error('Logout error:', error);
            alert('Logout failed: ' + error.message);
        }
    }

    async function checkAuth() {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            showDashboard();
            loadClaims();
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
    }

    async function loadClaims(status = null) {
        try {
            const claims = await getClaims();
            
            // Filter by status if provided
            const filteredClaims = status ? 
                claims.filter(claim => claim.status === status) : 
                claims;

            // Update UI
            claimsTableBody.innerHTML = '';
            filteredClaims.forEach(claim => {
                const row = createClaimRow(claim);
                claimsTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error loading claims:', error);
            alert('Error loading claims: ' + error.message);
        }
    }

    function createClaimRow(claim) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(claim.date).toLocaleDateString()}</td>
            <td>${claim.veteran_data.firstName} ${claim.veteran_data.lastName}</td>
            <td>${claim.branch}</td>
            <td>${claim.claim_type}</td>
            <td>
                <span class="status-badge ${claim.status}">${claim.status}</span>
            </td>
            <td>
                <button class="view-btn" data-claim-id="${claim.id}">View Details</button>
            </td>
        `;

        // Add click handler for view button
        row.querySelector('.view-btn').addEventListener('click', () => {
            showClaimDetails(claim);
        });

        return row;
    }

    function showClaimDetails(claim) {
        const modalContent = document.getElementById('modalContent');
        modalContent.innerHTML = `
            <h3>Claim Details</h3>
            <p><strong>Date:</strong> ${new Date(claim.date).toLocaleDateString()}</p>
            <p><strong>Veteran:</strong> ${claim.veteran_data.firstName} ${claim.veteran_data.lastName}</p>
            <p><strong>Contact:</strong> ${claim.veteran_data.email} | ${claim.veteran_data.phone}</p>
            <p><strong>Service:</strong> ${claim.branch}</p>
            <p><strong>Service Period:</strong> ${claim.veteran_data.serviceStart} - ${claim.veteran_data.serviceEnd}</p>
            <p><strong>Claim Type:</strong> ${claim.claim_type}</p>
            <p><strong>Details:</strong> ${claim.claim_details}</p>
            <p><strong>Status:</strong> ${claim.status}</p>
            
            <div class="files-section">
                <h4>Attached Files:</h4>
                <ul>
                    ${claim.files?.map(file => `
                        <li>
                            <a href="${file.url}" target="_blank">${file.name}</a>
                            (${(file.size / 1024 / 1024).toFixed(2)} MB)
                        </li>
                    `).join('') || 'No files attached'}
                </ul>
            </div>

            <div class="status-update">
                <h4>Update Status</h4>
                <select id="statusUpdate">
                    <option value="new" ${claim.status === 'new' ? 'selected' : ''}>New</option>
                    <option value="in_review" ${claim.status === 'in_review' ? 'selected' : ''}>In Review</option>
                    <option value="evidence_gathering" ${claim.status === 'evidence_gathering' ? 'selected' : ''}>Evidence Gathering</option>
                    <option value="approved" ${claim.status === 'approved' ? 'selected' : ''}>Approved</option>
                    <option value="denied" ${claim.status === 'denied' ? 'selected' : ''}>Denied</option>
                </select>
                <textarea id="statusNote" placeholder="Add a note about this status change..."></textarea>
                <button id="updateStatusBtn">Update Status</button>
            </div>
        `;

        // Add event listener for status update
        document.getElementById('updateStatusBtn').addEventListener('click', async () => {
            const newStatus = document.getElementById('statusUpdate').value;
            const note = document.getElementById('statusNote').value;
            
            try {
                await updateStatus(claim.id, newStatus, note);
                loadClaims(); // Reload claims list
                closeClaimModal();
            } catch (error) {
                console.error('Error updating status:', error);
                alert('Error updating status: ' + error.message);
            }
        });

        claimModal.classList.remove('hidden');
    }

    function closeClaimModal() {
        claimModal.classList.add('hidden');
    }
});
