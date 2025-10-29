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
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.error || 'Failed to scrape product data');
    }
    
    if (!responseData.success) {
      throw new Error(responseData.error || 'Scraping failed');
    }
    
    // Handle multiple possible response structures - check nested levels
    let productData;
    
    // Check if response has 'product' key (new scraper format)
    if (responseData.product) {
      productData = responseData;
    }
    // Deep nested: data.data.data (triple nested)
    else if (responseData.data?.data?.data) {
      productData = responseData.data.data.data;
    }
    // Double nested: data.data structure
    else if (responseData.data?.data) {
      productData = responseData.data.data;
    } 
    // Single nested with basic_information (old format)
    else if (responseData.data?.basic_information) {
      productData = responseData.data;
    }
    // Direct in data
    else if (responseData.data) {
      productData = responseData.data;
    }
    // Otherwise, assume data is directly in response (old format)
    else {
      productData = responseData;
    }
    
    if (!productData) {
      throw new Error('No product data found in response');
    }
    
    console.log('📦 Raw scraped data:', productData);
    
    // Helper function to safely get nested values
    const safeGet = (obj, path, defaultValue = null) => {
      try {
        return path.split('.').reduce((acc, part) => acc?.[part], obj) ?? defaultValue;
      } catch {
        return defaultValue;
      }
    };

    // Helper function to filter out null/undefined/N/A values
    const filterValidData = (data) => {
      if (!data || typeof data !== 'object') return null;
      const filtered = {};
      Object.entries(data).forEach(([key, value]) => {
        if (value && value !== 'N/A' && value !== 'null' && value !== 'undefined') {
          filtered[key] = value;
        }
      });
      return Object.keys(filtered).length > 0 ? filtered : null;
    };

    // Extract product info from new format
    const product = productData.product || productData;
    const details = productData.details || {};
    const raw = productData.raw || {};
    
    // Transform the scraped data to match our application's format
    const transformedProduct = {
      // Basic information
      asin: safeGet(product, 'asin') || 
            safeGet(raw, 'manufacturingDetails.ASIN') ||
            (Array.isArray(details.manufacturingDetails) ? 
              details.manufacturingDetails.find(d => d.label === 'ASIN')?.value : null),
      
      title: safeGet(product, 'title'),
      
      brand: safeGet(product, 'brand') ||
             safeGet(raw, 'productDetails.Brand'),
      
      url: productUrl,
      
      // Images - filter out invalid URLs
      images: (Array.isArray(product.images) ? product.images : [])
        .filter(img => img && img.startsWith('http')),
      
      // Features/Bullets
      features: (Array.isArray(details.featureBullets) ? details.featureBullets : [])
        .filter(f => f && f !== 'N/A' && f.trim().length > 0),
      
      // Description
      description: safeGet(product, 'description'),
      
      // Product Details - organized by sections
      productDetails: filterValidData(raw.productDetails),
      
      // Manufacturing Details
      manufacturingDetails: filterValidData(raw.manufacturingDetails),
      
      // Additional Info
      additionalInfo: filterValidData(raw.additionalInfo),
      
      // Flatten all details into arrays for easy rendering
      productDetailsArray: Array.isArray(details.productDetails) 
        ? details.productDetails.filter(d => d.value && d.value !== 'N/A')
        : [],
        
      manufacturingDetailsArray: Array.isArray(details.manufacturingDetails)
        ? details.manufacturingDetails.filter(d => d.value && d.value !== 'N/A')
        : [],
        
      additionalInfoArray: Array.isArray(details.additionalInfo)
        ? details.additionalInfo.filter(d => d.value && d.value !== 'N/A')
        : [],
      
      // Store raw data for reference
      rawData: productData
    };
    
    console.log('✅ Product data scraped and transformed successfully:', {
      title: transformedProduct.title,
      asin: transformedProduct.asin,
      brand: transformedProduct.brand,
      imageCount: transformedProduct.images.length,
      featureCount: transformedProduct.features.length,
      hasDescription: !!transformedProduct.description,
      hasProductDetails: !!transformedProduct.productDetails,
      hasManufacturingDetails: !!transformedProduct.manufacturingDetails
    });
    
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

// AI text generation using the real server endpoint
export const generateProductTitle = async (subcategory, productDetails) => {
  console.log('🤖 Generating AI product title with:', { subcategory, productDetails });
  
  try {
    const requestBody = {
      subcategory,
      type: 'title',
      ...productDetails
    };

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

export const generateProductDescription = async (subcategory, productDetails) => {
  console.log('🤖 Generating AI product description with:', { subcategory, productDetails });
  
  try {
    const requestBody = {
      subcategory,
      type: 'description',
      ...productDetails
    };

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

// AI image generation using the real server endpoint
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

    // The API returns JSON with either gcs_url or filename
    const data = await response.json();
    
    let imageUrl;
    if (data.gcs_url) {
      // Use the GCS public URL directly
      imageUrl = data.gcs_url;
      console.log('✅ AI image generated successfully (GCS):', imageUrl);
    } else if (data.filename) {
      // Fallback to local server URL if GCS upload failed
      imageUrl = `http://localhost:5000/generated_images/${data.filename}`;
      console.log('✅ AI image generated successfully (Local):', imageUrl);
    } else {
      throw new Error('No image URL returned from server');
    }
    
    return imageUrl;
  } catch (error) {
    console.error('❌ Error generating AI image:', error);
    throw new Error(`Failed to generate AI image: ${error.message}`);
  }
};