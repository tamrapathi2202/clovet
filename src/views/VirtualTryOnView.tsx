import { useState } from 'react';
import { ArrowLeft, Upload, Wand2, Loader2, Check, X, Download } from 'lucide-react';
import { FavoriteItem } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { generateVirtualTryOn as generateTryOnAPI, fileToBase64, downloadGeneratedImage } from '../lib/geminiApi';

type VirtualTryOnProps = {
  onBack: () => void;
  favorites: FavoriteItem[];
};

type Step = 'select-clothes' | 'upload-image' | 'generating' | 'result';

export default function VirtualTryOnView({ onBack, favorites }: VirtualTryOnProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('select-clothes');
  const [selectedItems, setSelectedItems] = useState<FavoriteItem[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [userImageFile, setUserImageFile] = useState<File | null>(null);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleItemSelect = (item: FavoriteItem) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(selected => selected.id === item.id);
      if (isSelected) {
        return prev.filter(selected => selected.id !== item.id);
      } else {
        if (prev.length >= 3) {
          return [...prev.slice(1), item];
        }
        return [...prev, item];
      }
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size should be less than 10MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setUserImageFile(file);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateVirtualTryOn = async () => {
    if (!user || !userImageFile || selectedItems.length === 0) return;
    
    setCurrentStep('generating');
    setError(null);

    try {
      const userImageBase64 = await fileToBase64(userImageFile);
      
      const clothingItems = selectedItems.map(item => ({
        name: item.item_name,
        image_url: item.image_url,
        category: (item.metadata as any)?.category || 'clothing'
      }));

      const result = await generateTryOnAPI({
        userImageBase64,
        clothingItems
      });

      if (result.success) {
        setGeneratedResult(result.imageUrl || 'https://images.pexels.com/photos/794062/pexels-photo-794062.jpeg?auto=compress&cs=tinysrgb&w=1200');
        setCurrentStep('result');
      } else {
        throw new Error(result.error || 'Failed to generate virtual try-on');
      }
      
    } catch (err) {
      console.error('Error generating virtual try-on:', err);
      setError('Failed to generate virtual try-on. Please try again.');
      setCurrentStep('upload-image');
    }
  };

  const restart = () => {
    setCurrentStep('select-clothes');
    setSelectedItems([]);
    setUploadedImage(null);
    setUserImageFile(null);
    setGeneratedResult(null);
    setError(null);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {['select-clothes', 'upload-image', 'generating', 'result'].map((step, index) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium`} style={{
              backgroundColor: currentStep === step ? 'rgb(45, 80, 22)' : index < ['select-clothes', 'upload-image', 'generating', 'result'].indexOf(currentStep) ? 'rgb(45, 80, 22)' : 'rgb(248, 242, 237)',
              color: currentStep === step || index < ['select-clothes', 'upload-image', 'generating', 'result'].indexOf(currentStep) ? 'rgb(248, 242, 237)' : 'rgb(45, 80, 22)',
              fontFamily: 'var(--font-warbler)'
            }}>
              {index < ['select-clothes', 'upload-image', 'generating', 'result'].indexOf(currentStep) ? (
                <Check className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            {index < 3 && (
              <div className="w-8 h-0.5" style={{
                backgroundColor: index < ['select-clothes', 'upload-image', 'generating', 'result'].indexOf(currentStep) ? 'rgb(45, 80, 22)' : 'rgb(248, 242, 237)'
              }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderSelectClothes = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-warbler)', color: 'rgb(45, 80, 22)' }}>
          Select Clothes for Try-On
        </h2>
        <p style={{ fontFamily: 'var(--font-tangerine)', color: 'rgb(45, 80, 22)', fontSize: '1.5rem' }}>
          Choose up to 3 items from your favorites to create an outfit
        </p>
        <p className="text-sm mt-2" style={{ fontFamily: 'var(--font-warbler)', color: 'rgb(45, 80, 22)' }}>
          {selectedItems.length}/3 items selected
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
        {favorites.map((item) => (
          <div
            key={item.id}
            onClick={() => handleItemSelect(item)}
            className={`relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer`}
            style={{
              border: selectedItems.some(selected => selected.id === item.id) ? '2px solid rgb(45, 80, 22)' : '1px solid rgb(248, 242, 237)'
            }}
          >
            <div className="aspect-[3/4] relative">
              <img src={item.image_url} alt={item.item_name} className="w-full h-full object-cover" />
              {selectedItems.some(selected => selected.id === item.id) && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(45, 80, 22, 0.2)' }}>
                  <div className="rounded-full p-2" style={{ backgroundColor: 'rgb(45, 80, 22)' }}>
                    <Check className="w-6 h-6" style={{ color: 'rgb(248, 242, 237)' }} />
                  </div>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                <span className="text-xs text-white font-medium" style={{ fontFamily: 'var(--font-warbler)' }}>
                  {item.platform}
                </span>
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-medium text-sm mb-1 line-clamp-2" style={{ fontFamily: 'var(--font-warbler)', color: 'rgb(45, 80, 22)' }}>
                {item.item_name}
              </h3>
              <p className="text-sm font-bold" style={{ fontFamily: 'var(--font-tangerine)', color: 'rgb(242, 109, 22)', fontSize: '1.25rem' }}>
                ${item.price}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => setCurrentStep('upload-image')}
          disabled={selectedItems.length === 0}
          className="px-8 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'rgb(45, 80, 22)', color: 'rgb(248, 242, 237)', fontFamily: 'var(--font-warbler)' }}
        >
          Next: Upload Your Photo
        </button>
      </div>
    </div>
  );

  const renderUploadImage = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-warbler)', color: 'rgb(45, 80, 22)' }}>
          Upload Your Photo
        </h2>
        <p style={{ fontFamily: 'var(--font-tangerine)', color: 'rgb(45, 80, 22)', fontSize: '1.5rem' }}>
          Upload a clear, full-body photo for the best results
        </p>
      </div>

      <div className="mb-6">
        {uploadedImage ? (
          <div className="relative">
            <img src={uploadedImage} alt="Uploaded" className="w-full max-w-md mx-auto rounded-lg" />
            <button
              onClick={() => {
                setUploadedImage(null);
                setUserImageFile(null);
              }}
              className="absolute top-2 right-2 bg-red-500 rounded-full p-1 hover:bg-red-600 transition"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        ) : (
          <label className="block w-full max-w-md mx-auto">
            <div className="border-2 border-dashed rounded-lg p-8 transition cursor-pointer" style={{ borderColor: 'rgb(45, 80, 22)' }}>
              <div className="text-center">
                <Upload className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgb(242, 109, 22)' }} />
                <p className="font-medium mb-2" style={{ fontFamily: 'var(--font-warbler)', color: 'rgb(45, 80, 22)' }}>
                  Click to upload your photo
                </p>
                <p className="text-sm" style={{ fontFamily: 'var(--font-warbler)', color: 'rgb(45, 80, 22)', opacity: 0.7 }}>
                  PNG, JPG up to 10MB
                </p>
              </div>
            </div>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgb(248, 242, 237)', border: '1px solid rgb(242, 109, 22)' }}>
          <p className="text-sm" style={{ fontFamily: 'var(--font-warbler)', color: 'rgb(45, 80, 22)' }}>{error}</p>
        </div>
      )}

      <div className="flex justify-center gap-4">
        <button
          onClick={() => setCurrentStep('select-clothes')}
          className="px-6 py-3 rounded-lg font-medium transition"
          style={{ border: '1px solid rgb(45, 80, 22)', color: 'rgb(45, 80, 22)', fontFamily: 'var(--font-warbler)', backgroundColor: 'white' }}
        >
          Back
        </button>
        <button
          onClick={generateVirtualTryOn}
          disabled={!uploadedImage}
          className="px-8 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          style={{ backgroundColor: 'rgb(45, 80, 22)', color: 'rgb(248, 242, 237)', fontFamily: 'var(--font-warbler)' }}
        >
          <Wand2 className="w-4 h-4" />
          Generate Try-On
        </button>
      </div>
    </div>
  );

  const renderGenerating = () => (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="relative">
          <Loader2 className="w-16 h-16 mx-auto animate-spin" style={{ color: 'rgb(242, 109, 22)' }} />
          <Wand2 className="w-8 h-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ color: 'rgb(45, 80, 22)' }} />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-warbler)', color: 'rgb(45, 80, 22)' }}>
        Creating Your Virtual Try-On
      </h2>
      <p className="mb-8" style={{ fontFamily: 'var(--font-tangerine)', color: 'rgb(45, 80, 22)', fontSize: '1.5rem' }}>
        Gemini AI is generating a realistic image of how you'll look in your selected outfit...
      </p>
      
      <div className="space-y-4 text-left max-w-md mx-auto">
        <div className="flex items-center gap-3 text-sm" style={{ fontFamily: 'var(--font-warbler)', color: 'rgb(45, 80, 22)' }}>
          <Check className="w-4 h-4" style={{ color: 'rgb(45, 80, 22)' }} />
          Processing your photo with Gemini 2.5 Flash
        </div>
        <div className="flex items-center gap-3 text-sm" style={{ fontFamily: 'var(--font-warbler)', color: 'rgb(45, 80, 22)' }}>
          <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'rgb(242, 109, 22)' }} />
          Analyzing clothing items and fit
        </div>
        <div className="flex items-center gap-3 text-sm" style={{ fontFamily: 'var(--font-warbler)', color: 'rgb(45, 80, 22)' }}>
          <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'rgb(242, 109, 22)' }} />
          Generating virtual try-on image
        </div>
      </div>
      
      <div className="mt-8 p-4 rounded-lg" style={{ backgroundColor: 'rgb(248, 242, 237)', border: '1px solid rgb(45, 80, 22)' }}>
        <p className="text-sm" style={{ fontFamily: 'var(--font-warbler)', color: 'rgb(45, 80, 22)' }}>
          <strong>Powered by Google Gemini 2.5 Flash Image</strong><br />
          Advanced AI for realistic virtual try-on generation
        </p>
      </div>
    </div>
  );

  const renderResult = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-warbler)', color: 'rgb(45, 80, 22)' }}>
          Your Virtual Try-On Result
        </h2>
        <p style={{ fontFamily: 'var(--font-tangerine)', color: 'rgb(45, 80, 22)', fontSize: '1.5rem' }}>
          Here's how you look in your selected outfit!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold mb-4" style={{ fontFamily: 'var(--font-warbler)', color: 'rgb(45, 80, 22)' }}>
            Original Photo
          </h3>
          <img src={uploadedImage!} alt="Original" className="w-full rounded-lg shadow-lg" style={{ border: '1px solid rgb(45, 80, 22)' }} />
        </div>
        <div>
          <h3 className="font-semibold mb-4" style={{ fontFamily: 'var(--font-warbler)', color: 'rgb(45, 80, 22)' }}>
            Virtual Try-On Result
          </h3>
          <div className="relative">
            <img src={generatedResult!} alt="Virtual try-on result" className="w-full rounded-lg shadow-lg" style={{ border: '1px solid rgb(45, 80, 22)' }} />
            {generatedResult?.startsWith('data:') && (
              <button
                onClick={() => downloadGeneratedImage(generatedResult!, 'clovet-virtual-tryon.png')}
                className="absolute top-2 right-2 bg-white bg-opacity-90 backdrop-blur-sm p-2 rounded-full hover:bg-opacity-100 transition"
                title="Download image"
              >
                <Download className="w-4 h-4" style={{ color: 'rgb(45, 80, 22)' }} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="text-center mb-8">
        <h3 className="font-semibold mb-4" style={{ fontFamily: 'var(--font-warbler)', color: 'rgb(45, 80, 22)' }}>
          Selected Items
        </h3>
        <div className="flex justify-center gap-4">
          {selectedItems.map((item) => (
            <div key={item.id} className="text-center">
              <img src={item.image_url} alt={item.item_name} className="w-20 h-20 object-cover rounded-lg mb-2 shadow-sm" style={{ border: '1px solid rgb(45, 80, 22)' }} />
              <p className="text-xs line-clamp-2 max-w-20" style={{ fontFamily: 'var(--font-warbler)', color: 'rgb(45, 80, 22)' }}>
                {item.item_name}
              </p>
              <p className="text-xs" style={{ fontFamily: 'var(--font-tangerine)', color: 'rgb(242, 109, 22)' }}>
                ${item.price}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={restart}
          className="px-6 py-3 rounded-lg font-medium transition"
          style={{ border: '1px solid rgb(45, 80, 22)', color: 'rgb(45, 80, 22)', fontFamily: 'var(--font-warbler)', backgroundColor: 'white' }}
        >
          Try Another Outfit
        </button>
        <button
          onClick={() => {
            if (generatedResult?.startsWith('data:')) {
              downloadGeneratedImage(generatedResult, 'clovet-virtual-tryon.png');
            } else {
              alert('Download feature available for AI-generated images only!');
            }
          }}
          className="px-8 py-3 rounded-lg font-medium transition flex items-center gap-2"
          style={{ backgroundColor: 'rgb(45, 80, 22)', color: 'rgb(248, 242, 237)', fontFamily: 'var(--font-warbler)' }}
        >
          <Download className="w-4 h-4" />
          Download Result
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(248, 242, 237)' }}>
      <div className="bg-white sticky top-0 z-50" style={{ borderBottom: '1px solid rgb(45, 80, 22)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 transition"
            style={{ color: 'rgb(45, 80, 22)', fontFamily: 'var(--font-warbler)' }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Favorites
          </button>
          <h1 className="text-xl font-semibold" style={{ fontFamily: 'var(--font-warbler)', color: 'rgb(45, 80, 22)' }}>
            Virtual Try-On
          </h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {renderStepIndicator()}
        
        {currentStep === 'select-clothes' && renderSelectClothes()}
        {currentStep === 'upload-image' && renderUploadImage()}
        {currentStep === 'generating' && renderGenerating()}
        {currentStep === 'result' && renderResult()}
      </div>
    </div>
  );
}