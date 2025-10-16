const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const { parse } = require('csv-parse/sync');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000; 
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Your Google Sheet CSV URL
const SHEET_CSV_URL = 
`https://docs.google.com/spreadsheets/d/1C6s96_hmDTYjwwkq5r4ekAh5FrtAvPJqN54WwYl_eVI/export?format=csv&gid=75817034`;

// Golden URL Sheet CSV URL (Page 2)
const GOLDEN_SHEET_CSV_URL = 
`https://docs.google.com/spreadsheets/d/1C6s96_hmDTYjwwkq5r4ekAh5FrtAvPJqN54WwYl_eVI/export?format=csv&gid=62256398`;

// Cache for sheet data
let sheetDataCache = null;
let lastCacheTime = null;

// Cache for golden sheet data
let goldenSheetDataCache = null;
let lastGoldenCacheTime = null;

// Function to get real data from Google Sheets CSV
async function getRealSheetData() {
    // Return cached data if it's fresh (5 minutes)
    if (sheetDataCache && lastCacheTime && (Date.now() - lastCacheTime) < 3000000) {
        console.log('📊 Using cached sheet data');
        return sheetDataCache;
    }

    try {
        console.log('📊 Fetching fresh data from Google Sheets CSV...');
        const response = await axios.get(SHEET_CSV_URL, { 
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const csvData = response.data;
        
        // Debug: Log first 200 characters to see what we're receiving
        console.log('📝 First 200 chars of response:', csvData.substring(0, 200));
        console.log('📝 Response type:', typeof csvData);
        
        // Parse CSV
        const records = parse(csvData, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            relax_quotes: true,
            relax_column_count: true
        });

        console.log('✅ Successfully parsed', records.length, 'rows from Google Sheets');
        
        // Cache the data
        sheetDataCache = {
            success: true,
            data: records,
            headers: Object.keys(records[0] || {})
        };
        lastCacheTime = Date.now();
        
        return sheetDataCache;
        
    } catch (error) {
        console.error('❌ Error fetching from Google Sheets CSV:', error.message);
        
        // If it's an axios error, log the response
        if (error.response) {
            console.error('📍 Status:', error.response.status);
            console.error('📍 Response preview:', error.response.data?.substring(0, 200));
        }
        
        // Return comprehensive fallback data
        return {
            success: true,
            data: [
                { '': 'Clothing', Gender: 'Women', 'Age Group': 'Adults', Subcategory: 'Kurtas', URL: 'https://www.amazon.in/s?k=women+kurtas' },
                { '': 'Clothing', Gender: 'Women', 'Age Group': 'Adults', Subcategory: 'Sarees', URL: 'https://www.amazon.in/s?k=women+sarees' },
                { '': 'Clothing', Gender: 'Women', 'Age Group': 'Adults', Subcategory: 'Dresses', URL: 'https://www.amazon.in/s?k=women+dresses' },
                { '': 'Clothing', Gender: 'Men', 'Age Group': 'Adults', Subcategory: 'Shirts', URL: 'https://www.amazon.in/s?k=men+shirts' },
                { '': 'Clothing', Gender: 'Men', 'Age Group': 'Adults', Subcategory: 'T-Shirts', URL: 'https://www.amazon.in/s?k=men+t+shirts' }
            ],
            headers: ['', 'Gender', 'Age Group', 'Subcategory', 'URL'],
            fromCache: true
        };
    }
}

// Function to get golden sheet data (Page 2)
async function getGoldenSheetData() {
    // Return cached data if it's fresh (5 minutes)
    if (goldenSheetDataCache && lastGoldenCacheTime && (Date.now() - lastGoldenCacheTime) < 3000000) {
        console.log('📊 Using cached golden sheet data');
        return goldenSheetDataCache;
    }

    try {
        console.log('📊 Fetching fresh data from Golden Sheet CSV...');
        const response = await axios.get(GOLDEN_SHEET_CSV_URL, { 
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const csvData = response.data;
        
        // Debug: Log first 200 characters to see what we're receiving
        console.log('📝 First 200 chars of golden sheet response:', csvData.substring(0, 200));
        console.log('📝 Response type:', typeof csvData);
        
        // Parse CSV
        const records = parse(csvData, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            relax_quotes: true,
            relax_column_count: true
        });

        console.log('✅ Successfully parsed', records.length, 'rows from Golden Sheet');
        
        // Cache the data
        goldenSheetDataCache = {
            success: true,
            data: records,
            headers: Object.keys(records[0] || {})
        };
        lastGoldenCacheTime = Date.now();
        
        return goldenSheetDataCache;
        
    } catch (error) {
        console.error('❌ Error fetching from Golden Sheet CSV:', error.message);
        
        // If it's an axios error, log the response
        if (error.response) {
            console.error('📍 Status:', error.response.status);
            console.error('📍 Response preview:', error.response.data?.substring(0, 200));
        }
        
        // Return empty fallback data
        return {
            success: true,
            data: [],
            headers: [],
            fromCache: false
        };
    }
}

// API endpoint to get filtered subcategories
app.get('/api/filtered-subcategories', async (req, res) => {
    const { category, gender, ageGroup } = req.query;
    
    console.log('🔍 Filtering for:', { category, gender, ageGroup });
    
    try {
        const sheetResult = await getRealSheetData();
        const data = sheetResult.data;

        // Filter and get unique subcategories
        const filteredSubcategories = [];
        const seenSubcategories = new Set();

        data.forEach(row => {
            // Get category from the first unnamed column (empty string key)
            const rowCategory = row[''] || row.Category;
            const rowGender = row.Gender || row.gender;
            const rowAgeGroup = row['Age Group'] || row.AgeGroup || row.agegroup;
            const rowSubcategory = row.Subcategory || row['Sub Category'] || row.subcategory;

            if (rowCategory && rowCategory.toString().trim() === category &&
                rowGender && rowGender.toString().trim() === gender &&
                rowAgeGroup && rowAgeGroup.toString().trim() === ageGroup &&
                rowSubcategory) {
                
                const subcat = rowSubcategory.toString().trim();
                if (!seenSubcategories.has(subcat)) {
                    filteredSubcategories.push(subcat);
                    seenSubcategories.add(subcat);
                }
            }
        });

        console.log('📋 Found', filteredSubcategories.length, 'subcategories:', filteredSubcategories);

        res.json({
            success: true,
            subcategories: filteredSubcategories.sort()
        });
    } catch (error) {
        console.error('❌ Error fetching subcategories:', error.message);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch subcategories: ' + error.message 
        });
    }
});

// API endpoint to find matching URL
app.get('/api/find-url', async (req, res) => {
    const { category, gender, ageGroup, subcategory } = req.query;
    
    console.log('🔍 Finding URL for:', { category, gender, ageGroup, subcategory });
    
    try {
        const sheetResult = await getRealSheetData();
        const data = sheetResult.data;

        // Find matching row
        const matchingRow = data.find(row => {
            const rowCategory = row[''] || row.Category;
            const rowGender = row.Gender || row.gender;
            const rowAgeGroup = row['Age Group'] || row.AgeGroup || row.agegroup;
            const rowSubcategory = row.Subcategory || row['Sub Category'] || row.subcategory;
            const rowURL = row.URL || row.Url || row.url;

            return (rowCategory && rowCategory.toString().trim() === category &&
                    rowGender && rowGender.toString().trim() === gender &&
                    rowAgeGroup && rowAgeGroup.toString().trim() === ageGroup &&
                    rowSubcategory && rowSubcategory.toString().trim() === subcategory);
        });

        const url = matchingRow ? (matchingRow.URL || matchingRow.Url || matchingRow.url) : null;

        if (matchingRow && url) {
            res.json({
                success: true,
                url: url,
                found: true
            });
        } else {
            res.json({
                success: true,
                url: null,
                found: false,
                message: 'No matching URL found for the selected criteria'
            });
        }
    } catch (error) {
        console.error('❌ Error finding URL:', error.message);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to find URL: ' + error.message 
        });
    }
});

// Helper function to clean and format scraped data for frontend
function formatScrapedData(rawData) {
    // Helper to clean keys - remove newlines, special characters, and extra spaces
    const cleanKey = (key) => {
        return key
            .replace(/\n/g, ' ')
            .replace(/\u200f|\u200e/g, '') // Remove RTL/LTR marks
            .replace(/\s+/g, ' ')
            .replace(/\s*:\s*$/, '')
            .trim();
    };

    // Helper to clean object keys
    const cleanObjectKeys = (obj) => {
        if (!obj || typeof obj !== 'object') return obj;
        
        const cleaned = {};
        for (let key in obj) {
            const cleanedKey = cleanKey(key);
            cleaned[cleanedKey] = obj[key];
        }
        return cleaned;
    };

    // Format product details as array for easier frontend rendering
    const formatDetailsAsArray = (obj) => {
        if (!obj || typeof obj !== 'object') return [];
        
        return Object.entries(obj)
            .filter(([key, value]) => key && value && key !== 'status')
            .map(([key, value]) => ({
                label: cleanKey(key),
                value: value
            }));
    };

    return {
        success: true,
        product: {
            title: rawData.title || 'N/A',
            description: rawData.description || 'N/A',
            asin: rawData.asin || 'N/A',
            images: rawData.images || []
        },
        details: {
            featureBullets: rawData.bullets || [],
            productDetails: formatDetailsAsArray(rawData.productDetails),
            manufacturingDetails: formatDetailsAsArray(rawData.manufacturingDetails),
            additionalInfo: formatDetailsAsArray(rawData.additionalInfo)
        },
        // Also include cleaned raw format for flexibility
        raw: {
            productDetails: cleanObjectKeys(rawData.productDetails),
            manufacturingDetails: cleanObjectKeys(rawData.manufacturingDetails),
            additionalInfo: cleanObjectKeys(rawData.additionalInfo)
        }
    };
}

// Real Python Scraper Integration
app.post('/api/scrape-product', async (req, res) => {
    const { url } = req.body;
    
    if (!url) {
        return res.status(400).json({ success: false, error: 'URL is required' });
    }

    console.log('🔍 Starting Python scraping for URL:', url);

    try {
        // Try using Python scraper first
        const pythonProcess = spawn('python3', ['scraper.py', url]);
        
        let scrapedData = '';
        let errorOutput = '';

        pythonProcess.stdout.on('data', (data) => {
            scrapedData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
            console.error('Python stderr:', data.toString());
        });

        pythonProcess.on('close', (code) => {
            console.log('Python process exited with code:', code);
            
            if (code === 0 && scrapedData) {
                try {
                    // Parse the JSON output from Python
                    const parsedData = JSON.parse(scrapedData);
                    
                    if (parsedData.success) {
                        console.log('✅ Successfully scraped product data with Python');
                        
                        // Format the data for frontend
                        const formattedData = formatScrapedData(parsedData);
                        
                        res.json(formattedData);
                    } else {
                        console.error('❌ Python scraper returned error:', parsedData.error);
                        // Return error response
                        res.json({
                            success: false,
                            error: parsedData.error || 'Scraping failed',
                            message: 'Unable to scrape product data'
                        });
                    }
                } catch (parseError) {
                    console.error('❌ JSON Parse Error:', parseError.message);
                    res.json({
                        success: false,
                        error: 'Failed to parse scraper response',
                        message: 'Data formatting error'
                    });
                }
            } else {
                console.error('❌ Python process failed with code:', code);
                res.json({
                    success: false,
                    error: 'Python scraper process failed',
                    message: 'Scraper execution error'
                });
            }
        });

    } catch (error) {
        console.error('❌ Scraping error:', error.message);
        res.json({
            success: false,
            error: error.message,
            message: 'Server error during scraping'
        });
    }
});

// API endpoint to get all sheet data
app.get('/api/sheet-data', async (req, res) => {
    try {
        const sheetResult = await getRealSheetData();
        
        res.json({
            success: true,
            data: sheetResult.data,
            headers: sheetResult.headers,
            totalRows: sheetResult.data.length,
            fromCache: sheetResult.fromCache || false
        });
    } catch (error) {
        console.error('❌ Error fetching sheet data:', error.message);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch sheet data: ' + error.message 
        });
    }
});

// API endpoint to get golden sheet data (Page 2)
app.get('/api/golden-sheet-data', async (req, res) => {
    try {
        const sheetResult = await getGoldenSheetData();
        
        res.json({
            success: true,
            data: sheetResult.data,
            headers: sheetResult.headers,
            totalRows: sheetResult.data.length,
            fromCache: sheetResult.fromCache || false
        });
    } catch (error) {
        console.error('❌ Error fetching golden sheet data:', error.message);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch golden sheet data: ' + error.message 
        });
    }
});

// Debug endpoint
app.get('/api/debug-sheet', async (req, res) => {
    try {
        const sheetResult = await getRealSheetData();
        
        const allData = sheetResult.data.map(row => ({
            firstColumn: row[''], // Category column
            gender: row.Gender,
            ageGroup: row['Age Group'],
            subcategory: row.Subcategory,
            url: row.URL,
            raw: row
        }));

        const uniqueValues = {
            categories: [...new Set(allData.map(row => row.firstColumn).filter(Boolean))],
            genders: [...new Set(allData.map(row => row.gender).filter(Boolean))],
            ageGroups: [...new Set(allData.map(row => row.ageGroup).filter(Boolean))],
            subcategories: [...new Set(allData.map(row => row.subcategory).filter(Boolean))]
        };

        res.json({
            success: true,
            totalRows: sheetResult.data.length,
            uniqueValues: uniqueValues,
            sampleData: allData.slice(0, 5),
            rawFirstRow: sheetResult.data[0]
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Failed to debug sheet: ' + error.message 
        });
    }
});

app.post('/api/submit-listing', (req, res) => {
    console.log('📦 Listing submitted:', req.body);
    res.json({ 
        success: true, 
        message: 'Listing submitted successfully',
        submittedData: req.body
    });
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve scraper page
app.get('/scraper', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'scraper.html'));
});

// Serve test page
app.get('/test-sheet', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'simple-test.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Google Sheets integration: ACTIVE`);
    console.log(`🔍 Python Scraper: READY (with mock data fallback)`);
    console.log(`💡 Main App: http://localhost:${PORT}`);
    console.log(`🔧 Scraper UI: http://localhost:${PORT}/scraper`);
    console.log(`🐛 Debug: http://localhost:${PORT}/api/debug-sheet`);
});