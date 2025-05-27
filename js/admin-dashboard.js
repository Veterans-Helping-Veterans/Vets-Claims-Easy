// Admin Dashboard Module for Veterans Claims Portal
import { 
    getClaims, 
    uploadFile, 
    updateClaimStatus, 
    getAuthToken 
} from './api-client.js';
import { decryptData } from './security.js';

document.addEventListener('DOMContentLoaded', function() {
    // Load claims when dashboard is loaded
    loadClaimsFromAPI();
    
    // Set up event listeners
    setupEventListeners();
});

// Load claims from API
async function loadClaimsFromAPI() {
    try {
        const token = getAuthToken();
        if (!token) {
            window.location.href = '/admin-login.html';
            return;
        }

        const claims = await getClaims(token);
        displayClaims(claims);
    } catch (error) {
        console.error('Error loading claims:', error);
        alert('Error loading claims. Please try again.');
    }
}

// Display claims in the table
function displayClaims(claims) {
    const tableBody = document.getElementById('claimsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = claims.length === 0 
        ? '<tr><td colspan="6" class="text-center py-4">No claims found.</td></tr>'
        : claims.map(claim => {
            const sensitiveData = decryptData(claim.sensitiveData);
            return `
                <tr class="border-b hover:bg-gray-50">
                    <td class="py-3 px-4">${formatDate(claim.date)}</td>
                    <td class="py-3 px-4">${sensitiveData.firstName} ${sensitiveData.lastName}</td>
                    <td class="py-3 px-4">${claim.branch || ''}</td>
                    <td class="py-3 px-4">${claim.claimType || ''}</td>
                    <td class="py-3 px-4">
                        <span class="status-badge status-${claim.status || 'new'}">${formatStatus(claim.status)}</span>
                    </td>
                    <td class="py-3 px-4">
                        <button class="view-claim-btn text-blue-600 hover:text-blue-800 mr-2" data-claim-id="${claim.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="update-status-btn text-green-600 hover:text-green-800 mr-2" data-claim-id="${claim.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    
    // Add event listeners to buttons
    addTableEventListeners();
}

// Add event listeners to table buttons
function addTableEventListeners() {
    document.querySelectorAll('.view-claim-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            viewClaimDetails(this.dataset.claimId);
        });
    });
    
    document.querySelectorAll('.update-status-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            showUpdateStatusModal(this.dataset.claimId);
        });
    });
}

// Set up event listeners
function setupEventListeners() {
    // Close claim details modal
    const closeClaimDetailsBtn = document.getElementById('closeClaimDetailsBtn');
    if (closeClaimDetailsBtn) {
        closeClaimDetailsBtn.addEventListener('click', function() {
            document.getElementById('claimDetailsModal').classList.add('hidden');
        });
    }
    
    // Close update status modal
    const closeUpdateStatusBtn = document.getElementById('closeUpdateStatusBtn');
    if (closeUpdateStatusBtn) {
        closeUpdateStatusBtn.addEventListener('click', function() {
            document.getElementById('updateStatusModal').classList.add('hidden');
        });
    }
    
    // Update status form submission
    const updateStatusForm = document.getElementById('updateStatusForm');
    if (updateStatusForm) {
        updateStatusForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const claimId = document.getElementById('updateClaimId').value;
            const newStatus = document.getElementById('newStatus').value;
            const statusNote = document.getElementById('statusNote').value;
            
            updateClaimStatus(claimId, newStatus, statusNote);
        });
    }
    
    // File preview modal
    const closeFilePreviewBtn = document.getElementById('closeFilePreviewBtn');
    const closeFilePreviewBtn2 = document.getElementById('closeFilePreviewBtn2');
    if (closeFilePreviewBtn && closeFilePreviewBtn2) {
        closeFilePreviewBtn.addEventListener('click', closeFilePreviewModal);
        closeFilePreviewBtn2.addEventListener('click', closeFilePreviewModal);
    }
    
    // File upload modal
    const closeFileUploadBtn = document.getElementById('closeFileUploadBtn');
    const closeFileUploadBtn2 = document.getElementById('closeFileUploadBtn2');
    const startUploadBtn = document.getElementById('startUploadBtn');
    if (closeFileUploadBtn && closeFileUploadBtn2 && startUploadBtn) {
        closeFileUploadBtn.addEventListener('click', closeFileUploadModal);
        closeFileUploadBtn2.addEventListener('click', closeFileUploadModal);
        startUploadBtn.addEventListener('click', uploadAdminFiles);
    }
}

// View claim details
async function viewClaimDetails(claimId) {
    try {
        const token = getAuthToken();
        const claims = await getClaims(token);
        const claim = claims.find(c => c.id === claimId);
        
        if (claim) {
            const sensitiveData = decryptData(claim.sensitiveData);
            
            // Populate modal with claim details
            document.getElementById('claimDetailsModal').classList.remove('hidden');
            document.getElementById('claimId').textContent = claim.id;
            document.getElementById('claimDate').textContent = formatDate(claim.date);
            document.getElementById('claimStatus').textContent = formatStatus(claim.status);
            
            // Veteran information
            document.getElementById('veteranName').textContent = `${sensitiveData.firstName} ${sensitiveData.lastName}`;
            document.getElementById('veteranEmail').textContent = sensitiveData.email;
            document.getElementById('veteranPhone').textContent = sensitiveData.phone || 'Not provided';
            document.getElementById('serviceBranch').textContent = claim.branch;
            document.getElementById('serviceStart').textContent = formatDate(claim.serviceStart);
            document.getElementById('serviceEnd').textContent = formatDate(claim.serviceEnd);
            
            // Claim information
            document.getElementById('claimType').textContent = claim.claimType;
            document.getElementById('claimDetails').textContent = sensitiveData.claimDetails;
            
            // Display files and notes
            displayFiles('medicalRecordsList', claim.files?.medical_records || []);
            displayFiles('vaLettersList', claim.files?.va_letters || []);
            displayFiles('otherDocumentsList', claim.files?.other_documents || []);
            displayNotes(claim.notes || []);
        }
    } catch (error) {
        console.error('Error viewing claim details:', error);
        alert('Error loading claim details. Please try again.');
    }
}

// Show update status modal
async function showUpdateStatusModal(claimId) {
    try {
        const token = getAuthToken();
        const claims = await getClaims(token);
        const claim = claims.find(c => c.id === claimId);
        
        if (claim) {
            // Populate modal
            document.getElementById('updateStatusModal').classList.remove('hidden');
            document.getElementById('updateClaimId').value = claim.id;
            document.getElementById('currentStatus').textContent = formatStatus(claim.status);
            document.getElementById('newStatus').value = claim.status;
        } else {
            alert('Claim not found.');
        }
    } catch (error) {
        console.error('Error showing update status modal:', error);
        alert('Error loading claim status. Please try again.');
    }
}

// Update claim status
async function updateClaimStatus(claimId, newStatus, statusNote) {
    try {
        const token = getAuthToken();
        await updateStatus(claimId, newStatus, statusNote, token);
        
        // Reload claims and close modal
        document.getElementById('updateStatusModal').classList.add('hidden');
        loadClaimsFromAPI();
        
        alert('Claim status updated successfully.');
    } catch (error) {
        console.error('Error updating claim status:', error);
        alert('Error updating claim status. Please try again.');
    }
}

// Preview file
function previewFile(fileUrl, fileName, fileType) {
    const filePreviewModal = document.getElementById('filePreviewModal');
    const filePreviewLoading = document.getElementById('filePreviewLoading');
    const filePreviewContent = document.getElementById('filePreviewContent');
    const filePreviewError = document.getElementById('filePreviewError');
    const downloadFileBtn = document.getElementById('downloadFileBtn');
    
    if (!filePreviewModal) return;
    
    // Show modal and loading state
    filePreviewModal.classList.remove('hidden');
    filePreviewLoading.classList.remove('hidden');
    filePreviewContent.classList.add('hidden');
    filePreviewError.classList.add('hidden');
    
    // Set download link
    downloadFileBtn.href = fileUrl;
    downloadFileBtn.setAttribute('download', fileName);
    
    // Update modal title
    document.querySelector('.admin-modal-title').textContent = `File Preview: ${fileName}`;
    
    // Determine file type and display appropriate preview
    if (fileType.startsWith('image/')) {
        // Image preview
        const img = document.createElement('img');
        img.className = 'max-w-full max-h-[70vh] mx-auto';
        img.src = fileUrl;
        img.alt = fileName;
        
        img.onload = function() {
            filePreviewContent.innerHTML = '';
            filePreviewContent.appendChild(img);
            filePreviewLoading.classList.add('hidden');
            filePreviewContent.classList.remove('hidden');
        };
        
        img.onerror = function() {
            filePreviewLoading.classList.add('hidden');
            filePreviewError.classList.remove('hidden');
        };
    } else if (fileType === 'application/pdf') {
        // PDF preview
        const iframe = document.createElement('iframe');
        iframe.className = 'w-full h-[70vh]';
        iframe.src = fileUrl;
        
        iframe.onload = function() {
            filePreviewLoading.classList.add('hidden');
            filePreviewContent.classList.remove('hidden');
        };
        
        iframe.onerror = function() {
            filePreviewLoading.classList.add('hidden');
            filePreviewError.classList.remove('hidden');
        };
        
        filePreviewContent.innerHTML = '';
        filePreviewContent.appendChild(iframe);
    } else {
        // Unsupported file type
        filePreviewLoading.classList.add('hidden');
        filePreviewError.classList.remove('hidden');
    }
}

// Close file preview modal
function closeFilePreviewModal() {
    const filePreviewModal = document.getElementById('filePreviewModal');
    const filePreviewContent = document.getElementById('filePreviewContent');
    
    if (filePreviewModal) {
        filePreviewModal.classList.add('hidden');
        filePreviewContent.innerHTML = '';
    }
}

// Show file upload modal
function showFileUploadModal(claimId) {
    const fileUploadModal = document.getElementById('fileUploadModal');
    const uploadClaimId = document.getElementById('uploadClaimId');
    
    if (fileUploadModal && uploadClaimId) {
        fileUploadModal.classList.remove('hidden');
        uploadClaimId.value = claimId;
        
        // Reset form
        document.getElementById('adminFileUploadForm').reset();
        document.getElementById('uploadProgressContainer').classList.add('hidden');
        document.getElementById('adminUploadProgressBar').style.width = '0%';
        document.getElementById('adminUploadProgressText').textContent = '0%';
        document.getElementById('adminUploadStatus').textContent = '';
    }
}

// Close file upload modal
function closeFileUploadModal() {
    const fileUploadModal = document.getElementById('fileUploadModal');
    
    if (fileUploadModal) {
        fileUploadModal.classList.add('hidden');
    }
}

// Upload files from admin interface
async function uploadAdminFiles() {
    const claimId = document.getElementById('uploadClaimId').value;
    const fileCategory = document.getElementById('fileCategory').value;
    const fileInput = document.getElementById('adminFileUpload');
    const uploadProgressContainer = document.getElementById('uploadProgressContainer');
    const adminUploadProgressBar = document.getElementById('adminUploadProgressBar');
    const adminUploadProgressText = document.getElementById('adminUploadProgressText');
    const adminUploadStatus = document.getElementById('adminUploadStatus');
    
    if (!claimId || !fileInput || !fileInput.files.length) {
        alert('Please select files to upload.');
        return;
    }
    
    // Show progress container
    uploadProgressContainer.classList.remove('hidden');
    adminUploadStatus.textContent = 'Preparing files...';
    
    try {
        // Get current claim data
        const token = getAuthToken();
        const claims = await getClaims(token);
        const claim = claims.find(c => c.id === claimId);
        
        if (claim) {
            // Upload files
            adminUploadStatus.textContent = `Uploading files to ${fileCategory.replace('_', ' ')}...`;
            
            // Function to upload files
            async function uploadFiles(files, category) {
                const uploadedFiles = [];
                let totalFiles = files.length;
                let filesUploaded = 0;
                
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const fileId = Date.now().toString(36) + Math.random().toString(36).substr(2);
                    const fileExtension = file.name.split('.').pop();
                    const fileName = `${fileId}.${fileExtension}`;
                    const filePath = `claims/${claimId}/${category}/${fileName}`;
                    
                    // Upload file
                    const uploadTask = uploadFile(file, filePath, token);
                    
                    // Wait for upload to complete
                    await new Promise((resolve, reject) => {
                        uploadTask.on('state_changed', 
                            (snapshot) => {
                                // Calculate total progress across all files
                                const fileProgress = snapshot.bytesTransferred / snapshot.totalBytes;
                                const overallProgress = ((filesUploaded + fileProgress) / totalFiles) * 100;
                                
                                // Update progress bar
                                adminUploadProgressBar.style.width = `${overallProgress}%`;
                                adminUploadProgressText.textContent = `${Math.round(overallProgress)}%`;
                                
                                // Update status
                                adminUploadStatus.textContent = `Uploading ${file.name} (${i+1}/${totalFiles})...`;
                            },
                            (error) => {
                                console.error('Error uploading file:', error);
                                reject(error);
                            },
                            async () => {
                                // Upload completed successfully
                                filesUploaded++;
                                
                                // Get download URL
                                const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                                
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
            
            // Upload files
            const uploadedFiles = await uploadFiles(fileInput.files, fileCategory);
            
            // Update claim with new files
            const updatedFiles = { ...claim.files };
            updatedFiles[fileCategory] = [...(updatedFiles[fileCategory] || []), ...uploadedFiles];
            
            // Update claim in database
            await updateClaimStatus(claimId, {
                files: updatedFiles,
                lastUpdated: new Date().toISOString()
            }, token);
            
            // Add a note about the upload
            const notes = claim.notes || [];
            notes.push({
                date: new Date().toISOString(),
                text: `Admin uploaded ${uploadedFiles.length} file(s) to ${fileCategory.replace('_', ' ')}.`,
                status: null
            });
            
            await updateClaimStatus(claimId, {
                notes: notes
            }, token);
            
            // Update progress
            adminUploadProgressBar.style.width = '100%';
            adminUploadProgressText.textContent = '100%';
            adminUploadStatus.textContent = 'Upload complete!';
            
            // Close modal and reload claim details
            setTimeout(() => {
                closeFileUploadModal();
                viewClaimDetails(claimId);
            }, 1500);
            
        } else {
            alert('Claim not found.');
            closeFileUploadModal();
        }
    } catch (error) {
        console.error('Error uploading files:', error);
        adminUploadStatus.textContent = 'Error: ' + error.message;
        
        setTimeout(() => {
            alert('An error occurred while uploading files. Please try again.');
        }, 1500);
    }
}

// Helper functions
function formatDate(dateString) {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatStatus(status) {
    const statusMap = {
        new: 'New',
        in_review: 'In Review',
        evidence_gathering: 'Evidence Gathering',
        approved: 'Approved',
        denied: 'Denied'
    };
    return statusMap[status] || status;
}

// File display helper
function displayFiles(listId, files) {
    const listElement = document.getElementById(listId);
    if (!listElement) return;
    
    listElement.innerHTML = files.length === 0
        ? '<li class="text-gray-500">No files uploaded</li>'
        : files.map(file => `
            <li class="flex items-center justify-between py-2">
                <span>${file.name}</span>
                <a href="${file.url}" target="_blank" class="text-blue-600 hover:text-blue-800">
                    <i class="fas fa-download"></i>
                </a>
            </li>
        `).join('');
}

// Notes display helper
function displayNotes(notes) {
    const notesContainer = document.getElementById('claimNotes');
    if (!notesContainer) return;
    
    notesContainer.innerHTML = notes.length === 0
        ? '<p class="text-gray-500">No notes added yet</p>'
        : notes.map(note => `
            <div class="bg-gray-50 p-3 rounded mb-2">
                <p class="text-sm text-gray-600">${formatDate(note.date)}</p>
                <p class="mt-1">${note.text}</p>
                ${note.status ? `<p class="text-sm text-gray-600 mt-1">Status changed to: ${formatStatus(note.status)}</p>` : ''}
            </div>
        `).join('');
}
