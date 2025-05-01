// Firebase Configuration for Veterans Claims Assistance Portal
// This file contains the Firebase configuration and initialization

// Firebase App (the core Firebase SDK) is always required and must be listed first
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, set, get, child, push, update, remove, query, orderByChild } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDVMxJ-iBn9ylnUUWR_Dn0NWxNdg2WFxTY",
  authDomain: "vets-claims-easy.firebaseapp.com",
  projectId: "vets-claims-easy",
  storageBucket: "vets-claims-easy.appspot.com",
  messagingSenderId: "1098765432",
  appId: "1:1098765432:web:abc123def456ghi789jkl",
  measurementId: "G-ABCDEFGHIJ",
  databaseURL: "https://vets-claims-easy-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

// Export the Firebase services
export { 
  app, 
  auth, 
  database, 
  storage, 
  ref, 
  set, 
  get, 
  child, 
  push, 
  update, 
  remove, 
  query, 
  orderByChild,
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

// Helper function to get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Helper function to format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to generate a unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Helper function to encrypt sensitive data (simplified for demo)
export const encryptData = (data) => {
  // In a real application, use a proper encryption library
  // This is just a simple encoding for demonstration
  return btoa(JSON.stringify(data));
};

// Helper function to decrypt sensitive data (simplified for demo)
export const decryptData = (encryptedData) => {
  // In a real application, use a proper decryption library
  // This is just a simple decoding for demonstration
  try {
    return JSON.parse(atob(encryptedData));
  } catch (error) {
    console.error('Error decrypting data:', error);
    return null;
  }
};
