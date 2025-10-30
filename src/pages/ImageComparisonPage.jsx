import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateAIImage } from '../api/api';
import { Wand2, Loader2, ArrowRight, X, Upload, Download, Link, Images } from 'lucide-react';


const ImageComparisonPage = () => {
 const navigate = useNavigate();
 const location = useLocation();
 const [previewImage, setPreviewImage] = useState(null);
 const [referenceImage, setReferenceImage] = useState(null);
 const [referenceFile, setReferenceFile] = useState(null);
 const [productAttributes, setProductAttributes] = useState({});
 const [goldStandardProduct, setGoldStandardProduct] = useState(null);
 const [existingProduct, setExistingProduct] = useState(null);
 const [isNewProduct, setIsNewProduct] = useState(location.state?.isNewProduct || false);
 const [showExistingImagesDialog, setShowExistingImagesDialog] = useState(false);


 const loadingMessages = [
   "ðŸŽ¨ Painting pixels...",
   "âœ¨ Creating magic...",
   "ðŸŽ­ Crafting your image...",
   "ðŸŒŸ Generating masterpiece...",
   "ðŸ•¯ï¸ Conjuring visuals...",
   "ðŸ–Œï¸ Building your vision...",
   "ðŸŒˆ Adding colors...",
   "ðŸŽ¯ Focusing creativity...",
   "ðŸš€ Launching generation...",
   "ðŸŽ¨ Mixing digital paint...",
   "ðŸ”¥ Rendering pixels...",
   "ðŸŒ¸ Blooming your image...",
   "ðŸŠ Flowing with creativity...",
   "ðŸ”† Shining up pixels...",
 ];


 const [currentLoadingMessage, setCurrentLoadingMessage] = useState("");
 const [isGeneratingAll, setIsGeneratingAll] = useState(false);


 useEffect(() => {
   if (location.state?.isNewProduct) {
     console.log('â€¦ Coming from new product page - hiding existing product section');
   }


   const storedFilters = localStorage.getItem('productFilters');
   if (storedFilters) {
     try {
       setProductAttributes(JSON.parse(storedFilters));
       console.log('â€¦ Loaded product attributes from localStorage:', JSON.parse(storedFilters));
     } catch (error) {
       console.error('Error parsing stored filters:', error);
     }
   }


   const storedGoldStandard = localStorage.getItem('goldStandardProduct');
   if (storedGoldStandard) {
     try {
       setGoldStandardProduct(JSON.parse(storedGoldStandard));
       console.log('â€¦ Loaded gold standard product from localStorage:', JSON.parse(storedGoldStandard));
     } catch (error) {
       console.error('Error parsing stored gold standard product:', error);
     }
   }


   if (!location.state?.isNewProduct) {
     const storedExisting = localStorage.getItem('existingProduct');
     if (storedExisting) {
       try {
         setExistingProduct(JSON.parse(storedExisting));
         console.log('â€¦ Loaded existing product from localStorage:', JSON.parse(storedExisting));
       } catch (error) {
         console.error('Error parsing stored existing product:', error);
       }
     }
   }
 }, [location.state]);


 const getGoldStandardImages = () => {
   const emptyArray = Array(7).fill(null);
   if (goldStandardProduct?.images?.length > 0) {
     const uniqueImages = [...new Set(goldStandardProduct.images)].slice(0, 7);
     while (uniqueImages.length < 7) uniqueImages.push(null);
     return uniqueImages;
   }
   console.log('âš  No gold standard images found, returning empty array');
   return emptyArray;
 };


 const getExistingImages = () => {
   const emptyArray = Array(7).fill(null);
   if (existingProduct?.images?.length > 0) {
     const uniqueImages = [...new Set(existingProduct.images)].slice(0, 7);
     while (uniqueImages.length < 7) uniqueImages.push(null);
     return uniqueImages;
   }
   console.log('âš  No existing product images found, returning empty array');
   return emptyArray;
 };


 const getAllExistingImages = () => {
   if (existingProduct?.images?.length > 0) {
     return [...new Set(existingProduct.images)];
   }
   return [];
 };


 const urlToFile = async (imageUrl, filename) => {
   try {
     console.log('â¤ Converting URL to File:', imageUrl);
     const response = await fetch(imageUrl);
     if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
     const blob = await response.blob();
     const file = new File([blob], filename, { type: blob.type || 'image/jpeg', lastModified: Date.now() });
     console.log('â€¦ Successfully converted URL to File:', file);
     return file;
   } catch (error) {
     console.error('âŒ Error converting URL to File:', error);
     throw error;
   }
 };


 const [generatedImages, setGeneratedImages] = useState(
   Array(7).fill(null).map(() => ({ url: null, isLoading: false }))
 );


 const [selectedImages, setSelectedImages] = useState(Array(7).fill(null));


 const imageLabels = [
   'Main Product',
   'Front View',
   'Back View',
   'Side View',
   'Detail Shot 1',
   'Detail Shot 2',
   'Lifestyle'
 ];


 const handleGenerateAll = async () => {
   if (!referenceFile) {
     alert('Please upload a reference image first!');
     return;
   }
   setIsGeneratingAll(true);
   const normalizedAttributes = {};
   Object.entries(productAttributes).forEach(([key, value]) => {
     if (key === 'Subcategory') normalizedAttributes['SubCategory'] = value;
     else if (key === 'Age Group') normalizedAttributes['AgeGroup'] = value;
     else normalizedAttributes[key] = value;
   });
   setCurrentLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
   const messageInterval = setInterval(() => {
     setCurrentLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
   }, 2000);
   setGeneratedImages(prev => prev.map((img, i) => i < 5 && !img.url ? { ...img, isLoading: true } : img));
   const generationPromises = [];
   for (let index = 0; index < 5; index++) {
     if (generatedImages[index]?.url) {
       generationPromises.push(Promise.resolve({ index, skipped: true }));
       continue;
     }
     generationPromises.push(generateAIImage(referenceFile, index, normalizedAttributes)
       .then(url => ({ index, url, success: true }))
       .catch(error => ({ index, error: error.message, success: false }))
     );
   }
   const results = await Promise.allSettled(generationPromises);
   clearInterval(messageInterval);
   let successCount = 0, failCount = 0;
   results.forEach(result => {
     if (result.status === 'fulfilled') {
       const data = result.value;
       if (data.skipped) return;
       if (data.success && data.url) {
         setGeneratedImages(prev => prev.map((img, i) => i === data.index ? { url: data.url, isLoading: false } : img));
         successCount++;
         console.log(`â€¦ Successfully generated image ${data.index + 1}`);
       } else {
         setGeneratedImages(prev => prev.map((img, i) => i === data.index ? { ...img, isLoading: false } : img));
         failCount++;
         console.error(`âŒ Failed to generate image ${data.index + 1}: ${data.error}`);
       }
     } else {
       failCount++;
       console.error('âŒ Generation promise rejected:', result.reason);
     }
   });
   setIsGeneratingAll(false);
   if (failCount) alert(`âš  Batch generation complete!\nâ€¦ Success: ${successCount} images\nâŒ Failed: ${failCount} images`);
 };


 const handleGenerateImage = async (index) => {
   if (!referenceFile && !referenceImage) {
     alert('Please upload or select a reference image first!');
     return;
   }
   if (index >= 5) {
     alert('âš  This image style is coming soon! Currently in development. Stay tuned! ðŸš¨');
     return;
   }
   const normalizedAttributes = {};
   Object.entries(productAttributes).forEach(([key, value]) => {
     if (key === 'Subcategory') normalizedAttributes['SubCategory'] = value;
     else if (key === 'Age Group') normalizedAttributes['AgeGroup'] = value;
     else normalizedAttributes[key] = value;
   });
   setCurrentLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
   setGeneratedImages(prev => prev.map((img, i) => i === index ? { ...img, isLoading: true } : img));
   const messageInterval = setInterval(() => {
     setCurrentLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
   }, 2000);
   try {
     let imageFile = referenceFile;
     if (!referenceFile && referenceImage) {
       imageFile = await urlToFile(referenceImage, `reference-image-${Date.now()}.jpg`);
     }
     if (!imageFile) throw new Error('No reference image available for generation');
     const newImageUrl = await generateAIImage(imageFile, index, normalizedAttributes);
     clearInterval(messageInterval);
     setGeneratedImages(prev => prev.map((img, i) => i === index ? { url: newImageUrl, isLoading: false } : img));
   } catch (error) {
     clearInterval(messageInterval);
     let errorMessage = error.message;
     if (errorMessage.includes('No image returned from model'))
       errorMessage = 'The AI model could not generate this image. This might be due to content safety filters or prompt issues. Please try a different style or image.';
     else if (errorMessage.includes('style_index out of range'))
       errorMessage = 'This image style is not yet available. Please try another style.';
     else if (errorMessage.includes('safety filters'))
       errorMessage = 'Content generation was blocked by safety filters. Please try a different reference image or style.';
     else if (errorMessage.includes('No image uploaded'))
       errorMessage = 'Reference image processing failed. Please try uploading the image directly or select a different existing image.';
     alert(`Failed to generate image: ${errorMessage}`);
     setGeneratedImages(prev => prev.map((img, i) => i === index ? { ...img, isLoading: false } : img));
   }
 };


 const handleReferenceImageUpload = (event) => {
   const file = event.target.files[0];
   if (file && file.type.startsWith('image/')) {
     setReferenceFile(file);
     const reader = new FileReader();
     reader.onload = (e) => setReferenceImage(e.target.result);
     reader.readAsDataURL(file);
     console.log('â€¦ Reference image uploaded:', file.name);
   }
 };


 const handleSelectExistingImage = async (imageUrl) => {
   try {
     const file = await urlToFile(imageUrl, `existing-reference-${Date.now()}.jpg`);
     setReferenceFile(file);
     setReferenceImage(imageUrl);
     setShowExistingImagesDialog(false);
     console.log('â€¦ Successfully set existing image as reference');
   } catch {
     alert('Failed to select this image as reference. Please try uploading the image directly or select a different image.');
   }
 };


 const handleRemoveReferenceImage = () => {
   setReferenceImage(null);
   setReferenceFile(null);
   console.log('Reference image removed');
 };


 const handleDownloadImage = async (imageUrl, imageName) => {
   try {
     if (!imageUrl) throw new Error('No URL provided');
     if (imageUrl.startsWith('data:image')) {
       const link = document.createElement('a');
       link.href = imageUrl;
       link.download = `${(imageName || 'image').replace(/\s+/g, '_')}.png`;
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
       return;
     }
     const response = await fetch(imageUrl, { mode: 'cors' });
     if (!response.ok) throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
     const blob = await response.blob();
     const blobUrl = window.URL.createObjectURL(blob);
     const link = document.createElement('a');
     link.href = blobUrl;
     link.download = `${(imageName || 'image').replace(/\s+/g, '_')}.png`;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
     window.URL.revokeObjectURL(blobUrl);
   } catch {
     alert('Failed to download image. Please try again.');
   }
 };


 const handleCopyImageLink = (imageUrl) => {
   navigator.clipboard.writeText(imageUrl).then(() => {
     alert('Image link copied to clipboard!');
   }).catch(() => {
     alert('Failed to copy link. Please try again.');
   });
 };


 const handleImageSelection = (rowIndex, imageType) => {
   const newSelection = [...selectedImages];
   if (newSelection[rowIndex] === imageType) newSelection[rowIndex] = null;
   else newSelection[rowIndex] = imageType;
   setSelectedImages(newSelection);
 };


 const handleSaveChanges = () => {
   if (isNewProduct) {
     const generatedCount = generatedImages.filter(img => img.url !== null).length;
     if (generatedCount < 5) {
       alert(`âš  Please generate at least 5 images before proceeding. Currently generated: ${generatedCount}/7`);
       return;
     }
     if (generatedCount > 7) {
       alert(`âš  Maximum 7 images allowed. Currently generated: ${generatedCount}`);
       return;
     }
   } else {
     const selectedCount = selectedImages.filter(sel => sel !== null).length;
     if (selectedCount < 5) {
       alert(`âš  Please select at least 5 images before proceeding. Currently selected: ${selectedCount}/7`);
       return;
     }
     if (selectedCount > 7) {
       alert(`âš  Maximum 7 selections allowed. Currently selected: ${selectedCount}`);
       return;
     }
   }


   const allImages = [];
   const generatedImageUrls = [];


   if (isNewProduct) {
     generatedImages.forEach((imgData, index) => {
       if (imgData.url) {
         allImages.push({ url: imgData.url, type: 'generated', label: imageLabels[index] || `Generated ${index + 1}` });
         generatedImageUrls.push(imgData.url);
       }
     });
   } else {
     const existingImages = getExistingImages();
     selectedImages.forEach((selection, index) => {
       if (selection === 0) {
         const existingUrl = existingImages[index];
         if (existingUrl) {
           allImages.push({ url: existingUrl, type: 'existing', label: imageLabels[index] || `Image ${index + 1}` });
         }
       } else if (selection === 1) {
         const generatedUrl = generatedImages[index].url;
         if (generatedUrl) {
           allImages.push({ url: generatedUrl, type: 'generated', label: imageLabels[index] || `Generated ${index + 1}` });
           generatedImageUrls.push(generatedUrl);
         }
       }
     });
   }


   localStorage.setItem('generatedImages', JSON.stringify(generatedImageUrls));
   localStorage.setItem('allProductImages', JSON.stringify(allImages));
   navigate('/final-page');
 };


 const ImageCard = ({ src, alt, label, type, index = null, onGenerate = null, isLoading = false, isSelected = false, onSelect = null }) => (
   <div className={`bg-white rounded-md border-2 overflow-hidden mb-2 transition-all ${isSelected ? 'border-green-500 shadow-lg ring-2 ring-green-300' : 'border-gray-200'} ${onSelect && src ? 'cursor-pointer hover:border-blue-300' : ''}`}
     onClick={() => onSelect && src && !isLoading && onSelect()}
   >
     <div className="aspect-square bg-gray-50 flex items-center justify-center relative">
       {isSelected && (
         <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-1 z-20 shadow-lg">
           <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
             <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
           </svg>
         </div>
       )}
       {(type === 'reference' || type === 'current') && !src && (
         <div className="flex flex-col items-center justify-center p-3 text-center">
           <div className="text-gray-400 text-xs">No image</div>
         </div>
       )}
       {type === 'generate' && !src && !isLoading && (
         <button
           onClick={(e) => {
             e.stopPropagation();
             onGenerate(index);
           }}
           className="flex flex-col items-center justify-center p-3 text-center hover:bg-gray-100 transition-colors w-full h-full"
         >
           <Wand2 className="h-5 w-5 text-blue-600 mb-1" />
           <span className="text-xs font-medium text-gray-700">Generate</span>
         </button>
       )}
       {isLoading && (
         <div className="flex flex-col items-center justify-center p-3 text-center">
           <Loader2 className="h-5 w-5 text-blue-600 animate-spin mb-1" />
           <span className="text-xs font-medium text-gray-700">{currentLoadingMessage}</span>
         </div>
       )}
       {src && !isLoading && (
         <>
           <img
             src={src}
             alt={alt}
             className="w-full h-full object-contain hover:opacity-90 transition-opacity"
             onClick={(e) => {
               e.stopPropagation();
               setPreviewImage({ src, alt, label });
             }}
             onError={(e) => {
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
       {onSelect && src && !isLoading && (
         <p className="text-xs text-center text-gray-500 mt-1">
           {isSelected ? 'Selected' : 'Click to select'}
         </p>
       )}
     </div>
   </div>
 );


 const ExistingImagesDialog = () => {
   const existingImages = getAllExistingImages();
   return (
     <div
       className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50"
       onClick={() => setShowExistingImagesDialog(false)}
     >
       <div
         className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden border-4 border-blue-500 animate-scaleIn"
         onClick={(e) => e.stopPropagation()}
       >
         <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
           <div>
             <h3 className="text-lg font-semibold text-gray-900">Select Existing Image as Reference</h3>
             <p className="text-sm text-gray-600 mt-1">
               Choose an image from your existing product images to use as reference for AI generation
             </p>
           </div>
           <button
             onClick={() => setShowExistingImagesDialog(false)}
             className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-all duration-200"
           >
             <X className="h-6 w-6" />
           </button>
         </div>
         <div className="p-6 bg-gray-50 max-h-[65vh] overflow-y-auto">
           {existingImages.length > 0 ? (
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
               {existingImages.map((imageUrl, index) => (
                 <div
                   key={index}
                   className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden cursor-pointer hover:border-blue-400 hover:shadow-md transition-all"
                   onClick={() => handleSelectExistingImage(imageUrl)}
                 >
                   <div className="aspect-square bg-gray-100 flex items-center justify-center">
                     <img
                       src={imageUrl}
                       alt={`Existing product image ${index + 1}`}
                       className="w-full h-full object-contain"
                       onError={(e) => {
                         e.target.src = `https://placehold.co/200x200/E5E7EB/6B7280?text=Image+${index + 1}`;
                       }}
                     />
                   </div>
                   <div className="p-2 text-center">
                     <span className="text-xs font-medium text-gray-700">Image {index + 1}</span>
                   </div>
                 </div>
               ))}
             </div>
           ) : (
             <div className="text-center py-8">
               <Images className="h-12 w-12 text-gray-400 mx-auto mb-3" />
               <p className="text-gray-600">No existing product images found.</p>
               <p className="text-sm text-gray-500 mt-1">Please upload images in the previous steps.</p>
             </div>
           )}
         </div>
         <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
           <span className="text-sm text-gray-600">
             {existingImages.length} image(s) available
           </span>
           <button
             onClick={() => setShowExistingImagesDialog(false)}
             className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
           >
             Cancel
           </button>
         </div>
       </div>
     </div>
   );
 };


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


     {/* Existing Images Dialog */}
     {showExistingImagesDialog && <ExistingImagesDialog />}


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
             <p className="text-xs text-gray-600">
               {referenceImage
                 ? 'Reference image selected. You can now generate AI images.'
                 : 'Upload a reference image or select from existing images to guide the AI generation process'
               }
             </p>
             {referenceImage && (
               <div className="mt-2 flex items-center space-x-2 text-xs">
                 <div className="bg-green-100 text-green-800 px-2 py-1 rounded flex items-center">
                   <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                   </svg>
                   Ready for AI Generation
                 </div>
               </div>
             )}
           </div>


           <div className="flex items-center space-x-3">
             {!referenceImage ? (
               <>
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
                 {!isNewProduct && getAllExistingImages().length > 0 && (
                   <button
                     onClick={() => setShowExistingImagesDialog(true)}
                     className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                   >
                     <Images className="h-4 w-4" />
                     <span>Select Existing Image</span>
                   </button>
                 )}
               </>
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
                 <div className="flex flex-col space-y-2">
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
                   {!isNewProduct && getAllExistingImages().length > 0 && (
                     <button
                       onClick={() => setShowExistingImagesDialog(true)}
                       className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                     >
                       <Images className="h-4 w-4" />
                       <span>Select Different</span>
                     </button>
                   )}
                 </div>
               </div>
             )}
           </div>
         </div>
       </div>


       {/* Main content */}
       {isNewProduct ? (
         <div>
           <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
             <div className="flex items-center justify-between">
               <p className="text-sm text-blue-900 font-medium">
                 âš  For new products, generate at least 5 images (max 7)
               </p>
               <button
                 onClick={handleGenerateAll}
                 disabled={isGeneratingAll || !referenceFile}
                 className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors text-sm font-semibold ${isGeneratingAll || !referenceFile
                   ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                   : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-md'
                   }`}
               >
                 <Wand2 className={`h-4 w-4 ${isGeneratingAll ? 'animate-spin' : ''}`} />
                 <span>{isGeneratingAll ? 'Generating All...' : 'Generate All'}</span>
               </button>
             </div>
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
             <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
               <div className="text-center mb-3">
                 <h2 className="text-base font-bold text-gray-900 mb-1">Gold Standard Images</h2>
                 <p className="text-xs text-gray-600">Reference benchmark images</p>
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
             <div className="border-2 border-blue-300 rounded-lg p-3">
               <div className="text-center mb-3">
                 <h2 className="text-base font-bold text-gray-900 mb-1">AI Generated Images</h2>
                 <p className="text-xs text-gray-600">Create optimized alternatives (min 5, max 7)</p>
                 <div className="mt-2 inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                   {generatedImages.filter(img => img.url !== null).length} / 7 Generated
                 </div>
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
       ) : (
         <div>
           <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm text-green-900 font-medium">
                   âš  Select at least 5 images (max 7)
                 </p>
                 <p className="text-xs text-green-700 mt-1">
                   Selected: {selectedImages.filter(sel => sel !== null).length} / 7
                 </p>
               </div>
               <button
                 onClick={handleGenerateAll}
                 disabled={isGeneratingAll || !referenceFile}
                 className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors text-sm font-semibold ${isGeneratingAll || !referenceFile
                   ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                   : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-md'
                   }`}
               >
                 <Wand2 className={`h-4 w-4 ${isGeneratingAll ? 'animate-spin' : ''}`} />
                 <span>{isGeneratingAll ? 'Generating All...' : 'Generate All'}</span>
               </button>
             </div>
           </div>
           <div className="space-y-4">
             {imageLabels.map((label, index) => {
               const existingImg = getExistingImages()[index];
               const generatedImg = generatedImages[index];
               return (
                 <div key={`row-${index}`} className="bg-gray-50 border-2 border-gray-300 rounded-lg p-3">
                   <div className="text-center mb-2">
                     <h3 className="text-sm font-bold text-gray-900">{label}</h3>
                     <p className="text-xs text-gray-600">Select one image for this slot</p>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div>
                       <div className="text-center mb-2">
                         <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                           Gold Standard
                         </span>
                       </div>
                       <ImageCard
                         src={getGoldStandardImages()[index]}
                         alt={`Gold standard ${label}`}
                         label="Reference"
                         type="reference"
                       />
                     </div>
                     <div>
                       <div className="text-center mb-2">
                         <span className="text-xs font-semibold text-gray-700 bg-gray-200 px-2 py-1 rounded">
                           Your Existing
                         </span>
                       </div>
                       <ImageCard
                         src={existingImg}
                         alt={`Existing ${label}`}
                         type="current"
                         isSelected={selectedImages[index] === 0}
                         onSelect={existingImg ? () => handleImageSelection(index, 0) : null}
                       />
                     </div>
                     <div>
                       <div className="text-center mb-2">
                         <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded">
                           AI Generated
                         </span>
                       </div>
                       <ImageCard
                         src={generatedImg.url}
                         alt={`AI generated ${label}`}
                         type="generate"
                         index={index}
                         onGenerate={handleGenerateImage}
                         isLoading={generatedImg.isLoading}
                         isSelected={selectedImages[index] === 1}
                         onSelect={generatedImg.url ? () => handleImageSelection(index, 1) : null}
                       />
                     </div>
                   </div>
                 </div>
               );
             })}
           </div>
         </div>
       )}


       <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
         <div className="flex items-center justify-between">
           <div className="text-xs text-gray-600">
             {isNewProduct ? (
               <>
                 <span className="font-medium">Generated Images:</span>
                 <span className="ml-2">
                   {generatedImages.filter(img => img.url !== null).length} of 7 (min 5 required)
                 </span>
               </>
             ) : (
               <>
                 <span className="font-medium">Selected Images:</span>
                 <span className="ml-2">
                   {selectedImages.filter(sel => sel !== null).length} of 7 (min 5 required)
                 </span>
               </>
             )}
           </div>
           <button
             onClick={handleSaveChanges}
             className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors text-sm ${(isNewProduct && generatedImages.filter(img => img.url !== null).length >= 5 && generatedImages.filter(img => img.url !== null).length <= 7) ||
               (!isNewProduct && selectedImages.filter(sel => sel !== null).length >= 5 && selectedImages.filter(sel => sel !== null).length <= 7)
               ? 'bg-blue-600 text-white hover:bg-blue-700'
               : 'bg-gray-300 text-gray-500 cursor-not-allowed'
               }`}
             disabled={
               isNewProduct
                 ? generatedImages.filter(img => img.url !== null).length < 5 || generatedImages.filter(img => img.url !== null).length > 7
                 : selectedImages.filter(sel => sel !== null).length < 5 || selectedImages.filter(sel => sel !== null).length > 7
             }
           >
             <ArrowRight className="h-4 w-4" />
             <span>Proceed</span>
           </button>
         </div>
       </div>
     </div>
   </div>
 );
};


export default ImageComparisonPage;



