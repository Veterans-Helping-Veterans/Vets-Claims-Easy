// Storage Monitor for Firebase Storage
// This script helps track storage usage to stay within free tier limits

import { 
    storage, 
    ref as storageRef, 
    listAll, 
    getMetadata 
} from './firebase-config.js';

// Constants for Firebase free tier limits
const FREE_TIER_STORAGE_LIMIT_MB = 5 * 1024; // 5GB in MB
const FREE_TIER_DAILY_DOWNLOAD_LIMIT_MB = 1 * 1024; // 1GB in MB
const FREE_TIER_UPLOAD_OPS_LIMIT = 20000;
const FREE_TIER_DOWNLOAD_OPS_LIMIT = 50000;

// Function to calculate storage usage
export async function calculateStorageUsage() {
    try {
        const rootRef = storageRef(storage, 'claims');
        return await calculateFolderSize(rootRef);
    } catch (error) {
        console.error('Error calculating storage usage:', error);
        return {
            totalSizeMB: 0,
            fileCount: 0,
            error: error.message
        };
    }
}

// Recursive function to calculate folder size
async function calculateFolderSize(folderRef) {
    let totalSize = 0;
    let fileCount = 0;
    let folderData = [];
    
    try {
        const result = await listAll(folderRef);
        
        // Process files in this folder
        for (const fileRef of result.items) {
            try {
                const metadata = await getMetadata(fileRef);
                totalSize += metadata.size;
                fileCount++;
                
                folderData.push({
                    name: fileRef.name,
                    path: fileRef.fullPath,
                    size: metadata.size,
                    contentType: metadata.contentType,
                    updated: metadata.updated
                });
            } catch (error) {
                console.error(`Error getting metadata for ${fileRef.fullPath}:`, error);
            }
        }
        
        // Process subfolders recursively
        for (const subfolder of result.prefixes) {
            const subfolderData = await calculateFolderSize(subfolder);
            totalSize += subfolderData.totalSize;
            fileCount += subfolderData.fileCount;
            folderData = folderData.concat(subfolderData.folderData);
        }
        
        return {
            totalSize,
            totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
            fileCount,
            folderData,
            percentUsed: ((totalSize / (1024 * 1024)) / FREE_TIER_STORAGE_LIMIT_MB * 100).toFixed(2)
        };
    } catch (error) {
        console.error(`Error listing contents of ${folderRef.fullPath}:`, error);
        return {
            totalSize: 0,
            totalSizeMB: 0,
            fileCount: 0,
            folderData: [],
            percentUsed: 0,
            error: error.message
        };
    }
}

// Function to display storage usage in the UI
export function displayStorageUsage(usageData, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const percentUsed = parseFloat(usageData.percentUsed);
    let statusClass = 'text-green-500';
    
    if (percentUsed > 80) {
        statusClass = 'text-red-500';
    } else if (percentUsed > 50) {
        statusClass = 'text-yellow-500';
    }
    
    container.innerHTML = `
        <div class="mb-2">
            <span class="font-semibold">Storage Usage:</span>
            <span class="${statusClass}">${usageData.totalSizeMB} MB / ${FREE_TIER_STORAGE_LIMIT_MB} MB (${usageData.percentUsed}%)</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
            <div class="${statusClass} h-2.5 rounded-full" style="width: ${Math.min(percentUsed, 100)}%"></div>
        </div>
        <div class="mt-1 text-xs text-gray-500">
            Files: ${usageData.fileCount} | Free Tier Limit: 5GB storage, 1GB daily download
        </div>
    `;
}

// Function to check if a file upload would exceed free tier limits
export function checkUploadLimits(fileSizeBytes) {
    const fileSizeMB = fileSizeBytes / (1024 * 1024);
    
    // Get current usage from localStorage (updated periodically)
    const currentUsage = JSON.parse(localStorage.getItem('storageUsage') || '{"totalSizeMB": 0, "percentUsed": 0}');
    const currentUsageMB = parseFloat(currentUsage.totalSizeMB);
    
    // Calculate new usage
    const newUsageMB = currentUsageMB + fileSizeMB;
    const newPercentUsed = (newUsageMB / FREE_TIER_STORAGE_LIMIT_MB * 100).toFixed(2);
    
    return {
        currentUsageMB,
        newUsageMB,
        fileSizeMB,
        newPercentUsed,
        willExceedLimit: newUsageMB > FREE_TIER_STORAGE_LIMIT_MB,
        isApproachingLimit: newPercentUsed > 80
    };
}

// Function to update storage usage in localStorage
export async function updateStorageUsageCache() {
    try {
        const usageData = await calculateStorageUsage();
        localStorage.setItem('storageUsage', JSON.stringify({
            totalSizeMB: usageData.totalSizeMB,
            percentUsed: usageData.percentUsed,
            fileCount: usageData.fileCount,
            lastUpdated: new Date().toISOString()
        }));
        return usageData;
    } catch (error) {
        console.error('Error updating storage usage cache:', error);
        return null;
    }
}
