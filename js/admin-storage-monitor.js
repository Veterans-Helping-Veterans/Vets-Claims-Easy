// Admin Storage Monitor for Firebase Storage
// This script adds storage monitoring to the admin dashboard

import { calculateStorageUsage, displayStorageUsage, updateStorageUsageCache } from './storage-monitor.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Check if we're on the admin page
    if (!document.getElementById('adminDashboard')) {
        return;
    }
    
    // Create storage monitor UI
    const storageMonitorContainer = document.createElement('div');
    storageMonitorContainer.id = 'storageMonitorContainer';
    storageMonitorContainer.className = 'admin-card mt-6';
    storageMonitorContainer.innerHTML = `
        <h2 class="text-lg font-semibold mb-4">Storage Usage Monitor</h2>
        <div id="storageUsageDisplay" class="p-4 bg-gray-50 rounded-lg">
            <p class="text-center text-gray-500">
                <i class="fas fa-spinner fa-spin mr-2"></i> Loading storage usage...
            </p>
        </div>
        <div class="mt-4">
            <button id="refreshStorageBtn" class="admin-btn admin-btn-secondary">
                <i class="fas fa-sync-alt admin-btn-icon"></i> Refresh
            </button>
            <button id="manageStorageBtn" class="admin-btn admin-btn-primary ml-2">
                <i class="fas fa-cog admin-btn-icon"></i> Manage Storage
            </button>
        </div>
    `;
    
    // Add storage monitor to settings section
    const settingsSection = document.getElementById('settingsSection');
    if (settingsSection) {
        settingsSection.appendChild(storageMonitorContainer);
    }
    
    // Add event listeners
    document.getElementById('refreshStorageBtn')?.addEventListener('click', async function() {
        this.innerHTML = '<i class="fas fa-spinner fa-spin admin-btn-icon"></i> Refreshing...';
        this.disabled = true;
        
        await updateStorageUsage();
        
        this.innerHTML = '<i class="fas fa-sync-alt admin-btn-icon"></i> Refresh';
        this.disabled = false;
    });
    
    document.getElementById('manageStorageBtn')?.addEventListener('click', function() {
        showStorageManagementModal();
    });
    
    // Initial storage usage update
    await updateStorageUsage();
    
    // Update storage usage periodically (every 30 minutes)
    setInterval(updateStorageUsage, 30 * 60 * 1000);
});

// Function to update storage usage
async function updateStorageUsage() {
    try {
        const usageData = await calculateStorageUsage();
        displayStorageUsage(usageData, 'storageUsageDisplay');
        
        // Cache the results
        await updateStorageUsageCache();
        
        return usageData;
    } catch (error) {
        console.error('Error updating storage usage:', error);
        const container = document.getElementById('storageUsageDisplay');
        if (container) {
            container.innerHTML = `
                <p class="text-red-500 text-center">
                    <i class="fas fa-exclamation-circle mr-2"></i> 
                    Error loading storage usage: ${error.message}
                </p>
                <p class="text-sm text-gray-500 text-center mt-2">
                    Please check your Firebase configuration and permissions.
                </p>
            `;
        }
        return null;
    }
}

// Function to show storage management modal
function showStorageManagementModal() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('storageManagementModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'storageManagementModal';
        modal.className = 'admin-modal';
        modal.innerHTML = `
            <div class="admin-modal-content">
                <div class="admin-modal-header">
                    <h3 class="admin-modal-title">Storage Management</h3>
                    <button id="closeStorageModalBtn" class="admin-modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="admin-modal-body">
                    <div class="mb-4">
                        <h4 class="font-semibold mb-2">Storage Usage</h4>
                        <div id="modalStorageUsage" class="p-3 bg-gray-50 rounded-lg">
                            <p class="text-center text-gray-500">
                                <i class="fas fa-spinner fa-spin mr-2"></i> Loading...
                            </p>
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <h4 class="font-semibold mb-2">Storage Tips</h4>
                        <ul class="list-disc pl-5 space-y-1 text-sm">
                            <li>The free tier includes 5GB of storage and 1GB daily download</li>
                            <li>Compress images before uploading to save space</li>
                            <li>Consider deleting old or unused files</li>
                            <li>Monitor your usage to avoid unexpected charges</li>
                        </ul>
                    </div>
                    
                    <div class="mb-4">
                        <h4 class="font-semibold mb-2">File Management</h4>
                        <p class="text-sm text-gray-600 mb-2">
                            You can manage files by claim in the Claims section. Select a claim and use the file management options.
                        </p>
                        <button id="viewClaimsBtn" class="admin-btn admin-btn-secondary admin-btn-sm">
                            <i class="fas fa-file-alt admin-btn-icon"></i> Go to Claims
                        </button>
                    </div>
                </div>
                <div class="admin-modal-footer">
                    <button id="closeStorageModalBtn2" class="admin-btn admin-btn-secondary">
                        <i class="fas fa-times admin-btn-icon"></i> Close
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        document.getElementById('closeStorageModalBtn').addEventListener('click', function() {
            modal.classList.remove('active');
        });
        
        document.getElementById('closeStorageModalBtn2').addEventListener('click', function() {
            modal.classList.remove('active');
        });
        
        document.getElementById('viewClaimsBtn').addEventListener('click', function() {
            modal.classList.remove('active');
            
            // Switch to claims section
            const claimsLink = document.querySelector('a[data-section="claimsSection"]');
            if (claimsLink) {
                claimsLink.click();
            }
        });
    }
    
    // Show modal
    modal.classList.add('active');
    
    // Update storage usage in modal
    updateStorageUsage().then(usageData => {
        if (usageData) {
            displayStorageUsage(usageData, 'modalStorageUsage');
        }
    });
}
