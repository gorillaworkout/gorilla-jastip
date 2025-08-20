// Script untuk test Google Auth
const { initializeApp } = require('firebase/app');
const { getAuth, GoogleAuthProvider, signInWithPopup } = require('firebase/auth');

// Load environment variables from .env file
const fs = require('fs');
const path = require('path');

let envVars = {};
try {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
  }
} catch (error) {
  console.error('Error reading .env file:', error);
}

const firebaseConfig = {
  apiKey: envVars.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: envVars.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: envVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: envVars.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envVars.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: envVars.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('🧪 Testing Google Auth configuration...');
console.log('📋 Firebase Config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  apiKey: firebaseConfig.apiKey ? '✅ Set' : '❌ Missing'
});

// Check if all required vars are set
const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

const missingVars = requiredVars.filter(varName => !envVars[varName]);
if (missingVars.length > 0) {
  console.log('\n❌ Missing environment variables:', missingVars);
  console.log('💡 Please check your .env file');
  process.exit(1);
}

try {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  
  console.log('✅ Firebase initialized successfully');
  console.log('🔐 Auth service initialized');
  
  // Test Google provider creation
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');
  
  console.log('✅ Google provider created successfully');
  console.log('📋 Provider scopes:', provider.scopes);
  
  console.log('\n🎉 Google Auth configuration is correct!');
  console.log('\n📝 Next steps:');
  console.log('1. Go to Firebase Console → Authentication → Sign-in method');
  console.log('2. Enable Google provider');
  console.log('3. Add authorized domains (localhost for development)');
  console.log('4. Test login in the application');
  
} catch (error) {
  console.error('\n❌ Firebase initialization failed:', error);
  process.exit(1);
}
