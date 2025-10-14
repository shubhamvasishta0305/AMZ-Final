// Mock data for the application

// Available seller IDs
export const availableSellerIds = [
  { id: 'ACME-CORP', name: 'ACME Corporation' },
  { id: 'TECH-SOLUTIONS', name: 'Tech Solutions Ltd' },
  { id: 'GLOBAL-TRADERS', name: 'Global Traders Inc' },
  { id: 'PRIME-RETAIL', name: 'Prime Retail Group' }
];

// Gold standard product data (the benchmark product)
export const goldStandardProduct = {
  id: 'B0FDWZ18JV',
  title: 'BIBA Women Cotton Straight Kurta',
  amazonUrl: 'https://www.amazon.in/dp/B0FDWZ18JV/',
  price: '₹849',
  rating: 4.2,
  reviews: 2341,
  images: [
    'https://placehold.co/300x400/E8E8E8/333?text=Main+Product',
    'https://placehold.co/300x400/F0F0F0/333?text=Front+View',
    'https://placehold.co/300x400/E8E8E8/333?text=Back+View',
    'https://placehold.co/300x400/F0F0F0/333?text=Side+View',
    'https://placehold.co/300x400/E8E8E8/333?text=Detail+1',
    'https://placehold.co/300x400/F0F0F0/333?text=Detail+2',
    'https://placehold.co/300x400/E8E8E8/333?text=Lifestyle'
  ],
  details: {
    brand: 'BIBA',
    fabric: '100% Cotton',
    sleeves: 'Short Sleeves',
    fit: 'Straight',
    occasion: 'Casual, Festive',
    neckType: 'Round Neck',
    pattern: 'Solid',
    color: 'Blue'
  },
  description: 'Elegant cotton kurta perfect for everyday wear and special occasions. Made from premium quality cotton fabric with comfortable straight fit.',
  keyFeatures: [
    'Premium 100% Cotton Fabric',
    'Comfortable Straight Fit',
    'Round Neck Design',
    'Short Sleeves',
    'Machine Washable',
    'Perfect for Casual & Festive Wear'
  ]
};

// Sample product data for editing
export const sampleProductForEdit = {
  id: 'B08N5V3T8W',
  title: 'BIBA Women\'s Cotton Straight Kurta - Traditional Design',
  price: 849.99,
  details: [
    { id: 1, key: 'Brand', value: 'BIBA', isEditing: false },
    { id: 2, key: 'Fabric', value: '100% Cotton', isEditing: false },
    { id: 3, key: 'Sleeves', value: 'Short Sleeves', isEditing: false },
    { id: 4, key: 'Fit Type', value: 'Straight', isEditing: false },
    { id: 5, key: 'Occasion', value: 'Casual, Festive', isEditing: false },
    { id: 6, key: 'Neck Type', value: 'Round Neck', isEditing: false },
    { id: 7, key: 'Pattern', value: 'Solid', isEditing: false },
    { id: 8, key: 'Color', value: 'Blue', isEditing: false },
    { id: 9, key: 'Care Instructions', value: 'Machine Wash', isEditing: false },
    { id: 10, key: 'Country of Origin', value: 'India', isEditing: false }
  ],
  currentImages: [
    'https://placehold.co/300x400/DDDDDD/333?text=Current+Main',
    'https://placehold.co/300x400/CCCCCC/333?text=Current+Front',
    'https://placehold.co/300x400/DDDDDD/333?text=Current+Back',
    'https://placehold.co/300x400/CCCCCC/333?text=Current+Side',
    'https://placehold.co/300x400/DDDDDD/333?text=Current+Detail+1',
    'https://placehold.co/300x400/CCCCCC/333?text=Current+Detail+2',
    'https://placehold.co/300x400/DDDDDD/333?text=Current+Lifestyle'
  ]
};

// Filter options for comparison setup page
export const filterOptions = {
  category: ['All Categories', 'Clothing', 'Electronics', 'Books', 'Beauty', 'Kitchen', 'Sports'],
  priceRange: ['All Prices', '₹0 - ₹500', '₹500 - ₹1000', '₹1000 - ₹5000', '₹5000+'],
  rating: ['All Ratings', '4+ Stars', '3+ Stars', '2+ Stars', '1+ Stars'],
  availability: ['All', 'In Stock', 'Limited Stock', 'Pre-order']
};