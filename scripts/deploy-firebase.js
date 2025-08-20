// Script untuk deploy Firebase rules dan konfigurasi
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying Firebase configuration...');

// Check if firebase CLI is installed
try {
  execSync('firebase --version', { stdio: 'pipe' });
  console.log('✅ Firebase CLI is installed');
} catch (error) {
  console.log('❌ Firebase CLI is not installed');
  console.log('💡 Please install Firebase CLI first:');
  console.log('   npm install -g firebase-tools');
  console.log('   or');
  console.log('   curl -sL https://firebase.tools | bash');
  process.exit(1);
}

// Check if user is logged in
try {
  execSync('firebase projects:list', { stdio: 'pipe' });
  console.log('✅ User is logged in to Firebase');
} catch (error) {
  console.log('❌ User is not logged in to Firebase');
  console.log('💡 Please login first:');
  console.log('   firebase login');
  process.exit(1);
}

// Deploy Firestore rules
try {
  console.log('\n📁 Deploying Firestore rules...');
  execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
  console.log('✅ Firestore rules deployed successfully');
} catch (error) {
  console.error('❌ Failed to deploy Firestore rules:', error.message);
  process.exit(1);
}

// Deploy Firestore indexes
try {
  console.log('\n📊 Deploying Firestore indexes...');
  execSync('firebase deploy --only firestore:indexes', { stdio: 'inherit' });
  console.log('✅ Firestore indexes deployed successfully');
} catch (error) {
  console.error('❌ Failed to deploy Firestore indexes:', error.message);
  process.exit(1);
}

console.log('\n🎉 Firebase configuration deployed successfully!');
console.log('💡 You can now test your application');
