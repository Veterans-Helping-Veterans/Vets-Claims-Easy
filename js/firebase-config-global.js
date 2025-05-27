// Firebase Configuration for Veterans Claims Assistance Portal (Global Version)
// This file contains the Firebase configuration and initialization for non-module scripts

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyFyaNXfzAG2JBDSTpMcbmTTwk3Twg",
  authDomain: "vets-claims-easy.firebaseapp.com",
  projectId: "vets-claims-easy",
  storageBucket: "vets-claims-easy.appspot.com",
  messagingSenderId: "422934662221",
  appId: "1:422934662221:web:bc6b8f6dafa9af73b784",
  measurementId: "G-PVPX2CXDL",
  databaseURL: "https://vets-claims-easy-default-rtdb.firebaseio.com"
};

// Initialize Firebase
let app;
try {
  app = firebase.app();
} catch (error) {
  app = firebase.initializeApp(firebaseConfig);
}

// Get Firebase services
const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();

// Helper function to check if user is authenticated
function isAuthenticated() {
  return new Promise((resolve) => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

// Helper function to get current user
function getCurrentUser() {
  return firebase.auth().currentUser;
}

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function to generate a unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Helper function to encrypt sensitive data (simplified for demo)
function encryptData(data) {
  // In a real application, use a proper encryption library
  // This is just a simple encoding for demonstration
  return btoa(JSON.stringify(data));
}

// Helper function to decrypt sensitive data (simplified for demo)
function decryptData(encryptedData) {
  // In a real application, use a proper decryption library
  // This is just a simple decoding for demonstration
  try {
    return JSON.parse(atob(encryptedData));
  } catch (error) {
    console.error('Error decrypting data:', error);
    return null;
  }
}
