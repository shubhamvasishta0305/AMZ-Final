// Page 5: Image Comparison and AI Generation Page

import { useState, useEffect } from 'react';
import { generateAIImage } from '../api/api';
import { Wand2, Loader2, Save, X, Upload, Download, Link } from 'lucide-react';

const ImageComparisonPage = () => {
  const [previewImage, setPreviewImage] = useState(null);
  const [referenceImage, setReferenceImage] = useState(null);
  const [referenceFile, setReferenceFile] = useState(null);
  const [productAttributes, setProductAttributes] = useState({});
  const [goldStandardProduct, setGoldStandardProduct] = useState(null);
  const [existingProduct, setExistingProduct] = useState(null);

  // Load product data from localStorage on component mount
  useEffect(() => {
    // Load product attributes/filters
    const storedFilters = localStorage.getItem('productFilters');
    if (storedFilters) {
      try {
        const filters = JSON.parse(storedFilters);
        setProductAttributes(filters);
        console.log('✅ Loaded product attributes from localStorage:', filters);
      } catch (error) {
        console.error('Error parsing stored filters:', error);
      }
    }

    // Load gold standard product
    const storedGoldStandard = localStorage.getItem('goldStandardProduct');
    if (storedGoldStandard) {
      try {
        const goldProduct = JSON.parse(storedGoldStandard);
        setGoldStandardProduct(goldProduct);
        console.log('✅ Loaded gold standard product from localStorage:', goldProduct);
      } catch (error) {
        console.error('Error parsing stored gold standard product:', error);
      }
    }

    // Load existing product
    const storedExisting = localStorage.getItem('existingProduct');
    if (storedExisting) {
      try {
        const existing = JSON.parse(storedExisting);
        setExistingProduct(existing);
        console.log('✅ Loaded existing product from localStorage:', existing);
      } catch (error) {
        console.error('Error parsing stored existing product:', error);
      }
    }
  }, []);

  // Get images from loaded products (up to 7 images each)
  const getGoldStandardImages = () => {
    const emptyArray = Array(7).fill(null);
    
    if (goldStandardProduct && goldStandardProduct.images && goldStandardProduct.images.length > 0) {
      // Filter out duplicates by using Set with image URLs
      const uniqueImages = [...new Set(goldStandardProduct.images)];
      const images = uniqueImages.slice(0, 7);
      
      console.log('📸 Gold Standard - Total images:', goldStandardProduct.images.length, 'Unique images:', uniqueImages.length);
      
      // Pad with null if less than 7
      while (images.length < 7) {
        images.push(null);
      }
      return images;
    }
    
    console.log('⚠️ No gold standard images found, returning empty array');
    return emptyArray; // Return empty array if no images
  };

  const getExistingImages = () => {
    const emptyArray = Array(7).fill(null);
    
    if (existingProduct && existingProduct.images && existingProduct.images.length > 0) {
      // Filter out duplicates by using Set with image URLs
      const uniqueImages = [...new Set(existingProduct.images)];
      const images = uniqueImages.slice(0, 7);
      
      console.log('📸 Existing Product - Total images:', existingProduct.images.length, 'Unique images:', uniqueImages.length);
      
      // Pad with null if less than 7
      while (images.length < 7) {
        images.push(null);
      }
      return images;
    }
    
    console.log('⚠️ No existing product images found, returning empty array');
    return emptyArray; // Return empty array if no images
  };

  const [generatedImages, setGeneratedImages] = useState(
    Array(7).fill(null).map(() => ({ url: null, isLoading: false }))
  );

  const imageLabels = [
    'Main Product',
    'Front View',
    'Back View', 
    'Side View',
    'Detail Shot 1',
    'Detail Shot 2',
    'Lifestyle'
  ];

  const handleGenerateImage = async (index) => {
    if (!referenceFile) {
      alert('Please upload a reference image first!');
      return;
    }

    // Check if style index is not yet implemented on backend (indices 5 and 6)
    if (index >= 5) {
      alert('🚧 This image style is coming soon! Currently in development. Stay tuned! 🎨');
      return;
    }

    const imageType = imageLabels[index];
    // Use index as style_index (0-6 for the 7 image slots)
    const styleIndex = index;
    
    // Normalize attribute keys to match prompt template placeholders
    // Convert filter keys like "Subcategory" -> "SubCategory", "Age Group" -> "AgeGroup"
    const normalizedAttributes = {};
    Object.entries(productAttributes).forEach(([key, value]) => {
      // Handle specific key mappings
      if (key === 'Subcategory') {
        normalizedAttributes['SubCategory'] = value;
      } else if (key === 'Age Group') {
        normalizedAttributes['AgeGroup'] = value;
      } else {
        // Keep other keys as-is (Gender, Category, etc.)
        normalizedAttributes[key] = value;
      }
    });
    
    console.log('🎨 Generating image with attributes:', normalizedAttributes);
    
    setGeneratedImages(prev => 
      prev.map((img, i) => 
        i === index ? { ...img, isLoading: true } : img
      )
    );

    try {
      // Call the real API with reference image file, style index, and attributes
      const newImageUrl = await generateAIImage(referenceFile, styleIndex, normalizedAttributes);
      setGeneratedImages(prev => 
        prev.map((img, i) => 
          i === index ? { url: newImageUrl, isLoading: false } : img
        )
      );
    } catch (error) {
      console.error('Error generating image:', error);
      
      // Provide more helpful error messages
      let errorMessage = error.message;
      if (errorMessage.includes('No image returned from model')) {
        errorMessage = 'The AI model could not generate this image. This might be due to content safety filters or prompt issues. Please try a different style or image.';
      } else if (errorMessage.includes('style_index out of range')) {
        errorMessage = 'This image style is not yet available. Please try another style.';
      } else if (errorMessage.includes('safety filters')) {
        errorMessage = 'Content generation was blocked by safety filters. Please try a different reference image or style.';
      }
      
      alert(`Failed to generate image: ${errorMessage}`);
      setGeneratedImages(prev => 
        prev.map((img, i) => 
          i === index ? { ...img, isLoading: false } : img
        )
      );
    }
  };

  const handleReferenceImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setReferenceFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setReferenceImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveReferenceImage = () => {
    setReferenceImage(null);
    setReferenceFile(null);
  };

  const handleDownloadImage = (imageUrl, imageName) => {
    try {
      // Create a temporary link element and trigger download
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${imageName.replace(/\s+/g, '_')}.png`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  const handleCopyImageLink = (imageUrl) => {
    navigator.clipboard.writeText(imageUrl).then(() => {
      alert('Image link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy link:', err);
      alert('Failed to copy link. Please try again.');
    });
  };

  const handleSaveChanges = () => {
    const generatedCount = generatedImages.filter(img => img.url !== null).length;
    alert(`Saved ${generatedCount} AI-generated images to your product listing!`);
  };

  const ImageCard = ({ src, alt, label, type, index = null, onGenerate = null, isLoading = false }) => (
    <div className="bg-white rounded-md border border-gray-200 overflow-hidden mb-2">
      <div className="aspect-square bg-gray-50 flex items-center justify-center relative">
        {/* For reference/current types with no image */}
        {(type === 'reference' || type === 'current') && !src && (
          <div className="flex flex-col items-center justify-center p-3 text-center">
            <div className="text-gray-400 text-xs">No image</div>
          </div>
        )}
        
        {/* For generate type - show generate button when no image */}
        {type === 'generate' && !src && !isLoading && (
          <button
            onClick={() => onGenerate(index)}
            className="flex flex-col items-center justify-center p-3 text-center hover:bg-gray-100 transition-colors w-full h-full"
          >
            <Wand2 className="h-5 w-5 text-blue-600 mb-1" />
            <span className="text-xs font-medium text-gray-700">Generate</span>
          </button>
        )}
        
        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-3 text-center">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin mb-1" />
            <span className="text-xs font-medium text-gray-700">Generating...</span>
          </div>
        )}
        
        {/* Show image when available */}
        {src && !isLoading && (
          <>
            <img
              src={src}
              alt={alt}
              className="w-full h-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setPreviewImage({ src, alt, label })}
              onError={(e) => {
                console.error('Image load error for:', src);
                e.target.src = `https://placehold.co/250x250/E5E7EB/6B7280?text=${encodeURIComponent(alt)}`;
              }}
            />
            {type === 'generate' && (
              <div className="absolute bottom-1 left-1 right-1 flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onGenerate(index);
                  }}
                  className="flex-1 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors z-10"
                  title="Regenerate Image"
                >
                  Regenerate
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadImage(src, label);
                  }}
                  className="bg-green-600 text-white p-1 rounded text-xs hover:bg-green-700 transition-colors z-10"
                  title="Download Image"
                >
                  <Download className="h-3 w-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyImageLink(src);
                  }}
                  className="bg-purple-600 text-white p-1 rounded text-xs hover:bg-purple-700 transition-colors z-10"
                  title="Copy Image Link"
                >
                  <Link className="h-3 w-3" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <div className="p-2">
        <h4 className="text-xs font-medium text-gray-900 text-center">{label}</h4>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden border-4 border-blue-500 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <h3 className="text-lg font-semibold text-gray-900">{previewImage.label}</h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-all duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 bg-gray-50">
              <img
                src={previewImage.src}
                alt={previewImage.alt}
                className="w-full h-auto max-h-[65vh] object-contain rounded-lg shadow-md"
                onError={(e) => {
                  e.target.src = `https://placehold.co/800x800/E5E7EB/6B7280?text=${encodeURIComponent(previewImage.alt)}`;
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Image Comparison & Generation</h1>
          <p className="text-sm text-gray-600">
            Compare your current images against the Gold Standard and generate new AI-powered alternatives for each slot.
          </p>
          {Object.keys(productAttributes).length > 0 && (
            <div className="mt-2 inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full text-xs">
              <span className="font-medium text-blue-900">Using attributes:</span>
              {Object.entries(productAttributes).map(([key, value]) => (
                <span key={key} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  {key}: {value}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Reference Image Upload Section */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-md border-2 border-purple-300 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-900 mb-1">Reference Image for AI Generation</h3>
              <p className="text-xs text-gray-600">Upload a reference image to guide the AI generation process</p>
            </div>
            
            {!referenceImage ? (
              <label className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 cursor-pointer transition-colors text-sm">
                <Upload className="h-4 w-4" />
                <span>Upload Reference</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReferenceImageUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={referenceImage}
                    alt="Reference"
                    className="w-20 h-20 object-cover rounded-lg border-2 border-purple-400 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setPreviewImage({ src: referenceImage, alt: 'Reference Image', label: 'Reference Image' })}
                  />
                  <button
                    onClick={handleRemoveReferenceImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <label className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 cursor-pointer transition-colors text-sm">
                  <Upload className="h-4 w-4" />
                  <span>Change</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleReferenceImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

          {/* Three Column Layout with Overall Border */}
        <div className="bg-white rounded-lg shadow-lg border-2 border-gray-300 p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Gold Standard Images */}
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
              <div className="text-center mb-3">
                <h2 className="text-base font-bold text-gray-900 mb-1">Gold Standard Images</h2>
                <p className="text-xs text-gray-600">Reference benchmark images</p>
                {/* {goldStandardProduct && (
                  <p className="text-xs text-blue-600 mt-1 font-medium truncate" title={goldStandardProduct.title}>
                    {goldStandardProduct.title}
                  </p>
                )} */}
              </div>
              <div className="space-y-1">
                {getGoldStandardImages().map((src, index) => (
                  <ImageCard
                    key={`gold-${index}`}
                    src={src}
                    alt={`Gold standard ${imageLabels[index]}`}
                    label={imageLabels[index]}
                    type="reference"
                  />
                ))}
              </div>
            </div>

            {/* Your Existing Images */}
            <div className="border-2 border-gray-300 rounded-lg p-3">
              <div className="text-center mb-3">
                <h2 className="text-base font-bold text-gray-900 mb-1">Your Existing Images</h2>
                <p className="text-xs text-gray-600">Current product images</p>
                {/* {existingProduct && (
                  <p className="text-xs text-green-600 mt-1 font-medium truncate" title={existingProduct.title}>
                    {existingProduct.title}
                  </p>
                )} */}
              </div>
              <div className="space-y-1">
                {getExistingImages().map((src, index) => (
                  <ImageCard
                    key={`existing-${index}`}
                    src={src}
                    alt={`Current ${imageLabels[index]}`}
                    label={imageLabels[index]}
                    type="current"
                  />
                ))}
              </div>
            </div>

            {/* AI Generated Images */}
            <div className="border-2 border-blue-300 rounded-lg p-3">
              <div className="text-center mb-3">
                <h2 className="text-base font-bold text-gray-900 mb-1">AI Generated Images</h2>
                <p className="text-xs text-gray-600">Create optimized alternatives</p>
              </div>
              <div className="space-y-1">
                {generatedImages.map((imgData, index) => (
                  <ImageCard
                    key={`generated-${index}`}
                    src={imgData.url}
                    alt={`AI generated ${imageLabels[index]}`}
                    label={imageLabels[index]}
                    type="generate"
                    index={index}
                    onGenerate={handleGenerateImage}
                    isLoading={imgData.isLoading}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>        {/* Action Bar */}
        <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">
              <span className="font-medium">Generated Images:</span>
              <span className="ml-2">
                {generatedImages.filter(img => img.url !== null).length} of {generatedImages.length} completed
              </span>
            </div>
            <button
              onClick={handleSaveChanges}
              disabled={generatedImages.filter(img => img.url !== null).length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageComparisonPage;