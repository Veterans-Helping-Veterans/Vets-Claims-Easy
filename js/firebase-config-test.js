// Firebase Configuration Test
// This file directly imports Firebase SDK and tests the configuration

// Import Firebase SDK directly
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Your Firebase configuration
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
const database = getDatabase(app);

// Function to test database connection
export async function testDatabaseConnection() {
  try {
    // Create a test reference
    const testRef = ref(database, 'test');
    const testData = {
      timestamp: new Date().toISOString(),
      message: 'Direct Firebase config test'
    };
    
    // Write data
    await set(testRef, testData);
    
    // Read data back
    const snapshot = await get(child(ref(database), 'test'));
    
    if (snapshot.exists()) {
      return {
        success: true,
        data: snapshot.val()
      };
    } else {
      return {
        success: false,
        error: 'No data found in database'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

// Function to get Firebase configuration
export function getFirebaseConfig() {
  return {
    projectId: app.options.projectId,
    authDomain: app.options.authDomain,
    databaseURL: app.options.databaseURL,
    storageBucket: app.options.storageBucket
  };
}
