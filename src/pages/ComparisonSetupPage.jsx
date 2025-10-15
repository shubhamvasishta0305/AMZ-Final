import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GoldStandardPanel from '../components/GoldStandardPanel';
import { filterOptions, goldStandardProduct } from '../data/mockData';
import { Edit3, Plus, ChevronDown, Link, Loader2, AlertCircle } from 'lucide-react';

const ComparisonSetupPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loadedProduct, setLoadedProduct] = useState(null);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: 'All Categories',
    priceRange: 'All Prices',
    rating: 'All Ratings',
    availability: 'All'
  });

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleLoadUrl = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Based on selected filters, determine which product/URL to load
      // This logic will be expanded later to handle different filter combinations
      console.log('Loading product based on filters:', filters);

      // For now, load the mock gold standard product
      // Later this will be replaced with actual filter-based product selection
      setLoadedProduct(goldStandardProduct);

    } catch (err) {
      setError(err.message || 'Failed to load product data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditExisting = () => {
    navigate('/edit-product/B08N5V3T8W');
  };

  const handleCreateNew = () => {
    navigate('/new-product');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(filterOptions).map(([filterType, options]) => (
              <div key={filterType} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {filterType.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <div className="relative">
                  <select
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
                    value={filters[filterType]}
                    onChange={(e) => handleFilterChange(filterType, e.target.value)}
                  >
                    {options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Load URL Button */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
          <div className="space-y-4">

            <div className="flex items-center justify-center">

              <button
                onClick={handleLoadUrl}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <Link className="h-4 w-4" />
                    <span>Load URL</span>
                  </>
                )}
              </button>
            </div>



            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* {loadedProduct && (
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
                <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                <span className="text-sm font-medium">Product loaded successfully: {loadedProduct.title}</span>
              </div>
            )} */}
          </div>
        </div>

        {/* Main Content - Gold Standard Panel (Full Width) - Only show when product is loaded */}
        {loadedProduct && (
          <>
            <div className="space-y-6 mb-8">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Gold Standard</h2>
                <p className="text-gray-600 text-sm">
                  Reference product that serves as the benchmark for optimization
                </p>
              </div>
              <div className="h-[600px] ring-4 ring-yellow-400 ring-opacity-50 rounded-lg">
                <div className="h-full bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-2">
                  <div className="h-full bg-white rounded-md shadow-lg">
                    <GoldStandardPanel />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Panel (Below Gold Standard) */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={handleEditExisting}
                    disabled={!loadedProduct}
                    className={`px-6 py-2 rounded-md transition-colors font-medium flex items-center space-x-2 ${loadedProduct
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit Existing Product</span>
                  </button>

                  <button
                    onClick={handleCreateNew}
                    disabled={!loadedProduct}
                    className={`px-6 py-2 rounded-md transition-colors font-medium flex items-center space-x-2 ${loadedProduct
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create New Product Listing</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ComparisonSetupPage;