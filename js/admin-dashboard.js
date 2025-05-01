// Admin Dashboard Module for Veterans Claims Portal
import { 
    database, storage, ref, get, child, update, 
    storageRef, getDownloadURL, decryptData
} from './firebase-config.js';

document.addEventListener('DOMContentLoaded', function() {
    // Load claims from Firebase
    loadClaimsFromFirebase();
    
    // Set up event listeners
    setupEventListeners();
});

// Load claims from Firebase
async function loadClaimsFromFirebase() {
    try {
        const claimsRef = ref(database, 'claims');
        const snapshot = await get(claimsRef);
        
        if (snapshot.exists()) {
            const claims = [];
            snapshot.forEach((childSnapshot) => {
                claims.push(childSnapshot.val());
            });
            
            // Sort claims by date (newest first)
            claims.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // Display claims in the table
            displayClaims(claims);
        } else {
            document.getElementById('claimsTableBody').innerHTML = 
                '<tr><td colspan="6" class="text-center py-4">No claims found.</td></tr>';
        }
    } catch (error) {
        console.error('Error loading claims:', error);
        alert('Error loading claims. Please try again.');
    }
}

// Display claims in the table
function displayClaims(claims) {
    const tableBody = document.getElementById('claimsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    claims.forEach(claim => {
        // Decrypt sensitive data
        const sensitiveData = claim.sensitiveData ? decryptData(claim.sensitiveData) : {};
        
        const row = document.createElement('tr');
        row.className = 'border-b hover:bg-gray-50';
        row.innerHTML = `
            <td class="py-3 px-4">${formatDate(claim.date)}</td>
            <td class="py-3 px-4">${sensitiveData.firstName || ''} ${sensitiveData.lastName || ''}</td>
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
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.view-claim-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const claimId = this.getAttribute('data-claim-id');
            viewClaimDetails(claimId);
        });
    });
    
    document.querySelectorAll('.update-status-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const claimId = this.getAttribute('data-claim-id');
            showUpdateStatusModal(claimId);
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
        const claimRef = ref(database, `claims/${claimId}`);
        const snapshot = await get(claimRef);
        
        if (snapshot.exists()) {
            const claim = snapshot.val();
            
            // Decrypt sensitive data
            const sensitiveData = claim.sensitiveData ? decryptData(claim.sensitiveData) : {};
            
            // Populate modal with claim details
            document.getElementById('claimDetailsModal').classList.remove('hidden');
            document.getElementById('claimId').textContent = claim.id;
            document.getElementById('claimDate').textContent = formatDate(claim.date);
            document.getElementById('claimStatus').textContent = formatStatus(claim.status);
            document.getElementById('claimStatus').className = `status-badge status-${claim.status || 'new'}`;
            
            // Veteran information
            document.getElementById('veteranName').textContent = `${sensitiveData.firstName || ''} ${sensitiveData.lastName || ''}`;
            document.getElementById('veteranEmail').textContent = sensitiveData.email || '';
            document.getElementById('veteranPhone').textContent = sensitiveData.phone || '';
            document.getElementById('serviceBranch').textContent = claim.branch || '';
            document.getElementById('serviceStart').textContent = claim.serviceStart || 'Not provided';
            document.getElementById('serviceEnd').textContent = claim.serviceEnd || 'Not provided';
            
            // Claim information
            document.getElementById('claimType').textContent = claim.claimType || '';
            document.getElementById('claimDetails').textContent = sensitiveData.claimDetails || '';
            
            // Files
            displayFiles('medicalRecordsList', claim.files.medical_records || []);
            displayFiles('vaLettersList', claim.files.va_letters || []);
            displayFiles('otherDocumentsList', claim.files.other_documents || []);
            
            // Notes
            displayNotes(claim.notes || []);
            
            // Set up upload button
            const uploadFilesBtn = document.getElementById('uploadFilesBtn');
            if (uploadFilesBtn) {
                uploadFilesBtn.onclick = function() {
                    showFileUploadModal(claim.id);
                };
            }
        } else {
            alert('Claim not found.');
        }
    } catch (error) {
        console.error('Error viewing claim details:', error);
        alert('Error loading claim details. Please try again.');
    }
}

// Display files in a list
function displayFiles(listId, files) {
    const filesList = document.getElementById(listId);
    if (!filesList) return;
    
    filesList.innerHTML = '';
    
    if (files.length === 0) {
        filesList.innerHTML = '<li class="text-gray-500">No files uploaded</li>';
        return;
    }
    
    files.forEach(file => {
        const li = document.createElement('li');
        li.className = 'mb-2 flex items-center';
        li.innerHTML = `
            <i class="fas fa-file mr-2 text-gray-600"></i>
            <span class="flex-grow">${file.originalName}</span>
            <button class="preview-file-btn text-blue-600 hover:text-blue-800 mr-2" 
                data-file-url="${file.url}" data-file-name="${file.originalName}" data-file-type="${file.type}">
                <i class="fas fa-eye"></i>
            </button>
            <a href="${file.url}" target="_blank" class="text-green-600 hover:text-green-800" download="${file.originalName}">
                <i class="fas fa-download"></i>
            </a>
        `;
        
        filesList.appendChild(li);
    });
    
    // Add event listeners to preview buttons
    filesList.querySelectorAll('.preview-file-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const fileUrl = this.getAttribute('data-file-url');
            const fileName = this.getAttribute('data-file-name');
            const fileType = this.getAttribute('data-file-type');
            
            previewFile(fileUrl, fileName, fileType);
        });
    });
}

// Display notes
function displayNotes(notes) {
    const notesList = document.getElementById('notesList');
    if (!notesList) return;
    
    notesList.innerHTML = '';
    
    if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-500">No notes added</li>';
        return;
    }
    
    notes.forEach(note => {
        const li = document.createElement('li');
        li.className = 'mb-3 pb-3 border-b border-gray-200';
        li.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="font-semibold">${note.status ? `Status changed to: ${formatStatus(note.status)}` : 'Note'}</div>
                <div class="text-sm text-gray-500">${formatDate(note.date)}</div>
            </div>
            <div class="mt-1">${note.text}</div>
        `;
        
        notesList.appendChild(li);
    });
}

// Show update status modal
async function showUpdateStatusModal(claimId) {
    try {
        const claimRef = ref(database, `claims/${claimId}`);
        const snapshot = await get(claimRef);
        
        if (snapshot.exists()) {
            const claim = snapshot.val();
            
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
        // Get current claim data
        const claimRef = ref(database, `claims/${claimId}`);
        const snapshot = await get(claimRef);
        
        if (snapshot.exists()) {
            const claim = snapshot.val();
            const currentStatus = claim.status;
            
            // Only update if status has changed
            if (newStatus !== currentStatus || statusNote.trim() !== '') {
                // Create a note
                const note = {
                    date: new Date().toISOString(),
                    text: statusNote.trim(),
                    status: newStatus !== currentStatus ? newStatus : null
                };
                
                // Add note to claim
                const notes = claim.notes || [];
                notes.push(note);
                
                // Update claim
                await update(claimRef, {
                    status: newStatus,
                    notes: notes,
                    lastUpdated: new Date().toISOString()
                });
                
                // Also update in claimsByDate
                const claimsByDateRef = ref(database, `claimsByDate/${claimId}`);
                await update(claimsByDateRef, {
                    status: newStatus
                });
                
                // Close modal and reload claims
                document.getElementById('updateStatusModal').classList.add('hidden');
                document.getElementById('updateStatusForm').reset();
                
                // Reload claims
                loadClaimsFromFirebase();
                
                // Show success message
                alert('Claim status updated successfully.');
            } else {
                document.getElementById('updateStatusModal').classList.add('hidden');
            }
        } else {
            alert('Claim not found.');
        }
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
        const claimRef = ref(database, `claims/${claimId}`);
        const snapshot = await get(claimRef);
        
        if (snapshot.exists()) {
            const claim = snapshot.val();
            
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
                    
                    // Create a storage reference
                    const fileRef = storageRef(storage, filePath);
                    
                    // Upload file
                    const uploadTask = uploadBytesResumable(fileRef, file);
                    
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
                                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                                
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
            await update(claimRef, {
                files: updatedFiles,
                lastUpdated: new Date().toISOString()
            });
            
            // Add a note about the upload
            const notes = claim.notes || [];
            notes.push({
                date: new Date().toISOString(),
                text: `Admin uploaded ${uploadedFiles.length} file(s) to ${fileCategory.replace('_', ' ')}.`,
                status: null
            });
            
            await update(claimRef, {
                notes: notes
            });
            
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

// Helper function to format date
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Helper function to format status
function formatStatus(status) {
    if (!status) return 'New';
    
    const statusMap = {
        'new': 'New',
        'in_review': 'In Review',
        'evidence_gathering': 'Evidence Gathering',
        'decision_pending': 'Decision Pending',
        'approved': 'Approved',
        'denied': 'Denied',
        'appealed': 'Appealed'
    };
    
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
}
