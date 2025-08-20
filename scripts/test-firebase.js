// Test script untuk menguji koneksi Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { getAuth } = require('firebase/auth');

console.log('🧪 Testing Firebase connection...');

// Check if we're in a Next.js environment
console.log('\n📋 Environment Check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Current working directory:', process.cwd());

// Try to load environment variables from .env.local or .env
try {
  const fs = require('fs');
  const path = require('path');
  
  const envFiles = ['.env.local', '.env'];
  let envContent = '';
  
  for (const envFile of envFiles) {
    const envPath = path.join(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      console.log(`✅ Found ${envFile}`);
      break;
    }
  }
  
  if (envContent) {
    // Parse environment variables
    const envVars = {};
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    // Check Firebase config
    const requiredVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      'NEXT_PUBLIC_FIREBASE_APP_ID'
    ];
    
    console.log('\n📋 Firebase Environment Variables:');
    requiredVars.forEach(varName => {
      const value = envVars[varName];
      const status = value ? '✅' : '❌';
      console.log(`${status} ${varName}: ${value || 'NOT SET'}`);
    });
    
    // Check if all required vars are set
    const missingVars = requiredVars.filter(varName => !envVars[varName]);
    if (missingVars.length > 0) {
      console.log('\n❌ Missing required environment variables:', missingVars);
      console.log('\n💡 Please check your .env.local or .env file');
      process.exit(1);
    }
    
    // Initialize Firebase
    const firebaseConfig = {
      apiKey: envVars.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: envVars.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: envVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: envVars.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: envVars.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: envVars.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
    
    try {
      console.log('\n🚀 Initializing Firebase...');
      const app = initializeApp(firebaseConfig);
      
      console.log('✅ Firebase app initialized');
      
      // Test Firestore
      console.log('\n📁 Testing Firestore...');
      const db = getFirestore(app);
      console.log('✅ Firestore initialized');
      
      // Test Auth
      console.log('\n🔐 Testing Auth...');
      const auth = getAuth(app);
      console.log('✅ Auth initialized');
      
      console.log('\n🎉 All Firebase services initialized successfully!');
      console.log(`🏗️ Project: ${envVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);
      
    } catch (error) {
      console.error('\n❌ Firebase initialization failed:', error);
      process.exit(1);
    }
    
  } else {
    console.log('\n❌ No .env.local or .env file found');
    console.log('💡 Please create a .env.local file with your Firebase configuration');
    process.exit(1);
  }
  
} catch (error) {
  console.error('\n❌ Error reading environment files:', error);
  process.exit(1);
}
