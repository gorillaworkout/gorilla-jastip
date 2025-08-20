console.log('🔍 Production Firebase Configuration Check');
console.log('=========================================');

console.log('\n📋 Current Environment Variables (Production):');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('VERCEL_URL:', process.env.VERCEL_URL || 'Not set');
console.log('VERCEL_ENV:', process.env.VERCEL_ENV || 'Not set');

console.log('\n🌐 Domain Information:');
if (process.env.VERCEL_URL) {
  console.log('Vercel Preview URL:', `https://${process.env.VERCEL_URL}`);
}

console.log('\n📝 Firebase Configuration Check:');
console.log('NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Not Set');
console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '❌ Not Set');
console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '❌ Not Set');

console.log('\n🔍 Troubleshooting Steps:');
console.log('1. Check Vercel Environment Variables:');
console.log('   - Go to Vercel Dashboard > Your Project > Settings > Environment Variables');
console.log('   - Ensure all Firebase variables are set correctly');
console.log('   - Make sure they are available in Production environment');

console.log('\n2. Verify Firebase Console Settings:');
console.log('   - Go to Firebase Console > Authentication > Settings > Authorized Domains');
console.log('   - Ensure your Vercel domain is listed (gorilla-jastip.vercel.app)');
console.log('   - Check that Google Sign-In provider is enabled');

console.log('\n3. Check Auth Domain Configuration:');
console.log('   - Your auth domain should be: gorillaworkout-project.firebaseapp.com');
console.log('   - This should match NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');

console.log('\n4. Common Issues:');
console.log('   - Environment variables not set in Vercel production');
console.log('   - Domain mismatch between Firebase and environment variables');
console.log('   - Google Sign-In not enabled in Firebase Console');
console.log('   - Caching issues in browser');

console.log('\n5. Quick Fixes:');
console.log('   - Redeploy after setting environment variables');
console.log('   - Clear browser cache and cookies');
console.log('   - Check browser console for specific error codes');
console.log('   - Verify Firebase project ID matches');

console.log('\n✅ Script completed. Check the output above for any issues.');
