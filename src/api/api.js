// API service for fetching data from Amazon Comparator API

const API_BASE_URL = 'http://localhost:3000';

// Fetch all sheet data from the API
export const fetchSheetData = async () => {
  console.log('Fetching sheet data from API...');
  try {
    const response = await fetch(`${API_BASE_URL}/api/sheet-data`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch sheet data');
    }
    
    if (!data.success) {
      throw new Error(data.error || 'API returned error');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw new Error(`Failed to fetch data: ${error.message}`);
  }
};

// Fetch golden sheet data from the API (for ComparisonSetupPage filters and URL)
export const fetchGoldenSheetData = async () => {
  console.log('Fetching golden sheet data from API...');
  try {
    const response = await fetch(`${API_BASE_URL}/api/golden-sheet-data`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch golden sheet data');
    }
    
    if (!data.success) {
      throw new Error(data.error || 'API returned error');
    }
    
    console.log('✅ Golden sheet data fetched successfully:', {
      totalRows: data.totalRows,
      fromCache: data.fromCache,
      headers: data.headers
    });
    
    return data;
  } catch (error) {
    console.error('Error fetching golden sheet data:', error);
    throw new Error(`Failed to fetch golden sheet data: ${error.message}`);
  }
};

// Scrape product data from a given URL
export const scrapeProductFromUrl = async (productUrl) => {
  console.log('🔍 Scraping product data from URL:', productUrl);
  try {
    const response = await fetch(`${API_BASE_URL}/api/scrape-product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: productUrl })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to scrape product data');
    }
    
    if (!data.success) {
      throw new Error(data.error || 'Scraping failed');
    }
    
    console.log('✅ Product data scraped successfully:', {
      title: data.product?.title,
      price: data.product?.price,
      rating: data.product?.rating
    });
    
    return data.product;
  } catch (error) {
    console.error('❌ Error scraping product:', error);
    throw new Error(`Failed to scrape product: ${error.message}`);
  }
};

// Legacy function kept for compatibility - now uses real API data
export const fetchSellerData = async (category) => {
  console.log(`Fetching data for category: ${category}`);
  try {
    const sheetData = await fetchSheetData();
    
    // Filter data by category if specified, otherwise return all
    let filteredData = sheetData.data;
    if (category && category !== 'All Categories') {
      filteredData = sheetData.data.filter(item => 
        item.Category && item.Category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Transform the data to match the expected format
    const transformedData = filteredData.map((item, index) => ({
      productID: `API-${Date.now()}-${index}`,
      productName: `${item.Category} - ${item.Subcategory} (${item.Gender}, ${item['Age Group']})`,
      // price: Math.floor(Math.random() * 5000) + 100, // Random price for demo
      category: item.Category,
      rating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3-5
      reviews: Math.floor(Math.random() * 10000) + 100,
      availability: 'In Stock',
      url: item.URL,
      gender: item.Gender,
      ageGroup: item['Age Group'],
      subcategory: item.Subcategory
    }));
    
    return transformedData;
  } catch (error) {
    throw new Error(`Failed to fetch data for ${category}: ${error.message}`);
  }
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