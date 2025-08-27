const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, doc, getDoc } = require('firebase/firestore');

// Firebase config - replace with your actual config
const firebaseConfig = {
  // Add your Firebase config here
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testInstagramSave() {
  try {
    console.log('🧪 Testing Instagram link save functionality...');
    
    // Test data
    const testJastiper = {
      name: "Test Jastiper Instagram",
      imageUrl: "https://example.com/test.jpg",
      facebookLink: "https://facebook.com/testuser",
      instagramLink: "https://instagram.com/testuser",
      phoneNumber: "+6281234567890",
      description: "Test jastiper untuk Instagram",
      completedOrders: 5,
      verifiedByFacebookLink: "",
      isVerified: false,
      rating: 0,
      totalOrders: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('📝 Test data:', testJastiper);
    
    // Add to Firestore
    console.log('💾 Saving to Firestore...');
    const docRef = await addDoc(collection(db, 'jastipers'), testJastiper);
    console.log('✅ Document written with ID:', docRef.id);
    
    // Retrieve and verify
    console.log('🔍 Retrieving from Firestore...');
    const docSnap = await getDoc(doc(db, 'jastipers', docRef.id));
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('📖 Retrieved data:', data);
      
      // Check if instagramLink exists
      if (data.instagramLink) {
        console.log('✅ Instagram link saved successfully:', data.instagramLink);
      } else {
        console.log('❌ Instagram link NOT found in saved data');
      }
      
      // Check all fields
      console.log('\n🔍 Field verification:');
      console.log('name:', data.name);
      console.log('facebookLink:', data.facebookLink);
      console.log('instagramLink:', data.instagramLink);
      console.log('phoneNumber:', data.phoneNumber);
      
    } else {
      console.log('❌ No such document!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run test
testInstagramSave();
