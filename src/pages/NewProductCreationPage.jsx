import { useState } from 'react';
import GoldStandardPanel from '../components/GoldStandardPanel';
import { Link, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NewProductCreationPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    category: '',
    price: '',
    description: '',
    keyFeatures: '',
    fabric: '',
    color: '',
    size: '',
    occasion: '',
    careInstructions: '',
    countryOfOrigin: 'India'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const navigate = useNavigate();

  const handleSaveDraft = () => {
    navigate(`/compare-images/NEW_PRODUCT_ID`);

    
    // console.log('Saving draft:', formData);

    // Mock save functionality
    // alert('Draft saved successfully!');
  };

  const formFields = [
    { key: 'title', label: 'Product Title', type: 'textarea', rows: 3, required: true, placeholder: 'Enter a compelling product title...' },
    { key: 'brand', label: 'Brand', type: 'input', required: true, placeholder: 'e.g., BIBA, Nike, Samsung...' },
    { key: 'category', label: 'Category', type: 'select', required: true, options: ['', 'Clothing', 'Electronics', 'Books', 'Beauty', 'Kitchen', 'Sports', 'Home'] },
    { key: 'price', label: 'Price (₹)', type: 'number', required: true, placeholder: '0.00' },
    { key: 'description', label: 'Product Description', type: 'textarea', rows: 4, required: true, placeholder: 'Describe your product in detail...' },
    { key: 'keyFeatures', label: 'Key Features', type: 'textarea', rows: 4, required: true, placeholder: 'List key features, one per line...' },
    { key: 'fabric', label: 'Fabric/Material', type: 'input', placeholder: 'e.g., 100% Cotton, Stainless Steel...' },
    { key: 'color', label: 'Color', type: 'input', placeholder: 'e.g., Blue, Black, Multi-color...' },
    { key: 'size', label: 'Size/Dimensions', type: 'input', placeholder: 'e.g., XL, 15.6 inch, 1L...' },
    { key: 'occasion', label: 'Occasion/Use Case', type: 'input', placeholder: 'e.g., Casual, Festive, Professional...' },
    { key: 'careInstructions', label: 'Care Instructions', type: 'textarea', rows: 2, placeholder: 'e.g., Machine wash, Hand wash only...' },
    { key: 'countryOfOrigin', label: 'Country of Origin', type: 'input', required: true }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Panel - Gold Standard Reference */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Gold Standard Reference</h2>
              <p className="text-gray-600 text-sm">
                Use this high-performing product as your guide for creating an optimized listing
              </p>
            </div>
            <div className="sticky top-6">
              <div className="h-[600px]">
                {/* <GoldStandardPanel /> */}
              </div>
            </div>
          </div>

          {/* Right Panel - New Product Form */}
          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Create New Product</h1>
              <p className="text-gray-600 mt-1 text-sm">
                Build a new product listing from scratch using best practices
              </p>
            </div>

            {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <form className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {formFields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {field.type === 'textarea' ? (
                      <textarea
                        value={formData[field.key]}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        rows={field.rows || 2}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                        placeholder={field.placeholder}
                        required={field.required}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        value={formData[field.key]}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        required={field.required}
                      >
                        {field.options.map((option) => (
                          <option key={option} value={option}>
                            {option || 'Select ' + field.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={formData[field.key]}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder={field.placeholder}
                        required={field.required}
                        step={field.type === 'number' ? '0.01' : undefined}
                      />
                    )}
                  </div>
                ))}
              </form>
            </div> */}

            {/* Action Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Progress:</span>
                  <span className="ml-2">
                    {Object.values(formData).filter(value => value.trim() !== '').length} of {formFields.length} fields completed
                  </span>
                </div>
                <button
                  onClick={handleSaveDraft}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Draft</span>
                </button>
              </div>
            </div>

            {/* Tips Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-blue-900 mb-2 text-sm">💡 Optimization Tips</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Use relevant keywords in your title for better searchability</li>
                <li>• Include specific product details and benefits in the description</li>
                <li>• List clear, concise features that highlight your product's value</li>
                <li>• Reference the gold standard for inspiration on structure and content</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewProductCreationPage;