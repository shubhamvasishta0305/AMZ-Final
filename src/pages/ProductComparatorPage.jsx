// Page 4a: Product Comparator Page with Editable Features with golden standard reference

import React, { useState, useRef, useLayoutEffect } from 'react';
import { Wand2, Check, Edit2, Eye, ExternalLink, Star, Save, Plus } from 'lucide-react';
import { goldStandardProduct } from '../data/mockData.js';
import { useNavigate } from 'react-router-dom';

// Component for editable attributes (not features - for product details like brand, fabric, etc.)
function AttributeEditableCell({ attributeKey, initialValue, onAccept, isAccepted }) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [acceptedValue, setAcceptedValue] = useState(initialValue);

  const handleAccept = () => {
    setAcceptedValue(value);
    setIsEditing(false);
    onAccept();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold text-gray-600">{attributeKey}</div>
        {isAccepted && (
          <div className="flex items-center text-green-600">
            <Check className="h-4 w-4" />
          </div>
        )}
      </div>
      {isEditing ? (
        <div className="space-y-2">
          <input
            type="text"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={value}
            onChange={e => setValue(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
              onClick={handleAccept}
            >
              <Check className="h-3.5 w-3.5" />
              <span>Accept</span>
            </button>
            <button
              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
              onClick={() => {
                setValue(acceptedValue);
                setIsEditing(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <p className="text-gray-800 text-sm flex-1">{acceptedValue}</p>
          <div className="flex gap-2 flex-shrink-0">
            <button
              className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-3 w-3" />
              <span>Edit</span>
            </button>
            {!isAccepted && (
              <button
                className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs"
                onClick={handleAccept}
              >
                <Check className="h-3 w-3" />
                <span>Accept</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const ProductComparator = () => {
  const navigate = useNavigate();
  
  // Product Title State
  const [productTitle, setProductTitle] = useState('Amazon Brand - Symbol Girl\'s Rayon Ethnic Wear Embroidered Kurta Set with Organza Dupatta');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [acceptedTitle, setAcceptedTitle] = useState('Amazon Brand - Symbol Girl\'s Rayon Ethnic Wear Embroidered Kurta Set with Organza Dupatta');
  const [originalTitle] = useState('Amazon Brand - Symbol Girl\'s Rayon Ethnic Wear Embroidered Kurta Set with Organza Dupatta');
  const titleTextareaRef = useRef(null);

  // Product Description State
  const [productDescription, setProductDescription] = useState('Elegant cotton kurta perfect for everyday wear and special occasions. Made from premium quality cotton fabric with comfortable straight fit.');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [acceptedDescription, setAcceptedDescription] = useState('Elegant cotton kurta perfect for everyday wear and special occasions. Made from premium quality cotton fabric with comfortable straight fit.');
  const [originalDescription] = useState('Elegant cotton kurta perfect for everyday wear and special occasions. Made from premium quality cotton fabric with comfortable straight fit.');
  const descTextareaRef = useRef(null);

  // Product Attributes State (details like brand, fabric, etc.)
  const [productAttributes, setProductAttributes] = useState([
    { id: 1, key: 'Brand', value: 'BIBA', accepted: false },
    { id: 2, key: 'Fabric', value: '100% Cotton', accepted: false },
    { id: 3, key: 'Sleeves', value: 'Short Sleeves', accepted: false },
    { id: 4, key: 'Fit', value: 'Straight', accepted: false },
    { id: 5, key: 'Occasion', value: 'Casual, Festive', accepted: false },
    { id: 6, key: 'Neck Type', value: 'Round Neck', accepted: false },
    { id: 7, key: 'Pattern', value: 'Solid', accepted: false },
    { id: 8, key: 'Color', value: 'Blue', accepted: false }
  ]);

  const [showAddAttribute, setShowAddAttribute] = useState(false);
  const [newAttributeKey, setNewAttributeKey] = useState('');
  const [newAttributeValue, setNewAttributeValue] = useState('');

  // Check if all attributes are accepted
  const allAttributesAccepted = productAttributes.every(attr => attr.accepted);

  useLayoutEffect(() => {
    if (titleTextareaRef.current) {
      titleTextareaRef.current.style.height = 'auto';
      titleTextareaRef.current.style.height = titleTextareaRef.current.scrollHeight + 'px';
    }
  }, [productTitle]);

  useLayoutEffect(() => {
    if (descTextareaRef.current) {
      descTextareaRef.current.style.height = 'auto';
      descTextareaRef.current.style.height = descTextareaRef.current.scrollHeight + 'px';
    }
  }, [productDescription]);

  // Title Handlers
  const handleAcceptTitle = () => {
    setAcceptedTitle(productTitle);
    setIsEditingTitle(false);
  };

  const handleCancelTitle = () => {
    setProductTitle(acceptedTitle);
    setIsEditingTitle(false);
  };

  const handleAIGenerateTitle = () => {
    setProductTitle(`AI Enhanced: ${originalTitle}`);
    setIsEditingTitle(true);
  };

  // Description Handlers
  const handleAcceptDescription = () => {
    setAcceptedDescription(productDescription);
    setIsEditingDescription(false);
  };

  const handleCancelDescription = () => {
    setProductDescription(acceptedDescription);
    setIsEditingDescription(false);
  };

  const handleAIGenerateDescription = () => {
    setProductDescription(`AI Enhanced: ${originalDescription}`);
    setIsEditingDescription(true);
  };

  // Attribute Handlers
  const handleAddAttribute = () => {
    if (newAttributeKey.trim() && newAttributeValue.trim()) {
      const newAttr = {
        id: Date.now(),
        key: newAttributeKey.trim(),
        value: newAttributeValue.trim(),
        accepted: false
      };
      setProductAttributes([...productAttributes, newAttr]);
      setNewAttributeKey('');
      setNewAttributeValue('');
      setShowAddAttribute(false);
    }
  };

  const handleAcceptAttribute = (attrId) => {
    setProductAttributes(prev => 
      prev.map(attr => 
        attr.id === attrId ? { ...attr, accepted: true } : attr
      )
    );
  };

  const handleProceed = () => {
    if (allAttributesAccepted) {
      // Console log all the product data
      const productData = {
        title: acceptedTitle,
        description: acceptedDescription,
        attributes: productAttributes.map(attr => ({
          key: attr.key,
          value: attr.value,
          accepted: attr.accepted
        }))
      };
      console.log('Product Data:', productData);
      navigate('/compare-images');
    }
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
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Page Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Comparison & Editing</h1>
          <p className="text-sm text-gray-600">
            Compare your product against the Gold Standard and enhance your listing with AI-powered suggestions
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
              <h2 className="text-xl font-semibold text-gray-900">Your Product</h2>
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

              {/* Right: Your Product Title (Editable) */}
              <div>
                {isEditingTitle ? (
                  <div className="space-y-3">
                    <textarea
                      ref={titleTextareaRef}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      value={productTitle}
                      onChange={e => setProductTitle(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                        onClick={handleAcceptTitle}
                      >
                        <Check className="h-4 w-4" />
                        <span>Accept</span>
                      </button>
                      <button
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
                        onClick={handleCancelTitle}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 min-h-[60px]">
                      {acceptedTitle}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition-colors text-sm"
                        onClick={() => setProductTitle(originalTitle)}
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Original</span>
                      </button>
                      <button
                        className="flex items-center space-x-1 px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
                        onClick={handleAIGenerateTitle}
                      >
                        <Wand2 className="h-4 w-4" />
                        <span>AI Generate</span>
                      </button>
                      <button
                        className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        onClick={() => setIsEditingTitle(true)}
                      >
                        <Edit2 className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                )}
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

              {/* Right: Your Product Description (Editable) */}
              <div>
                {isEditingDescription ? (
                  <div className="space-y-3">
                    <textarea
                      ref={descTextareaRef}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      value={productDescription}
                      onChange={e => setProductDescription(e.target.value)}
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <button
                        className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                        onClick={handleAcceptDescription}
                      >
                        <Check className="h-4 w-4" />
                        <span>Accept</span>
                      </button>
                      <button
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
                        onClick={handleCancelDescription}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 min-h-[80px]">
                      {acceptedDescription}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition-colors text-sm"
                        onClick={() => setProductDescription(originalDescription)}
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Original</span>
                      </button>
                      <button
                        className="flex items-center space-x-1 px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
                        onClick={handleAIGenerateDescription}
                      >
                        <Wand2 className="h-4 w-4" />
                        <span>AI Generate</span>
                      </button>
                      <button
                        className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        onClick={() => setIsEditingDescription(true)}
                      >
                        <Edit2 className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                )}
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
                    <div className="text-xs font-semibold text-gray-600 mb-2 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <p className="text-sm font-medium text-gray-800">{value}</p>
                  </div>
                ))}
              </div>

              {/* Right: Your Product Attributes (Editable) */}
              <div className="space-y-3">
                {productAttributes.map((attr) => (
                  <AttributeEditableCell
                    key={attr.id}
                    attributeKey={attr.key}
                    initialValue={attr.value}
                    onAccept={() => handleAcceptAttribute(attr.id)}
                    isAccepted={attr.accepted}
                  />
                ))}
                
                {/* Add Attribute Button/Form */}
                {showAddAttribute ? (
                  <div className="bg-blue-50 border border-blue-300 rounded-lg p-3">
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Attribute Name (e.g., Brand)"
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={newAttributeKey}
                        onChange={e => setNewAttributeKey(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Attribute Value (e.g., BIBA)"
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
                    <span>Add Attribute</span>
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
              {allAttributesAccepted ? (
                <>
                  <span className="font-medium text-green-600">All attributes accepted!</span>
                  <span className="ml-2">Ready to proceed to image comparison.</span>
                </>
              ) : (
                <>
                  <span className="font-medium">Please accept all attributes to proceed</span>
                  <span className="ml-2">
                    ({productAttributes.filter(attr => attr.accepted).length} of {productAttributes.length} accepted)
                  </span>
                </>
              )}
            </div>
            <button
              className={`flex items-center space-x-2 px-6 py-2 rounded-md transition-colors text-sm font-medium ${
                allAttributesAccepted
                  ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              onClick={handleProceed}
              disabled={!allAttributesAccepted}
            >
              <span>Proceed</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductComparator;
