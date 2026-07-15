const firebaseConfig = {
  apiKey: "AIzaSyAbscO_j9cwn-50OH6M7G4p9z3sqtSnqXQ",
  authDomain: "tela-de-login---opencode.firebaseapp.com",
  projectId: "tela-de-login---opencode",
  storageBucket: "tela-de-login---opencode.firebasestorage.app",
  messagingSenderId: "504371411989",
  appId: "1:504371411989:web:5a9c524436cb7a22dba21c",
  measurementId: "G-7LMVFK291N"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
