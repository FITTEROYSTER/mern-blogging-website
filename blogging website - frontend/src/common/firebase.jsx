// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAR-EJ8JOKRuH0hCQ0NIWjjO72ivrilo8U",
  authDomain: "mern--blogsite.firebaseapp.com",
  projectId: "mern--blogsite",
  storageBucket: "mern--blogsite.appspot.com",
  messagingSenderId: "867005514212",
  appId: "1:867005514212:web:781f5487c11114fd1007f1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//google authentication

const provider = new GoogleAuthProvider();

const auth = getAuth(app);

export const authWithGoogle = async () => {
  let user = null;

  await signInWithPopup(auth, provider)
    .then((result) => {
      user = result.user;
    })
    .catch((err) => {
      console.log(err);
    });

  return user;
};
