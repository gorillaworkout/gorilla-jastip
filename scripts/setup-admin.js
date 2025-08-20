// Script untuk setup admin role
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, getDocs, collection, query, where } = require('firebase/firestore');

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

console.log('🚀 Setting up admin role...');
console.log('📋 Firebase Config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});

try {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  console.log('✅ Firebase initialized successfully');
  
  async function setupAdmin(userEmail) {
    try {
      console.log(`🔍 Looking for user with email: ${userEmail}`);
      
      // Find user by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', userEmail));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log(`❌ User with email ${userEmail} not found`);
        console.log('💡 Make sure to login with Google first in the application');
        return;
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      console.log(`✅ Found user: ${userData.name} (${userData.email})`);
      console.log(`📊 Current role: ${userData.role}`);
      
      if (userData.role === 'admin') {
        console.log('✅ User is already an admin');
        return;
      }
      
      // Update role to admin
      await updateDoc(doc(db, 'users', userDoc.id), {
        role: 'admin',
        updatedAt: new Date()
      });
      
      console.log('🎉 Successfully updated user role to admin!');
      console.log('💡 You can now access all admin features');
      
    } catch (error) {
      console.error('❌ Error setting up admin:', error);
    }
  }
  
  // Get email from command line argument
  const userEmail = process.argv[2];
  
  if (!userEmail) {
    console.log('❌ Please provide user email as argument');
    console.log('💡 Usage: node scripts/setup-admin.js your-email@gmail.com');
    process.exit(1);
  }
  
  setupAdmin(userEmail);
  
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  process.exit(1);
}
