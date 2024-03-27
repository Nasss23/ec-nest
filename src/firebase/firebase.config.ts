// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { ConfigService } from '@nestjs/config';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: 'AIzaSyCnO_13ieWS1wpcQiDF7K8Mt8ij1-uCbXE',
  authDomain: 'nest-ecommerce-image.firebaseapp.com',
  projectId: 'nest-ecommerce-image',
  storageBucket: 'nest-ecommerce-image.appspot.com',
  messagingSenderId: '329962717270',
  appId: '1:329962717270:web:f4fb2578abc907aea5fbf7',
  measurementId: 'G-J7JVZPYXVS',
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
