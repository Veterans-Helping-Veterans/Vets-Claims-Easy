// Local Storage Handler for file storage
// This is an alternative to Firebase Storage for demo purposes

// Function to save a file to localStorage
export async function saveFileToLocalStorage(file, path) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                const fileId = Date.now().toString(36) + Math.random().toString(36).substr(2);
                const fileData = {
                    id: fileId,
                    name: file.name,
                    originalName: file.name,
                    size: file.size,
                    type: file.type,
                    path: path + '/' + fileId,
                    data: event.target.result,
                    uploadDate: new Date().toISOString()
                };
                
                // Store file metadata in localStorage
                const filesMetadata = JSON.parse(localStorage.getItem('filesMetadata') || '{}');
                if (!filesMetadata[path]) {
                    filesMetadata[path] = [];
                }
                
                // Don't store the actual data in metadata to save space
                const metadataEntry = { ...fileData };
                delete metadataEntry.data;
                filesMetadata[path].push(metadataEntry);
                localStorage.setItem('filesMetadata', JSON.stringify(filesMetadata));
                
                // Store the file data separately
                localStorage.setItem(`file_${fileId}`, event.target.result);
                
                resolve(metadataEntry);
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = function(error) {
            reject(error);
        };
        
        // Read file as Data URL
        reader.readAsDataURL(file);
    });
}

// Function to get a file from localStorage
export function getFileFromLocalStorage(fileId) {
    try {
        const fileData = localStorage.getItem(`file_${fileId}`);
        if (!fileData) {
            throw new Error('File not found');
        }
        return fileData;
    } catch (error) {
        console.error('Error getting file from localStorage:', error);
        throw error;
    }
}

// Function to delete a file from localStorage
export function deleteFileFromLocalStorage(fileId, path) {
    try {
        // Remove file data
        localStorage.removeItem(`file_${fileId}`);
        
        // Update metadata
        const filesMetadata = JSON.parse(localStorage.getItem('filesMetadata') || '{}');
        if (filesMetadata[path]) {
            filesMetadata[path] = filesMetadata[path].filter(file => file.id !== fileId);
            localStorage.setItem('filesMetadata', JSON.stringify(filesMetadata));
        }
        
        return true;
    } catch (error) {
        console.error('Error deleting file from localStorage:', error);
        return false;
    }
}

// Function to list files in a path
export function listFilesInLocalStorage(path) {
    try {
        const filesMetadata = JSON.parse(localStorage.getItem('filesMetadata') || '{}');
        return filesMetadata[path] || [];
    } catch (error) {
        console.error('Error listing files from localStorage:', error);
        return [];
    }
}

// Function to check available space in localStorage
export function checkLocalStorageSpace() {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        total += (key.length + value.length) * 2; // Unicode characters take 2 bytes
    }
    
    // Convert to MB
    const usedMB = total / (1024 * 1024);
    const availableMB = 5 - usedMB; // Assuming 5MB limit
    
    return {
        used: usedMB.toFixed(2) + ' MB',
        available: availableMB.toFixed(2) + ' MB',
        percentUsed: (usedMB / 5 * 100).toFixed(2) + '%'
    };
}
