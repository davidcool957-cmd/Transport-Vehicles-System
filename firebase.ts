
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBG_7IMuFpIQth16cz98CIXHdSX24-GgLc",
  authDomain: "oiltankers-2e62b.firebaseapp.com",
  projectId: "oiltankers-2e62b",
  storageBucket: "oiltankers-2e62b.firebasestorage.app",
  messagingSenderId: "638767138928",
  appId: "1:638767138928:web:9bc105d44b750e96944cb5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
