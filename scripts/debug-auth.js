const { initializeApp } = require('firebase/app');
const { getAuth, signInWithPopup, GoogleAuthProvider } = require('firebase/auth');

// Load environment variables
require('dotenv').config();

console.log('🔍 Firebase Authentication Debug Script');
console.log('=====================================');

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log('NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Not Set');
console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '❌ Not Set');
console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '❌ Not Set');
console.log('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '❌ Not Set');
console.log('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '❌ Not Set');
console.log('NEXT_PUBLIC_FIREBASE_APP_ID:', process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '❌ Not Set');

// Check if all required variables are set
const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('\n❌ Missing environment variables:', missingVars);
  console.log('Please set these variables in your .env file or Vercel environment');
  process.exit(1);
}

// Initialize Firebase
console.log('\n🚀 Initializing Firebase...');
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

try {
  const app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized successfully');
  
  const auth = getAuth(app);
  console.log('✅ Firebase Auth initialized successfully');
  
  console.log('\n📊 Configuration Details:');
  console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  console.log('Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
  console.log('Storage Bucket:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
  
  console.log('\n🔐 Current Auth State:');
  console.log('Current User:', auth.currentUser ? auth.currentUser.email : 'No user signed in');
  
  console.log('\n✅ Firebase configuration looks good!');
  console.log('\n📝 Next steps:');
  console.log('1. Make sure your Vercel domain is added to Firebase Authorized Domains');
  console.log('2. Check that Google Sign-In is enabled in Firebase Console');
  console.log('3. Verify the auth domain matches exactly');
  
} catch (error) {
  console.error('\n❌ Firebase initialization failed:', error.message);
  process.exit(1);
}
