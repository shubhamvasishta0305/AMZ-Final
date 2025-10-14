import { useState, useEffect } from 'react';
import { goldStandardProduct } from '../data/mockData';
import { Star, ExternalLink, AlertTriangle } from 'lucide-react';

const GoldStandardPanel = () => {
  const [iframeError, setIframeError] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Set a timeout to show fallback if iframe doesn't load
    const timer = setTimeout(() => {
      setShowFallback(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleIframeError = () => {
    setIframeError(true);
    setShowFallback(true);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />);
      }
    }
    return stars;
  };

  if (showFallback || iframeError) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 h-full">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Gold Standard Product</h3>
            <a
              href={goldStandardProduct.amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
            >
              <span>View on Amazon</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          {iframeError && (
            <div className="mt-2 flex items-center space-x-2 text-amber-600 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Direct Amazon view unavailable - showing mockup</span>
            </div>
          )}
        </div>

        <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100% - 80px)' }}>
          {/* Product Image */}
          <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
            <img
              src={goldStandardProduct.images[0]}
              alt={goldStandardProduct.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-3">
            <h4 className="text-lg font-medium text-gray-900 leading-tight">
              {goldStandardProduct.title}
            </h4>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {renderStars(goldStandardProduct.rating)}
              </div>
              <span className="text-sm text-gray-600">
                {goldStandardProduct.rating} ({goldStandardProduct.reviews.toLocaleString()} reviews)
              </span>
            </div>

            <div className="text-2xl font-bold text-red-600">
              {goldStandardProduct.price}
            </div>

            {/* Key Features */}
            <div className="space-y-2">
              <h5 className="font-medium text-gray-900 text-sm">Key Features:</h5>
              <ul className="space-y-1">
                {goldStandardProduct.keyFeatures.slice(0, 4).map((feature, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Product Details */}
            <div className="space-y-2">
              <h5 className="font-medium text-gray-900 text-sm">Product Details:</h5>
              <div className="grid grid-cols-1 gap-1 text-sm">
                {Object.entries(goldStandardProduct.details).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600 capitalize">{key}:</span>
                    <span className="text-gray-900 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Amazon-like buttons */}
            <div className="space-y-2 pt-2">
              <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 px-4 rounded-lg text-sm">
                Add to Cart
              </button>
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg text-sm">
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Gold Standard Product</h3>
          <a
            href={goldStandardProduct.amazonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
          >
            <span>View on Amazon</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="p-2" style={{ height: 'calc(100% - 80px)' }}>
        <iframe
          src={goldStandardProduct.amazonUrl}
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