// Admin Dashboard JavaScript for Veterans Claims Assistance Portal

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements - Login
    const loginForm = document.getElementById('loginForm');
    const loginContainer = document.getElementById('loginContainer');
    const adminDashboard = document.getElementById('adminDashboard');
    const loginError = document.getElementById('loginError');
    const togglePassword = document.getElementById('togglePassword');

    // DOM elements - Dashboard
    const logoutBtn = document.getElementById('logoutBtn');
    const currentDate = document.getElementById('currentDate');
    const adminSections = document.querySelectorAll('.admin-section');
    const sidebarLinks = document.querySelectorAll('.admin-sidebar-menu a');

    // DOM elements - Claims
    const claimsTableBody = document.getElementById('claimsTableBody');
    const recentClaimsTableBody = document.getElementById('recentClaimsTableBody');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchClaims = document.getElementById('searchClaims');
    const exportBtn = document.getElementById('exportBtn');
    const selectAllClaims = document.getElementById('selectAllClaims');
    const bulkActionBtn = document.getElementById('bulkActionBtn');

    // DOM elements - Stats
    const totalClaimsCount = document.getElementById('totalClaimsCount');
    const totalClaimsCount2 = document.getElementById('totalClaimsCount2');
    const newClaimsCount = document.getElementById('newClaimsCount');
    const inProgressClaimsCount = document.getElementById('inProgressClaimsCount');
    const completedClaimsCount = document.getElementById('completedClaimsCount');
    const shownClaimsCount = document.getElementById('shownClaimsCount');

    // DOM elements - Modals
    const claimModal = document.getElementById('claimModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const closeModalBtn2 = document.getElementById('closeModalBtn2');
    const printClaimBtn = document.getElementById('printClaimBtn');
    const bulkActionsModal = document.getElementById('bulkActionsModal');
    const closeBulkModalBtn = document.getElementById('closeBulkModalBtn');
    const closeBulkModalBtn2 = document.getElementById('closeBulkModalBtn2');
    const bulkAction = document.getElementById('bulkAction');
    const bulkStatus = document.getElementById('bulkStatus');
    const bulkStatusSection = document.getElementById('bulkStatusSection');
    const selectedClaimsCount = document.getElementById('selectedClaimsCount');
    const applyBulkActionBtn = document.getElementById('applyBulkActionBtn');

    // DOM elements - Claim Details
    const claimId = document.getElementById('claimId');
    const claimDate = document.getElementById('claimDate');
    const claimStatus = document.getElementById('claimStatus');
    const veteranName = document.getElementById('veteranName');
    const veteranEmail = document.getElementById('veteranEmail');
    const veteranPhone = document.getElementById('veteranPhone');
    const veteranBranch = document.getElementById('veteranBranch');
    const claimType = document.getElementById('claimType');
    const claimDetails = document.getElementById('claimDetails');
    const medicalRecordsList = document.getElementById('medicalRecordsList');
    const vaLettersList = document.getElementById('vaLettersList');
    const otherDocumentsList = document.getElementById('otherDocumentsList');
    const notesHistory = document.getElementById('notesHistory');
    const statusUpdate = document.getElementById('statusUpdate');
    const updateStatusBtn = document.getElementById('updateStatusBtn');
    const adminNote = document.getElementById('adminNote');
    const addNoteBtn = document.getElementById('addNoteBtn');

    // DOM elements - Notification
    const notificationToast = document.getElementById('notificationToast');
    const notificationIcon = document.getElementById('notificationIcon');
    const notificationTitle = document.getElementById('notificationTitle');
    const notificationMessage = document.getElementById('notificationMessage');
    const closeNotificationBtn = document.getElementById('closeNotificationBtn');

    // DOM elements - Charts
    const statusChart = document.getElementById('statusChart');
    const branchChart = document.getElementById('branchChart');
    const claimsTimeChart = document.getElementById('claimsTimeChart');
    const claimTypesChart = document.getElementById('claimTypesChart');
    const processingTimeChart = document.getElementById('processingTimeChart');
    const timeRangeSelect = document.getElementById('timeRangeSelect');

    // Admin credentials (in a real app, this would be server-side)
    const adminCredentials = {
        email: 'admin@example.com',
        password: 'admin123'
    };

    // Current claim being viewed
    let currentClaimId = null;
    let selectedClaims = [];
    let allClaims = [];
    let charts = {};

    // Initialize
    init();

    function init() {
        // Set current date
        if (currentDate) {
            currentDate.textContent = new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        // Check if user is already logged in (for demo purposes)
        const isLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
        if (isLoggedIn && loginContainer && adminDashboard) {
            loginContainer.classList.add('hidden');
            adminDashboard.classList.remove('hidden');
            initDashboard();
        }

        // Setup event listeners
        setupEventListeners();
    }

    function setupEventListeners() {
        // Toggle password visibility
        if (togglePassword) {
            togglePassword.addEventListener('click', function() {
                const passwordInput = document.getElementById('adminPassword');
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);

                // Toggle eye icon
                const icon = this.querySelector('i');
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            });
        }

        // Handle login form submission
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();

                const email = document.getElementById('adminEmail').value;
                const password = document.getElementById('adminPassword').value;

                if (email === adminCredentials.email && password === adminCredentials.password) {
                    // Login successful
                    localStorage.setItem('isAdminLoggedIn', 'true');
                    loginContainer.classList.add('hidden');
                    adminDashboard.classList.remove('hidden');

                    // Initialize dashboard
                    initDashboard();
                } else {
                    // Login failed
                    if (loginError) {
                        loginError.classList.remove('hidden');
                    } else {
                        alert('Invalid credentials. Please try again.');
                    }
                }
            });
        }

        // Handle logout
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                localStorage.removeItem('isAdminLoggedIn');
                adminDashboard.classList.add('hidden');
                loginContainer.classList.remove('hidden');
                document.getElementById('loginForm').reset();
                if (loginError) loginError.classList.add('hidden');
            });
        }

        // Handle sidebar navigation
        if (sidebarLinks) {
            sidebarLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    if (this.getAttribute('id') === 'logoutBtn') return;

                    e.preventDefault();
                    const sectionId = this.getAttribute('data-section');

                    // Update active link
                    sidebarLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');

                    // Show selected section
                    adminSections.forEach(section => {
                        section.classList.add('hidden');
                    });
                    document.getElementById(sectionId).classList.remove('hidden');

                    // Special handling for sections
                    if (sectionId === 'claimsSection') {
                        loadClaims('all');
                    } else if (sectionId === 'analyticsSection') {
                        initCharts();
                    }
                });
            });
        }

        // Handle filter buttons
        if (filterButtons) {
            filterButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // Update active button
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');

                    // Filter claims
                    const filter = this.getAttribute('data-filter');
                    loadClaims(filter);
                });
            });
        }

        // Handle search
        if (searchClaims) {
            searchClaims.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                filterClaimsBySearch(searchTerm);
            });
        }

        // Handle select all claims
        if (selectAllClaims) {
            selectAllClaims.addEventListener('change', function() {
                const checkboxes = document.querySelectorAll('.claim-checkbox');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = this.checked;
                });

                updateSelectedClaims();
            });
        }

        // Handle bulk action selection
        if (bulkAction) {
            bulkAction.addEventListener('change', function() {
                if (this.value === 'status') {
                    bulkStatusSection.classList.remove('hidden');
                } else {
                    bulkStatusSection.classList.add('hidden');
                }
            });
        }

        // Handle bulk action button
        if (bulkActionBtn) {
            bulkActionBtn.addEventListener('click', function() {
                if (selectedClaims.length === 0) return;

                selectedClaimsCount.textContent = selectedClaims.length;
                bulkActionsModal.classList.add('show');
            });
        }

        // Handle apply bulk action
        if (applyBulkActionBtn) {
            applyBulkActionBtn.addEventListener('click', function() {
                const action = bulkAction.value;

                if (!action) {
                    showNotification('error', 'Error', 'Please select an action');
                    return;
                }

                if (action === 'status') {
                    const newStatus = bulkStatus.value;
                    updateBulkStatus(selectedClaims, newStatus);
                    showNotification('success', 'Success', `Status updated for ${selectedClaims.length} claims`);
                } else if (action === 'export') {
                    exportSelectedClaims(selectedClaims);
                    showNotification('success', 'Success', `Exported ${selectedClaims.length} claims`);
                } else if (action === 'delete') {
                    if (confirm(`Are you sure you want to delete ${selectedClaims.length} claims? This action cannot be undone.`)) {
                        deleteSelectedClaims(selectedClaims);
                        showNotification('success', 'Success', `Deleted ${selectedClaims.length} claims`);
                    }
                }

                // Close modal and reset
                bulkActionsModal.classList.remove('show');
                bulkAction.value = '';
                bulkStatusSection.classList.add('hidden');
                selectAllClaims.checked = false;
                selectedClaims = [];
                loadClaims('all');
            });
        }

        // Handle close bulk modal
        if (closeBulkModalBtn) {
            closeBulkModalBtn.addEventListener('click', function() {
                bulkActionsModal.classList.remove('show');
            });
        }

        if (closeBulkModalBtn2) {
            closeBulkModalBtn2.addEventListener('click', function() {
                bulkActionsModal.classList.remove('show');
            });
        }

        // Handle export button
        if (exportBtn) {
            exportBtn.addEventListener('click', function() {
                exportAllClaims();
                showNotification('success', 'Success', 'Claims exported successfully');
            });
        }

        // Handle time range selection for analytics
        if (timeRangeSelect) {
            timeRangeSelect.addEventListener('change', function() {
                initCharts();
            });
        }

        // Close modal buttons
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', function() {
                claimModal.classList.remove('show');
            });
        }

        if (closeModalBtn2) {
            closeModalBtn2.addEventListener('click', function() {
                claimModal.classList.remove('show');
            });
        }

        // Print claim button
        if (printClaimBtn) {
            printClaimBtn.addEventListener('click', function() {
                printClaimDetails();
            });
        }

        // Close notification
        if (closeNotificationBtn) {
            closeNotificationBtn.addEventListener('click', function() {
                notificationToast.style.transform = 'translateY(20px)';
            });
        }

        // Update claim status
        if (updateStatusBtn) {
            updateStatusBtn.addEventListener('click', function() {
                if (currentClaimId) {
                    updateClaimStatus(currentClaimId, statusUpdate.value);
                    showNotification('success', 'Success', 'Status updated successfully');

                    // Update the status in the modal
                    if (claimStatus) {
                        claimStatus.textContent = getStatusLabel(statusUpdate.value);

                        // Refresh claims list
                        loadClaims();
                        loadDashboardStats();
                        if (statusChart) initCharts();
                    }
                }
            });
        }

        // Add admin note
        if (addNoteBtn) {
            addNoteBtn.addEventListener('click', function() {
                if (currentClaimId && adminNote.value.trim() !== '') {
                    addNoteToClaimId(currentClaimId, adminNote.value);
                    showNotification('success', 'Success', 'Note added successfully');

                    // Update the notes in the modal
                    loadNotesHistory(currentClaimId);

                    // Clear the note input
                    adminNote.value = '';
                }
            });
        }
    }

    // Initialize dashboard
    function initDashboard() {
        // Load claims data
        loadAllClaims();

        // Load dashboard stats
        loadDashboardStats();

        // Initialize charts
        initCharts();

        // Load recent claims
        loadRecentClaims();
    }

    // Load all claims from localStorage
    function loadAllClaims() {
        allClaims = JSON.parse(localStorage.getItem('veteranClaims')) || [];

        // Sort claims by date (newest first)
        allClaims.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Load dashboard stats
    function loadDashboardStats() {
        if (!totalClaimsCount) return;

        const claims = allClaims.length > 0 ? allClaims : JSON.parse(localStorage.getItem('veteranClaims')) || [];

        // Count claims by status
        const newCount = claims.filter(claim => claim.status === 'new').length;

        // Count in-progress statuses (in_review, evidence_gathering, decision_pending, in-progress)
        const inProgressCount = claims.filter(claim =>
            claim.status === 'in_review' ||
            claim.status === 'evidence_gathering' ||
            claim.status === 'decision_pending' ||
            claim.status === 'in-progress'
        ).length;

        // Count completed statuses (approved, denied, appealed, completed)
        const completedCount = claims.filter(claim =>
            claim.status === 'approved' ||
            claim.status === 'denied' ||
            claim.status === 'appealed' ||
            claim.status === 'completed'
        ).length;

        // Update stats
        totalClaimsCount.textContent = claims.length;
        if (totalClaimsCount2) totalClaimsCount2.textContent = claims.length;
        newClaimsCount.textContent = newCount;
        inProgressClaimsCount.textContent = inProgressCount;
        completedClaimsCount.textContent = completedCount;
    }

    // Load recent claims
    function loadRecentClaims() {
        if (!recentClaimsTableBody) return;

        const claims = allClaims.length > 0 ? allClaims : JSON.parse(localStorage.getItem('veteranClaims')) || [];

        // Clear table
        recentClaimsTableBody.innerHTML = '';

        if (claims.length === 0) {
            recentClaimsTableBody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-gray-500">No claims found</td></tr>';
            return;
        }

        // Get only the 5 most recent claims
        const recentClaims = claims.slice(0, 5);

        // Populate table
        recentClaims.forEach(claim => {
            const row = document.createElement('tr');

            const dateObj = new Date(claim.date);
            const formattedDate = dateObj.toLocaleDateString();

            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${claim.firstName} ${claim.lastName}</td>
                <td>${claim.claimType}</td>
                <td><span class="admin-badge ${getStatusBadgeClass(claim.status)}">${getStatusLabel(claim.status)}</span></td>
                <td>
                    <button class="admin-btn admin-btn-primary admin-btn-sm view-claim-btn" data-id="${claim.id}">
                        View
                    </button>
                </td>
            `;

            recentClaimsTableBody.appendChild(row);
        });

        // Add event listeners to view buttons
        document.querySelectorAll('.view-claim-btn').forEach(button => {
            button.addEventListener('click', function() {
                const claimId = this.getAttribute('data-id');
                viewClaimDetails(claimId);
            });
        });
    }

    // Initialize charts
    function initCharts() {
        if (!statusChart) return;

        const claims = allClaims.length > 0 ? allClaims : JSON.parse(localStorage.getItem('veteranClaims')) || [];

        // Destroy existing charts
        Object.values(charts).forEach(chart => {
            if (chart) chart.destroy();
        });

        // Create status chart
        createStatusChart(claims);

        // Create branch chart
        createBranchChart(claims);

        // Create claims over time chart
        if (claimsTimeChart) {
            createClaimsTimeChart(claims);
        }

        // Create claim types chart
        if (claimTypesChart) {
            createClaimTypesChart(claims);
        }

        // Create processing time chart
        if (processingTimeChart) {
            createProcessingTimeChart(claims);
        }
    }

    // Create status chart
    function createStatusChart(claims) {
        if (!statusChart) return;

        // Count claims by status
        const newCount = claims.filter(claim => claim.status === 'new').length;
        const inReviewCount = claims.filter(claim => claim.status === 'in_review').length;
        const evidenceGatheringCount = claims.filter(claim => claim.status === 'evidence_gathering').length;
        const decisionPendingCount = claims.filter(claim => claim.status === 'decision_pending').length;
        const approvedCount = claims.filter(claim => claim.status === 'approved').length;
        const deniedCount = claims.filter(claim => claim.status === 'denied').length;
        const appealedCount = claims.filter(claim => claim.status === 'appealed').length;

        // Legacy status support
        const inProgressCount = claims.filter(claim => claim.status === 'in-progress').length;
        const completedCount = claims.filter(claim => claim.status === 'completed').length;

        // Create chart
        charts.status = new Chart(statusChart, {
            type: 'doughnut',
            data: {
                labels: [
                    'New',
                    'In Review',
                    'Evidence Gathering',
                    'Decision Pending',
                    'Approved',
                    'Denied',
                    'Appealed',
                    'In Progress (Legacy)',
                    'Completed (Legacy)'
                ],
                datasets: [{
                    data: [
                        newCount,
                        inReviewCount,
                        evidenceGatheringCount,
                        decisionPendingCount,
                        approvedCount,
                        deniedCount,
                        appealedCount,
                        inProgressCount,
                        completedCount
                    ],
                    backgroundColor: [
                        getComputedStyle(document.documentElement).getPropertyValue('--warning-yellow').trim(),
                        getComputedStyle(document.documentElement).getPropertyValue('--accent-blue').trim(),
                        '#9b59b6', // Purple for Evidence Gathering
                        '#3498db', // Blue for Decision Pending
                        getComputedStyle(document.documentElement).getPropertyValue('--success-green').trim(),
                        getComputedStyle(document.documentElement).getPropertyValue('--accent-red').trim(),
                        '#e67e22', // Orange for Appealed
                        '#7f8c8d', // Gray for legacy In Progress
                        '#2ecc71'  // Green for legacy Completed
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Create branch chart
    function createBranchChart(claims) {
        if (!branchChart) return;

        // Count claims by branch
        const branchCounts = {};
        claims.forEach(claim => {
            const branch = claim.branch || 'Not Specified';
            branchCounts[branch] = (branchCounts[branch] || 0) + 1;
        });

        // Create chart
        charts.branch = new Chart(branchChart, {
            type: 'bar',
            data: {
                labels: Object.keys(branchCounts),
                datasets: [{
                    label: 'Claims by Branch',
                    data: Object.values(branchCounts),
                    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--military-green').trim(),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }

    // Create claims over time chart
    function createClaimsTimeChart(claims) {
        if (!claimsTimeChart) return;

        // Get time range
        const days = parseInt(timeRangeSelect.value) || 30;
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Generate date labels
        const dateLabels = [];
        const dateCounts = {};

        // Initialize all dates with 0 counts
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateString = date.toISOString().split('T')[0];
            dateLabels.push(dateString);
            dateCounts[dateString] = 0;
        }

        // Count claims by date
        claims.forEach(claim => {
            const claimDate = new Date(claim.date);
            if (claimDate >= startDate && claimDate <= endDate) {
                const dateString = claimDate.toISOString().split('T')[0];
                dateCounts[dateString] = (dateCounts[dateString] || 0) + 1;
            }
        });

        // Create chart
        charts.claimsTime = new Chart(claimsTimeChart, {
            type: 'line',
            data: {
                labels: dateLabels,
                datasets: [{
                    label: 'Claims Submitted',
                    data: dateLabels.map(date => dateCounts[date] || 0),
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--military-green').trim(),
                    backgroundColor: 'rgba(93, 138, 61, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    },
                    x: {
                        ticks: {
                            maxTicksLimit: 10
                        }
                    }
                }
            }
        });
    }

    // Create claim types chart
    function createClaimTypesChart(claims) {
        if (!claimTypesChart) return;

        // Count claims by type
        const typeCounts = {};
        claims.forEach(claim => {
            const type = claim.claimType || 'Not Specified';
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });

        // Create chart
        charts.claimTypes = new Chart(claimTypesChart, {
            type: 'pie',
            data: {
                labels: Object.keys(typeCounts),
                datasets: [{
                    data: Object.values(typeCounts),
                    backgroundColor: [
                        '#5d8a3d', // military-green
                        '#4a7032', // military-green-dark
                        '#c9bc8f', // military-tan
                        '#a67c52', // military-brown
                        '#6c757d', // military-gray
                        '#4a90e2', // accent-blue
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Create processing time chart
    function createProcessingTimeChart(claims) {
        if (!processingTimeChart) return;

        // Calculate average processing time by claim type
        const processingTimes = {};
        const completedClaims = claims.filter(claim => claim.status === 'completed');

        completedClaims.forEach(claim => {
            const type = claim.claimType || 'Not Specified';
            const submissionDate = new Date(claim.date);

            // Find the completion date from notes
            let completionDate = null;
            if (claim.notes && claim.notes.length > 0) {
                // Assume the last note with status change to 'completed' is the completion date
                const statusNotes = claim.notes.filter(note =>
                    note.text.toLowerCase().includes('status') &&
                    note.text.toLowerCase().includes('completed')
                );

                if (statusNotes.length > 0) {
                    completionDate = new Date(statusNotes[statusNotes.length - 1].date);
                }
            }

            // If no completion date found, use current date (this is just for demo)
            if (!completionDate) {
                completionDate = new Date();
            }

            // Calculate days difference
            const diffTime = Math.abs(completionDate - submissionDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (!processingTimes[type]) {
                processingTimes[type] = {
                    total: diffDays,
                    count: 1
                };
            } else {
                processingTimes[type].total += diffDays;
                processingTimes[type].count += 1;
            }
        });

        // Calculate averages
        const types = Object.keys(processingTimes);
        const averages = types.map(type =>
            Math.round(processingTimes[type].total / processingTimes[type].count)
        );

        // Create chart
        charts.processingTime = new Chart(processingTimeChart, {
            type: 'bar',
            data: {
                labels: types,
                datasets: [{
                    label: 'Avg. Days to Complete',
                    data: averages,
                    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-blue').trim(),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }

    // Load claims from localStorage
    function loadClaims(filter = 'all') {
        if (!claimsTableBody) return;

        // Get claims from localStorage
        const claims = allClaims.length > 0 ? allClaims : JSON.parse(localStorage.getItem('veteranClaims')) || [];

        // Filter claims if needed
        const filteredClaims = filter === 'all'
            ? claims
            : claims.filter(claim => claim.status === filter);

        // Clear table
        claimsTableBody.innerHTML = '';

        if (filteredClaims.length === 0) {
            claimsTableBody.innerHTML = '<tr><td colspan="6" class="py-4 text-center text-gray-500">No claims found</td></tr>';
            if (shownClaimsCount) shownClaimsCount.textContent = 0;
            return;
        }

        // Update shown claims count
        if (shownClaimsCount) shownClaimsCount.textContent = filteredClaims.length;

        // Populate table
        filteredClaims.forEach(claim => {
            const row = document.createElement('tr');

            const dateObj = new Date(claim.date);
            const formattedDate = dateObj.toLocaleDateString();

            row.innerHTML = `
                <td>
                    <input type="checkbox" class="claim-checkbox mr-2" data-id="${claim.id}">
                    ${formattedDate}
                </td>
                <td>${claim.firstName} ${claim.lastName}</td>
                <td>${claim.branch || 'Not specified'}</td>
                <td>${claim.claimType}</td>
                <td><span class="admin-badge ${getStatusBadgeClass(claim.status)}">${getStatusLabel(claim.status)}</span></td>
                <td>
                    <button class="admin-btn admin-btn-primary admin-btn-sm view-claim-btn" data-id="${claim.id}">
                        <i class="fas fa-eye admin-btn-icon"></i> View
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

        // Add event listeners to checkboxes
        document.querySelectorAll('.claim-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                updateSelectedClaims();
            });
        });
    }

    // Filter claims by search term
    function filterClaimsBySearch(searchTerm) {
        if (!claimsTableBody || !searchTerm) {
            loadClaims(document.querySelector('.filter-btn.active').getAttribute('data-filter'));
            return;
        }

        const claims = allClaims.length > 0 ? allClaims : JSON.parse(localStorage.getItem('veteranClaims')) || [];

        // Filter claims by search term
        const filteredClaims = claims.filter(claim => {
            const fullName = `${claim.firstName} ${claim.lastName}`.toLowerCase();
            const email = claim.email.toLowerCase();
            const claimType = claim.claimType.toLowerCase();
            const branch = (claim.branch || '').toLowerCase();
            const details = claim.claimDetails.toLowerCase();

            return fullName.includes(searchTerm) ||
                   email.includes(searchTerm) ||
                   claimType.includes(searchTerm) ||
                   branch.includes(searchTerm) ||
                   details.includes(searchTerm);
        });

        // Clear table
        claimsTableBody.innerHTML = '';

        if (filteredClaims.length === 0) {
            claimsTableBody.innerHTML = '<tr><td colspan="6" class="py-4 text-center text-gray-500">No matching claims found</td></tr>';
            if (shownClaimsCount) shownClaimsCount.textContent = 0;
            return;
        }

        // Update shown claims count
        if (shownClaimsCount) shownClaimsCount.textContent = filteredClaims.length;

        // Sort claims by date (newest first)
        filteredClaims.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Populate table
        filteredClaims.forEach(claim => {
            const row = document.createElement('tr');

            const dateObj = new Date(claim.date);
            const formattedDate = dateObj.toLocaleDateString();

            row.innerHTML = `
                <td>
                    <input type="checkbox" class="claim-checkbox mr-2" data-id="${claim.id}">
                    ${formattedDate}
                </td>
                <td>${claim.firstName} ${claim.lastName}</td>
                <td>${claim.branch || 'Not specified'}</td>
                <td>${claim.claimType}</td>
                <td><span class="admin-badge ${getStatusBadgeClass(claim.status)}">${getStatusLabel(claim.status)}</span></td>
                <td>
                    <button class="admin-btn admin-btn-primary admin-btn-sm view-claim-btn" data-id="${claim.id}">
                        <i class="fas fa-eye admin-btn-icon"></i> View
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

        // Add event listeners to checkboxes
        document.querySelectorAll('.claim-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                updateSelectedClaims();
            });
        });
    }

    // Update selected claims
    function updateSelectedClaims() {
        selectedClaims = [];

        document.querySelectorAll('.claim-checkbox:checked').forEach(checkbox => {
            selectedClaims.push(checkbox.getAttribute('data-id'));
        });

        // Enable/disable bulk action button
        if (bulkActionBtn) {
            bulkActionBtn.disabled = selectedClaims.length === 0;
        }
    }

    // View claim details
    function viewClaimDetails(claimId) {
        const claims = allClaims.length > 0 ? allClaims : JSON.parse(localStorage.getItem('veteranClaims')) || [];
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

        // Populate claim details
        if (claimId) claimId.textContent = claim.id;
        if (claimDate) claimDate.textContent = submissionDate;
        if (claimStatus) claimStatus.textContent = getStatusLabel(claim.status);
        if (veteranName) veteranName.textContent = `${claim.firstName} ${claim.lastName}`;
        if (veteranEmail) veteranEmail.textContent = claim.email;
        if (veteranPhone) veteranPhone.textContent = claim.phone || 'Not provided';
        if (veteranBranch) veteranBranch.textContent = claim.branch || 'Not specified';
        if (claimType) claimType.textContent = claim.claimType;
        if (claimDetails) claimDetails.textContent = claim.claimDetails;

        // Load documents
        loadDocuments(claim);

        // Load notes history
        loadNotesHistory(claimId);

        // Show modal
        claimModal.classList.add('show');
    }

    // Load documents
    function loadDocuments(claim) {
        if (!medicalRecordsList || !vaLettersList || !otherDocumentsList) return;

        // Clear lists
        medicalRecordsList.innerHTML = '';
        vaLettersList.innerHTML = '';
        otherDocumentsList.innerHTML = '';

        // Check if files exist in the new format
        if (claim.files && typeof claim.files === 'object' && !Array.isArray(claim.files)) {
            // Medical records
            if (claim.files.medical_records && claim.files.medical_records.length > 0) {
                claim.files.medical_records.forEach(file => {
                    const li = document.createElement('li');
                    li.textContent = `${file.name} (${formatFileSize(file.size)})`;
                    medicalRecordsList.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.textContent = 'No medical records uploaded';
                li.className = 'text-gray-500 italic';
                medicalRecordsList.appendChild(li);
            }

            // VA letters
            if (claim.files.va_letters && claim.files.va_letters.length > 0) {
                claim.files.va_letters.forEach(file => {
                    const li = document.createElement('li');
                    li.textContent = `${file.name} (${formatFileSize(file.size)})`;
                    vaLettersList.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.textContent = 'No VA letters uploaded';
                li.className = 'text-gray-500 italic';
                vaLettersList.appendChild(li);
            }

            // Other documents
            if (claim.files.other_documents && claim.files.other_documents.length > 0) {
                claim.files.other_documents.forEach(file => {
                    const li = document.createElement('li');
                    li.textContent = `${file.name} (${formatFileSize(file.size)})`;
                    otherDocumentsList.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.textContent = 'No other documents uploaded';
                li.className = 'text-gray-500 italic';
                otherDocumentsList.appendChild(li);
            }
        }
        // Check if files exist in the old format
        else if (claim.files && Array.isArray(claim.files) && claim.files.length > 0) {
            // Put all files in other documents
            claim.files.forEach(file => {
                const li = document.createElement('li');
                li.textContent = `${file.name} (${formatFileSize(file.size)})`;
                otherDocumentsList.appendChild(li);
            });

            // Add placeholders for medical records and VA letters
            const medLi = document.createElement('li');
            medLi.textContent = 'No medical records uploaded';
            medLi.className = 'text-gray-500 italic';
            medicalRecordsList.appendChild(medLi);

            const vaLi = document.createElement('li');
            vaLi.textContent = 'No VA letters uploaded';
            vaLi.className = 'text-gray-500 italic';
            vaLettersList.appendChild(vaLi);
        }
        // No files
        else {
            ['No medical records uploaded', 'No VA letters uploaded', 'No other documents uploaded'].forEach((text, index) => {
                const li = document.createElement('li');
                li.textContent = text;
                li.className = 'text-gray-500 italic';

                if (index === 0) medicalRecordsList.appendChild(li);
                else if (index === 1) vaLettersList.appendChild(li);
                else otherDocumentsList.appendChild(li);
            });
        }
    }

    // Load notes history
    function loadNotesHistory(claimId) {
        if (!notesHistory) return;

        const claims = JSON.parse(localStorage.getItem('veteranClaims')) || [];
        const claim = claims.find(c => c.id === claimId);

        if (!claim) return;

        // Clear notes history
        notesHistory.innerHTML = '';

        // Check if notes exist
        if (claim.notes && claim.notes.length > 0) {
            // Sort notes by date (newest first)
            claim.notes.sort((a, b) => new Date(b.date) - new Date(a.date));

            // Populate notes
            claim.notes.forEach(note => {
                const noteDiv = document.createElement('div');
                noteDiv.className = 'p-3 bg-gray-50 rounded mb-3';

                const noteDate = new Date(note.date).toLocaleString();

                noteDiv.innerHTML = `
                    <p class="mb-1">${note.text}</p>
                    <p class="text-xs text-gray-500">${noteDate}</p>
                `;

                notesHistory.appendChild(noteDiv);
            });
        } else {
            // No notes
            const noNotes = document.createElement('p');
            noNotes.className = 'text-gray-500 text-sm italic';
            noNotes.textContent = 'No notes have been added yet.';
            notesHistory.appendChild(noNotes);
        }
    }

    // Print claim details
    function printClaimDetails() {
        if (!currentClaimId) return;

        const claims = JSON.parse(localStorage.getItem('veteranClaims')) || [];
        const claim = claims.find(c => c.id === currentClaimId);

        if (!claim) return;

        // Create a new window for printing
        const printWindow = window.open('', '_blank');

        // Format dates
        const submissionDate = new Date(claim.date).toLocaleString();

        // Create print content
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Claim Details - ${claim.firstName} ${claim.lastName}</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
                    h1 { color: #5d8a3d; border-bottom: 2px solid #5d8a3d; padding-bottom: 10px; }
                    h2 { color: #5d8a3d; margin-top: 20px; }
                    .section { margin-bottom: 20px; }
                    .label { font-weight: bold; }
                    .status { display: inline-block; padding: 3px 8px; border-radius: 3px; color: white; font-weight: bold; }
                    .status-new { background-color: #f39c12; }
                    .status-in-progress { background-color: #4a90e2; }
                    .status-completed { background-color: #2ecc71; }
                    .details { background-color: #f9f9f9; padding: 10px; border-radius: 5px; margin-top: 5px; }
                    .note { background-color: #f9f9f9; padding: 10px; border-radius: 5px; margin-bottom: 10px; }
                    .note-date { font-size: 0.8em; color: #777; }
                    .footer { margin-top: 30px; text-align: center; font-size: 0.8em; color: #777; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Claim Details</h1>

                    <div class="section">
                        <p><span class="label">Claim ID:</span> ${claim.id}</p>
                        <p><span class="label">Submission Date:</span> ${submissionDate}</p>
                        <p><span class="label">Status:</span> <span class="status status-${claim.status}">${getStatusLabel(claim.status)}</span></p>
                    </div>

                    <h2>Veteran Information</h2>
                    <div class="section">
                        <p><span class="label">Name:</span> ${claim.firstName} ${claim.lastName}</p>
                        <p><span class="label">Email:</span> ${claim.email}</p>
                        <p><span class="label">Phone:</span> ${claim.phone || 'Not provided'}</p>
                        <p><span class="label">Military Branch:</span> ${claim.branch || 'Not specified'}</p>
                    </div>

                    <h2>Claim Information</h2>
                    <div class="section">
                        <p><span class="label">Claim Type:</span> ${claim.claimType}</p>
                        <p><span class="label">Details:</span></p>
                        <div class="details">${claim.claimDetails}</div>
                    </div>

                    <h2>Uploaded Documents</h2>
                    <div class="section">
                        ${getDocumentsHTML(claim)}
                    </div>

                    <h2>Notes History</h2>
                    <div class="section">
                        ${getNotesHTML(claim)}
                    </div>

                    <div class="footer">
                        <p>Printed on ${new Date().toLocaleString()}</p>
                        <p>Veterans Claims Assistance Portal</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Write content to the new window
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();

        // Wait for content to load then print
        printWindow.onload = function() {
            printWindow.print();
        };
    }

    // Get documents HTML for printing
    function getDocumentsHTML(claim) {
        let html = '';

        // Check if files exist in the new format
        if (claim.files && typeof claim.files === 'object' && !Array.isArray(claim.files)) {
            // Medical records
            html += '<h3>Medical Records</h3>';
            if (claim.files.medical_records && claim.files.medical_records.length > 0) {
                html += '<ul>';
                claim.files.medical_records.forEach(file => {
                    html += `<li>${file.name} (${formatFileSize(file.size)})</li>`;
                });
                html += '</ul>';
            } else {
                html += '<p><em>No medical records uploaded</em></p>';
            }

            // VA letters
            html += '<h3>VA Letters</h3>';
            if (claim.files.va_letters && claim.files.va_letters.length > 0) {
                html += '<ul>';
                claim.files.va_letters.forEach(file => {
                    html += `<li>${file.name} (${formatFileSize(file.size)})</li>`;
                });
                html += '</ul>';
            } else {
                html += '<p><em>No VA letters uploaded</em></p>';
            }

            // Other documents
            html += '<h3>Other Documents</h3>';
            if (claim.files.other_documents && claim.files.other_documents.length > 0) {
                html += '<ul>';
                claim.files.other_documents.forEach(file => {
                    html += `<li>${file.name} (${formatFileSize(file.size)})</li>`;
                });
                html += '</ul>';
            } else {
                html += '<p><em>No other documents uploaded</em></p>';
            }
        }
        // Check if files exist in the old format
        else if (claim.files && Array.isArray(claim.files) && claim.files.length > 0) {
            html += '<h3>Documents</h3><ul>';
            claim.files.forEach(file => {
                html += `<li>${file.name} (${formatFileSize(file.size)})</li>`;
            });
            html += '</ul>';
        }
        // No files
        else {
            html += '<p><em>No documents uploaded</em></p>';
        }

        return html;
    }

    // Get notes HTML for printing
    function getNotesHTML(claim) {
        let html = '';

        if (claim.notes && claim.notes.length > 0) {
            // Sort notes by date (newest first)
            const sortedNotes = [...claim.notes].sort((a, b) => new Date(b.date) - new Date(a.date));

            sortedNotes.forEach(note => {
                const noteDate = new Date(note.date).toLocaleString();
                html += `
                    <div class="note">
                        <p>${note.text}</p>
                        <p class="note-date">${noteDate}</p>
                    </div>
                `;
            });
        } else {
            html += '<p><em>No notes have been added yet.</em></p>';
        }

        return html;
    }

    // Update bulk status
    function updateBulkStatus(claimIds, newStatus) {
        const claims = JSON.parse(localStorage.getItem('veteranClaims')) || [];

        claimIds.forEach(claimId => {
            const claimIndex = claims.findIndex(c => c.id === claimId);
            if (claimIndex !== -1) {
                claims[claimIndex].status = newStatus;

                // Add a note about the status change
                if (!claims[claimIndex].notes) {
                    claims[claimIndex].notes = [];
                }

                claims[claimIndex].notes.push({
                    text: `Status changed to ${getStatusLabel(newStatus)} via bulk update`,
                    date: new Date().toISOString()
                });
            }
        });

        localStorage.setItem('veteranClaims', JSON.stringify(claims));

        // Refresh data
        loadAllClaims();
        loadDashboardStats();
        if (statusChart) initCharts();
    }

    // Delete selected claims
    function deleteSelectedClaims(claimIds) {
        let claims = JSON.parse(localStorage.getItem('veteranClaims')) || [];

        // Filter out the claims to delete
        claims = claims.filter(claim => !claimIds.includes(claim.id));

        localStorage.setItem('veteranClaims', JSON.stringify(claims));

        // Refresh data
        loadAllClaims();
        loadDashboardStats();
        if (statusChart) initCharts();
    }

    // Export selected claims
    function exportSelectedClaims(claimIds) {
        const claims = JSON.parse(localStorage.getItem('veteranClaims')) || [];

        // Filter claims to export
        const claimsToExport = claims.filter(claim => claimIds.includes(claim.id));

        // Create export data
        const exportData = JSON.stringify(claimsToExport, null, 2);

        // Create download link
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `veteran-claims-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Export all claims
    function exportAllClaims() {
        const claims = JSON.parse(localStorage.getItem('veteranClaims')) || [];

        // Create export data
        const exportData = JSON.stringify(claims, null, 2);

        // Create download link
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `veteran-claims-export-all-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Show notification
    function showNotification(type, title, message) {
        if (!notificationToast || !notificationIcon || !notificationTitle || !notificationMessage) return;

        // Set notification content
        notificationTitle.textContent = title;
        notificationMessage.textContent = message;

        // Set notification icon
        notificationIcon.innerHTML = '';
        let iconClass = '';

        switch (type) {
            case 'success':
                iconClass = 'fa-check-circle text-green-500';
                break;
            case 'error':
                iconClass = 'fa-exclamation-circle text-red-500';
                break;
            case 'warning':
                iconClass = 'fa-exclamation-triangle text-yellow-500';
                break;
            case 'info':
                iconClass = 'fa-info-circle text-blue-500';
                break;
            default:
                iconClass = 'fa-info-circle text-blue-500';
        }

        const icon = document.createElement('i');
        icon.className = `fas ${iconClass} text-xl`;
        notificationIcon.appendChild(icon);

        // Show notification
        notificationToast.style.transform = 'translateY(0)';

        // Hide notification after 3 seconds
        setTimeout(() => {
            notificationToast.style.transform = 'translateY(20px)';
        }, 3000);
    }

    // Update claim status
    function updateClaimStatus(claimId, newStatus) {
        const claims = JSON.parse(localStorage.getItem('veteranClaims')) || [];
        const claimIndex = claims.findIndex(c => c.id === claimId);

        if (claimIndex !== -1) {
            const oldStatus = claims[claimIndex].status;
            claims[claimIndex].status = newStatus;

            // Add a note about the status change
            if (!claims[claimIndex].notes) {
                claims[claimIndex].notes = [];
            }

            claims[claimIndex].notes.push({
                text: `Status changed from ${getStatusLabel(oldStatus)} to ${getStatusLabel(newStatus)}`,
                date: new Date().toISOString()
            });

            localStorage.setItem('veteranClaims', JSON.stringify(claims));

            // Refresh data
            loadAllClaims();
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

            // Refresh data
            loadAllClaims();
        }
    }

    // Helper functions
    function getStatusLabel(status) {
        switch (status) {
            case 'new': return 'New';
            case 'in_review': return 'In Review';
            case 'evidence_gathering': return 'Evidence Gathering';
            case 'decision_pending': return 'Decision Pending';
            case 'approved': return 'Approved';
            case 'denied': return 'Denied';
            case 'appealed': return 'Appealed';
            // Legacy status support
            case 'in-progress': return 'In Progress';
            case 'completed': return 'Completed';
            default: return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
        }
    }

    function getStatusClass(status) {
        switch (status) {
            case 'new': return 'status-new';
            case 'in_review': return 'status-in_review';
            case 'evidence_gathering': return 'status-evidence_gathering';
            case 'decision_pending': return 'status-decision_pending';
            case 'approved': return 'status-approved';
            case 'denied': return 'status-denied';
            case 'appealed': return 'status-appealed';
            // Legacy status support
            case 'in-progress': return 'status-in-progress';
            case 'completed': return 'status-completed';
            default: return '';
        }
    }

    function getStatusBadgeClass(status) {
        switch (status) {
            case 'new': return 'admin-badge-warning';
            case 'in_review': return 'admin-badge-info';
            case 'evidence_gathering': return 'admin-badge-purple';
            case 'decision_pending': return 'admin-badge-blue';
            case 'approved': return 'admin-badge-success';
            case 'denied': return 'admin-badge-danger';
            case 'appealed': return 'admin-badge-orange';
            // Legacy status support
            case 'in-progress': return 'admin-badge-info';
            case 'completed': return 'admin-badge-success';
            default: return 'admin-badge-default';
        }
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }
});
