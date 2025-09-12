import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {"apiKey":"your-api-key","authDomain":"your-auth-domain","projectId":"your-project-id","storageBucket":"your-storage-bucket","messagingSenderId":"your-messaging-sender-id","appId":"your-app-id","measurementId":"your-measurement-id"};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);

export { app, auth };
