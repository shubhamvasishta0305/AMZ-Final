// Mock API service for simulating network requests and AI generation

// Mock seller data - 15-20 Amazon products with realistic data
const mockSellerData = {
  'ACME-CORP': [
    { productID: 'B08N5V3T8W', productName: 'BIBA Women\'s Cotton Straight Kurta', price: 849.99, category: 'Clothing', rating: 4.2, reviews: 2341, availability: 'In Stock' },
    { productID: 'B09K7H2M3P', productName: 'Samsung Galaxy M32 (Light Blue, 6GB RAM, 128GB Storage)', price: 16999.99, category: 'Electronics', rating: 4.1, reviews: 15643, availability: 'In Stock' },
    { productID: 'B07XJ8C8F5', productName: 'Boat Airdopes 131 Wireless Earbuds', price: 1299.99, category: 'Electronics', rating: 4.0, reviews: 87432, availability: 'In Stock' },
    { productID: 'B08F2SXD6K', productName: 'The Alchemist by Paulo Coelho', price: 199.99, category: 'Books', rating: 4.6, reviews: 9876, availability: 'In Stock' },
    { productID: 'B09B8W7XYZ', productName: 'Nivea Soft Light Moisturizing Cream', price: 149.99, category: 'Beauty', rating: 4.3, reviews: 5432, availability: 'In Stock' },
    { productID: 'B07H4Q9R8T', productName: 'Prestige Deluxe Alpha Stainless Steel Pressure Cooker', price: 2299.99, category: 'Kitchen', rating: 4.4, reviews: 12876, availability: 'In Stock' },
    { productID: 'B08D6T4NM2', productName: 'Puma Men\'s Running Shoes', price: 2999.99, category: 'Sports', rating: 4.2, reviews: 3456, availability: 'In Stock' },
    { productID: 'B09L3P6Q7R', productName: 'Amazfit Bip U Smart Watch', price: 3999.99, category: 'Electronics', rating: 4.1, reviews: 8765, availability: 'In Stock' },
    { productID: 'B08C1H5M9N', productName: 'Himalaya Herbals Face Wash', price: 89.99, category: 'Beauty', rating: 4.0, reviews: 6789, availability: 'In Stock' },
    { productID: 'B07G2F4K8L', productName: 'Milton Thermosteel Flask 1000ml', price: 899.99, category: 'Kitchen', rating: 4.5, reviews: 4321, availability: 'In Stock' },
    { productID: 'B09M7N8P2Q', productName: 'HP 14 Laptop AMD Ryzen 5', price: 42999.99, category: 'Electronics', rating: 4.2, reviews: 2198, availability: 'In Stock' },
    { productID: 'B08R3T5V7W', productName: 'Godrej Aer Pocket Bathroom Fragrance', price: 99.99, category: 'Home', rating: 4.1, reviews: 3456, availability: 'In Stock' },
    { productID: 'B07Y9S6Z1A', productName: 'Cello Opalware Dinner Set', price: 1299.99, category: 'Kitchen', rating: 4.3, reviews: 2109, availability: 'In Stock' },
    { productID: 'B09P4Q6R8S', productName: 'Peter England Men\'s Cotton Shirt', price: 1199.99, category: 'Clothing', rating: 4.0, reviews: 5643, availability: 'In Stock' },
    { productID: 'B08T5U7V9W', productName: 'Lakme Absolute Perfect Radiance Serum', price: 699.99, category: 'Beauty', rating: 4.4, reviews: 1876, availability: 'In Stock' },
    { productID: 'B07X1Y3Z5A', productName: 'Bajaj Majesty RX11 1000-Watt Room Heater', price: 1799.99, category: 'Appliances', rating: 4.1, reviews: 9876, availability: 'In Stock' },
    { productID: 'B09C2D4F6G', productName: 'Fortune Sunlite Refined Sunflower Oil 1L', price: 149.99, category: 'Grocery', rating: 4.2, reviews: 7654, availability: 'In Stock' },
    { productID: 'B08H3I5J7K', productName: 'Fiama Di Wills Gel Bar Blackcurrant & Bearberry', price: 199.99, category: 'Beauty', rating: 4.0, reviews: 4321, availability: 'In Stock' },
    { productID: 'B07L6M8N0P', productName: 'Asian Paints Ace Exterior Emulsion White 1L', price: 349.99, category: 'Home', rating: 4.3, reviews: 1234, availability: 'In Stock' },
    { productID: 'B09Q2R4S6T', productName: 'Kindle Paperwhite E-reader', price: 12999.99, category: 'Electronics', rating: 4.5, reviews: 13245, availability: 'In Stock' }
  ],
  'TECH-SOLUTIONS': [
    { productID: 'B08A1B2C3D', productName: 'OnePlus Nord CE 2 5G', price: 23999.99, category: 'Electronics', rating: 4.3, reviews: 8976, availability: 'In Stock' },
    { productID: 'B07E4F5G6H', productName: 'Sony WH-CH720N Wireless Headphones', price: 8999.99, category: 'Electronics', rating: 4.4, reviews: 6543, availability: 'In Stock' },
    { productID: 'B09I7J8K9L', productName: 'Lenovo IdeaPad 3 Laptop', price: 39999.99, category: 'Electronics', rating: 4.1, reviews: 3456, availability: 'In Stock' },
    { productID: 'B08M1N2O3P', productName: 'Realme Smart TV 43 inch 4K', price: 25999.99, category: 'Electronics', rating: 4.2, reviews: 5678, availability: 'In Stock' },
    { productID: 'B07Q4R5S6T', productName: 'Canon EOS 1500D DSLR Camera', price: 32999.99, category: 'Electronics', rating: 4.3, reviews: 4321, availability: 'In Stock' }
  ]
};

// Mock function to simulate fetching seller data
export const fetchSellerData = async (sellerId) => {
  console.log(`Fetching data for seller: ${sellerId}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const data = mockSellerData[sellerId];
      if (data) {
        resolve(data);
      } else {
        reject(new Error(`No data found for seller: ${sellerId}`));
      }
    }, 1500);
  });
};

// Mock function for AI text generation
export const generateAIText = async (originalText) => {
  console.log(`Generating AI text for: ${originalText}`);
  return new Promise(resolve => {
    setTimeout(() => {
      const aiEnhancements = [
        'Premium Quality',
        'Best Seller',
        'Top Rated',
        'Customer Favorite',
        'Trending Now',
        'Limited Edition',
        'Professional Grade',
        'Ultra Modern',
        'Advanced Technology',
        'Eco-Friendly'
      ];
      const randomEnhancement = aiEnhancements[Math.floor(Math.random() * aiEnhancements.length)];
      resolve(`${randomEnhancement} ${originalText} - Enhanced with AI-powered keywords for better visibility!`);
    }, 1000);
  });
};

// Mock function for AI image generation
export const generateAIImage = async (imageType) => {
  console.log(`Generating AI image for: ${imageType}`);
  return new Promise(resolve => {
    setTimeout(() => {
      const imageColors = ['FF6B6B', '4ECDC4', '45B7D1', 'F7DC6F', 'BB8FCE', '85C1E9', 'F8C471', '82E0AA'];
      const randomColor = imageColors[Math.floor(Math.random() * imageColors.length)];
      resolve(`https://placehold.co/600x400/${randomColor}/white?text=AI+${imageType.replace(/\s/g, '+')}`);
    }, 2000);
  });
};