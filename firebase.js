// Initialize Firebase
const firebaseConfig = {
   apiKey: "AIzaSyAvtdt5lozNDmxcDS-IfBN5E6x-ITrp3Mo",
  authDomain: "auctionarena07.firebaseapp.com",
  databaseURL: "https://auctionarena07-default-rtdb.firebaseio.com",
  projectId: "auctionarena07",
  storageBucket: "auctionarena07.firebasestorage.app",
  messagingSenderId: "971412380623",
  appId: "1:971412380623:web:22898603bfe50028cbd0ba",
  measurementId: "G-PNTK0XGS7Q"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Export if needed
window.auth = auth;
window.db = db;