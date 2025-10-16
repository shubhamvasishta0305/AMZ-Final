import { useState, useEffect } from 'react';
import { ExternalLink, Package, Info, FileText, Building2, AlertTriangle } from 'lucide-react';

const GoldStandardPanel = ({ product = {} }) => {
  const [iframeError, setIframeError] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Reset error states when product changes
    setIframeError(false);
    setShowFallback(false);
    
    // Set a timeout to show fallback if iframe doesn't load
    const timer = setTimeout(() => {
      setShowFallback(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [product]);

  const handleIframeError = () => {
    setIframeError(true);
    setShowFallback(true);
  };

  // Helper to check if data exists and has content
  const hasData = (data) => {
    if (!data) return false;
    if (Array.isArray(data)) return data.length > 0;
    if (typeof data === 'object') return Object.keys(data).length > 0;
    return true;
  };

  if (showFallback || iframeError) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Gold Standard Product</h3>
            {product.amazonUrl && (
              <a
                href={product.amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
              >
                <span>View on Amazon</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">

          {/* Basic Product Info */}
          <div className="space-y-3">
            {/* Title */}
            {product.title && (
              <h4 className="text-lg font-semibold text-gray-900 leading-tight">
                {product.title}
              </h4>
            )}

            {/* ASIN and Brand */}
            <div className="flex flex-wrap gap-3 text-sm">
              {product.asin && product.asin !== 'N/A' && (
                <div className="bg-blue-50 px-3 py-1 rounded-full">
                  <span className="text-gray-600">ASIN:</span>{' '}
                  <span className="font-medium text-gray-900">{product.asin}</span>
                </div>
              )}
              {product.brand && (
                <div className="bg-purple-50 px-3 py-1 rounded-full">
                  <span className="text-gray-600">Brand:</span>{' '}
                  <span className="font-medium text-gray-900">{product.brand}</span>
                </div>
              )}
            </div>

            {/* Sheet Metadata */}
            {(product.category || product.gender || product.ageGroup || product.subcategory) && (
              <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 p-3 rounded-lg">
                {product.category && (
                  <div>
                    <span className="text-gray-600">Category:</span>{' '}
                    <span className="font-medium text-gray-900">{product.category}</span>
                  </div>
                )}
                {product.gender && (
                  <div>
                    <span className="text-gray-600">Gender:</span>{' '}
                    <span className="font-medium text-gray-900">{product.gender}</span>
                  </div>
                )}
                {product.ageGroup && (
                  <div>
                    <span className="text-gray-600">Age Group:</span>{' '}
                    <span className="font-medium text-gray-900">{product.ageGroup}</span>
                  </div>
                )}
                {product.subcategory && (
                  <div>
                    <span className="text-gray-600">Subcategory:</span>{' '}
                    <span className="font-medium text-gray-900">{product.subcategory}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-700">
                <FileText className="h-4 w-4" />
                <h5 className="font-semibold text-sm">Product Description</h5>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg">
                {product.description}
              </p>
            </div>
          )}

          {/* Feature Bullets */}
          {hasData(product.features) && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-700">
                <Package className="h-4 w-4" />
                <h5 className="font-semibold text-sm">Key Features</h5>
              </div>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start bg-green-50 p-2 rounded">
                    <span className="text-green-600 mr-2 font-bold">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Product Details Section */}
          {hasData(product.productDetailsArray) && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-700">
                <Info className="h-4 w-4" />
                <h5 className="font-semibold text-sm">Product Details</h5>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                {product.productDetailsArray.map((detail, index) => (
                  <div key={index} className="flex justify-between text-sm border-b border-blue-100 pb-2 last:border-0">
                    <span className="text-gray-600 font-medium">{detail.label}</span>
                    <span className="text-gray-900 text-right flex-1 ml-2">{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Manufacturing Details Section */}
          {hasData(product.manufacturingDetailsArray) && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-700">
                <Building2 className="h-4 w-4" />
                <h5 className="font-semibold text-sm">Manufacturing Details</h5>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 space-y-2">
                {product.manufacturingDetailsArray.map((detail, index) => (
                  <div key={index} className="flex justify-between text-sm border-b border-amber-100 pb-2 last:border-0">
                    <span className="text-gray-600 font-medium">{detail.label}</span>
                    <span className="text-gray-900 text-right flex-1 ml-2">{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Info Section */}
          {hasData(product.additionalInfoArray) && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-700">
                <Info className="h-4 w-4" />
                <h5 className="font-semibold text-sm">Additional Information</h5>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 space-y-2">
                {product.additionalInfoArray.map((detail, index) => (
                  <div key={index} className="flex justify-between text-sm border-b border-purple-100 pb-2 last:border-0">
                    <span className="text-gray-600 font-medium">{detail.label}:</span>
                    <span className="text-gray-900 text-right flex-1 ml-2">{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Data Warning */}
          {!product.description && 
           !hasData(product.features) && 
           !hasData(product.productDetailsArray) && 
           !hasData(product.manufacturingDetailsArray) && 
           !hasData(product.additionalInfoArray) && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertTriangle className="h-12 w-12 text-amber-400 mb-3" />
              <p className="text-gray-600 font-medium">No detailed product information available</p>
              <p className="text-sm text-gray-500 mt-1">The web scraping may have failed or the product page structure is different</p>
            </div>
          )}

        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Gold Standard Product</h3>
          {product.amazonUrl && (
            <a
              href={product.amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
            >
              <span>View on Amazon</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      <div className="p-2" style={{ height: 'calc(100% - 80px)' }}>
        <iframe
          src={product.amazonUrl}
          className="w-full h-full border-0 rounded"
          onError={handleIframeError}
          onLoad={(e) => {
            // Check if iframe loaded successfully
            try {
              e.target.contentWindow.location.href;
            } catch (error) {
              handleIframeError();
            }
          }}
          title="Amazon Product Page"
        />
      </div>
    </div>
  );
};

export default GoldStandardPanel;