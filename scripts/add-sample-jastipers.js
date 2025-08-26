const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration - replace with your actual config
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleJastipers = [
  {
    name: "Sarah Tanaka",
    imageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    facebookLink: "https://facebook.com/sarah.tanaka",
    phoneNumber: "+62 812-3456-7890",
    description: "Jastiper berpengalaman untuk produk kosmetik dan skincare Jepang",
    isVerified: true,
    rating: 4.8,
    totalOrders: 156
  },
  {
    name: "Ahmad Rizki",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    facebookLink: "https://facebook.com/ahmad.rizki",
    phoneNumber: "+62 813-4567-8901",
    description: "Spesialis produk fashion dan aksesoris dari Jepang",
    isVerified: true,
    rating: 4.9,
    totalOrders: 203
  },
  {
    name: "Maya Sari",
    imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    facebookLink: "https://facebook.com/maya.sari",
    phoneNumber: "+62 814-5678-9012",
    description: "Jastiper terpercaya untuk produk makanan dan snack Jepang",
    isVerified: true,
    rating: 4.7,
    totalOrders: 89
  },
  {
    name: "Budi Santoso",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    facebookLink: "https://facebook.com/budi.santoso",
    phoneNumber: "+62 815-6789-0123",
    description: "Spesialis gadget dan elektronik dari Jepang",
    isVerified: false,
    rating: 0,
    totalOrders: 0
  },
  {
    name: "Dewi Putri",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    facebookLink: "https://facebook.com/dewi.putri",
    phoneNumber: "+62 816-7890-1234",
    description: "Jastiper untuk produk hobi dan koleksi dari Jepang",
    isVerified: true,
    rating: 4.6,
    totalOrders: 67
  }
];

async function addSampleJastipers() {
  try {
    console.log('Adding sample jastipers...');
    
    for (const jastiper of sampleJastipers) {
      const docRef = await addDoc(collection(db, 'jastipers'), {
        ...jastiper,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log(`Added jastiper: ${jastiper.name} with ID: ${docRef.id}`);
    }
    
    console.log('Successfully added all sample jastipers!');
  } catch (error) {
    console.error('Error adding sample jastipers:', error);
  }
}

// Run the function
addSampleJastipers();
