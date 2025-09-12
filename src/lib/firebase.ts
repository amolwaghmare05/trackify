import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {"projectId":"studio-2982935128-8a237","appId":"1:1069453338660:web:36a3d17819c078d97150b1","storageBucket":"studio-2982935128-8a237.firebasestorage.app","apiKey":"AIzaSyCpPxyWw1tB0q1vfLqu4ghM6b-rbE_PLQY","authDomain":"studio-2982935128-8a237.firebaseapp.com","measurementId":"","messagingSenderId":"1069453338660"};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);

export { app, auth };
