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
export const scrapeProductFromUrl = async (url) => {
  try {
    console.log('🕷️ Starting to scrape URL:', url);
    
    const response = await fetch('http://localhost:5000/api/scrape-product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Scraping response received:', data);

    if (!data.success) {
      throw new Error(data.error || 'Scraping failed');
    }

    // Transform the data to match your frontend expectations
    const transformedProduct = {
      // Basic product info
      title: data.title || 'No Title',
      description: data.description || '',
      brand: data.brand || 'Unknown Brand',
      asin: data.asin || 'N/A',
      
      // Images
      images: data.images || [],
      
      // Features/Bullets
      features: data.bullets || [],
      
      // Product details in structured format
      productDetails: data.productDetails || {},
      manufacturingDetails: data.manufacturingDetails || {},
      additionalInfo: data.additionalInfo || {},
      
      // Array formats for easier rendering
      productDetailsArray: Object.entries(data.productDetails || {}).map(([key, value]) => ({
        label: key,
        value: value,
        key: key.toLowerCase().replace(/\s+/g, '_')
      })),
      
      manufacturingDetailsArray: Object.entries(data.manufacturingDetails || {}).map(([key, value]) => ({
        label: key,
        value: value,
        key: key.toLowerCase().replace(/\s+/g, '_')
      })),
      
      additionalInfoArray: Object.entries(data.additionalInfo || {}).map(([key, value]) => ({
        label: key,
        value: value,
        key: key.toLowerCase().replace(/\s+/g, '_')
      })),
      
      // Raw data for reference
      rawData: data
    };

    console.log('✅ Transformed product data:', transformedProduct);
    return transformedProduct;

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

// AI text generation using the real server endpoint - IMPROVED
export const generateProductTitle = async (productData) => {
  console.log('🤖 Generating AI product title with:', productData);
  try {
    // Ensure we have at least some basic data
    const requestBody = {
      ...productData,
      type: 'title'
    };

    // Add fallback values if critical fields are missing
    if (!requestBody.subcategory && requestBody.GenericName) {
      requestBody.subcategory = requestBody.GenericName;
    }
    if (!requestBody.subcategory && requestBody.Category) {
      requestBody.subcategory = requestBody.Category;
    }
    if (!requestBody.subcategory) {
      requestBody.subcategory = "Clothing Item";
    }

    console.log('📤 Sending request body:', requestBody);

    const response = await fetch('http://localhost:5000/api/generate-title-description', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
   
    if (!data.success) {
      throw new Error(data.error || 'Title generation failed');
    }
   
    console.log('✅ AI product title generated successfully:', data.generated_title);
    return data.generated_title;
  } catch (error) {
    console.error('❌ Error generating AI product title:', error);
    throw new Error(`Failed to generate product title: ${error.message}`);
  }
};

export const generateProductDescription = async (productData) => {
  console.log('🤖 Generating AI product description with:', productData);
  try {
    // Ensure we have at least some basic data
    const requestBody = {
      ...productData,
      type: 'description'
    };

    // Add fallback values if critical fields are missing
    if (!requestBody.subcategory && requestBody.GenericName) {
      requestBody.subcategory = requestBody.GenericName;
    }
    if (!requestBody.subcategory && requestBody.Category) {
      requestBody.subcategory = requestBody.Category;
    }
    if (!requestBody.subcategory) {
      requestBody.subcategory = "Clothing Item";
    }

    console.log('📤 Sending request body:', requestBody);

    const response = await fetch('http://localhost:5000/api/generate-title-description', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
   
    if (!data.success) {
      throw new Error(data.error || 'Description generation failed');
    }
   
    console.log('✅ AI product description generated successfully:', data.generated_description);
    return data.generated_description;
  } catch (error) {
    console.error('❌ Error generating AI product description:', error);
    throw new Error(`Failed to generate product description: ${error.message}`);
  }
};

// AI image generation using the real server endpoint - FIXED
export const generateAIImage = async (imageFile, styleIndex, attributes = {}) => {
  console.log('🎨 Generating AI image with:', { styleIndex, attributes });
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('style_index', styleIndex.toString());
    formData.append('attributes', JSON.stringify(attributes));

    const response = await fetch('http://localhost:5000/generate-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    console.log('✅ Image generation response:', data);
    
    // Return the first available URL in priority order
    const imageUrl = data.gcs_url || data.local_url || 
                    (data.filename ? `http://localhost:5000/generated_images/${data.filename}` : null);
    
    if (!imageUrl) {
      throw new Error('No image URL returned from server');
    }

    return {
      url: imageUrl,
      filename: data.filename,
      gcs_url: data.gcs_url,
      local_url: data.local_url,
      success: data.success || true
    };
  } catch (error) {
    console.error('❌ Error generating AI image:', error);
    throw new Error(`Failed to generate AI image: ${error.message}`);
  }
};

// Utility function to check if backend is available
export const checkBackendHealth = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/generate-title-description', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        subcategory: 'test',
        type: 'title',
        Brand: 'Test Brand'
      }),
    });
    return response.status !== 404;
  } catch (error) {
    console.log('Backend not available:', error.message);
    return false;
  }
};

// Check if image exists on server
export const checkImageExists = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Mock data for development when backend is not available
export const getMockProductData = (url) => {
  return {
    title: "Mock Product Title",
    description: "This is a mock product description for development purposes.",
    brand: "Mock Brand",
    asin: "MOCK123",
    images: [
      "https://via.placeholder.com/500x500?text=Product+Image+1",
      "https://via.placeholder.com/500x500?text=Product+Image+2"
    ],
    features: [
      "High-quality mock material",
      "Durable construction",
      "Comfortable fit"
    ],
    productDetails: {
      "Material": "100% Cotton",
      "Fit": "Regular Fit",
      "Pattern": "Solid"
    },
    manufacturingDetails: {
      "ASIN": "MOCK123",
      "Manufacturer": "Mock Manufacturer"
    },
    additionalInfo: {},
    productDetailsArray: [
      { label: "Material", value: "100% Cotton", key: "material" },
      { label: "Fit", value: "Regular Fit", key: "fit" },
      { label: "Pattern", value: "Solid", key: "pattern" }
    ],
    manufacturingDetailsArray: [
      { label: "ASIN", value: "MOCK123", key: "asin" },
      { label: "Manufacturer", value: "Mock Manufacturer", key: "manufacturer" }
    ],
    additionalInfoArray: []
  };
};

