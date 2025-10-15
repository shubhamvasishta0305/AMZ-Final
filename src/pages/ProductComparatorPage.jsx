// Editable cell for feature value with Change/Accept functionality
function FeatureEditableCell({ initialValue }) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [value, setValue] = React.useState(initialValue);
  const [acceptedValue, setAcceptedValue] = React.useState(initialValue);

  const handleAccept = () => {
    setAcceptedValue(value);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded p-3">
      {isEditing ? (
        <input
          className="border border-gray-300 rounded px-2 py-1 text-sm w-full mr-4"
          value={value}
          onChange={e => setValue(e.target.value)}
          autoFocus
        />
      ) : (
        <span className="text-gray-700 mr-4">{acceptedValue}</span>
      )}
      <div className="flex gap-2">
        {!isEditing && (
          <button
            className="text-white px-3 py-1.5 bg-blue-700 border rounded-xl hover:underline"
            onClick={() => setIsEditing(true)}
          >
            Change
          </button>
        )}
        {isEditing && (
          <button
            className="text-white px-3 py-1.5 bg-green-700 border rounded-xl hover:underline"
            onClick={handleAccept}
          >
            Accept
          </button>
        )}
        <button className="text-white px-3 py-1.5 bg-purple-700 border rounded-xl hover:underline">AI Generate</button>
      </div>
    </div>
  );
}
import React, { useState, useRef, useLayoutEffect } from 'react';
import { CheckCircle, XCircle, Image as ImageIcon, Star } from 'lucide-react';
import { goldStandardProduct } from '../data/mockData.js';

const mockProduct = {
  title: 'Premium Wireless Headphones - Noise Cancelling',
  rating: 4.5,
  reviews: 1247,
  price: 89.99,
  oldPrice: 129.99,
  discount: 31,
  features: [
    'Active Noise Cancellation technology',
    '30-hour battery life with quick charge',
    'Premium comfort with memory foam ear cups',
    'Bluetooth 5.0 with multi-device pairing',
  ],
};

const ProductComparator = () => {

  const [productTitle, setProductTitle] = useState('Amazon Brand - Symbols Rayon Ethnic Wear Embroidered Kurta Set with Organza Dupatta');
  const textareaRef = useRef(null);

  useLayoutEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [productTitle]);
  
  return (
    <div className="w-full max-w-7xl mx-auto min-h-screen px-2 md:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Gold Standard Preview */}
        <section className="max-w-xl w-full mx-auto md:mx-0 flex flex-col justify-start">
          <div className="bg-white rounded-xl shadow p-6 border border-gray-200 flex-1 flex flex-col">
            <h2 className="text-3xl font-semibold mb-4 justify-center flex items-center gap-2">
              Gold Standard Preview
            </h2>
            {/* Add more gold standard content here if needed */}
          </div>
        </section>

        {/* Right: Product Title, Input, Buttons, Product Details */}
        <section className="w-full mx-auto md:mx-0 flex flex-col justify-start">
          <div className="bg-white rounded-xl shadow p-6 border border-gray-200 flex flex-col">
            <div className="mb-6">
              <label className="block text-base font-semibold mb-2">Product Title</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
                value="Amazon Brand - Symbol Girl's Rayon Ethnic Wear Embroidered Kurta Set with Organza Dupatta"
                readOnly
              />
              <div className="flex flex-wrap gap-2 mt-3">
                <button className="px-4 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-100">View Original</button>
                <button className="px-4 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">AI Generate</button>
                <button className="px-4 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">Accept</button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Product Details</h3>
            </div>
          </div>
        </section>
      </div>
      {/* Grid: Gold Standard Features (left) and Product Details (right) */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {(goldStandardProduct.keyFeatures || []).map((feature, index) => (
          <React.Fragment key={index}>
            {/* Left: Gold Standard Feature */}
            <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded p-3">
              <span className="font-medium text-gray-800">{feature}</span>
            </div>
            {/* Right: Product Detail Editable */}
            <FeatureEditableCell initialValue={feature} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProductComparator;

// <div className='grid grid-cols-2 max-w-7xl mx-auto min-h-screen gap-6 px-2 md:px-8 py-6'>
//   <div className='text-3xl font-semibold flex justify-center pt-10'>
//     <h2>Gold Standard Preview</h2>
    //   </div>
    //   <div>
    //     <h3 className='text-2xl font-semibold mt-20'>Product Title</h3>
    //     <textarea
    //       ref={textareaRef}
    //       className='border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 mt-2 resize-none overflow-auto block'
    //       value={productTitle}
    //       onChange={e => setProductTitle(e.target.value)}
    //       rows={1}
    //       style={{ minHeight: '40px', maxHeight: '300px', width: '100%', maxWidth: '100%' }}
    //     />
    //     <div className='mt-5 flex gap-4'>
    //       <button className='bg-white-500 text-black border-2 px-4 py-2 rounded'>View Original</button>
    //       <button className='bg-purple-500 text-white px-4 py-2 rounded'>AI Generate</button>
    //       <button className='bg-green-500 text-white px-4 py-2 rounded'>Accept</button>
    //     </div>
    //   </div>
    //   <div></div>
    //   <div></div>
    //   <div></div>
    //   <div></div>
    // </div>