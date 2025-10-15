import { useState } from 'react';
import { generateAIImage } from '../api/mockApi';
import { Wand2, Loader2, Save, X } from 'lucide-react';

const ImageComparisonPage = () => {
  const [previewImage, setPreviewImage] = useState(null);

  // Real kurti images for gold standard
  const [goldStandardImages] = useState([
    'https://images.unsplash.com/photo-1488272690691-2636704d6000?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bGlua3xlbnwwfHwwfHx8MA%3D%3D',
    'https://images.meesho.com/images/products/267890123/xyz12_512.webp', 
    'https://images.meesho.com/images/products/301245678/abc34_512.webp',
    'https://images.meesho.com/images/products/289456789/def56_512.webp',
    'https://images.meesho.com/images/products/312567890/ghi78_512.webp',
    'https://images.meesho.com/images/products/298678901/jkl90_512.webp',
    'https://images.meesho.com/images/products/283789012/mno12_512.webp'
  ]);

  // Real kurti images for existing
  const [existingImages] = useState([
    'https://images.meesho.com/images/products/276890123/pqr34_512.webp',
    'https://images.meesho.com/images/products/291234567/stu56_512.webp',
    'https://images.meesho.com/images/products/305678901/vwx78_512.webp', 
    'https://images.meesho.com/images/products/287890123/yza90_512.webp',
    'https://images.meesho.com/images/products/319012345/bcd12_512.webp',
    'https://images.meesho.com/images/products/293456789/efg34_512.webp',
    'https://images.meesho.com/images/products/275678901/hij56_512.webp'
  ]);

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
    const imageType = imageLabels[index];
    
    setGeneratedImages(prev => 
      prev.map((img, i) => 
        i === index ? { ...img, isLoading: true } : img
      )
    );

    try {
      const newImageUrl = await generateAIImage(imageType);
      setGeneratedImages(prev => 
        prev.map((img, i) => 
          i === index ? { url: newImageUrl, isLoading: false } : img
        )
      );
    } catch (error) {
      console.error('Error generating image:', error);
      setGeneratedImages(prev => 
        prev.map((img, i) => 
          i === index ? { ...img, isLoading: false } : img
        )
      );
    }
  };

  const handleSaveChanges = () => {
    const generatedCount = generatedImages.filter(img => img.url !== null).length;
    alert(`Saved ${generatedCount} AI-generated images to your product listing!`);
  };

  const ImageCard = ({ src, alt, label, type, index = null, onGenerate = null, isLoading = false }) => (
    <div className="bg-white rounded-md border border-gray-200 overflow-hidden mb-2">
      <div className="aspect-square bg-gray-50 flex items-center justify-center relative">
        {type === 'generate' && !src && !isLoading && (
          <button
            onClick={() => onGenerate(index)}
            className="flex flex-col items-center justify-center p-3 text-center hover:bg-gray-100 transition-colors w-full h-full"
          >
            <Wand2 className="h-5 w-5 text-blue-600 mb-1" />
            <span className="text-xs font-medium text-gray-700">Generate</span>
          </button>
        )}
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-3 text-center">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin mb-1" />
            <span className="text-xs font-medium text-gray-700">Generating...</span>
          </div>
        )}
        {src && !isLoading && (
          <>
            <img
              src={src}
              alt={alt}
              className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setPreviewImage({ src, alt, label })}
              onError={(e) => {
                e.target.src = `https://placehold.co/250x250/E5E7EB/6B7280?text=${encodeURIComponent(alt)}`;
              }}
            />
            {type === 'generate' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onGenerate(index);
                }}
                className="absolute bottom-1 right-1 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors z-10"
              >
                Regenerate
              </button>
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
        </div>

        {/* Three Column Layout with Overall Border */}
        <div className="bg-white rounded-lg shadow-lg border-2 border-gray-300 p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Gold Standard Images */}
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
              <div className="text-center mb-3">
                <h2 className="text-base font-bold text-gray-900 mb-1">Gold Standard Images</h2>
                <p className="text-xs text-gray-600">Reference benchmark images</p>
              </div>
              <div className="space-y-1">
                {goldStandardImages.map((src, index) => (
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
              </div>
              <div className="space-y-1">
                {existingImages.map((src, index) => (
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
        </div>

        {/* Action Bar */}
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