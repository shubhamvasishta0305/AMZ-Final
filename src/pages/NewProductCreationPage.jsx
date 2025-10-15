// Page 4b: New Product Creation Page with Form and Gold Standard Reference

import { useState } from 'react';
import { Star, Save, Wand2, Plus, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { goldStandardProduct } from '../data/mockData.js';

const NewProductCreationPage = () => {
  const navigate = useNavigate();

  // Product Title State
  const [productTitle, setProductTitle] = useState('');
  
  // Product Description State
  const [productDescription, setProductDescription] = useState('');
  
  // Product Attributes State
  const [productAttributes, setProductAttributes] = useState({
    brand: '',
    fabric: '',
    sleeves: '',
    fit: '',
    occasion: '',
    neckType: '',
    pattern: '',
    color: ''
  });

  const [showAddAttribute, setShowAddAttribute] = useState(false);
  const [newAttributeKey, setNewAttributeKey] = useState('');
  const [newAttributeValue, setNewAttributeValue] = useState('');

  const handleAttributeChange = (key, value) => {
    setProductAttributes(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddAttribute = () => {
    if (newAttributeKey.trim() && newAttributeValue.trim()) {
      setProductAttributes(prev => ({
        ...prev,
        [newAttributeKey.trim().toLowerCase().replace(/\s+/g, '')]: newAttributeValue.trim()
      }));
      setNewAttributeKey('');
      setNewAttributeValue('');
      setShowAddAttribute(false);
    }
  };

  const handleSaveDraft = () => {
    const formData = {
      title: productTitle,
      description: productDescription,
      ...productAttributes
    };
    console.log('Saving draft:', formData);
    navigate('/compare-images');
  };

  const calculateProgress = () => {
    const allFields = [productTitle, productDescription, ...Object.values(productAttributes)];
    const filledFields = allFields.filter(field => field.trim() !== '').length;
    return { filled: filledFields, total: allFields.length };
  };

  const progress = calculateProgress();
  const isFormComplete = progress.filled === progress.total;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Page Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Product</h1>
          <p className="text-sm text-gray-600">
            Use the Gold Standard as your guide to create an optimized product listing
          </p>
        </div>

        {/* Main Content Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          
          {/* Column Headers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 pb-4 border-b border-gray-200">
            {/* Left Column Header */}
            <div className="flex items-center gap-2">
              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              <h2 className="text-xl font-semibold text-gray-900">Gold Standard Product</h2>
            </div>
            {/* Right Column Header */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Your New Product</h2>
            </div>
          </div>

          {/* Product Title Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Product Title</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Gold Standard Product Title */}
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-300 rounded-lg p-4">
                <div className="bg-white/60 rounded-md p-3 border border-yellow-200">
                  <p className="text-gray-800 text-sm leading-relaxed">
                    {goldStandardProduct.title}
                  </p>
                </div>
              </div>

              {/* Right: Your Product Title Input */}
              <div>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  value={productTitle}
                  onChange={e => setProductTitle(e.target.value)}
                  rows={3}
                  placeholder="Enter your product title..."
                />
                <button
                  className="flex items-center space-x-1 px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm mt-2"
                  onClick={() => setProductTitle(`AI Generated: ${goldStandardProduct.title}`)}
                >
                  <Wand2 className="h-4 w-4" />
                  <span>AI Generate</span>
                </button>
              </div>
            </div>
          </div>

          {/* Product Description Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Product Description</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Gold Standard Description */}
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-300 rounded-lg p-4">
                <div className="bg-white/60 rounded-md p-3 border border-yellow-200">
                  <p className="text-gray-800 text-sm leading-relaxed">
                    {goldStandardProduct.description}
                  </p>
                </div>
              </div>

              {/* Right: Your Product Description Input */}
              <div>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  value={productDescription}
                  onChange={e => setProductDescription(e.target.value)}
                  rows={4}
                  placeholder="Enter your product description..."
                />
                <button
                  className="flex items-center space-x-1 px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm mt-2"
                  onClick={() => setProductDescription(`AI Generated: ${goldStandardProduct.description}`)}
                >
                  <Wand2 className="h-4 w-4" />
                  <span>AI Generate</span>
                </button>
              </div>
            </div>
          </div>

          {/* Product Attributes Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Product Attributes</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Gold Standard Attributes */}
              <div className="space-y-3">
                {Object.entries(goldStandardProduct.details).map(([key, value], index) => (
                  <div key={index} className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-300 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="text-xs font-semibold text-gray-600 min-w-[80px] capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <p className="text-sm font-medium text-gray-800">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right: Your Product Attributes Input */}
              <div className="space-y-3">
                {Object.entries(productAttributes).map(([key, value]) => (
                  <div key={key} className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="text-xs font-semibold text-gray-600 min-w-[80px] capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <input
                        type="text"
                        className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={value}
                        onChange={e => handleAttributeChange(key, e.target.value)}
                        placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}...`}
                      />
                    </div>
                  </div>
                ))}
                
                {/* Add Attribute Button/Form */}
                {showAddAttribute ? (
                  <div className="bg-blue-50 border border-blue-300 rounded-lg p-3">
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Attribute Name (e.g., Material)"
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={newAttributeKey}
                        onChange={e => setNewAttributeKey(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Attribute Value (e.g., Silk)"
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={newAttributeValue}
                        onChange={e => setNewAttributeValue(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button
                          className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                          onClick={handleAddAttribute}
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Add</span>
                        </button>
                        <button
                          className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
                          onClick={() => {
                            setShowAddAttribute(false);
                            setNewAttributeKey('');
                            setNewAttributeValue('');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm w-full justify-center"
                    onClick={() => setShowAddAttribute(true)}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add New Attribute</span>
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Action Bar */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Progress:</span>
              <span className="ml-2">{progress.filled} of {progress.total} fields completed</span>
            </div>
            <button
              onClick={handleSaveDraft}
              disabled={!isFormComplete}
              className={`flex items-center space-x-2 px-6 py-2 rounded-md transition-colors text-sm font-medium ${
                isFormComplete 
                  ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save className="h-4 w-4" />
              <span>Proceed</span>
            </button>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2 text-sm flex items-center gap-2">
            <span>💡</span> Optimization Tips
          </h4>
          <ul className="text-sm text-blue-800 space-y-1.5">
            <li>• Use relevant keywords in your title for better searchability</li>
            <li>• Include specific product details and benefits in the description</li>
            <li>• Fill in all attributes to provide complete product information</li>
            <li>• Reference the gold standard for inspiration on structure and content</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NewProductCreationPage;